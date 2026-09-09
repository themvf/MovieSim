const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" }),
    page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = process.env.TEST_URL || "http://127.0.0.1:4173";
  await page.goto(base);
  const fixture = async (transform) => {
    await page.evaluate(transform);
    await page.reload();
    await page.waitForSelector("h1");
  };
  const click = async (sel) =>
    page
      .locator(sel + ":visible")
      .first()
      .click();
  await fixture(() => {
    const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    s.cash = -150;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await page.waitForSelector("#loan-form");
  await page.locator('input[name="amount"]').fill("1000");
  await page.locator("#loan-form button").click();
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("moviesim-save-v1")).cash,
    ),
    850,
  );
  await fixture(async () => {
    const E = await import("./engine.js");
    const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    E.nominations(s, 2026);
    E.act(s, "ackNominations", { year: 2026 });
    s.week = 61;
    s.cash = 6000;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="next"]');
  await page.waitForSelector(".ceremony-invite");
  await click('[data-action="summarizeAwards"]');
  assert.equal(await page.locator(".ceremony-category").count(), 4);
  await page.screenshot({ path: "test-results/mobile-ceremony.png" });
  await click('[data-action="afterAwards"]');
  await fixture(() => {
    const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    s.week = 259;
    s.cash = 6000;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="next"]');
  await click('[data-action="ackNominations"]');
  await click('[data-action="summarizeAwards"]');
  await click('[data-action="afterAwards"]');
  await page.waitForSelector(".recap");
  await page.screenshot({ path: "test-results/mobile-recap.png" });
  assert.match(await page.locator(".recap").innerText(), /unwritten story/);
  await click('[data-action="close"]');
  await click('[data-action="nav"][data-tab="scripts"]');
  await click('[data-action="original"]');
  await page.locator('input[name="title"]').fill("Too Late");
  await page.locator("#original-form button").click();
  assert.match(await page.locator("#toast").innerText(), /ended/);
  await click('[data-action="close"]');
  await click('[data-action="help"]');
  await click('[data-action="restart"]');
  await page.locator("#restart-form input").fill("Test Studio");
  await page.locator("#restart-form button").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("moviesim-save-v1")).week,
    ),
    0,
  );
  await click('[data-action="nav"][data-tab="scripts"]');
  await click('[data-action="original"]');
  await page.locator('input[name="title"]').fill("Original Ambition");
  await page.locator("#genre").selectOption("Sci-fi");
  await page.locator("#subgenre").selectOption("Space");
  await page.locator("#original-form button").click();
  assert.match(await page.locator("dialog").innerText(), /Original Ambition/);
  await click('[data-action="close"]');
  await click('[data-action="nav"][data-tab="studio"]');
  await click('[data-action="upgrade"]');
  await click('[data-action="confirmUpgrade"]');
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("moviesim-save-v1")).departments
          .Development,
    ),
    2,
  );
  for (const width of [320, 375, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `Overflow at ${width}`,
    );
  }
  await fixture(() => {
    const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    s.cash = -100;
    s.debt = [{ balance: 8000, principal: 80 }];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await page.waitForSelector('[data-action="end"]');
  await click('[data-action="end"]');
  await page.waitForSelector(".recap");
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("moviesim-save-v1")).ended,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: emergency recovery, bankruptcy, annual ceremony, five-year ending, restart, originals, upgrades, 320–768px layouts.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
