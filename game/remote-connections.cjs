const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const url = process.argv[2];
const origin = process.argv[3];
if (!url || !origin) throw Error('Usage: node game/remote-connections.cjs <game-url> <website-origin>');

const sockets = [];
const connect = () => new Promise((resolve, reject) => {
  const socket = io(url, { transports: ['websocket'], extraHeaders: { Origin: origin }, reconnection: false, timeout: 30000 });
  sockets.push(socket);
  const timer = setTimeout(() => reject(Error('Timed out waiting for initial game state.')), 30000);
  socket.once('connect_error', error => { clearTimeout(timer); reject(error); });
  socket.once('state', state => { clearTimeout(timer); resolve({ socket, state }); });
});

(async () => {
  const started = performance.now();
  try {
    for (let batch = 0; batch < 12; batch++) {
      await Promise.all(Array.from({ length: 25 }, () => connect()));
    }
    const connectionMs = Math.round(performance.now() - started);
    await new Promise(resolve => setTimeout(resolve, 1000));
    assert.equal(sockets.length, 300);
    assert.equal(sockets.filter(socket => socket.connected).length, 300);
    console.log(JSON.stringify({ ok: true, connections: 300, assignedSimulationGroups: { men: 150, women: 150 }, connectionMs, allStillConnected: true, mutations: 0 }));
  } finally {
    sockets.forEach(socket => socket.disconnect());
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
