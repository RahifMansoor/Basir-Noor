const { randomUUID, randomBytes } = require('node:crypto');
const { questions, categories } = require('./questions.cjs');
const freshState = () => ({ version: 0, phase: 'lobby', registrationOpen: true, scores: { men: 0, women: 0 }, players: {}, used: [], current: null, winner: null, attempted: [], deadline: null, round: randomUUID(), selectionTeam: null, message: 'Welcome! Choose a team and join the game.' });
class Game {
  constructor(saved) { this.state = saved || freshState(); }
  question() { return questions.find(q => q.id === this.state.current); }
  view(admin = false) {
    const s = this.state, q = this.question();
    return { ...s, players: undefined, categories, board: questions.map(({ id, category, value }) => ({ id, category, value })),
      counts: Object.values(s.players).reduce((a, p) => { a[p.team]++; return a; }, { men: 0, women: 0 }),
      question: q ? { id: q.id, category: q.category, value: q.value, clue: q.clue, ...((admin || s.phase === 'revealed') ? { answer: q.answer } : {}) } : null,
      ...(admin ? { roster: Object.values(s.players).map(({ token, ...p }) => p) } : {}), serverNow: Date.now() };
  }
  player(token) { return Object.values(this.state.players).find(p => p.token === token); }
  join(name, team) {
    if (!this.state.registrationOpen) throw Error('Registration is closed. Ask the host to reopen it.');
    if (!['men', 'women'].includes(team) || typeof name !== 'string' || !name.trim() || name.trim().length > 40 || /[\x00-\x1f]/.test(name)) throw Error('Choose a team and enter a name of 1–40 characters.');
    if (Object.keys(this.state.players).length >= 2000) throw Error('This event is full.');
    const p = { id: randomUUID(), token: randomBytes(32).toString('hex'), name: name.trim(), team };
    this.state.players[p.id] = p;
    this.state.version++;
    return p;
  }
  open(now) { Object.assign(this.state, { phase: 'open', winner: null, round: randomUUID(), deadline: now + 15000, message: 'Buzz in when you know the answer!' }); }
  incorrect(now, timeout = false) {
    const s = this.state;
    s.scores[s.winner.team] -= this.question().value;
    s.attempted.push(s.winner.team);
    if (s.attempted.length === 2) this.reveal();
    else { this.open(now); s.message = `${timeout ? 'Time expired' : 'Incorrect answer'}. The other team can buzz!`; }
  }
  reveal() { Object.assign(this.state, { phase: 'revealed', deadline: null, message: 'Answer revealed. The host will return to the board.' }); }
  tick(now = Date.now()) {
    const s = this.state;
    if (!s.deadline || now < s.deadline) return false;
    if (s.phase === 'answering') this.incorrect(now, true);
    else if (s.phase === 'open') this.reveal();
    else return false;
    s.version++; return true;
  }
  buzz(playerId, round, now = Date.now()) {
    const s = this.state, p = s.players[playerId];
    if (!p) throw Error('Join the game first.');
    if (s.phase !== 'open' || round !== s.round || now >= s.deadline || s.attempted.includes(p.team)) return false;
    // No awaits: the first eligible packet handled by this process wins atomically.
    Object.assign(s, { phase: 'answering', winner: { id: p.id, name: p.name, team: p.team }, deadline: now + 10000, message: `${p.name} has the floor. Answer in the form of a question!` });
    s.version++; return true;
  }
  command(action, payload = {}, now = Date.now()) {
    const s = this.state;
    if (payload.version !== s.version) throw Error('The game changed. Please try again.');
    switch (action) {
      case 'registration': s.registrationOpen = !s.registrationOpen; break;
      case 'start':
        if (s.phase !== 'lobby') throw Error('The game has already started.');
        s.phase = 'board'; s.message = 'Choose a category and point value.'; break;
      case 'select':
        if (s.phase !== 'board' || s.used.includes(payload.id) || !questions.some(q => q.id === payload.id)) throw Error('Choose an unused clue from the board.');
        Object.assign(s, { current: payload.id, phase: 'reading', winner: null, attempted: [], deadline: null, round: randomUUID(), message: 'Listen to the clue. Buzzers will open when the host is ready.' });
        s.used.push(payload.id); break;
      case 'open':
        if (s.phase !== 'reading') throw Error('Read a clue before opening buzzers.');
        this.open(now); break;
      case 'correct':
        if (s.phase !== 'answering') throw Error('There is no answer to judge.');
        s.scores[s.winner.team] += this.question().value; s.selectionTeam = s.winner.team; this.reveal(); s.message = `${s.winner.name} is correct!`; break;
      case 'incorrect':
        if (s.phase !== 'answering') throw Error('There is no answer to judge.');
        this.incorrect(now); break;
      case 'reveal':
        if (!['reading', 'open', 'answering'].includes(s.phase)) throw Error('No active clue.');
        this.reveal(); break;
      case 'board':
        if (s.phase !== 'revealed') throw Error('Finish the clue first.');
        Object.assign(s, { phase: s.used.length === questions.length ? 'finished' : 'board', current: null, winner: null, deadline: null, message: s.used.length === questions.length ? 'Game complete! Thank you for playing.' : 'Choose the next clue.' }); break;
      case 'adjust':
        if (!['men', 'women'].includes(payload.team) || !Number.isInteger(payload.points) || Math.abs(payload.points) > 5000 || typeof payload.reason !== 'string' || !payload.reason.trim() || payload.reason.length > 120) throw Error('Enter a team, whole-number adjustment (up to 5,000), and a reason.');
        s.scores[payload.team] += payload.points; s.message = `Host adjustment: ${payload.team} ${payload.points >= 0 ? '+' : ''}${payload.points}. ${payload.reason.trim()}`; break;
      case 'reset':
        if (payload.confirm !== 'RESET') throw Error('Type RESET to start a new event.');
        this.state = freshState(); this.state.version = s.version; break;
      default: throw Error('Unknown host action.');
    }
    this.state.version++;
  }
}
module.exports = { Game, freshState };
