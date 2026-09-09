const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const fs = require("node:fs");
(async () => {
  fs.mkdirSync("test-results", { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
  await page.waitForSelector("h1");
  await page.screenshot({
    path: "test-results/desktop-slate.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/mobile-slate.png",
    fullPage: true,
  });
  const click = async (selector) =>
    page
      .locator(selector + ":visible")
      .first()
      .click();
  await click('[data-action="nav"][data-tab="scripts"]');
  const scriptId = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("moviesim-save-v1")).market.find(
        (m) => m.scale === "Small",
      ).id,
  );
  await click(`[data-action="script"][data-script="${scriptId}"]`);
  await click('[data-action="buy"]');
  for (let role = 0; role < 3; role++) {
    const next = page.locator(`[data-action="casting"][data-role="${role}"]`);
    if (!(await next.count())) break;
    await next.click();
    await page.locator("#casting-budget").selectOption("250");
    await click('[data-action="audition"]');
    await click('[data-action="offer"]');
    if (role === 0) await page.locator('input[name="option"]').check();
    await page.locator("#offer-form button").click();
  }
  await click('[data-action="director"]');
  await page.locator("#casting-budget").selectOption("750");
  await click('[data-action="offer"]');
  await page.locator("#offer-form button").click();
  await click('[data-action="production"]');
  await page.screenshot({
    path: "test-results/mobile-production.png",
    fullPage: true,
  });
  await page.locator("#production-form button").click();
  await click('[data-action="close"]');
  let state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moviesim-save-v1")),
  );
  if (state.movies[0].stage !== "filming") throw Error("Greenlight failed");
  await page.screenshot({
    path: "test-results/mobile-active.png",
    fullPage: true,
  });
  for (let i = 0; i < 30; i++) {
    state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("moviesim-save-v1")),
    );
    const m = state.movies[0];
    if (m.stage === "ready") break;
    if (m.event) {
      await click('[data-action="nextDecision"]');
      await click('[data-action="event"][data-choice="split"]');
      await click('[data-action="close"]');
    } else await click('[data-action="next"]');
  }
  await click('[data-action="movie"]');
  await click('[data-action="screen"]');
  await click('[data-action="campaign"][data-campaign="0"]');
  await click('[data-action="release"]');
  await page
    .locator("#release-select")
    .selectOption(
      String(
        (await page.evaluate(
          () => JSON.parse(localStorage.getItem("moviesim-save-v1")).week,
        )) + 3,
      ),
    );
  await page.locator("#release-form button").click();
  await click('[data-action="dealReview"][data-deal="partner"]');
  await click('[data-action="distribute"][data-deal="partner"]');
  await click('[data-action="close"]');
  for (let i = 0; i < 3; i++) await click('[data-action="next"]');
  await page.waitForSelector(".opening-reveal");
  await page.screenshot({
    path: "test-results/mobile-opening.png",
    fullPage: true,
  });
  await click('[data-action="dismissNotice"]');
  await page.reload();
  await page.waitForSelector("h1");
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moviesim-save-v1")),
  );
  if (state.movies[0].stage !== "theaters" || state.movies[0].gross <= 0)
    throw Error("Release or save persistence failed");
  for (const tab of [
    "slate",
    "scripts",
    "talent",
    "studio",
    "calendar",
    "finance",
    "awards",
  ]) {
    // Desktop navigation remains visible at this size for a systematic page sweep.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await click(`[data-action="nav"][data-tab="${tab}"]`);
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    if (overflow) throw Error(`Mobile overflow on ${tab}`);
    await page.screenshot({
      path: `test-results/mobile-${tab}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await click('[data-action="nav"][data-tab="slate"]');
  await page.screenshot({
    path: "test-results/desktop-active.png",
    fullPage: true,
  });
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    JSON.stringify({
      result: "PASS",
      week: state.week,
      movie: state.movies[0].title,
      gross: state.movies[0].gross,
      consoleErrors: errors.length,
      screenshots: "test-results/",
    }),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
