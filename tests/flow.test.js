import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { storyFor } from "../stories.js";
function film(s) {
  const m = E.act(s, "buy", {
    script: s.market.find((m) => m.scale === "Small").id,
  });
  const actors = s.people
    .filter((p) => p.kind === "actor")
    .sort((a, b) => a.fee - b.fee);
  for (let role = 0; role < m.roles.length; role++) {
    const p = actors[role];
    E.act(s, "audition", { id: m.id, person: p.id, role });
    E.act(s, "hire", {
      id: m.id,
      person: p.id,
      role,
      offer: E.quote(s, p, m, role).high,
    });
  }
  const d = s.people
    .filter((p) => p.kind === "director")
    .sort((a, b) => a.fee - b.fee)[0];
  E.act(s, "hire", { id: m.id, person: d.id, offer: E.quote(s, d, m).high });
  E.act(s, "greenlight", {
    id: m.id,
    sets: 200,
    crew: 250,
    effects: 100,
    duration: 8,
  });
  return m;
}
test("fast advancement matches manual simulation and stops for every production decision", () => {
  const s = E.newGame(61),
    m = film(s);
  let stops = 0;
  while (m.stage === "filming") {
    if (m.event) E.act(s, "event", { id: m.id, choice: "split" });
    const replay = structuredClone(s);
    const result = E.act(s, "nextEvent");
    assert.ok(result.weeks > 0 && result.weeks <= 8);
    for (let i = 0; i < result.weeks; i++) E.act(replay, "next");
    assert.deepEqual(s, replay);
    stops++;
  }
  assert.ok(stops <= 3);
  assert.equal(m.stage, "ready");
  const before = structuredClone(s);
  assert.equal(E.act(s, "nextEvent").weeks, 0);
  assert.deepEqual(s, before);
  E.act(s, "setRelease", { id: m.id, release: s.week + 1 });
  E.act(s, "confirmMarketing", { id: m.id });
  E.act(s, "distribute", { id: m.id, deal: "partner" });
  assert.equal(E.act(s, "nextEvent").weeks, 1);
  assert.equal(m.stage, "theaters");
  assert.ok(s.notices.some((n) => n.kind === "opening"));
  assert.equal(E.act(s, "nextEvent").weeks, 0);
  assert.equal(m.careerChanges.length, m.contracts.length + 1);
});
test("fast advancement stops on development, new scripts, awards, emergency and finale", () => {
  let s = E.newGame(62);
  E.act(s, "original", {
    title: "Tomorrow",
    genre: "Drama",
    subgenre: "Courtroom",
    scale: "Small",
  });
  assert.equal(E.act(s, "nextEvent").weeks, 3);
  assert.equal(s.movies[0].stage, "packaging");
  s = E.newGame(63);
  assert.equal(E.act(s, "nextEvent").weeks, 13);
  s = E.newGame(64);
  s.week = 54;
  assert.equal(E.act(s, "nextEvent").weeks, 1);
  assert.ok(s.notices.some((n) => n.kind === "nominations"));
  s = E.newGame(65);
  s.cash = 1;
  assert.equal(E.act(s, "nextEvent").weeks, 1);
  assert.ok(s.cash < 0);
  s = E.newGame(66);
  s.week = 259;
  assert.equal(E.act(s, "nextEvent").weeks, 1);
  assert.ok(s.epilogue);
});
test("new stories are distinct in a market and commissioned stories match subgenre", () => {
  for (let seed = 1; seed < 100; seed++) {
    const s = E.newGame(seed);
    assert.equal(new Set(s.market.map((m) => m.premise)).size, s.market.length);
  }
  for (const subgenre of Object.values(E.GENRES).flat())
    assert.ok(!storyFor(subgenre).premise.includes("unlikely outsider"));
  const s = E.newGame(67),
    m = E.act(s, "original", {
      title: "Justice",
      genre: "Drama",
      subgenre: "Courtroom",
      scale: "Small",
    });
  assert.match(m.premise, /public defender/);
  assert.match(m.roleDescriptions[0], /public defender/);
  m.stage = "catalog";
  m.fans = 80;
  const sequel = E.act(s, "sequel", { id: m.id });
  assert.notEqual(sequel.premise, m.premise);
  assert.match(sequel.premise, /After Justice/);
  assert.equal(sequel.parent, m.id);
});
test("creative and performance choices have distinct effects without hidden costs", () => {
  const s = E.newGame(68),
    m = film(s);
  const cash = s.cash;
  m.event = { kind: "creative" };
  E.act(s, "event", { id: m.id, choice: "pay" });
  assert.equal(m.audienceBias, 6);
  assert.equal(m.criticBias, -3);
  assert.equal(s.cash, cash);
  const c = m.contracts.find((c) => c.role === 0),
    key = `0:${c.id}`,
    before = m.auditions[key];
  m.event = { kind: "performance" };
  E.act(s, "event", { id: m.id, choice: "split" });
  assert.equal(m.auditions[key], Math.min(100, before + 4));
  assert.equal(s.cash, cash);
  assert.equal(m.productionDecisions.length, 2);
});

test("finished undated films cannot advance time or charge cash", () => {
  const s=E.newGame(123), m=E.act(s,"buy",{script:s.market[0].id});
  m.stage="ready";m.release=null;
  const before=structuredClone(s);
  assert.throws(()=>E.act(s,"next"),/Choose a release date/);
  assert.deepEqual(s,before);
  E.act(s,"setRelease",{id:m.id,release:s.week+3});
  E.act(s,"next");
  assert.equal(s.week,1);
});
