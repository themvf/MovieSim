import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";

test("money and estimated rating ranges use readable round numbers", () => {
  assert.equal(E.money(1234), "$1.2M");
  assert.equal(E.money(247), "$250K");
  assert.equal(E.money(-1234), "-$1.2M");
  assert.equal(E.money(0), "$0");
  assert.equal(E.money(0.4), "<$1K");
  for (const n of E.range(63, 2).split("–")) assert.equal(Number(n) % 5, 0);
});

test("distribution saves a forecast and theater marketing cannot rewrite it", () => {
  const s = E.newGame(41);
  const m = E.act(s, "buy", { script: s.market[0].id });
  Object.assign(m, { stage: "ready", release: 5, screen: 70 });
  E.act(s, "distribute", { id: m.id, deal: "partner" });
  const saved = structuredClone(m.expectations);
  assert.ok(saved.high > saved.low);
  assert.equal(m.share * 100, Math.round(m.share * 100));
  m.stage = "theaters";
  E.act(s, "campaign", { id: m.id, campaign: 0 });
  assert.deepEqual(m.expectations, saved);
  assert.deepEqual(
    E.migrateSave(JSON.parse(JSON.stringify(s))).movies[0].expectations,
    saved,
  );
});

test("seasonal resurgence is occasional, saved, and included in actual receipts", () => {
  let boosted = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const s = E.newGame(seed),
      m = E.act(s, "buy", { script: s.market[0].id });
    s.week = 40;
    Object.assign(m, {
      genre: "Horror",
      stage: "theaters",
      theaterStart: 39,
      opening: 1000,
      fans: 80,
      share: 0.5,
      boxWeeks: [1000, 750],
      gross: 1750,
      receipts: 875,
    });
    const before = m.receipts;
    E.act(s, "next");
    const baseline = 1000 * 0.75 ** 2;
    assert.equal(m.boxWeeks.length, 3);
    assert.equal(m.receipts - before, m.boxWeeks[2] * 0.5);
    if (m.resurgences.length) {
      boosted++;
      assert.ok(m.boxWeeks[2] > 750);
      assert.equal(m.resurgences[0].bonus, m.boxWeeks[2] - baseline);
      const replay = JSON.parse(JSON.stringify(s));
      E.act(s, "next");
      E.act(replay, "next");
      assert.deepEqual(s, replay);
      assert.equal(m.resurgences.length, 1);
    } else assert.equal(m.boxWeeks[2], baseline);
  }
  assert.ok(boosted > 0 && boosted < 60);
  assert.equal(E.resurgenceReason("Horror", 5), null);
});

test("version two saves migrate without changing money or existing contracts", () => {
  const s = E.newGame(31);
  s.version = 2;
  const before = JSON.stringify(s);
  const migrated = E.migrateSave(JSON.parse(before));
  assert.equal(migrated.version, E.VERSION);
  assert.equal(migrated.cash, s.cash);
  assert.deepEqual(migrated.movies, s.movies);
});
