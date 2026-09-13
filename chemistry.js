// Pair history belongs to the studio; film snapshots lock when cameras roll.
const clamp = n => Math.max(-4, Math.min(4, n));
const hash = text => [...String(text)].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, 7);
export const STYLES = ['Instinctive performer', 'Careful preparer', 'Generous scene partner', 'Scene stealer'];
export const style = p => STYLES[hash(p.id) % STYLES.length];
const key = (a, b) => JSON.stringify([a, b].sort());
export function ensure(s) { s.castRelationships ??= {}; }
export function pair(s, a, b) {
  const history = s.castRelationships?.[key(a.id, b.id)];
  const x = hash(a.id) % 4, y = hash(b.id) % 4;
  const base = x === 2 || y === 2 ? 2 : (x === 3 && y === 3) || (x === 0 && y === 1) || (x === 1 && y === 0) ? -2 : 0;
  const bond = history?.bond ?? 0;
  return {ids: [a.id, b.id], effect: clamp(base + bond), bond, films: history?.films ?? 0,
    label: bond >= 2 ? 'Trusted pairing' : bond <= -2 ? 'Lingering tension' : base > 0 ? 'Natural rapport' : base < 0 ? 'Clashing approaches' : 'Finding their rhythm',
    last: history?.last ?? null};
}
export function preview(s, m, candidate, role) {
  return m.contracts.filter(c => c.id !== candidate.id && c.role !== role)
    .map(c => pair(s, candidate, s.people.find(p => p.id === c.id)));
}
export function pairs(s, m) {
  const cast = [...new Set(m.contracts.map(c => c.id))].map(id => s.people.find(p => p.id === id));
  return cast.flatMap((a, i) => cast.slice(i + 1).map(b => pair(s, a, b)));
}
export function lock(s, m) {
  ensure(s);
  m.castChemistry = {version: 1, pairs: pairs(s, m), settled: false};
}
export function adjustment(m, id) {
  const matches = m.castChemistry?.pairs.filter(p => p.ids.includes(id)) ?? [];
  return matches.length ? matches.reduce((sum, p) => sum + p.effect, 0) / matches.length : 0;
}
export function finish(s, m, notify = () => {}) {
  const snapshot = m.castChemistry;
  if (!snapshot || snapshot.settled) return;
  ensure(s);
  snapshot.settled = true;
  for (const p of snapshot.pairs) {
    const performances = p.ids.map(id => m.performances[m.contracts.findIndex(c => c.id === id)]);
    const strong = performances.reduce((a, b) => a + b, 0) / 2 >= 60;
    const old = s.castRelationships[key(...p.ids)] ?? {bond: 0, films: 0};
    const names = p.ids.map(id => s.people.find(actor => actor.id === id).name);
    const text = strong ? `${names.join(' and ')} found their rhythm on ${m.title}. “We should do this again.”` : `${names.join(' and ')} struggled to connect on ${m.title}. “Next time, we need a different approach.”`;
    s.castRelationships[key(...p.ids)] = {bond: clamp(old.bond + (strong ? 1 : -1)), films: old.films + 1, last: {movie: m.id, title: m.title, week: s.week, text}};
    p.outcome = text;
    p.bondAfter = s.castRelationships[key(...p.ids)].bond;
    notify(text);
  }
}
export function relationships(s, id) {
  return Object.entries(s.castRelationships ?? {}).filter(([k]) => JSON.parse(k).includes(id))
    .map(([k, history]) => ({other: JSON.parse(k).find(x => x !== id), ...history}))
    .sort((a, b) => b.last.week - a.last.week);
}
