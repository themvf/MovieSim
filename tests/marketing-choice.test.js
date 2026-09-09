import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
const ready = () => {
  const s = E.newGame(29),
    m = E.act(s, "buy", { script: s.market[0].id });
  m.stage = "ready";
  E.act(s, "setRelease", { id: m.id, release: 2 });
  return { s, m };
};
test("distribution cannot bypass explicit marketing choice", () => {
  const { s, m } = ready(),
    before = structuredClone(s);
  assert.throws(
    () => E.act(s, "distribute", { id: m.id, deal: "partner" }),
    /marketing budget/,
  );
  assert.deepEqual(s, before);
  E.act(s, "confirmMarketing", { id: m.id, none: true });
  assert.equal(m.marketingBudget, 0);
  E.act(s, "distribute", { id: m.id, deal: "partner" });
  assert.equal(m.stage, "scheduled");
});
test("confirming paid marketing records the plan without a second charge", () => {
  const { s, m } = ready();
  E.act(s, "campaign", { id: m.id, campaign: 0 });
  assert.equal(m.marketingConfirmed, false);
  const cash = s.cash;
  assert.throws(
    () => E.act(s, "confirmMarketing", { id: m.id, none: true }),
    /already purchased/,
  );
  E.act(s, "confirmMarketing", { id: m.id });
  assert.equal(s.cash, cash);
  assert.equal(m.marketingBudget, E.CAMPAIGNS[0].cost);
  E.act(s, "distribute", { id: m.id, deal: "secure" });
  const beforeForecast = m.expectations.high;
  E.act(s, "campaign", { id: m.id, campaign: 1 });
  assert.equal(m.marketingBudget, E.CAMPAIGNS[0].cost + E.CAMPAIGNS[1].cost);
  assert.ok(m.expectations.high > beforeForecast);
  const restored = E.migrateSave(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.movies[0].marketingConfirmed, true);
  assert.equal(restored.movies[0].marketingBudget, m.marketingBudget);
});
