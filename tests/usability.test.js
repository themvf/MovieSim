import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";

test("genre aptitude and presence affect role ability independently of fame", () => {
  const p = E.newGame(15).people[1];
  p.talent = 65;
  p.presence = 70;
  p.genres.Comedy = 95;
  p.genres.Drama = 25;
  assert.ok(E.roleAbility(p, "Comedy") > E.roleAbility(p, "Drama") + 15);
  const before = E.roleAbility(p, "Comedy");
  p.star = 99;
  assert.equal(E.roleAbility(p, "Comedy"), before);
  p.presence = 95;
  assert.ok(E.roleAbility(p, "Comedy") > before);
});
test("fresh face status tracks major credits rather than current fame", () => {
  const p = E.newGame(15).people.find((p) => p.majorCredits === 0);
  assert.ok(E.freshFace(p));
  p.history.push({ title: "Tiny short" });
  assert.ok(E.freshFace(p));
  p.majorCredits = 1;
  assert.equal(E.freshFace(p), false);
});
test("budget tiers are ordered, scale-aware and genre-sensitive", () => {
  const small = { scale: "Small", genre: "Drama" },
    large = { scale: "Blockbuster", genre: "Action" };
  for (const key of ["sets", "crew", "effects"])
    for (let i = 1; i < 5; i++)
      assert.ok(E.budgetCost(small, key, i) > E.budgetCost(small, key, i - 1));
  assert.ok(E.budgetCost(large, "crew", 2) > E.budgetCost(small, "crew", 2));
  assert.ok(
    E.budgetCost({ ...small, genre: "Action" }, "effects", 2) >
      E.budgetCost(small, "effects", 2),
  );
});
test("10 weeks has explicit cost, execution, and weekly risk tradeoffs versus 8", () => {
  const a = E.scheduleInfo(8),
    b = E.scheduleInfo(10);
  assert.ok(b.multiplier > a.multiplier);
  assert.ok(b.quality > a.quality);
  assert.ok(b.risk < a.risk);
  const s = E.newGame(16),
    m = { scale: "Small", genre: "Drama" },
    budget = { sets: 250, crew: 350, effects: 100 };
  assert.equal(E.productionCosts(s, m, budget, 8).total, 700);
  assert.ok(E.productionCosts(s, m, budget, 10).total > 700);
});
test("legacy save migration preserves cash, people, RNG, and signed distributions", () => {
  const s = E.newGame(17);
  s.version = 1;
  delete s.seasons;
  delete s.prestigeLevel;
  for (const p of s.people) {
    delete p.genres;
    delete p.presence;
    delete p.majorCredits;
  }
  s.movies = [
    { id: "old1", stage: "filming", release: 30 },
    { id: "old2", stage: "scheduled", release: 40 },
  ];
  const rng = s.rng,
    cash = s.cash,
    names = s.people.map((p) => p.name);
  E.migrateSave(s);
  assert.equal(s.cash, cash);
  assert.equal(s.rng, rng);
  assert.deepEqual(
    s.people.map((p) => p.name),
    names,
  );
  assert.equal(s.movies[0].release, null);
  assert.equal(s.movies[1].release, 40);
  const once = structuredClone(s);
  E.migrateSave(s);
  assert.deepEqual(s, once);
});
test("nominations happen in January; ceremony comes later in March", () => {
  const s = E.newGame(18);
  s.week = 54;
  E.act(s, "next");
  assert.equal(E.date(s.week).month, 0);
  assert.equal(s.seasons.length, 1);
  assert.equal(s.awards.length, 0);
  assert.throws(() => E.act(s, "next"), /awards/);
  E.act(s, "ackNominations", { year: 2026 });
  while (s.week < 62) E.act(s, "next");
  assert.equal(E.date(s.week).month, 2);
  assert.equal(s.awards.length, 1);
  assert.equal(s.awards[0].revealed, 0);
  assert.throws(() => E.act(s, "next"), /awards/);
});
test("winner reveals are persistent and exactly once, with no skipped categories", () => {
  const s = E.newGame(19);
  E.nominations(s, 2026);
  E.act(s, "ackNominations", { year: 2026 });
  E.ceremony(s, 2026);
  const original = structuredClone(s.awards[0].results);
  E.act(s, "awardReveal", { year: 2026 });
  assert.equal(s.awards[0].revealed, 1);
  const reloaded = E.migrateSave(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(reloaded.awards[0].results, original);
  assert.equal(reloaded.awards[0].revealed, 1);
  E.act(reloaded, "awardSummary", { year: 2026 });
  assert.equal(reloaded.awards[0].revealed, 4);
  assert.ok(reloaded.awards[0].completed);
  const prestige = reloaded.prestige;
  E.act(reloaded, "awardSummary", { year: 2026 });
  assert.equal(reloaded.prestige, prestige);
});
test("prestige milestones are queued once, including multiple levels crossed", () => {
  const s = E.newGame(20);
  s.prestige = 61;
  E.notifyPrestige(s);
  assert.deepEqual(
    s.notices.filter((n) => n.kind === "prestige").map((n) => n.level),
    [1, 2, 3],
  );
  E.notifyPrestige(s);
  assert.equal(s.notices.length, 3);
});
test("final-year awards get an epilogue without advancing finances or operating time", () => {
  const s = E.newGame(21);
  s.week = 259;
  E.act(s, "next");
  assert.equal(s.week, 260);
  assert.ok(s.epilogue);
  assert.equal(s.ended, false);
  const cash = s.cash;
  assert.equal(s.seasons.at(-1).year, 2030);
  E.act(s, "ackNominations", { year: 2030 });
  assert.throws(() => E.act(s, "loan", { amount: 1000 }), /final awards/);
  E.act(s, "awardSummary", { year: 2030 });
  assert.ok(s.ended);
  assert.equal(s.week, 260);
  assert.equal(s.cash, cash);
});
