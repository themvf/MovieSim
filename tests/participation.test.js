import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
test("participation demands reflect leverage, scope and awards exception for both kinds", () => {
  for (const kind of ["actor", "director"]) {
    const p = { kind, star: 80, majorCredits: 5 };
    assert.equal(
      E.participationDemand(p, { scale: "Blockbuster", difficulty: 90 }),
      0.05,
    );
    assert.equal(
      E.participationDemand(p, { scale: "Mid-budget", difficulty: 90 }),
      0.03,
    );
    assert.equal(
      E.participationDemand(p, { scale: "Small", difficulty: 74 }),
      0.02,
    );
    assert.equal(
      E.participationDemand(p, { scale: "Small", difficulty: 75 }),
      0,
    );
    p.majorCredits = 0;
    assert.equal(E.participationDemand(p, { scale: "Blockbuster" }), 0);
  }
});
test("hire locks a non-negotiable share and sequel options preserve it", () => {
  const s = E.newGame(42),
    m = E.act(s, "buy", { script: s.market[0].id });
  m.scale = "Blockbuster";
  const p = s.people.find((p) => p.kind === "actor");
  p.star = 80;
  p.majorCredits = 5;
  E.act(s, "audition", { id: m.id, person: p.id, role: 0 });
  E.act(s, "hire", {
    id: m.id,
    person: p.id,
    role: 0,
    offer: E.quote(s, p, m).high,
    option: true,
    grossShare: 0,
  });
  assert.equal(m.contracts[0].grossShare, 0.05);
  const sequel = {
    ...m,
    id: "test-sequel",
    parent: m.id,
    scale: "Small",
    difficulty: 90,
  };
  assert.equal(E.quote(s, p, sequel).grossShare, 0.05);
});
test("lead and director have equal drawing weight; supporting roles have half", () => {
  const s = E.newGame(9),
    people = s.people;
  const m = {
    contracts: [
      { id: people[0].id, role: 0 },
      { id: people[1].id, role: 1 },
    ],
    director: { id: people.find((p) => p.kind === "director").id },
  };
  const d = E.person(s, m.director.id);
  people[0].star = 20;
  people[1].star = 20;
  d.star = 20;
  const baseline = E.castDraw(s, m);
  people[0].star += 20;
  const lead = E.castDraw(s, m) - baseline;
  people[0].star -= 20;
  d.star += 20;
  assert.equal(E.castDraw(s, m) - baseline, lead);
  d.star -= 20;
  people[1].star += 20;
  assert.equal(E.castDraw(s, m) - baseline, lead / 2);
});
test("all participation uses the same ticket receipts; cash, costs and save agree", () => {
  const s = E.newGame(11),
    m = E.act(s, "buy", { script: s.market[0].id });
  Object.assign(m, {
    stage: "theaters",
    theaterStart: 0,
    opening: 1000,
    fans: 80,
    share: 0.4,
    advance: 500,
    release: 0,
    contracts: [
      {
        id: s.people[0].id,
        role: 0,
        fee: 100,
        optionCost: 0,
        grossShare: 0.05,
      },
    ],
    director: {
      id: s.people.find((p) => p.kind === "director").id,
      fee: 100,
      optionCost: 0,
      grossShare: 0.03,
    },
  });
  const cash = s.cash,
    cost = m.spent,
    receipts = m.receipts;
  E.act(s, "next");
  const paid = m.boxWeeks.at(-1) * 0.4 * 0.08;
  assert.ok(Math.abs(m.participationPaid - paid) < 1e-9);
  assert.ok(Math.abs(m.spent - cost - paid) < 1e-9);
  assert.ok(
    Math.abs(s.cash - (cash - E.overhead(s) + m.receipts - receipts - paid)) <
      1e-9,
  );
  assert.ok(
    Math.abs(
      m.contracts[0].participationPaid + m.director.participationPaid - paid,
    ) < 1e-9,
  );
  const saved = E.migrateSave(JSON.parse(JSON.stringify(s)));
  assert.equal(saved.movies[0].participationPaid, m.participationPaid);
  m.stage = "catalog";
  m.catalogStart = s.week;
  E.act(s, "next");
  assert.equal(m.participationPaid, paid);
});
test("box office verdict is independent of spending or distribution profitability", () => {
  const m = {
    scale: "Small",
    stage: "catalog",
    gross: 1800 * 3 * 3,
    spent: 999999,
    receipts: 100,
  };
  assert.equal(E.boxOfficeStatus(m).label, "Monster hit");
  m.spent = 1;
  assert.equal(E.boxOfficeStatus(m).label, "Monster hit");
  m.gross = 100;
  assert.equal(E.boxOfficeStatus(m).label, "Flop");
  m.stage = "theaters";
  m.opening = 100;
  assert.equal(E.boxOfficeStatus(m).label, "Weak opening");
});
