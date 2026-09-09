const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Game } = require('./engine.cjs');
const command = (g, action, payload = {}, now = 1000) => g.command(action, { ...payload, version: g.state.version }, now);
const setup = () => {
  const g = new Game(), man = g.join('Ahmed', 'men'), woman = g.join('Aisha', 'women');
  command(g, 'start'); command(g, 'select', { id: '0-0' }); command(g, 'open');
  return { g, man, woman };
};
test('one winner, stale rounds rejected, answers and tokens hidden', () => {
  const { g, man, woman } = setup();
  const round = g.state.round;
  assert.equal(g.buzz(man.id, 'old-round', 1100), false);
  assert.equal(g.buzz(man.id, round, 1100), true);
  assert.equal(g.buzz(woman.id, round, 1100), false);
  assert.equal(g.view().question.answer, undefined);
  assert.equal(g.view().players, undefined);
  assert.ok(!JSON.stringify(g.view(true)).includes(man.token));
  command(g, 'correct');
  assert.equal(g.state.scores.men, 100);
  assert.ok(g.view().question.answer);
  assert.throws(() => command(g, 'correct'));
  assert.equal(g.state.scores.men, 100);
});
test('timeout deducts once and opens a fresh round to the other team', () => {
  const { g, man, woman } = setup(), old = g.state.round;
  g.buzz(man.id, old, 1100);
  assert.equal(g.tick(11100), true);
  assert.equal(g.state.scores.men, -100);
  assert.equal(g.buzz(man.id, g.state.round, 11200), false);
  assert.equal(g.buzz(woman.id, old, 11200), false);
  assert.equal(g.buzz(woman.id, g.state.round, 11200), true);
  g.tick(21200); g.tick(30000);
  assert.equal(g.state.scores.women, -100);
  assert.equal(g.state.phase, 'revealed');
});
test('no late buzz, no replayed host action, and registration validation', () => {
  const { g, man } = setup();
  assert.equal(g.buzz(man.id, g.state.round, 16000), false);
  g.tick(16000);
  assert.equal(g.state.phase, 'revealed');
  assert.deepEqual(g.state.scores, { men: 0, women: 0 });
  assert.throws(() => g.command('board', { version: -1 }));
  command(g, 'board');
  assert.throws(() => command(g, 'select', { id: '0-0' }));
  command(g, 'registration');
  assert.throws(() => g.join('Guest', 'men'));
  command(g, 'registration');
  assert.throws(() => g.join('Guest', 'invalid'));
  assert.throws(() => g.join(' ', 'women'));
});
test('whole board completes, ties and score corrections, reset clears identities', () => {
  const g = new Game();
  g.join('Guest', 'women'); command(g, 'start');
  for (const q of g.view().board) {
    command(g, 'select', { id: q.id }); command(g, 'reveal'); command(g, 'board');
  }
  assert.equal(g.state.phase, 'finished');
  command(g, 'adjust', { team: 'men', points: 100, reason: 'Host correction' });
  assert.equal(g.state.scores.men, 100);
  assert.throws(() => command(g, 'reset', { confirm: 'no' }));
  command(g, 'reset', { confirm: 'RESET' });
  assert.equal(g.state.phase, 'lobby');
  assert.equal(Object.keys(g.state.players).length, 0);
});
