import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";

const copy = (s) => E.migrateSave(JSON.parse(JSON.stringify(s)));
function film(s, offset = 0) {
  const m = E.act(s, "buy", { script: s.market[0].id });
  for (const p of s.people) {
    p.genres[m.genre] = 80;
    p.look = 1;
  }
  const actors = s.people
    .filter((p) => p.kind === "actor")
    .slice(offset, offset + m.roles.length);
  actors.forEach((p, role) => {
    E.act(s, "audition", { id: m.id, person: p.id, role });
    E.act(s, "hire", {
      id: m.id,
      person: p.id,
      role,
      offer: E.quote(s, p, m, role).high,
    });
  });
  const p = s.people.filter((p) => p.kind === "director")[offset];
  E.act(s, "hire", { id: m.id, person: p.id, offer: E.quote(s, p, m).high });
  return m;
}
function tick(s) {
  for (const n of [...s.notices]) {
    if (n.kind === "nominations") E.act(s, "ackNominations", { year: n.year });
    if (n.kind === "awards") E.act(s, "awardSummary", { year: n.year });
  }
  for (const m of s.movies)
    if (m.event) E.act(s, "event", { id: m.id, choice: "cut" });
  if (!s.ended && !s.epilogue) E.act(s, "next");
}

test("alpha: full-dollar loan limits and invalid transactions preserve state", () => {
  const s = E.newGame(101);
  for (const text of [
    "999",
    "0",
    "8,000,000.01",
    "Infinity",
    "-1000",
    "1,00",
  ]) {
    const before = JSON.stringify(s);
    assert.throws(() => E.act(s, "loan", { amount: E.fromDollars(text) }));
    assert.equal(JSON.stringify(s), before);
  }
  E.act(s, "loan", { amount: E.fromDollars("8,000,000") });
  assert.equal(E.creditAvailable(s), 0);
  assert.equal(s.cash, 14000);
  E.act(s, "repay", { amount: E.fromDollars("7,999,999") });
  assert.ok(Math.abs(E.debtTotal(s) - 0.001) < 1e-9);
  assert.equal(s.cash, 6000.001);
});

test("alpha: 104-week loan amortization agrees with independently calculated interest", () => {
  const s = E.newGame(102);
  E.act(s, "loan", { amount: 1000 });
  let expected = 7000;
  for (let w = 0; w < 104; w++) {
    expected -= 5 + 1000 / 104 + (((1000 * (104 - w)) / 104) * 0.12) / 52;
    tick(s);
  }
  assert.ok(Math.abs(s.cash - expected) < 1e-7);
  assert.equal(E.debtTotal(s), 0);
});

test("alpha: low and max plans finish all scale/genre combinations without NaNs after reload", () => {
  for (const scale of E.SCALES)
    for (const genre of Object.keys(E.GENRES))
      for (const tier of [0, 4]) {
        let s = E.newGame(103);
        s.cash = 1e7;
        const m = film(s);
        m.scale = scale;
        m.genre = genre;
        const b = Object.fromEntries(
          ["sets", "crew", "effects"].map((k) => [k, E.budgetCost(m, k, tier)]),
        );
        E.act(s, "greenlight", {
          id: m.id,
          ...b,
          duration: tier === 0 ? 4 : 20,
        });
        const id = m.id;
        for (let i = 0; i < 22 && E.movie(s, id).stage === "filming"; i++) {
          tick(s);
          s = copy(s);
        }
        const done = E.movie(s, id);
        assert.equal(done.stage, "ready");
        assert.ok(
          Number.isFinite(done.spent) &&
            Number.isFinite(done.quality) &&
            Number.isFinite(s.cash),
        );
        assert.ok(done.quality >= 10 && done.quality <= 98);
      }
});

test("alpha: shared talent cannot film simultaneous movies; disjoint talent can", () => {
  const s = E.newGame(104);
  s.cash = 1e7;
  const a = film(s),
    b = film(s),
    c = film(s, 4);
  const plan = { sets: 25, crew: 25, effects: 0, duration: 4 };
  E.act(s, "greenlight", { id: a.id, ...plan });
  const before = JSON.stringify(s);
  assert.throws(() => E.act(s, "greenlight", { id: b.id, ...plan }), /booked/);
  assert.equal(JSON.stringify(s), before);
  E.act(s, "greenlight", { id: c.id, ...plan });
  for (let i = 0; i < 4; i++) tick(s);
  assert.equal(a.stage, "ready");
  assert.equal(c.stage, "ready");
  E.act(s, "greenlight", { id: b.id, ...plan });
});

test("alpha: final legal shoot reaches a release and awards epilogue without extra weeks", () => {
  const s = E.newGame(105);
  s.cash = 1e7;
  const m = film(s);
  s.week = 252;
  E.act(s, "greenlight", {
    id: m.id,
    sets: 25,
    crew: 25,
    effects: 0,
    duration: 4,
  });
  for (let i = 0; i < 4; i++) tick(s);
  E.act(s, "setRelease", { id: m.id, release: 259 });
  E.act(s, "distribute", { id: m.id, deal: "secure" });
  while (s.week < 260) tick(s);
  assert.equal(s.epilogue, true);
  assert.equal(m.boxWeeks.length, 2);
  E.act(s, "ackNominations", { year: 2030 });
  E.act(s, "awardSummary", { year: 2030 });
  assert.equal(s.ended, true);
  assert.equal(s.week, 260);
});

test("alpha: malformed save without debt is rejected without mutating migration input", () => {
  const malformed = E.newGame(106);
  delete malformed.debt;
  const before = JSON.stringify(malformed);
  assert.throws(() => E.migrateSave(malformed), /Invalid save/);
  assert.equal(JSON.stringify(malformed), before);
});

test("alpha: cents allow partial repayment and complete payoff below one thousand dollars", () => {
  const s = E.newGame(107);
  E.act(s, "loan", { amount: E.fromDollars("1,000") });
  E.act(s, "next");
  assert.ok(E.debtTotal(s) > 0 && E.debtTotal(s) < 1);
  const beforePartial = E.debtTotal(s),
    cashBeforePartial = s.cash;
  E.act(s, "repay", { amount: E.fromDollars("0.01") });
  assert.ok(Math.abs(E.debtTotal(s) - (beforePartial - 0.00001)) < 1e-10);
  assert.ok(Math.abs(s.cash - (cashBeforePartial - 0.00001)) < 1e-10);
  const due = E.debtTotal(s),
    cash = s.cash;
  const display = E.dollarInput(due, 2);
  assert.match(display, /^\d+\.\d{2}$/);
  const payoff = E.fromDollars(display);
  assert.ok(Math.abs(payoff - due) <= 0.0000051);
  E.act(s, "repay", { amount: payoff });
  assert.equal(E.debtTotal(s), 0);
  assert.ok(Math.abs(s.cash - (cash - due)) < 1e-10);
});
