const { randomUUID, randomBytes, randomInt } = require('node:crypto');
const { questions, categories } = require('./questions.cjs');
const freshScratch = () => ({ active: false, id: null, winnerIds: [], results: {} });
const freshState = () => ({ version: 0, phase: 'lobby', registrationOpen: true, scores: { men: 0, women: 0 }, players: {}, used: [], current: null, winner: null, attempted: [], deadline: null, pausedRemaining: null, round: randomUUID(), selectionTeam: null, chooserTeam: null, eligibleTeam: null, declaredWinner: null, scratch: freshScratch(), message: 'Welcome! Choose a team and join the game.' });
class Game {
  constructor(saved) { this.state = saved ? { ...freshState(), ...saved, scratch: saved.scratch || freshScratch() } : freshState(); }
  question() { return questions.find(q => q.id === this.state.current); }
  view(admin = false) {
    const s = this.state, q = this.question();
    const scratch = admin ? { active: s.scratch.active, id: s.scratch.id, winners: s.scratch.winnerIds.map(id => ({ id, name: s.players[id]?.name || 'Unknown player', team: s.players[id]?.team || null })) } : { active: s.scratch.active, id: s.scratch.id };
    return { ...s, players: undefined, scratch, categories, board: questions.map(({ id, category, value }) => ({ id, category, value })),
      counts: Object.values(s.players).reduce((a, p) => { a[p.team]++; return a; }, { men: 0, women: 0 }),
      question: q ? { id: q.id, category: q.category, value: q.value, clue: q.clue, ...((admin || s.phase === 'revealed') ? { answer: q.answer } : {}) } : null,
      ...(admin ? { roster: Object.values(s.players).map(({ token, ...p }) => p) } : {}), serverNow: Date.now() };
  }
  player(token) { return Object.values(this.state.players).find(p => p.token === token); }
  scratchView(playerId) {
    const scratch = this.state.scratch;
    if (!scratch.active || !scratch.results[playerId]) return null;
    return { active: true, id: scratch.id, ...scratch.results[playerId] };
  }
  join(name, team) {
    if (!this.state.registrationOpen) throw Error('Registration is closed. Ask the host to reopen it.');
    if (!['men', 'women'].includes(team) || typeof name !== 'string' || !name.trim() || name.trim().length > 40 || /[\x00-\x1f]/.test(name)) throw Error('Choose a team and enter a name of 1–40 characters.');
    if (Object.keys(this.state.players).length >= 2000) throw Error('This event is full.');
    const p = { id: randomUUID(), token: randomBytes(32).toString('hex'), name: name.trim(), team };
    this.state.players[p.id] = p;
    this.state.version++;
    return p;
  }
  open(now, eligibleTeam = this.state.eligibleTeam) { Object.assign(this.state, { phase: 'open', winner: null, eligibleTeam, round: randomUUID(), deadline: now + 15000, pausedRemaining: null, message: `Team ${eligibleTeam === 'men' ? 'Men' : 'Women'} can buzz now!` }); }
  incorrect(now, timeout = false) {
    const s = this.state;
    s.attempted.push(s.winner.team);
    if (s.attempted.length === 2) this.awaitReveal(timeout ? 'Time expired. Both teams have had a chance; the host may reveal the answer.' : 'Both teams have answered incorrectly. The host may reveal the answer.');
    else {
      const otherTeam = s.attempted[0] === 'men' ? 'women' : 'men';
      Object.assign(s, { phase: 'reading', winner: null, eligibleTeam: otherTeam, round: randomUUID(), deadline: null, pausedRemaining: null, message: `${timeout ? 'Time expired' : 'Incorrect answer'}. The host can now open Team ${otherTeam === 'men' ? 'Men' : 'Women'} buzzers for 15 seconds.` });
    }
  }
  awaitReveal(message) { Object.assign(this.state, { phase: 'awaitingReveal', deadline: null, pausedRemaining: null, message }); }
  reveal() { Object.assign(this.state, { phase: 'revealed', deadline: null, pausedRemaining: null, message: 'Answer revealed. The host will return to the board.' }); }
  tick(now = Date.now()) {
    const s = this.state;
    if (!s.deadline || now < s.deadline) return false;
    if (s.phase === 'answering') this.incorrect(now, true);
    else if (s.phase === 'open') this.awaitReveal('Buzzing time expired. The answer remains hidden until the host reveals it.');
    else return false;
    s.version++; return true;
  }
  buzz(playerId, round, now = Date.now()) {
    const s = this.state, p = s.players[playerId];
    if (!p) throw Error('Join the game first.');
    if (s.phase !== 'open' || round !== s.round || now >= s.deadline || s.eligibleTeam !== p.team || s.attempted.includes(p.team)) return false;
    // No awaits: the first eligible packet handled by this process wins atomically.
    Object.assign(s, { phase: 'answering', winner: { id: p.id, name: p.name, team: p.team }, deadline: now + 10000, pausedRemaining: null, message: `${p.name} has the floor. Answer in the form of a question!` });
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
      case 'chooser':
        if (s.phase !== 'board' || !['men', 'women'].includes(payload.team)) throw Error('Choose Men or Women while the board is open.');
        s.chooserTeam = payload.team; s.message = `Team ${payload.team === 'men' ? 'Men' : 'Women'} chooses the next clue and gets the first chance to buzz.`; break;
      case 'select':
        if (s.phase !== 'board' || s.used.includes(payload.id) || !questions.some(q => q.id === payload.id)) throw Error('Choose an unused clue from the board.');
        if (!['men', 'women'].includes(s.chooserTeam)) throw Error('Choose which team gets the first chance to buzz.');
        Object.assign(s, { current: payload.id, phase: 'reading', eligibleTeam: s.chooserTeam, winner: null, attempted: [], deadline: null, pausedRemaining: null, round: randomUUID(), message: `Listen to the clue. Team ${s.chooserTeam === 'men' ? 'Men' : 'Women'} will buzz first.` });
        s.used.push(payload.id); break;
      case 'open':
        if (s.phase !== 'reading') throw Error('Read a clue before opening buzzers.');
        this.open(now); break;
      case 'pause':
        if (!['open', 'answering'].includes(s.phase) || !s.deadline) throw Error('There is no running timer to pause.');
        s.pausedRemaining = Math.max(1, s.deadline - now); s.deadline = null; s.message = 'Timer paused by the host.'; break;
      case 'resume':
        if (!['open', 'answering'].includes(s.phase) || !Number.isFinite(s.pausedRemaining)) throw Error('There is no paused timer to resume.');
        s.deadline = now + s.pausedRemaining; s.pausedRemaining = null;
        s.message = s.phase === 'open' ? `Team ${s.eligibleTeam === 'men' ? 'Men' : 'Women'} can buzz now!` : `${s.winner.name} has the floor. Answer in the form of a question!`; break;
      case 'correct':
        if (s.phase !== 'answering') throw Error('There is no answer to judge.');
        if (!['men', 'women'].includes(payload.team)) throw Error('Choose the team that earns the points.');
        s.scores[payload.team] += this.question().value; s.selectionTeam = payload.team; s.declaredWinner = null; this.reveal(); s.message = `Team ${payload.team === 'men' ? 'Men' : 'Women'} earns ${this.question().value} points!`; break;
      case 'incorrect':
        if (s.phase !== 'answering') throw Error('There is no answer to judge.');
        this.incorrect(now); break;
      case 'reveal':
        if (!['reading', 'open', 'answering', 'awaitingReveal'].includes(s.phase)) throw Error('No active clue.');
        this.reveal(); break;
      case 'board':
        if (s.phase !== 'revealed') throw Error('Finish the clue first.');
        Object.assign(s, { phase: s.used.length === questions.length ? 'finished' : 'board', current: null, winner: null, chooserTeam: null, eligibleTeam: null, deadline: null, pausedRemaining: null, message: s.used.length === questions.length ? 'Game complete! Thank you for playing.' : 'Choose which team picks the next clue.' }); break;
      case 'adjust':
        if (!['men', 'women'].includes(payload.team) || !Number.isInteger(payload.points) || Math.abs(payload.points) > 5000 || typeof payload.reason !== 'string' || !payload.reason.trim() || payload.reason.length > 120) throw Error('Enter a team, whole-number adjustment (up to 5,000), and a reason.');
        s.scores[payload.team] += payload.points; s.declaredWinner = null; s.message = `Host adjustment: ${payload.team} ${payload.points >= 0 ? '+' : ''}${payload.points}. ${payload.reason.trim()}`; break;
      case 'declareWinner': {
        if (s.scores.men === s.scores.women) throw Error('Break the tie before declaring a winner.');
        const team = s.scores.men > s.scores.women ? 'men' : 'women';
        s.declaredWinner = { team, declaredAt: now }; s.message = `Team ${team === 'men' ? 'Men' : 'Women'} wins!`; break;
      }
      case 'clearWinner':
        if (!s.declaredWinner) throw Error('No winner celebration is active.');
        s.declaredWinner = null; break;
      case 'scratchStart': {
        if (s.scratch.active) throw Error('End the current scratch game before starting another.');
        const ids = Object.keys(s.players);
        if (ids.length < 2) throw Error('At least two registered players are needed for the scratch game.');
        for (let i = ids.length - 1; i > 0; i--) { const j = randomInt(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]]; }
        const winnerIds = ids.slice(0, 2), results = {};
        winnerIds.forEach((id, index) => { results[id] = { winner: true, image: `/images/jeopardy/scratch/winner-${index + 1}.svg` }; });
        const consolationImages = [1, 2, 3, 4].map(index => `/images/jeopardy/scratch/surprise-${index}.svg`);
        ids.slice(2).forEach(id => { results[id] = { winner: false, image: consolationImages[randomInt(consolationImages.length)] }; });
        s.scratch = { active: true, id: randomUUID(), winnerIds, results }; break;
      }
      case 'scratchEnd':
        if (!s.scratch.active) throw Error('There is no active scratch game.');
        s.scratch.active = false; break;
      case 'reset':
        if (payload.confirm !== 'RESET') throw Error('Type RESET to start a new event.');
        this.state = freshState(); this.state.version = s.version; break;
      default: throw Error('Unknown host action.');
    }
    this.state.version++;
  }
}
module.exports = { Game, freshState };
