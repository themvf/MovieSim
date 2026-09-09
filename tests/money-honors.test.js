import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";

test("dollar display and entry preserve the currency unit", () => {
  assert.equal(E.money(120), "$120,000");
  assert.equal(E.dollarInput(120), "120,000");
  for (const input of ["120000", "120,000", "$120,000"])
    assert.equal(E.fromDollars(input), 120);
  assert.equal(E.fromDollars("120"), 0.12);
  assert.equal(E.fromDollars("120,000.50"), 120.0005);
  for (const input of ["12,00", "", "-120", "abc", "Infinity"])
    assert.ok(Number.isNaN(E.fromDollars(input)));
});

test("talent honors count nominations without exposing unrevealed winners", () => {
  const s = E.newGame(44),
    p = s.people[0];
  s.seasons = [
    {
      year: 2026,
      categories: [
        {
          category: "Lead Acting",
          nominees: [{ person: p.id, id: "m1", title: "First Film" }],
        },
        {
          category: "Picture",
          nominees: [{ person: null, id: "m1", title: "First Film" }],
        },
      ],
    },
  ];
  s.awards = [
    {
      year: 2026,
      completed: false,
      revealed: 0,
      results: [
        { category: "Lead Acting", person: p.id, id: "m1", ours: true },
      ],
    },
  ];
  let honors = E.talentHonors(s, p);
  assert.equal(honors.nominations.length, 1);
  assert.equal(honors.wins, 0);
  assert.equal(honors.nominations[0].won, false);
  s.awards[0].revealed = 1;
  p.awards = 1;
  honors = E.talentHonors(s, p);
  assert.equal(honors.nominations[0].won, true);
  assert.equal(honors.wins, 1);
  assert.deepEqual(
    E.talentHonors(E.migrateSave(JSON.parse(JSON.stringify(s))), p),
    honors,
  );
});

test("all-shoestring plans save about 70 percent of filming and reduce craft contribution", () => {
  for (const scale of E.SCALES)
    for (const genre of Object.keys(E.GENRES)) {
      const m = { scale, genre };
      const b = (tier) =>
        Object.fromEntries(
          ["sets", "crew", "effects"].map((k) => [k, E.budgetCost(m, k, tier)]),
        );
      const low = b(0),
        standard = b(2),
        total = (b) => b.sets + b.crew + b.effects;
      assert.ok(
        total(low) / total(standard) > 0.27 &&
          total(low) / total(standard) < 0.33,
      );
      assert.equal(E.score(E.productionCraft(m, low)), 20);
      assert.equal(E.score(E.productionCraft(m, standard)), 65);
      const qualityDifference =
        (E.productionCraft(m, standard) - E.productionCraft(m, low)) * 0.25;
      assert.ok(qualityDifference > 10 && qualityDifference < 12);
    }
});
