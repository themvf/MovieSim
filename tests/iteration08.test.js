import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
test("effects shortfalls matter by genre and excess sets cannot fully compensate", () => {
  const loss = (m) => {
    const b = Object.fromEntries(
      ["sets", "crew", "effects"].map((k) => [k, E.budgetCost(m, k, 2)]),
    );
    const baseline = E.productionCraft(m, b);
    const cut = { ...b, effects: 0, sets: b.sets + b.effects };
    return baseline - E.productionCraft(m, cut);
  };
  assert.ok(
    loss({ scale: "Small", genre: "Horror", subgenre: "Creature" }) >
      loss({ scale: "Small", genre: "Drama", subgenre: "Family" }),
  );
  for (const scale of E.SCALES) {
    const m = { scale, genre: "Horror", subgenre: "Creature" };
    const tier = scale === "Blockbuster" ? 3 : 2;
    const b = Object.fromEntries(
      ["sets", "crew", "effects"].map((k) => [k, E.budgetCost(m, k, tier)]),
    );
    assert.ok(Math.abs(E.productionCraft(m, b) - 65) < 0.01);
  }
});
test("scope and difficulty require time; excess weeks have diminishing benefit", () => {
  const small = { scale: "Small", difficulty: 50 },
    big = { scale: "Blockbuster", difficulty: 80 };
  assert.equal(E.recommendedWeeks(small), 8);
  assert.equal(E.recommendedWeeks(big), 14);
  assert.ok(E.scheduleInfo(8, big).quality < E.scheduleInfo(14, big).quality);
  assert.equal(E.scheduleInfo(20, small).quality, 3);
});
test("fame can rise, hold or fall for both actors and directors", () => {
  for (const kind of ["actor", "director"]) {
    const p = { kind, star: 60 };
    assert.ok(E.fameChange(p, 90, 1800, "Small") > 0);
    assert.equal(E.fameChange(p, 60, 1800, "Small"), 0);
    assert.ok(E.fameChange(p, 30, 9000, "Small") < 0);
    assert.ok(
      E.fameChange(p, 30, 9000, "Small") <= E.fameChange(p, 30, 300, "Small"),
    );
  }
});
test("stars protect genre fit and selectively seek challenge; newcomers remain open", () => {
  const p = { star: 80, majorCredits: 5, look: 3, genres: { Drama: 30 } };
  const m = { genre: "Drama", difficulty: 80 };
  assert.match(E.projectInterest(p, m), /genre/);
  p.genres.Drama = 80;
  m.difficulty = 40;
  assert.match(E.projectInterest(p, m), /challenging/);
  p.look = 4;
  assert.equal(E.projectInterest(p, m), null);
  p.majorCredits = 0;
  p.genres.Drama = 10;
  assert.equal(E.projectInterest(p, m), null);
});
test("distribution offers reward demand rather than waste; each model can win", () => {
  const s = E.newGame(37),
    m = E.act(s, "buy", { script: s.market[0].id });
  m.scale = "Mid-budget";
  const a = E.distribution(s, m);
  m.spent *= 100;
  assert.deepEqual(E.distribution(s, m), a);
  assert.ok(a.self.cost > a.partner.cost);
  assert.ok(a.self.reach < a.partner.reach);
  const net = (d, g) =>
    d.advance + Math.max(0, g * d.reach * d.share - d.recoup) - d.cost;
  assert.ok(net(a.secure, 500) > net(a.partner, 500));
  assert.ok(net(a.partner, 6000) > net(a.secure, 6000));
  s.departments.Marketing = 4;
  s.prestige = 100;
  const b = E.distribution(s, m);
  assert.ok(net(b.self, 30000) > net(b.partner, 30000));
});
test("partner recovery counts once and preserves cash accounting after save", () => {
  const s = E.newGame(19),
    m = E.act(s, "buy", { script: s.market[0].id });
  Object.assign(m, {
    stage: "theaters",
    theaterStart: 0,
    opening: 1000,
    fans: 80,
    share: 0.4,
    advance: 0,
    release: 0,
    recoupRemaining: 200,
    recouped: 0,
  });
  const cash = s.cash,
    receipts = m.receipts;
  E.act(s, "next");
  const entitlement = m.boxWeeks.at(-1) * 0.4;
  assert.equal(m.recouped, Math.min(200, entitlement));
  assert.equal(m.receipts - receipts, Math.max(0, entitlement - 200));
  assert.equal(s.cash, cash - E.overhead(s) + Math.max(0, entitlement - 200));
  const replay = E.migrateSave(JSON.parse(JSON.stringify(s)));
  E.act(s, "next");
  E.act(replay, "next");
  assert.deepEqual(replay, s);
});
