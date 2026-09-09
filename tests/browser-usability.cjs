const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  fs.mkdirSync("test-results", { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
  const click = (sel) =>
    page
      .locator(sel + ":visible")
      .first()
      .click();
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("moviesim-save-v1")));
  const fixture = async (fn) => {
    await page.evaluate(fn);
    await page.reload();
    await page.waitForSelector("h1");
  };
  await fixture(async () => {
    const E = await import("./engine.js");
    const s = E.newGame(501),
      m = E.act(s, "buy", {
        script: s.market.find((m) => m.scale === "Small").id,
      });
    const actors = s.people
      .filter((p) => p.kind === "actor")
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
      });
    }
    const director = s.people
        .filter((p) => p.kind === "director")
        .sort((a, b) => a.fee - b.fee)[0],
      q = E.quote(s, director, m);
    E.act(s, "hire", {
      id: m.id,
      person: director.id,
      offer: Math.round((q.low + q.high) / 2),
    });
    actors[0].bookings.push({ start: 0, end: 12, movie: null });
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="movie"]');
  await click('[data-action="production"]');
  await page.locator('input[name="sets"]').fill("3");
  await page.locator('input[name="duration"]').fill("10");
  const cost = await page.locator("#sets-cost").innerText();
  assert.match(
    await page.locator("#production-preview").innerText(),
    /10 weeks/,
  );
  assert.equal(
    await page.locator("#release-select").count(),
    0,
    "No pre-wrap release picker",
  );
  await page.screenshot({ path: "test-results/v02-production-conflict.png" });
  await click('[data-action="replaceConflict"]');
  await page.locator(".casting-filter-details > summary").click();
  await page.locator("#casting-budget").selectOption("250");
  assert.match(
    await page.locator("dialog").innerText(),
    /Returning to your production plan/,
  );
  await page.locator(".talent-secondary > summary").first().click();
  assert.match(await page.locator("dialog").innerText(), /SCREEN PRESENCE/);
  await page.screenshot({ path: "test-results/v02-casting.png" });
  await click('[data-action="audition"]');
  await click('[data-action="offer"]');
  await page.locator("#offer-form button").click();
  await page.waitForSelector("#production-form");
  assert.equal(await page.locator('input[name="sets"]').inputValue(), "3");
  assert.equal(await page.locator('input[name="duration"]').inputValue(), "10");
  assert.equal(await page.locator("#sets-cost").innerText(), cost);
  assert.equal(await page.locator(".conflict-panel").count(), 0);
  await page.locator('button[form="production-form"]').click();
  assert.equal((await state()).movies[0].release, null);
  await click('[data-action="close"]');
  // Jump only the simulation in a fixture to test the new post-wrap release/distribution UI.
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    while (s.movies[0].stage === "filming") {
      if (s.movies[0].event)
        E.act(s, "event", { id: s.movies[0].id, choice: "split" });
      E.act(s, "next");
    }
    s.notices = [];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  if (await page.locator("#release-form").count())
    await click('[data-action="close"]');
  await click('[data-action="movie"]');
  await click('[data-action="release"]');
  while (
    !(await page.locator('[data-action="releaseWeek"][data-week="35"]').count())
  )
    await click('[data-action="releaseMonth"][data-step="1"]');
  await click('[data-action="releaseWeek"][data-week="35"]');
  await page.screenshot({ path: "test-results/v02-release.png" });
  await page.locator("#release-form > button").click();
  if (await page.locator('[data-action="selectNoMarketing"]').isEnabled()) await click('[data-action="selectNoMarketing"]');
  await click('[data-action="confirmMarketing"]');
  assert.equal(
    await page.locator(".distribution-overview tbody tr").count(),
    3,
  );
  assert.match(
    await page.locator(".distribution-options").innerText(),
    /Share/i,
  );
  await page.screenshot({ path: "test-results/v02-distribution.png" });
  await click('[data-action="dealReview"][data-deal="partner"]');
  assert.match(await page.locator("dialog").innerText(), /\$10,000,000/);
  await click('[data-action="distribute"]');
  assert.equal((await state()).movies[0].release, 35);
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    while (s.week < 54) {
      for (const n of [...s.notices]) {
        if (n.kind === "nominations")
          E.act(s, "ackNominations", { year: n.year });
        if (n.kind === "awards") E.act(s, "awardSummary", { year: n.year });
      }
      s.notices = [];
      E.act(s, "next");
    }
    s.notices = [];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="next"]');
  await page.waitForSelector(".nomination-category");
  assert.equal(await page.locator(".nomination-category").count(), 4);
  assert.equal((await state()).awards.length, 0);
  assert.equal(await page.locator('[data-action="close"]:visible').count(), 0);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 1);
  await page.screenshot({ path: "test-results/v02-nominations.png" });
  await page.reload();
  await page.waitForSelector(".nomination-category");
  await click('[data-action="ackNominations"]');
  for (let i = 0; i < 7; i++) await click('[data-action="next"]');
  await page.waitForSelector(".ceremony-invite");
  assert.match(await page.locator("dialog").innerText(), /Want to watch/);
  assert.equal((await state()).awards[0].revealed, 0);
  await page.screenshot({ path: "test-results/v02-awards-invitation.png" });
  await click('[data-action="watchAwards"]');
  assert.equal(await page.locator(".winner-card").count(), 0);
  await click('[data-action="revealAward"]');
  assert.equal((await state()).awards[0].revealed, 1);
  await page.screenshot({ path: "test-results/v02-awards-winner.png" });
  await page.reload();
  await page.waitForSelector(".ceremony-invite");
  await click('[data-action="watchAwards"]');
  assert.equal((await state()).awards[0].revealed, 1);
  for (let i = 1; i < 4; i++) {
    await click('[data-action="revealAward"]');
    await click('[data-action="nextAward"]');
  }
  assert.ok((await state()).awards[0].completed);
  await click('[data-action="afterAwards"]');
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    s.notices = [];
    s.prestigeLevel = 0;
    s.prestige = 16;
    E.notifyPrestige(s);
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await page.waitForSelector(".prestige-reveal");
  assert.match(await page.locator("dialog").innerText(), /On the radar/);
  assert.match(await page.locator("dialog").innerText(), /Distribution offers/);
  await page.screenshot({ path: "test-results/v02-prestige.png" });
  await click('[data-action="dismissNotice"]');
  await page.reload();
  assert.equal(await page.locator(".prestige-reveal").count(), 0);
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(502);
    s.week = 259;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="next"]');
  assert.match(await page.locator("dialog").innerText(), /epilogue/);
  await click('[data-action="ackNominations"]');
  await click('[data-action="summarizeAwards"]');
  assert.equal((await state()).week, 260);
  assert.equal((await state()).ended, true);
  await click('[data-action="afterAwards"]');
  await page.waitForSelector(".recap");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: sliders, schedule explanation, in-place conflict replacement, post-wrap release, distribution comparison, nominations, persistent manual awards, prestige, final epilogue.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
