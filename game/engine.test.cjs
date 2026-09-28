const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Game } = require('./engine.cjs');
const { questions, categories } = require('./questions.cjs');
const command = (g, action, payload = {}, now = 1000) => g.command(action, { ...payload, version: g.state.version }, now);
const setup = () => {
  const g = new Game(), man = g.join('Ahmed', 'men'), woman = g.join('Aisha', 'women');
  command(g, 'start'); command(g, 'chooser', { team: 'men' }); command(g, 'select', { id: '0-0' }); command(g, 'open');
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
  assert.throws(() => command(g, 'correct'), /Choose the team/);
  command(g, 'correct', { team: 'women' });
  assert.deepEqual(g.state.scores, { men: 0, women: 100 });
  assert.equal(g.state.selectionTeam, 'women');
  assert.ok(g.view().question.answer);
  assert.throws(() => command(g, 'correct', { team: 'women' }));
  assert.equal(g.state.scores.women, 100);
});
test('wrong answers and timeouts give the other team a chance, then wait for host reveal', () => {
  const { g, man, woman } = setup(), old = g.state.round;
  g.buzz(man.id, old, 1100);
  command(g, 'incorrect', {}, 2000);
  assert.equal(g.state.scores.men, 0);
  assert.equal(g.buzz(man.id, g.state.round, 11200), false);
  assert.equal(g.buzz(woman.id, old, 11200), false);
  assert.equal(g.buzz(woman.id, g.state.round, 11200), true);
  g.tick(21200); g.tick(30000);
  assert.deepEqual(g.state.scores, { men: 0, women: 0 });
  assert.equal(g.state.phase, 'awaitingReveal');
  assert.equal(g.view().question.answer, undefined);
  command(g, 'reveal');
  assert.equal(g.state.phase, 'revealed');
  assert.ok(g.view().question.answer);
});
test('the choosing team gets the first buzz and the other team gets a chance after a miss', () => {
  const g = new Game(), man = g.join('Ahmed', 'men'), woman = g.join('Aisha', 'women');
  command(g, 'start');
  assert.throws(() => command(g, 'select', { id: '0-0' }), /first chance/);
  command(g, 'chooser', { team: 'women' }); command(g, 'select', { id: '0-0' }); command(g, 'open');
  assert.equal(g.state.eligibleTeam, 'women');
  assert.equal(g.buzz(man.id, g.state.round, 1100), false);
  assert.equal(g.buzz(woman.id, g.state.round, 1100), true);
  command(g, 'incorrect', {}, 2000);
  assert.equal(g.state.eligibleTeam, 'men');
  assert.equal(g.buzz(woman.id, g.state.round, 2100), false);
  assert.equal(g.buzz(man.id, g.state.round, 2100), true);
});
test('host can pause and resume buzzer and answer timers without losing remaining time', () => {
  const { g, man } = setup();
  const round = g.state.round;
  command(g, 'pause', {}, 6000);
  assert.equal(g.state.deadline, null);
  assert.equal(g.state.pausedRemaining, 10000);
  assert.equal(g.tick(50000), false);
  assert.equal(g.buzz(man.id, round, 50000), false);
  command(g, 'resume', {}, 50000);
  assert.equal(g.state.deadline, 60000);
  assert.equal(g.state.pausedRemaining, null);
  assert.equal(g.buzz(man.id, round, 59000), true);
  command(g, 'pause', {}, 59500);
  assert.equal(g.state.pausedRemaining, 9500);
  assert.equal(g.tick(80000), false);
  command(g, 'resume', {}, 80000);
  assert.equal(g.state.deadline, 89500);
});
test('scratch game privately assigns exactly two winners and random images to everyone else', () => {
  const g = new Game(), players = [];
  for (let index = 0; index < 12; index++) players.push(g.join(`Guest ${index}`, index % 2 ? 'women' : 'men'));
  command(g, 'scratchStart');
  assert.equal(g.state.scratch.active, true);
  assert.equal(new Set(g.state.scratch.winnerIds).size, 2);
  assert.equal(g.view(true).scratch.winners.length, 2);
  assert.equal(g.view().scratch.winners, undefined);
  assert.equal(g.view().scratch.results, undefined);
  const privateResults = players.map(player => g.scratchView(player.id));
  assert.equal(privateResults.filter(result => result.winner).length, 2);
  assert.equal(privateResults.filter(result => !result.winner).length, 10);
  assert.ok(privateResults.every(result => result.image.startsWith('/images/jeopardy/scratch/')));
  assert.equal(g.scratchView('unknown-player'), null);
  command(g, 'scratchEnd');
  assert.equal(g.scratchView(players[0].id), null);
  assert.equal(g.view(true).scratch.winners.length, 2);
});
test('no late buzz, no replayed host action, and registration validation', () => {
  const { g, man } = setup();
  assert.equal(g.buzz(man.id, g.state.round, 16000), false);
  g.tick(16000);
  assert.equal(g.state.phase, 'awaitingReveal');
  assert.equal(g.view().question.answer, undefined);
  assert.deepEqual(g.state.scores, { men: 0, women: 0 });
  assert.throws(() => g.command('board', { version: -1 }));
  assert.throws(() => command(g, 'board'), /Finish the clue/);
  command(g, 'reveal');
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
    command(g, 'chooser', { team: 'women' }); command(g, 'select', { id: q.id }); command(g, 'reveal'); command(g, 'board');
  }
  assert.equal(g.state.phase, 'finished');
  command(g, 'adjust', { team: 'men', points: 100, reason: 'Host correction' });
  assert.equal(g.state.scores.men, 100);
  command(g, 'declareWinner');
  assert.equal(g.view().declaredWinner.team, 'men');
  command(g, 'clearWinner');
  assert.equal(g.state.declaredWinner, null);
  assert.throws(() => command(g, 'reset', { confirm: 'no' }));
  command(g, 'reset', { confirm: 'RESET' });
  assert.equal(g.state.phase, 'lobby');
  assert.equal(Object.keys(g.state.players).length, 0);
});
test('five requested categories and clue values appear on the board', () => {
  assert.equal(questions.length, 25);
  assert.deepEqual(categories, [
    'Famous Muslims in the United States',
    'Wedding Traditions',
    'Food',
    'Culture',
    'Bride and Groom (Test)',
  ]);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const category of categories) {
    assert.deepEqual(questions.filter(q => q.category === category).map(q => q.value), [100, 200, 300, 400, 500]);
  }
  assert.equal(questions.find(q => q.category === 'Culture' && q.answer.includes('Rekhta')).value, 300);
  assert.equal(questions.find(q => q.category === 'Bride and Groom (Test)' && q.answer.includes('purple')).value, 500);
});
