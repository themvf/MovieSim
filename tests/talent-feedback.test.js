import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";

test("talent ranges have exact variable widths and stay inside 0–100", () => {
  const s = E.newGame(12),
    widths = new Set();
  for (let look = 0; look < 4; look++) {
    for (const value of [0, 1, 43, 78, 99, 100]) {
      const r = E.talentEstimate(s, { look }, value);
      widths.add(r.high - r.low);
      assert.equal(r.low % 5, 0);
      assert.equal(r.high % 5, 0);
      assert.ok(r.low >= 0 && r.high <= 100);
      assert.deepEqual(r, E.talentEstimate(s, { look }, value));
    }
  }
  assert.deepEqual([...widths], [5, 10, 15, 20]);
  s.departments.Casting = 4;
  for (let look = 0; look < 4; look++) {
    const r = E.talentEstimate(s, { look }, 70);
    assert.equal(r.high - r.low, 5);
  }
});

test("hire snapshots survive staff upgrades and match real actor/director delivery", () => {
  const s = E.newGame(18),
    m = E.act(s, "buy", {
      script: s.market.find((m) => m.scale === "Small").id,
    });
  s.cash = 100000;
  const actors = s.people.filter((p) => p.kind === "actor");
  const hire = (p, role) => {
    E.act(s, "audition", { id: m.id, person: p.id, role });
    const q = E.quote(s, p, m, role);
    E.act(s, "hire", { id: m.id, person: p.id, role, offer: q.high });
  };
  m.roles.forEach((_, i) => hire(actors[i], i));
  hire(s.people.find((p) => p.kind === "director"));
  const snapshots = [...m.contracts, m.director].map((c) =>
    structuredClone(c.expectation),
  );
  s.departments.Casting = 4;
  E.act(s, "greenlight", {
    id: m.id,
    sets: 250,
    crew: 350,
    effects: 100,
    duration: 8,
  });
  while (m.stage === "filming") {
    if (m.event) E.act(s, "event", { id: m.id, choice: "split" });
    E.act(s, "next");
  }
  assert.deepEqual(
    [...m.contracts, m.director].map((c) => c.expectation),
    snapshots,
  );
  assert.equal(m.performances.length, m.roles.length);
  assert.ok(m.directorPerformance >= 0 && m.directorPerformance <= 100);
  const expectedQuality = Math.max(
    10,
    Math.min(
      98,
      (m.scriptQuality ?? 60) * 0.25 +
        (m.performances.reduce((a, v) => a + v, 0) / m.performances.length) *
          0.3 +
        m.directorPerformance * 0.2 +
        m.craft * 0.25 -
        m.penalty,
    ),
  );
  assert.equal(m.quality, expectedQuality);
  const saved = JSON.parse(JSON.stringify(s));
  saved.version = 3;
  assert.deepEqual(E.migrateSave(saved).movies[0], m);
});

test("expanded subgenres remain valid choices without changing legacy scope keys", () => {
  const s = E.newGame(52);
  assert.equal(Object.values(E.GENRES).flat().length, 58);
  for (const [genre, subgenres] of Object.entries(E.GENRES)) {
    assert.equal(new Set(subgenres).size, subgenres.length);
    assert.ok(subgenres.length >= 9);
    E.act(s, "original", {
      title: "A new story",
      genre,
      subgenre: subgenres.at(-1),
      scale: "Small",
    });
  }
  assert.equal(E.scopeName("Small"), "Low-budget film");
  assert.deepEqual(E.SCALES, ["Small", "Mid-budget", "Blockbuster"]);
});
