import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
function acquire(s) {
  return E.act(s, "buy", {
    script: (s.market.find((m) => m.scale === "Small") || s.market[0]).id,
  });
}
function packageFilm(s, m, options = {}) {
  const actors = s.people
    .filter(
      (p) =>
        p.kind === "actor" && !p.retired && E.available(p, s.week, s.week + 8),
    )
    .sort((a, b) => a.fee - b.fee);
  for (let role = 0; role < m.roles.length; role++) {
    const p = actors[role];
    E.act(s, "audition", { id: m.id, person: p.id, role });
    const q = E.quote(s, p, m, role);
    E.act(s, "hire", {
      id: m.id,
      person: p.id,
      role,
      offer: Math.round((q.low + q.high) / 2),
      option: !!options.option,
    });
  }
  const p = s.people
      .filter(
        (p) =>
          p.kind === "director" &&
          !p.retired &&
          E.available(p, s.week, s.week + 8),
      )
      .sort((a, b) => a.fee - b.fee)[0],
    q = E.quote(s, p, m);
  E.act(s, "audition", {id:m.id, person:p.id});
  E.act(s, "hire", {
    id: m.id,
    person: p.id,
    offer: Math.round((q.low + q.high) / 2),
  });
}
function greenlight(s, m, extra = {}) {
  E.act(s, "greenlight", {
    id: m.id,
    sets: 250,
    crew: 350,
    effects: 100,
    duration: 8,
    ...extra,
  });
}
function tick(s) {
  for (const n of [...s.notices]) {
    if (n.kind === "nominations") E.act(s, "ackNominations", { year: n.year });
    if (n.kind === "awards") E.act(s, "awardSummary", { year: n.year });
  }
  if (s.epilogue) {
    for (const a of s.awards)
      if (!a.completed) E.act(s, "awardSummary", { year: a.year });
  }
  s.notices = [];
  if (s.ended) return;
  for (const m of s.movies)
    if (m.event) E.act(s, "event", { id: m.id, choice: "split" });
  E.act(s, "next");
}
function finish(s, m) {
  while (m.stage === "filming") tick(s);
}
function release(s, m, deal = "partner") {
  if (m.release === null)
    E.act(s, "setRelease", { id: m.id, release: s.week + 3 });
  E.act(s, "confirmMarketing", { id: m.id, none: !m.campaignSpend });
  E.act(s, "distribute", { id: m.id, deal });
  while (m.stage === "scheduled") tick(s);
}
test("new runs have distinct talent and deterministic saved seeds", () => {
  assert.deepEqual(E.newGame(7), E.newGame(7));
  assert.notDeepEqual(E.newGame(7).people, E.newGame(8).people);
  assert.equal(E.newGame(7).cash, 6000);
  assert.equal(new Set(E.newGame(7).people.map((p) => p.name)).size, 32);
});
test("purchase keeps the real script quality separate from unrevealed film quality", () => {
  const s = E.newGame(7),
    sc = s.market[0],
    m = E.act(s, "buy", { script: sc.id });
  assert.equal(m.scriptQuality, sc.quality);
  assert.equal(m.quality, null);
  assert.equal(s.cash, 6000 - sc.price);
  assert.throws(() => E.act(s, "buy", { script: sc.id }));
});
test("auditions are free, immediate, and repeatable without rerolling", () => {
  const s = E.newGame(5),
    m = acquire(s),
    p = s.people[0];
  const cash = s.cash;
  E.act(s, "audition", { id: m.id, person: p.id, role: 0 });
  const first = m.auditions[`0:${p.id}`],
    rng = s.rng;
  E.act(s, "audition", { id: m.id, person: p.id, role: 0 });
  assert.equal(m.auditions[`0:${p.id}`], first);
  assert.equal(s.rng, rng);
  assert.equal(s.cash, cash);
  assert.equal(s.week, 0);
});
test("complete film lifecycle reconciles advance, ticket share, catalog and costs", () => {
  const s = E.newGame(71),
    m = acquire(s);
  packageFilm(s, m);
  greenlight(s, m);
  finish(s, m);
  assert.equal(m.stage, "ready");
  assert.ok(Number.isFinite(m.quality));
  const before = s.cash;
  E.act(s, "screen", { id: m.id });
  assert.equal(s.cash, before - 45);
  assert.throws(() => E.act(s, "screen", { id: m.id }));
  E.act(s, "campaign", { id: m.id, campaign: 0 });
  release(s, m);
  assert.equal(m.stage, "theaters");
  assert.equal(m.gross, m.opening);
  assert.ok(
    Math.abs(m.receipts - (m.advance + m.gross * m.share - (m.recouped ?? 0))) <
      0.001,
  );
  while (m.stage === "theaters") tick(s);
  E.act(s,"streamingDeal",{id:m.id,deal:"royalty"});
  const old = m.receipts;
  tick(s);
  assert.ok(m.receipts > old);
  assert.ok(
    Math.abs(
      m.receipts -
        (m.advance + m.gross * m.share - (m.recouped ?? 0) + m.catalog),
    ) < 0.001,
  );
  assert.ok(m.spent > m.price);
});
test("all distribution options disclose and apply their share and fee", () => {
  for (const deal of ["secure", "partner", "self"]) {
    const s = E.newGame(17),
      m = acquire(s);
    packageFilm(s, m);
    greenlight(s, m);
    finish(s, m);
    E.act(s, "setRelease", { id: m.id, release: s.week + 3 });
    const d = E.distribution(s, m)[deal],
      cash = s.cash,
      spent = m.spent;
    E.act(s, "confirmMarketing", { id: m.id, none: !m.campaignSpend });
    E.act(s, "distribute", { id: m.id, deal });
    assert.equal(s.cash, cash + d.advance - d.cost);
    assert.equal(m.spent, spent + d.cost);
    assert.equal(m.share, d.share);
    assert.throws(() => E.act(s, "distribute", { id: m.id, deal }));
  }
});
test("production conflicts are blocked without partially changing state", () => {
  const s = E.newGame(3),
    a = acquire(s),
    b = acquire(s);
  packageFilm(s, a);
  packageFilm(s, b);
  greenlight(s, a);
  const cash = s.cash;
  assert.throws(() => greenlight(s, b), /booked/);
  assert.equal(b.stage, "packaging");
  assert.equal(s.cash, cash);
});
test("release date can only be chosen after wrap and is fixed after confirmation", () => {
  const s = E.newGame(8),
    m = acquire(s);
  packageFilm(s, m);
  greenlight(s, m);
  assert.equal(m.release, null);
  assert.throws(() => E.act(s, "setRelease", { id: m.id, release: 20 }));
  finish(s, m);
  assert.equal(m.release, null);
  assert.throws(() => E.act(s, "distribute", { id: m.id, deal: "self" }));
  E.act(s, "setRelease", { id: m.id, release: 20 });
  assert.throws(() => E.act(s, "setRelease", { id: m.id, release: 22 }));
  while (s.week < 19) tick(s);
  assert.throws(() => tick(s), /distribution/);
  assert.equal(s.week, 19);
  release(s, m);
  assert.equal(m.release, 20);
});

