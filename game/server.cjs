const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { timingSafeEqual } = require('node:crypto');
const { Server } = require('socket.io');
const { Game } = require('./engine.cjs');

function createGameServer({ adminKey, origins = ['http://localhost:3000'], stateFile, allowNoOrigin = false } = {}) {
  if (!adminKey || adminKey.length < 16) throw Error('HUB_ADMIN_KEY must contain at least 16 characters.');
  if (!stateFile) throw Error('A persistent stateFile is required.');
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  // Exclusive lock prevents two processes from declaring different buzzer winners.
  const lock = `${stateFile}.lock`;
  const lockFd = fs.openSync(lock, 'wx');
  fs.writeFileSync(lockFd, String(process.pid));
  let game;
  try { game = new Game(fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : undefined); }
  catch (error) { fs.closeSync(lockFd); fs.unlinkSync(lock); throw error; }
  const server = http.createServer((req, res) => {
    res.writeHead(req.url === '/health' ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(req.url === '/health' ? { ok: true } : { error: 'Not found' }));
  });
  const io = new Server(server, {
    transports: ['websocket'], serveClient: false, maxHttpBufferSize: 4096,
    cors: { origin: origins },
    allowRequest: (req, cb) => cb(null, origins.includes(req.headers.origin) || (allowNoOrigin && !req.headers.origin)),
  });
  const persist = () => {
    const temp = `${stateFile}.tmp`;
    const fd = fs.openSync(temp, 'w', 0o600);
    try { fs.writeFileSync(fd, JSON.stringify(game.state)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temp, stateFile);
  };
  const mutate = (fn) => {
    const before = structuredClone(game.state);
    try { const result = fn(); if (before.version !== game.state.version) persist(); return result; }
    catch (error) { game.state = before; throw error; }
  };
  const publish = () => {
    io.to('audience').emit('state', game.view());
    io.to('hosts').emit('state', game.view(true));
  };
  let rosterTimer;
  const publishRoster = () => { if (!rosterTimer) rosterTimer = setTimeout(() => { rosterTimer = null; publish(); }, 150); };
  io.use((socket, next) => {
    const key = socket.handshake.auth?.adminKey;
    if (key !== undefined) {
      if (typeof key !== 'string' || Buffer.byteLength(key) !== Buffer.byteLength(adminKey) || !timingSafeEqual(Buffer.from(key), Buffer.from(adminKey))) return next(Error('Invalid host password.'));
      socket.data.admin = true;
    }
    const player = game.player(socket.handshake.auth?.token);
    if (player) socket.data.playerId = player.id;
    next();
  });
  io.on('connection', socket => {
    socket.join(socket.data.admin ? 'hosts' : 'audience');
    const identity = () => {
      const player = game.state.players[socket.data.playerId];
      socket.emit('identity', player ? { id: player.id, name: player.name, team: player.team } : null);
    };
    socket.emit('state', game.view(socket.data.admin)); identity();
    let windowStart = Date.now(), calls = 0;
    const handle = (event, fn) => socket.on(event, (payload, ack) => {
      if (typeof ack !== 'function') return;
      if (Date.now() - windowStart > 1000) { windowStart = Date.now(); calls = 0; }
      if (++calls > 8) return ack({ error: 'Please wait a moment before trying again.' });
      try { ack({ ok: true, ...fn(payload && typeof payload === 'object' ? payload : {}) }); }
      catch (error) {
        if (error.code) { console.error('Game persistence failed:', error.code); ack({ error: 'The game could not save. Please contact the host.' }); }
        else ack({ error: error.message });
      }
    });
    handle('join', ({ name, team }) => {
      if (game.state.players[socket.data.playerId]) throw Error('You have already joined.');
      const player = mutate(() => game.join(name, team));
      socket.data.playerId = player.id; identity(); publishRoster();
      return { player };
    });
    handle('buzz', ({ round }) => {
      // Losing clicks perform no disk writes and trigger no broadcasts.
      const s = game.state;
      const p = s.players[socket.data.playerId];
      if (!p) throw Error('Join the game first.');
      if (s.phase !== 'open' || round !== s.round || s.attempted.includes(p.team) || Date.now() >= s.deadline) return { won: false };
      const won = mutate(() => game.buzz(p.id, round));
      if (won) publish();
      return { won };
    });
    handle('command', ({ action, ...payload }) => {
      if (!socket.data.admin) throw Error('Host access is required.');
      mutate(() => { game.tick(); game.command(action, payload); });
      if (action === 'reset') {
        for (const client of io.sockets.sockets.values()) { delete client.data.playerId; client.emit('identity', null); }
      }
      publish(); return {};
    });
  });
  const timer = setInterval(() => {
    if (!game.state.deadline || game.state.deadline > Date.now()) return;
    try { if (mutate(() => game.tick())) publish(); } catch (error) { console.error('Timer save failed:', error.code || error.message); }
  }, 100);
  return { server, io, game, close: async () => {
    clearInterval(timer); clearTimeout(rosterTimer);
    await new Promise(resolve => io.close(resolve));
    fs.closeSync(lockFd); fs.unlinkSync(lock);
  } };
}
module.exports = { createGameServer };
if (require.main === module) {
  const app = createGameServer({
    adminKey: process.env.HUB_ADMIN_KEY || process.env.JEOPARDY_ADMIN_KEY,
    origins: (process.env.JEOPARDY_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()),
    stateFile: path.resolve(process.env.JEOPARDY_STATE_FILE || '.jeopardy/state.json'),
  });
  app.server.listen({ port: Number(process.env.PORT || 4001), host: '0.0.0.0', backlog: 2048 }, () => console.log('Jeopardy service listening on port', process.env.PORT || 4001));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await app.close(); process.exit(0); });
}
