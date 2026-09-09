import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
function original() {
  const s = E.newGame(18),
    m = E.act(s, "buy", { script: s.market[0].id });
  m.stage = "theaters";
  m.fans = 75;
  m.participationPaid = 200;
  m.contracts = m.roles.map((_, role) => ({
    id: s.people[role].id,
    role,
    fee: 120,
    option: role === 0,
    optionCost: 0,
    grossShare: role === 0 ? 0.05 : 0,
  }));
  m.director = {
    id: s.people.find((p) => p.kind === "director").id,
    fee: 150,
    option: false,
    optionCost: 0,
    grossShare: 0,
  };
  return { s, m };
}
test("sequel can rehire original roles and director with displayed terms; only development charged", () => {
  const { s, m } = original(),
    cash = s.cash,
    terms = E.returningTeam(s, m);
  const seq = E.act(s, "sequel", { id: m.id, rehire: true });
  assert.equal(seq.stage, "development");
  assert.equal(s.cash, cash - 140);
  assert.deepEqual(
    seq.contracts.map((c) => c.id),
    m.contracts.map((c) => c.id),
  );
  assert.equal(seq.director.id, m.director.id);
  assert.equal(seq.contracts[0].fee, 120);
  assert.equal(seq.contracts[0].grossShare, 0.05);
  assert.equal(seq.participationPaid, 0);
  for (const c of [...seq.contracts, seq.director]) {
    assert.equal(c.fee, terms.find((t) => t.id === c.id).fee);
    assert.ok(c.expectation);
    assert.equal(c.optionCost, 0);
  }
  assert.notEqual(seq.contracts[0], m.contracts[0]);
});
test("unavailable original team cannot charge development; individual selection remains available", () => {
  const { s, m } = original();
  E.person(s, m.director.id).bookings.push({
    start: 3,
    end: 11,
    movie: "other",
  });
  const before = structuredClone(s);
  assert.throws(
    () => E.act(s, "sequel", { id: m.id, rehire: true }),
    /unavailable/,
  );
  assert.deepEqual(s, before);
  const seq = E.act(s, "sequel", { id: m.id });
  assert.equal(seq.contracts.length, 0);
  assert.equal(seq.director, null);
});
