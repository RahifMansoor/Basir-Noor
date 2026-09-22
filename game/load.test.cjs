const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { io } = require('socket.io-client');
const { createGameServer } = require('./server.cjs');

test('300 live players: simultaneous buzz, authorization, reconnect and restart', { timeout: 120000 }, async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jeopardy-test-'));
  const options = { adminKey: 'test-only-password-123456', stateFile: path.join(directory, 'state.json'), allowNoOrigin: true };
  let app = createGameServer(options);
  const sockets = [];
  t.after(async () => { sockets.forEach(s => s.disconnect()); await app.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  async function listen() { await new Promise(resolve => app.server.listen({ port: 0, host: '127.0.0.1', backlog: 2048 }, resolve)); return `http://127.0.0.1:${app.server.address().port}`; }
  let url = await listen();
  async function connect(auth = {}) {
    const s = io(url, { transports: ['websocket'], auth, reconnection: false }); sockets.push(s);
    await new Promise((resolve, reject) => { s.once('connect', resolve); s.once('connect_error', error => { error.message += ` (${error.description?.message || ''}; ${sockets.length} sockets; ${url})`; reject(error); }); });
    return s;
  }
  const emit = (s, event, data) => s.timeout(30000).emitWithAck(event, data);
  const host = await connect({ adminKey: options.adminKey });
  const audience = await connect();
  let publicState, hostState;
  audience.on('state', s => { publicState = s; }); host.on('state', s => { hostState = s; });
  await assert.rejects(connect({ adminKey: 'wrong' }), /Invalid host password/);
  const started = performance.now();
  const players = [];
  for (let batch = 0; batch < 12; batch++) players.push(...await Promise.all(Array.from({ length: 25 }, async (_, index) => {
    const i = batch * 25 + index;
    const s = await connect();
    const result = await emit(s, 'join', { name: `Guest ${i}`, team: i % 2 ? 'women' : 'men' });
    assert.ok(result.ok, result.error); return { s, player: result.player };
  })));
  assert.equal(Object.keys(app.game.state.players).length, 300);
  const joinMs = Math.round(performance.now() - started);
  const unauthorized = await emit(players[0].s, 'command', { action: 'start', version: app.game.state.version });
  assert.match(unauthorized.error, /Host access/);
  const cmd = async (action, data = {}) => {
    const result = await emit(host, 'command', { action, version: app.game.state.version, ...data });
    assert.ok(result.ok, result.error);
  };
  await cmd('start'); await cmd('select', { id: '0-0' }); await cmd('open');
  const burstStart = performance.now();
  const results = await Promise.all(players.map(({ s }) => emit(s, 'buzz', { round: app.game.state.round })));
  const burstMs = Math.round(performance.now() - burstStart);
  assert.equal(results.filter(r => r.won).length, 1);
  const winner = players[results.findIndex(r => r.won)].player;
  assert.equal(app.game.state.winner.id, winner.id);
  await new Promise(resolve => setTimeout(resolve, 180));
  assert.equal(publicState.winner.id, winner.id); assert.equal(hostState.winner.id, winner.id);
  assert.equal(publicState.question.answer, undefined); assert.ok(hostState.question.answer);
  assert.ok(!JSON.stringify(publicState).includes(winner.token));
  const awardedTeam = winner.team === 'men' ? 'women' : 'men';
  await cmd('correct', { team: awardedTeam });
  const score = app.game.state.scores[awardedTeam];
  assert.equal(app.game.state.scores[winner.team], 0);
  const replay = await emit(host, 'command', { action: 'correct', team: awardedTeam, version: app.game.state.version });
  assert.ok(replay.error); assert.equal(app.game.state.scores[awardedTeam], score);
  const returning = await connect({ token: winner.token });
  assert.equal(app.io.sockets.sockets.get(returning.id).data.playerId, winner.id);
  sockets.forEach(s => s.disconnect()); await app.close();
  app = createGameServer(options); url = await listen();
  assert.equal(app.game.state.scores[awardedTeam], 100);
  assert.equal(Object.keys(app.game.state.players).length, 300);
  const restored = await connect({ token: winner.token });
  assert.equal(app.io.sockets.sockets.get(restored.id).data.playerId, winner.id);
  t.diagnostic(`300 registrations: ${joinMs} ms; 300 simultaneous buzz acknowledgments: ${burstMs} ms; exactly one winner, matching host/display.`);
});
