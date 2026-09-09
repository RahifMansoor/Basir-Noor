# Islamic Jeopardy

## Pages

- `/jeopardy`: choose Men or Women, enter a name, follow the board, and buzz.
- `/jeopardy/display`: public board for a projector, including the first buzzer’s name and team.
- `/jeopardy/admin`: password-protected host console, answer key, roster, scoring, and registration controls.

The navigation includes a Jeopardy link. `data/guestList.js` is not used or changed: event registration is separate from wedding RSVPs.

## Run locally

Use Node 20.9 or newer. Install dependencies with `npm ci`.

In a PowerShell terminal:

```powershell
$env:HUB_ADMIN_KEY = 'use-the-same-password-as-hub-admin'
npm run game
```

In another terminal:

```powershell
npm run dev
```

Open `http://localhost:3000/jeopardy/admin` and enter the password. Open player and display pages in separate browsers. The development client defaults to `http://localhost:4001`.

The standalone service reads environment variables from its process, not Next.js `.env` files. No database credentials are needed for this feature.

## Production deployment

Keep the Next.js website on Vercel. Deploy `npm run game` as **one always-running Node process** on a host that supports WebSockets and a persistent disk. Vercel Functions cannot host this persistent WebSocket service: [Vercel guidance](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections). Configure these service variables:

| Variable | Value |
| --- | --- |
| `HUB_ADMIN_KEY` | Same admin password used by `/hub/admin`; at least 16 characters |
| `JEOPARDY_ORIGINS` | Exact website origins, comma-separated, e.g. `https://your-site.com,https://www.your-site.com`; no trailing slashes |
| `JEOPARDY_STATE_FILE` | File on a persistent local volume, e.g. `/data/state.json` |
| `PORT` | Host-assigned port, default `4001` |

`JEOPARDY_ADMIN_KEY` is still accepted as a temporary fallback for older deployments, but new setups should use `HUB_ADMIN_KEY` so `/hub/admin` and `/jeopardy/admin` share one password.

Set `NEXT_PUBLIC_JEOPARDY_URL=https://your-game-service.example.com` in the **website’s** Vercel environment, then rebuild/redeploy the website. This public URL is baked into the client at build time. Never put the host password in a `NEXT_PUBLIC_` variable.

Terminate TLS at the host/reverse proxy and enable WebSocket upgrade forwarding. Use a proxy idle timeout above 60 seconds. `/health` returns HTTP 200 for service monitoring. Configure automatic process restart, disable sleep-to-zero, and use stop-then-start deployment so two instances never serve the same event. Do not use Node cluster, PM2 cluster mode, or multiple replicas: this implementation deliberately has one authoritative game process. An adapter alone would not make the winner selection safe across processes.

State is saved to disk before successful mutations are acknowledged, using a temporary file, fsync, and rename. Only accepted buzzes write state; losing clicks neither write files nor broadcast. Registration broadcasts are batched at 150 ms. State includes bearer tokens and participant names: keep the volume private and back it up as needed. **An ephemeral filesystem loses the event when the instance is replaced.** The exclusive `.lock` file prevents a second process using the same state path. After a hard kill, stop all game processes, verify no other instance uses the volume, and remove only the stale `state.json.lock` before restarting. Do not remove the state file.

## Event operation

1. Review the 25 clues and accepted answers in `game/questions.cjs` with the host. Edit before the event and restart the service; do not change the bank during an active game.
2. Open `/jeopardy/display` on the projector and select Fullscreen. Open `/jeopardy/admin` on a separate device so answers stay private.
3. Share `/jeopardy`, allow guests to register, and optionally close registration. Counts mean registered players, not connected devices. A returning browser keeps its team via a private random token.
4. Start the game. Select a clue, read it aloud, then open buzzers. Players get 15 seconds to buzz; the first eligible packet received by the server wins, regardless of device timestamps.
5. The winner has 10 seconds to answer aloud in question form. Judge with Correct or Incorrect. Correct adds the clue value. Incorrect/timeout subtracts it and automatically opens a fresh window for the other team. Each team gets one attempt per clue. If nobody buzzes, the answer is revealed without a score change.
6. Return to the board. The last correct team tells the host which clue to choose. After all clues, highest score wins; a tie is shown as a tie. This simplified event edition has one board and no Daily Doubles or Final Jeopardy.
7. Use Reveal / skip to end a clue without scoring, and score corrections with a reason to resolve judging mistakes. A host disconnect does not pause timers. A disconnected winner can still answer aloud; otherwise their timeout applies.
8. Reset requires typing `RESET`; it clears scores, clues, and registrations. Reset after the event when names no longer need to be retained.

Reconnecting clients receive the current state and identity, rather than replaying old clicks. Buzzers are disabled offline, early, after a team’s failed attempt, and while another player is answering. Do not open multiple identities to play for both teams; names are self-reported, not verified against a guest list. Keep the host key private, use the event host’s network protections for Internet abuse, and close registration once everyone has joined. The server limits message size, per-socket event frequency, and total registrations (2,000). It does not rate-limit guests by shared Wi-Fi IP.

## Verification and capacity

```powershell
npm run test:game
npm run build
```

The integration test creates a temporary service and real WebSocket clients. It registers 300 players in batches of 25, keeps all connected, and sends a simultaneous 300-player buzzer burst. It asserts exactly one winner, matching host/display state, private answers/tokens, host authorization, exactly-once scoring, reconnect identity, and saved state across restart. Unit tests cover timeout handoff, stale rounds/actions, closed registration, all 25 clues, score adjustments, and reset.

A local Windows run completed 300 registrations in 1,670 ms and all 300 buzzer acknowledgments in 86 ms. This is a local functional/load result, not an Internet latency or production capacity guarantee. The initial test attempting all 300 new TCP connections together hit local connection refusals; the included test stages connections and tests simultaneous buzzing after registration. Rehearse on the deployed host and venue Wi-Fi with the expected devices before the event. Mobile latency affects first-received ordering; no browser-based system can establish who physically tapped first across different networks.

Socket transport and origin restrictions follow the [Socket.IO server options](https://socket.io/docs/v4/server-options/). WebSocket-only transport avoids polling traffic but requires venue networks to allow WebSockets.
