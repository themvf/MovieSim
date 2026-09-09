const {
  chromium,
} = require("C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
  await page.evaluate(async () => {
    const E = await import("./engine.js");
    let chosen;
    for (let seed = 1; seed < 100; seed++) {
      const s = E.newGame(seed),
        m = E.act(s, "buy", { script: s.market[0].id });
      s.week = 40;
      Object.assign(m, {
        genre: "Horror",
        stage: "theaters",
        theaterStart: 39,
        release: 39,
        opening: 1000,
        fans: 80,
        share: 0.5,
        boxWeeks: [1000, 750],
        gross: 1750,
        receipts: 875,
      });
      E.act(s, "next");
      if (m.resurgences.length) {
        chosen = s;
        break;
      }
    }
    localStorage.setItem("moviesim-save-v1", JSON.stringify(chosen));
  });
  await page.reload();
  assert.equal(await page.locator(".mini-box-chart i").count(), 3);
  assert.equal(await page.locator(".mini-box-chart .resurgence").count(), 1);
  assert.match(
    await page.locator(".card-box-office").innerText(),
    /Halloween interest/,
  );
  await page.screenshot({ path: "test-results/v03-card-chart.png" });
  await page.locator('[data-action="next"]:visible').first().click();
  assert.equal(await page.locator(".mini-box-chart i").count(), 4);
  await page.reload();
  assert.equal(await page.locator(".mini-box-chart i").count(), 4);
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
    "PASS: weekly card growth, seasonal highlight, saved history, mobile widths.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
