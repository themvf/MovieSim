const {
  chromium,
} = require("C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
  const id = await page.evaluate(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(54),
      p = s.people[0];
    p.awards = 1;
    s.seasons = [
      {
        year: 2026,
        acknowledged: true,
        categories: [
          {
            category: "Lead Acting",
            nominees: [{ person: p.id, id: "film1", title: "Breakthrough" }],
          },
        ],
      },
    ];
    s.awards = [
      {
        year: 2026,
        completed: true,
        revealed: 1,
        results: [
          { category: "Lead Acting", person: p.id, id: "film1", ours: true },
        ],
      },
    ];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
    return p.id;
  });
  await page.reload();
  const click = (sel) =>
    page
      .locator(sel + ":visible")
      .first()
      .click();
  await click('[data-action="nav"][data-tab="talent"]');
  const card = page.locator(`.talent-card[data-person="${id}"]`);
  assert.match(await card.innerText(), /1 nomination/i);
  assert.match(await card.innerText(), /1 award won/i);
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/v05-talent-honors.png" });
  await card.click();
  assert.match(
    await page.locator(".talent-awards-history").innerText(),
    /Breakthrough/,
  );
  assert.match(
    await page.locator(".talent-awards-history").innerText(),
    /Winner/i,
  );
  await click('[data-action="close"]');
  await click('[data-action="nav"][data-tab="finance"]');
  await click('[data-action="bank"]');
  await page.locator("#loan-form input").fill("120,000");
  await page.locator("#loan-form button").click();
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moviesim-save-v1")),
  );
  assert.equal(s.cash, 6120);
  await click('[data-action="repay"]');
  await page.locator("#repay-form input").fill("20,000");
  await page.locator("#repay-form button").click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moviesim-save-v1")),
  );
  assert.equal(s.cash, 6100);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: full-dollar loans and repayments, talent nominations/wins, mobile finance layout.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