test("pending production events pause time and both cash/quality responses work", () => {
  for (const choice of ["pay", "cut", "split"]) {
    const s = E.newGame(4),
      m = acquire(s);
    packageFilm(s, m);
    greenlight(s, m);
    m.event = { cost: 100, damage: 10 };
    const cash = s.cash;
    assert.throws(() => E.act(s, "next"), /production decision/);
    E.act(s, "event", { id: m.id, choice });
    assert.equal(m.event, null);
    assert.equal(
      cash - s.cash,
      choice === "pay" ? 100 : choice === "split" ? 50 : 0,
    );
    assert.equal(m.penalty, choice === "pay" ? 0 : choice === "split" ? 4 : 10);
  }
});
test("emergency debt is optional and credit is finite", () => {
  const s = E.newGame(5);
  s.cash = -100;
  assert.throws(() => E.act(s, "next"), /emergency/);
  E.act(s, "loan", { amount: 1000 });
  assert.equal(s.cash, 900);
  assert.equal(E.debtTotal(s), 1000);
  assert.throws(() => E.act(s, "loan", { amount: 8000 }));
  const before = s.cash;
  E.act(s, "next");
  assert.ok(
    Math.abs(
      before - s.cash - (1000 / 104 + (1000 * 0.12) / 52 + E.overhead(s)),
    ) < 0.001,
  );
  s.cash = -5;
  E.act(s, "end");
  assert.ok(s.ended);
  assert.throws(() => E.act(s, "loan", { amount: 1000 }), /ended/);
});
test("cancellation charges closeout, releases bookings and preserves bank debt", () => {
  const s = E.newGame(19),
    m = acquire(s);
  E.act(s, "loan", { amount: 500 });
  packageFilm(s, m);
  greenlight(s, m);
  const outstanding = E.debtTotal(s),
    closeout = E.remaining(m) * 0.15,
    cash = s.cash;
  E.act(s, "cancel", { id: m.id });
  assert.equal(m.stage, "cancelled");
  assert.equal(E.debtTotal(s), outstanding);
  assert.equal(s.cash, cash - closeout);
  assert.ok(s.people.every((p) => p.bookings.every((b) => b.movie !== m.id)));
});
test("sequel options preserve negotiated actor fee after a breakout", () => {
  const s = E.newGame(29),
    m = acquire(s);
  packageFilm(s, m, { option: true });
  greenlight(s, m);
  finish(s, m);
  release(s, m);
  const c = m.contracts[0],
    p = E.person(s, c.id);
  p.fee = 3000;
  const seq = E.act(s, "sequel", { id: m.id });
  assert.equal(seq.parent, m.id);
  assert.equal(seq.stage, "development");
  assert.equal(seq.contracts.length, 0);
  assert.equal(seq.receipts, 0);
  assert.equal(seq.gross, 0);
  assert.equal(E.quote(s, p, seq).low, c.fee);
  assert.ok(Number.isFinite(seq.scriptQuality));
});
test("paid upgrades improve facilities and screening/forecast precision", () => {
  const s = E.newGame(39),
    m = acquire(s);
  packageFilm(s, m);
  const before = E.projection(s, m),
    cost = E.upgradeCost(s, "Research"),
    cash = s.cash;
  E.act(s, "upgrade", { name: "Research" });
  assert.equal(s.cash, cash - cost);
  const after = E.projection(s, m);
  assert.ok(after[1] - after[0] < before[1] - before[0]);
  E.act(s, "upgrade", { name: "Soundstage" });
  greenlight(s, m);
  assert.ok(m.productionTotal < 700);
});
test("five-year run ages talent, holds five ceremonies, and terminates", () => {
  const s = E.newGame(44),
    age = s.people[0].age;
  while (!s.ended) tick(s);
  assert.equal(s.week, 260);
  assert.equal(s.awards.length, 5);
  assert.deepEqual(
    s.awards.map((a) => a.year),
    [2026, 2027, 2028, 2029, 2030],
  );
  assert.equal(s.people[0].age, age + 5);
  assert.ok(s.people.length > 32);
  assert.equal(E.summary(s).score, 0);
  assert.throws(() => E.act(s, "next"), /ended/);
});
test("original commissioning uses title, genre, subgenre and scale", () => {
  const s = E.newGame(54),
    m = E.act(s, "original", {
      title: "First Light",
      genre: "Drama",
      subgenre: "Character study",
      scale: "Small",
    });
  assert.equal(m.title, "First Light");
  assert.equal(m.price, 100);
  assert.equal(m.stage, "development");
  tick(s);
  tick(s);
  tick(s);
  assert.equal(m.stage, "packaging");
  assert.ok(m.scriptQuality > 0);
});
test("reloaded state reproduces identical outcomes", () => {
  const s = E.newGame(64),
    m = acquire(s);
  packageFilm(s, m);
  greenlight(s, m);
  const copy = JSON.parse(JSON.stringify(s));
  for (let i = 0; i < 8; i++) {
    tick(s);
    tick(copy);
  }
  assert.deepEqual(s, copy);
});
test("late game prevents productions that cannot release inside five years", () => {
  const s = E.newGame(74),
    m = acquire(s);
  packageFilm(s, m);
  s.week = 255;
  assert.throws(() => greenlight(s, m), /enough time/);
  assert.equal(m.stage, "packaging");
});
test("negative or nonfinite monetary input is rejected", () => {
  const s = E.newGame(84);
  for (const amount of [-10, NaN, Infinity, 900000])
    assert.throws(() => E.act(s, "loan", { amount }));
  assert.equal(s.cash, 6000);
});
