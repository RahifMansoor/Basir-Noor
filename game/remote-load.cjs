const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { io } = require('socket.io-client');

const url = process.argv[2];
const origin = process.argv[3];
const adminKey = process.env.REMOTE_JEOPARDY_ADMIN_KEY;
if (!url || !origin || !adminKey) {
  throw Error('Usage: REMOTE_JEOPARDY_ADMIN_KEY=... node game/remote-load.cjs <game-url> <website-origin>');
}

const sockets = [];
const connect = (auth = {}) => new Promise((resolve, reject) => {
  const socket = io(url, { transports: ['websocket'], auth, extraHeaders: { Origin: origin }, reconnection: false, timeout: 30000 });
  sockets.push(socket);
  const timer = setTimeout(() => reject(Error('Timed out waiting for initial game state.')), 30000);
  socket.once('connect_error', error => { clearTimeout(timer); reject(error); });
  socket.once('state', state => { clearTimeout(timer); resolve({ socket, state }); });
});
const emit = (socket, event, data) => socket.timeout(30000).emitWithAck(event, data);

(async () => {
  let host, hostState, ownsState = false;
  const runId = randomUUID().slice(0, 8);
  const started = performance.now();
  try {
    const hostConnection = await connect({ adminKey });
    host = hostConnection.socket; hostState = hostConnection.state;
    host.on('state', state => { hostState = state; });
    const publicConnection = await connect();
    let publicState = publicConnection.state;
    publicConnection.socket.on('state', state => { publicState = state; });

    const registered = hostState.counts.men + hostState.counts.women;
    if (hostState.phase !== 'lobby' || registered !== 0 || hostState.scores.men !== 0 || hostState.scores.women !== 0 || hostState.used.length !== 0) {
      throw Error(`Safety stop: live game is not empty (phase=${hostState.phase}, registered=${registered}, used=${hostState.used.length}). No changes were made.`);
    }
    ownsState = true;

    const players = [];
    for (let batch = 0; batch < 12; batch++) {
      players.push(...await Promise.all(Array.from({ length: 25 }, async (_, index) => {
        const i = batch * 25 + index;
        const { socket } = await connect();
        const result = await emit(socket, 'join', { name: `Load test ${runId}-${i + 1}`, team: i % 2 ? 'women' : 'men' });
        assert.ok(result.ok, result.error);
        return { socket, player: result.player };
      })));
    }
    const registrationMs = Math.round(performance.now() - started);
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.equal(hostState.counts.men, 150);
    assert.equal(hostState.counts.women, 150);

    const command = async (action, data = {}) => {
      const result = await emit(host, 'command', { action, version: hostState.version, ...data });
      assert.ok(result.ok, result.error);
    };
    await command('registration');
    await command('start');
    await command('chooser', { team: 'men' });
    await command('select', { id: hostState.board.find(q => !hostState.used.includes(q.id)).id });
    await command('open');

    const burstStart = performance.now();
    const results = await Promise.all(players.map(({ socket }) => emit(socket, 'buzz', { round: hostState.round })));
    const burstMs = Math.round(performance.now() - burstStart);
    assert.equal(results.filter(result => result.won).length, 1);
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(publicState.winner.id, hostState.winner.id);
    console.log(JSON.stringify({ ok: true, men: 150, women: 150, registrationMs, simultaneousBuzzMs: burstMs, exactlyOneWinner: true }));
  } finally {
    if (ownsState && host?.connected) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await emit(host, 'command', { action: 'reset', confirm: 'RESET', version: hostState.version }).catch(() => null);
        if (result?.ok) break;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    sockets.forEach(socket => socket.disconnect());
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
