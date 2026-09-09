import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
test("damaged financial records reject without changing candidate state", () => {
  const original = E.newGame(80);
  E.act(original, "buy", { script: original.market[0].id });
  for (const field of [
    "spent",
    "receipts",
    "gross",
    "catalog",
    "campaignSpend",
    "awardSpend",
  ]) {
    for (const value of [undefined, null, -1, "120", NaN, Infinity]) {
      const s = structuredClone(original);
      s.movies[0][field] = value;
      const before = structuredClone(s);
      assert.throws(() => E.migrateSave(s), /Invalid save/);
      assert.deepEqual(s, before);
    }
  }
  for (const [stage, fields] of [
    ["filming", ["weekly"]],
    ["scheduled", ["share", "advance"]],
    ["theaters", ["share", "advance", "opening"]],
    ["catalog", ["share", "advance", "opening"]],
  ]) {
    for (const field of fields) {
      const s = structuredClone(original);
      Object.assign(s.movies[0], {
        stage,
        weekly: 100,
        share: 0.31,
        advance: 100,
        opening: 1000,
      });
      delete s.movies[0][field];
      assert.throws(() => E.migrateSave(s), /Invalid save/);
    }
  }
  assert.deepEqual(E.migrateSave(structuredClone(original)), original);
});
test("partial repayment retains nine dollars and one cent until actually paid", () => {
  for (const remainder of [0.009, 0.00001]) {
    const s = E.newGame(81);
    E.act(s, "loan", { amount: 1 });
    const cash = s.cash;
    E.act(s, "repay", { amount: 1 - remainder });
    assert.ok(Math.abs(E.debtTotal(s) - remainder) < 1e-12);
    assert.equal(E.money(remainder), remainder === .009 ? "$9" : "$0.01");
    assert.ok(Math.abs(s.cash - (cash - 1 + remainder)) < 1e-9);
    E.act(s, "repay", { amount: remainder });
    assert.equal(E.debtTotal(s), 0);
    assert.ok(Math.abs(s.cash - (cash - 1)) < 1e-9);
  }
});
test("weekly processing retains small outstanding principal and reconciles interest", () => {
  const s = E.newGame(82);
  s.debt = [{ balance: 0.02, principal: 0.011 }];
  const cash = s.cash;
  E.act(s, "next");
  assert.ok(Math.abs(E.debtTotal(s) - 0.009) < 1e-12);
  assert.ok(
    Math.abs(s.cash - (cash - E.overhead(s) - 0.011 - (0.02 * 0.12) / 52)) <
      1e-9,
  );
  const nextCash = s.cash;
  E.act(s, "next");
  assert.equal(E.debtTotal(s), 0);
  assert.ok(
    Math.abs(
      s.cash - (nextCash - E.overhead(s) - 0.009 - (0.009 * 0.12) / 52),
    ) < 1e-9,
  );
});
