"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import styles from './Jeopardy.module.css';

const teamName = team => team === 'men' ? 'Men' : 'Women';
const flowers = [
  [3, 6, 17, 18, 20], [10, 26, 15, -14, 16], [18, 62, 18, 20, -18],
  [24, 14, 16, 16, 28], [31, 44, 14, -18, 14], [39, 10, 19, 12, 30],
  [46, 58, 16.5, -20, -16], [52, 22, 18, 22, 18], [58, 76, 15.5, -16, -22],
  [64, 36, 17.5, 19, 22], [71, 12, 16, -13, 26], [78, 52, 18.5, 15, -18],
  [84, 24, 14.5, -17, 18], [90, 68, 17, 12, -16], [96, 16, 19, -11, 24],
  [8, 84, 15.8, 18, -20],
];
export default function Jeopardy({ mode }) {
  const admin = mode === 'admin', display = mode === 'display', scoreboard = mode === 'scoreboard';
  const socket = useRef(null), offset = useRef(0), buzzerLock = useRef(false);
  const [game, setGame] = useState(null), [player, setPlayer] = useState(null);
  const [connected, setConnected] = useState(false), [error, setError] = useState('');
  const [team, setTeam] = useState(''), [name, setName] = useState('');
  const [password, setPassword] = useState(''), [hostKey, setHostKey] = useState(null);
  const [busy, setBusy] = useState(false), [now, setNow] = useState(Date.now());
  const [adjustTeam, setAdjustTeam] = useState('men'), [points, setPoints] = useState('100'), [reason, setReason] = useState('');
  const [reset, setReset] = useState('');
  useEffect(() => {
    if (admin && !hostKey) return;
    const url = process.env.NEXT_PUBLIC_JEOPARDY_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4001' : '');
    if (!url) { setError('The live game is not configured yet. Please contact the event host.'); return; }
    let token;
    try { token = localStorage.getItem('jeopardy-player-token'); } catch { /* Storage may be unavailable. */ }
    const client = io(url, { transports: ['websocket'], auth: admin ? { adminKey: hostKey } : (display || scoreboard) ? {} : { token }, reconnectionDelayMax: 3000 });
    socket.current = client;
    client.on('connect', () => { setConnected(true); setError(''); });
    client.on('disconnect', () => { setConnected(false); buzzerLock.current = false; setBusy(false); });
    client.on('connect_error', e => { setConnected(false); setError(e.message === 'Invalid host password.' ? e.message : 'Cannot reach the live game. Reconnecting…'); });
    client.on('state', state => { offset.current = state.serverNow - Date.now(); setGame(state); setNow(Date.now() + offset.current); buzzerLock.current = false; });
    client.on('identity', identity => {
      setPlayer(identity);
      if (!identity && !admin && !display && !scoreboard) { try { localStorage.removeItem('jeopardy-player-token'); } catch {} }
    });
    return () => { client.disconnect(); socket.current = null; };
  }, [admin, display, scoreboard, hostKey]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now() + offset.current), 200); return () => clearInterval(timer); }, []);

  async function send(event, payload) {
    if (!socket.current?.connected) { setError('Reconnect before continuing.'); return null; }
    setBusy(true); setError('');
    try {
      const result = await socket.current.timeout(5000).emitWithAck(event, payload);
      if (result.error) { setError(result.error); return null; }
      return result;
    } catch { setError('No confirmation received. Check the live board before trying again.'); return null; }
    finally { setBusy(false); }
  }
  const command = (action, extra = {}) => send('command', { action, version: game.version, ...extra });
  async function join(event) {
    event.preventDefault();
    const result = await send('join', { name, team });
    if (result?.player) {
      const { token, ...identity } = result.player;
      setPlayer(identity); socket.current.auth = { token };
      try { localStorage.setItem('jeopardy-player-token', token); } catch { setError('Your browser cannot save your sign-in. Keep this tab open.'); }
    }
  }
  const timerPaused = Number.isFinite(game?.pausedRemaining);
  const remaining = timerPaused ? Math.max(1, Math.ceil(game.pausedRemaining / 1000)) : game?.deadline ? Math.max(0, Math.ceil((game.deadline - now) / 1000)) : null;
  const canBuzz = connected && player && game?.phase === 'open' && !timerPaused && !game.attempted.includes(player.team) && remaining > 0 && !busy;
  async function buzz() {
    if (!canBuzz || buzzerLock.current) return;
    buzzerLock.current = true;
    const result = await send('buzz', { round: game.round });
    if (result && !result.won) setError('Buzzers are locked. Watch the board for the next opportunity.');
    // Keep locked until a fresh server state; prevent tap spam and offline buffering.
  }
  const hostButton = (action, label) => <button disabled={!connected || busy} onClick={() => command(action)}>{label}</button>;

  return <section className={`${styles.shell} ${display ? styles.display : ''} ${scoreboard ? styles.scoreboard : ''}`}>
    <div className={styles.flowerLayer} aria-hidden="true">
      {flowers.map(([left, top, duration, driftX, driftY], index) => <svg key={index} className={styles.floatingFlower} viewBox="0 0 40 40" style={{ left: `${left}%`, top: `${top}%`, '--flower-duration': `${duration}s`, '--flower-delay': `${(index * 1.3) % 5}s`, '--flower-drift-x': `${driftX}vw`, '--flower-drift-y': `${driftY}vh` }}><g fill="#d7bee6" stroke="#b998cb" strokeWidth=".7"><ellipse cx="20" cy="11" rx="5.5" ry="9"/><ellipse cx="28.6" cy="17.2" rx="5.5" ry="9" transform="rotate(72 28.6 17.2)"/><ellipse cx="25.3" cy="27.2" rx="5.5" ry="9" transform="rotate(144 25.3 27.2)"/><ellipse cx="14.7" cy="27.2" rx="5.5" ry="9" transform="rotate(216 14.7 27.2)"/><ellipse cx="11.4" cy="17.2" rx="5.5" ry="9" transform="rotate(288 11.4 17.2)"/></g><circle cx="20" cy="20" r="4" fill="#f7effa" stroke="#b998cb" strokeWidth=".8"/></svg>)}
    </div>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>EVENT NIGHT · KNOWLEDGE & COMMUNITY</p><h1>Islamic <em>Jeopardy!</em></h1><p>Two teams. One board. A little friendly competition.</p></div>
      <div className={styles.connection}><span className={connected ? styles.live : styles.offline} />{connected ? 'Live' : 'Disconnected'}{(display || scoreboard) && <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => setError('Fullscreen is unavailable in this browser.'))}>Fullscreen</button>}</div>
    </header>
    <nav className={styles.links} aria-label="Game views"><Link href="/">Wedding home</Link><Link href="/jeopardy">Join game</Link>{!admin && !display && !scoreboard && <a href="#game-rules">Game rules</a>}<Link href="/jeopoardy/scoreboard">Scoreboard</Link><Link href="/jeopardy/display">Display board</Link><Link href="/jeopardy/admin">Host controls</Link></nav>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {admin && !connected && <form className={styles.panel} onSubmit={e => { e.preventDefault(); if (hostKey === password) socket.current?.connect(); else setHostKey(password); }}>
      <p className={styles.eyebrow}>HOST ACCESS</p><h2>Run the room.</h2><label htmlFor="host-password">Host password</label><input id="host-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /><button>Enter host console</button>
    </form>}
    {!admin && !display && !scoreboard && !player && <form className={styles.panel} onSubmit={join}>
      <p className={styles.eyebrow}>TAKE YOUR PLACE</p><h2>First, choose your team.</h2>
      <div className={styles.teamPicker} role="group" aria-label="Choose your team and gender">{['men', 'women'].map(t => <button key={t} type="button" aria-pressed={team === t} className={team === t ? styles.selected : ''} onClick={() => setTeam(t)}>{teamName(t)}<small>Join the {t}’s team</small></button>)}</div>
      {team && <><label htmlFor="player-name">Your name</label><input id="player-name" maxLength={40} required autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} placeholder="The name the host will call" /><button disabled={!connected || busy || !game?.registrationOpen}>{game?.registrationOpen === false ? 'Registration is closed' : `Join team ${teamName(team)}`}</button></>}
      <p className={styles.note}>Your name and team will appear on the host screen and, when you buzz first, the live display.</p>
    </form>}
    {player && !admin && !display && !scoreboard && <p className={styles.identity}>Playing as <strong>{player.name}</strong> · Team {teamName(player.team)}</p>}
    {game && <>
      <div className={styles.scores}>{['men', 'women'].map(t => <article key={t} className={(scoreboard ? game.scores[t] > game.scores[t === 'men' ? 'women' : 'men'] : game.winner?.team === t) ? styles.winning : ''}><div><span>TEAM {t.toUpperCase()}</span><small>{game.counts[t]} registered</small></div><strong>{game.scores[t].toLocaleString()}</strong></article>)}</div>
      {scoreboard ? <div className={styles.scoreboardStatus} aria-live="polite"><span>{game.phase === 'lobby' ? 'SESSION NOT STARTED' : game.phase === 'finished' ? 'FINAL SCORE' : 'SESSION IN PROGRESS'}</span><p>{game.phase === 'lobby' ? 'The host will start the session from the admin page.' : game.message}</p>{game.phase === 'finished' && <h2>{game.scores.men === game.scores.women ? 'It’s a tie!' : `Team ${teamName(game.scores.men > game.scores.women ? 'men' : 'women')} wins!`}</h2>}</div> : <>
      <div className={styles.status} aria-live="polite"><p>{game.message}</p>{remaining !== null && <strong className={timerPaused ? styles.paused : ''} aria-label={timerPaused ? `Timer paused with ${remaining} seconds remaining` : `${remaining} seconds remaining`}>{timerPaused ? 'PAUSED' : remaining}<small>{timerPaused ? `${remaining} sec left` : 'sec'}</small></strong>}</div>
      {game.winner && <div className={styles.winner} aria-live="assertive"><span>FIRST TO BUZZ · TEAM {teamName(game.winner.team).toUpperCase()}</span><h2>{game.winner.name}</h2>{game.phase === 'answering' && <p>You have the floor!</p>}</div>}
      {game.question ? <article className={styles.clue}><p className={styles.eyebrow}>{game.question.category} · {game.question.value} POINTS</p><h2>{game.question.clue}</h2>{game.question.answer && <div className={styles.answer}><span>{game.phase === 'revealed' ? 'ANSWER' : 'HOST ONLY · ACCEPTED ANSWER'}</span><p>{game.question.answer}</p></div>}</article> : <>
        {game.phase === 'lobby' && <p className={styles.boardHint}>Get settled in. The host will start the game shortly.</p>}
        {game.phase === 'finished' && <h2 className={styles.result}>{game.scores.men === game.scores.women ? 'It’s a tie!' : `Team ${teamName(game.scores.men > game.scores.women ? 'men' : 'women')} wins!`}</h2>}
        {game.selectionTeam && game.phase === 'board' && <p className={styles.boardHint}>Team {teamName(game.selectionTeam)} chooses the next clue. Tell the host your choice.</p>}
        <div className={styles.boardScroll}><div className={styles.board}>{game.categories.map(category => <div className={styles.column} key={category}><h3>{category}</h3>{game.board.filter(q => q.category === category).map(q => <button key={q.id} disabled={!admin || !connected || busy || game.phase !== 'board' || game.used.includes(q.id)} className={game.used.includes(q.id) ? styles.used : ''} onClick={() => command('select', { id: q.id })} aria-label={`${category}, ${q.value} points${game.used.includes(q.id) ? ', played' : ''}`}>{game.used.includes(q.id) ? '—' : q.value}</button>)}</div>)}</div></div>
      </>}
      </>}
      {!admin && !display && !scoreboard && player && <div className={styles.buzzerDock}><button className={styles.buzzer} disabled={!canBuzz} onClick={buzz}>{canBuzz ? 'BUZZ IN' : game.phase === 'answering' && game.winner?.id === player.id ? 'YOU’RE UP!' : game.attempted.includes(player.team) ? 'OTHER TEAM’S TURN' : 'BUZZER LOCKED'}</button><p>Wait for the host to open buzzers. First eligible buzz received by the server wins.</p></div>}
      {admin && connected && <section className={styles.host}>
        <div className={styles.hostTitle}><h2>Host console</h2><button onClick={() => { setHostKey(null); setPassword(''); setConnected(false); setGame(null); }}>Sign out</button></div>
        <div className={styles.actions}>
          {hostButton('registration', game.registrationOpen ? 'Close registration' : 'Open registration')}
          {game.phase === 'lobby' && hostButton('start', 'Start session')}
          {game.phase === 'reading' && hostButton('open', 'Open buzzers · 15 sec')}
          {['open', 'answering'].includes(game.phase) && (timerPaused ? hostButton('resume', `Resume timer · ${remaining} sec`) : hostButton('pause', 'Pause timer'))}
          {game.phase === 'answering' && <>
            <button disabled={!connected || busy} onClick={() => command('correct', { team: 'men' })}>Correct · Men +{game.question.value}</button>
            <button disabled={!connected || busy} onClick={() => command('correct', { team: 'women' })}>Correct · Women +{game.question.value}</button>
            {hostButton('incorrect', 'Incorrect · no points')}
          </>}
          {['reading', 'open', 'answering', 'awaitingReveal'].includes(game.phase) && hostButton('reveal', game.phase === 'awaitingReveal' ? 'Reveal answer' : 'Reveal answer / skip without scoring')}
          {game.phase === 'revealed' && hostButton('board', 'Return to board')}
        </div>
        <p className={styles.note}>Read the clue, then open buzzers. For a correct answer, choose the team that earns the points. A wrong answer or timeout awards no points and gives the other team a 15-second chance.</p>
        <section className={styles.quickScore} aria-labelledby="quick-score-title">
          <div><p className={styles.eyebrow}>LIVE SCOREBOARD</p><h3 id="quick-score-title">Add points</h3></div>
          <div className={styles.quickButtons}>{['men', 'women'].map(t => <button key={t} disabled={!connected || busy} onClick={() => command('adjust', { team: t, points: 100, reason: 'Quick score' })}>Team {teamName(t)} +100</button>)}</div>
          <form className={styles.customScore} onSubmit={e => { e.preventDefault(); command('adjust', { team: adjustTeam, points: Number(points), reason: 'Custom score' }); }}>
            <label>Team<select value={adjustTeam} onChange={e => setAdjustTeam(e.target.value)}><option value="men">Men</option><option value="women">Women</option></select></label>
            <label>Custom points<input type="number" min="1" max="5000" step="1" required value={points} onChange={e => setPoints(e.target.value)} /></label>
            <button disabled={!connected || busy}>Add points</button>
          </form>
          <Link className={styles.scoreboardLink} href="/jeopoardy/scoreboard" target="_blank" rel="noopener noreferrer">Open scoreboard ↗</Link>
        </section>
        <details><summary>Correct a score</summary><form className={styles.adjust} onSubmit={async e => { e.preventDefault(); if (await command('adjust', { team: adjustTeam, points: Number(points), reason })) setReason(''); }}><label>Team<select value={adjustTeam} onChange={e => setAdjustTeam(e.target.value)}><option value="men">Men</option><option value="women">Women</option></select></label><label>Points (+ or −)<input type="number" min="-5000" max="5000" step="1" required value={points} onChange={e => setPoints(e.target.value)} /></label><label>Reason<input required maxLength={120} value={reason} onChange={e => setReason(e.target.value)} /></label><button disabled={busy}>Apply adjustment</button></form></details>
        <details><summary>Registered players ({game.roster?.length || 0})</summary><ul className={styles.roster}>{game.roster?.map(p => <li key={p.id}>{p.name}<span>{teamName(p.team)}</span></li>)}</ul></details>
        <details><summary>Start a new session</summary><p>This clears all names, scores, and played clues. Everyone will need to join again.</p><form className={styles.adjust} onSubmit={async e => { e.preventDefault(); if (await command('reset', { confirm: reset })) setReset(''); }}><label>Type RESET<input value={reset} onChange={e => setReset(e.target.value)} /></label><button disabled={reset !== 'RESET' || busy}>Reset session</button></form></details>
      </section>}
    </>}
    {!admin && !display && !scoreboard && <details id="game-rules" className={styles.rules} open><summary>Jeopardy rules</summary><ol><li>Choose Men or Women, enter your name, and stay on that team for the session.</li><li>The host selects and reads each clue. Wait until the buzzer opens before tapping <strong>Buzz in</strong>.</li><li>The first eligible buzz received by the game server wins. Connection speed can affect which response arrives first.</li><li>The winner answers aloud within 10 seconds and should respond in the form of a question.</li><li>A correct answer earns the clue’s points. An incorrect answer or timeout earns no points and gives the other team a chance.</li><li>Each team gets one attempt per clue. When buzzing time expires—or after both teams miss—the answer stays hidden until the host selects <strong>Reveal answer</strong>.</li><li>The host may pause and resume a running timer. Buzzing is disabled while paused.</li><li>After all {game?.board.length ?? 51} clues, the team with the highest score wins. Equal scores are a tie.</li></ol></details>}
  </section>;
}
