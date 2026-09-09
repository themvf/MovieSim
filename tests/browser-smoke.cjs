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
    await next.first().click();
    if (role === 0) {
      const badges = await page
        .locator(".casting-list.shortlist .casting-card")
        .allTextContents();
      if (
        !badges[0].includes("Fresh face") ||
        !badges[1].includes("Working actor") ||
        !badges[2].includes("Established star")
      )
        throw Error(
          "Shortlist must show fresh face, working actor and star in order",
        );

      if (
        (await page.locator(".casting-list.shortlist > article").count()) !== 3
      )
        throw Error("Expected three shortlisted actors");
      const firstThree = await page
        .locator(".casting-card h3")
        .allTextContents();
      await click('[data-action="moreCasting"]');
      const expanded = await page.locator(".casting-card h3").allTextContents();
      if (
        expanded.length !== 6 ||
        expanded.slice(0, 3).join() !== firstThree.join()
      )
        throw Error(
          "More must append three actors and preserve first candidates",
        );
      const cashBefore = await page.evaluate(
        () => JSON.parse(localStorage.getItem("moviesim-save-v1")).cash,
      );
      await click('[data-action="auditionShortlist"]');
      const cashAfter = await page.evaluate(
        () => JSON.parse(localStorage.getItem("moviesim-save-v1")).cash,
      );
      if (cashAfter !== cashBefore) throw Error("Batch auditions must be free");
      await page.screenshot({ path: "test-results/mobile-shortlist.png" });
      await click('[data-action="castingMode"]');
      if ((await page.locator(".casting-list > article").count()) <= 3)
        throw Error("Browse all did not expand candidates");
      await click('[data-action="castingMode"]');
    }
    await page.locator(".casting-filter-details > summary").click();
    await page.locator("#casting-budget").selectOption("250");
    if (await page.locator('[data-action="audition"]').count())
      await click('[data-action="audition"]');
    await click('[data-action="offer"]');
    if (role === 0) await page.locator('input[name="option"]').check();
    await page.locator("#offer-form button").click();
  }
  await click('[data-action="director"]');
  await page.locator(".casting-filter-details > summary").click();
  await page.locator("#casting-budget").selectOption("750");
  await click('[data-action="offer"]');
  await page.locator("#offer-form button").click();
  await click('[data-action="production"]');
  await page.screenshot({
    path: "test-results/mobile-production.png",
    fullPage: true,
  });
  await page.locator('button[form="production-form"]').click();
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
  if (!(await page.locator("#release-form").isVisible()))
    throw Error("Wrap must open the release calendar");
  const wrapWeek = await page.evaluate(
    () => JSON.parse(localStorage.getItem("moviesim-save-v1")).week,
  );
  await click('[data-action="close"]');
  await click('[data-action="next"]');
  if (!(await page.locator("#release-form").isVisible()))
    throw Error("Next week must require release date");
  if (
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("moviesim-save-v1")).week,
    )) !== wrapWeek
  )
    throw Error("Undated film advanced time");
  await page.reload();
  await page.waitForSelector("#release-form");
  if (await page.locator("dialog[open]").count())
    await click('[data-action="close"]');
  await click('[data-action="movie"]');
  await click('[data-action="screen"]');
  await click('[data-action="campaign"][data-campaign="0"]');
  await click('[data-action="release"]');
  const releaseWeek =
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("moviesim-save-v1")).week,
    )) + 3;
  while (
    !(await page
      .locator(`[data-action="releaseWeek"][data-week="${releaseWeek}"]`)
      .count())
  )
    await click('[data-action="releaseMonth"][data-step="1"]');
  await click(`[data-action="releaseWeek"][data-week="${releaseWeek}"]`);
  await page.locator("#release-form > button").click();
  if (
    !(await page.locator("dialog").innerText()).includes(
      "Choose your marketing budget",
    )
  )
    throw Error("Release date must lead to required marketing choice");
  await page.screenshot({ path: "test-results/required-marketing.png" });
  await click('[data-action="close"]');
  await page.locator('[data-action="distribution"]').first().click();
  if (!(await page.locator('[data-action="confirmMarketing"]').isVisible()))
    throw Error("Cannot bypass marketing by opening distribution");
  if (await page.locator('[data-action="selectNoMarketing"]').isEnabled()) await click('[data-action="selectNoMarketing"]');
  await click('[data-action="confirmMarketing"]');
  if (!(await page.locator(".distribution-options").isVisible()))
    throw Error("Distribution screen did not open after setting release");
  if (
    !(await page.locator("dialog").innerText()).includes("Choose distribution")
  )
    throw Error("Missing distribution action heading");
  await page.screenshot({ path: "test-results/v08-distribution.png" });
  await click('[data-action="dealReview"][data-deal="partner"]');
  await click('[data-action="distribute"][data-deal="partner"]');
  await click('[data-action="close"]');
  for (let i = 0; i < 3; i++) await click('[data-action="next"]');
  await page.waitForSelector(".opening-reveal");
  const teamCount = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("moviesim-save-v1")).movies[0].contracts
        .length + 1,
  );
  if (
    (await page.locator(".personal-recap .career-headline").count()) !==
    teamCount
  )
    throw Error("Every cast member and director must have a career result");
  const careerButton = page.locator('[data-action="viewCareers"]');
  if (!(await careerButton.isVisible()))
    throw Error("Missing opening career entry point");
  await careerButton.click();
  if ((await page.locator(".career-headline").count()) !== teamCount)
    throw Error("Career summary must open whole team");
  await click('[data-action="back"]');
  await page.locator(".opening-reveal > details > summary").click();
  await page.waitForSelector(".expectations-review");
  if ((await page.locator(".comparison-list").count()) !== 1)
    throw Error("Expected one unified comparison list");
  if (
    (await page
      .locator(".comparison-list thead th")
      .allTextContents()
      .then((x) => x.join(","))) !== "Measure,Expected,Result"
  )
    throw Error("Comparison columns missing");
  if (!(await page.locator(".comparison-list .rating-range").count()))
    throw Error("Missing colored ranges");
  await page.waitForSelector(".talent-review");
  if (
    !(await page.locator(".comparison-list").innerText()).includes(
      "Marketing budget",
    )
  )
    throw Error("Marketing comparison missing");
  const marketingState = await page.evaluate(
    () => JSON.parse(localStorage.getItem("moviesim-save-v1")).movies[0],
  );
  if (marketingState.marketingBudget !== marketingState.marketingSpendAtRelease)
    throw Error("Opening marketing spending differs from selected plan");
  const badgeCount = await page.locator(".expectation-status").count();
  const castCount = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("moviesim-save-v1")).movies[0].contracts
        .length,
  );
  if (badgeCount !== castCount + 2)
    throw Error("Missing opening or talent outcome badge");
  const performanceText = await page.locator(".talent-review").innerText();
  if (
    !performanceText.includes("Director") ||
    performanceText.includes("Not recorded")
  )
    throw Error("Missing cast or director expectations");
  await page.screenshot({
    path: "test-results/mobile-opening.png",
    fullPage: true,
  });
  await page.locator(".talent-review").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/v04-talent-review.png" });
  await click('[data-action="dismissNotice"]');
  while (await page.locator('[data-action="dismissNotice"]:visible').count())
    await click('[data-action="dismissNotice"]');
  if (await page.locator('[data-action="announcements"]:visible').count())
    throw Error("Stale announcement button after dismissal");
  await page.waitForSelector('[data-action="next"]:visible');
  for (const method of ["close", "escape"]) {
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
      s.notices = [{ kind: "opening", id: s.movies[0].id }];
      localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector(".opening-reveal");
    if (method === "close") await click('[data-action="close"]');
    else await page.keyboard.press("Escape");
    await page.waitForSelector('[data-action="next"]:visible');
    if (await page.locator('[data-action="announcements"]:visible').count())
      throw Error("Stale announcement after " + method);
  }
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
  await click('[data-action="movie"]');
  // Isolate the rehire UI from random rival bookings earned during the lifecycle.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("moviesim-save-v1"));
    const m = s.movies[0];
    for (const c of [...m.contracts,m.director]) {
      const p=s.people.find(p=>p.id===c.id);
      p.bookings=[];
      p.genres[m.genre]=80;
    }
    localStorage.setItem("moviesim-save-v1",JSON.stringify(s));
  });
  await page.reload();
  await click('[data-action="movie"]');
  await click('[data-action="sequel"]');
  const rehire = page.locator('[data-action="confirmSequel"]').first();
  if ((await rehire.getAttribute("data-rehire")) !== "true")
    throw Error("Rehire must be first sequel choice");
  await page.screenshot({ path: "test-results/sequel-rehire.png" });
  await rehire.click();
  const sequelState = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moviesim-save-v1")),
  );
  const original = sequelState.movies[0],
    sequel = sequelState.movies[1];
  if (
    sequel.director.id !== original.director.id ||
    sequel.contracts.length !== original.contracts.length
  )
    throw Error("Original team not rehired");
  if (
    (await page.locator(".attached-team .award-row").count()) !==
    original.contracts.length + 1
  )
    throw Error("Development must confirm attached team");
  await page.reload();
  await page
    .locator('[data-action="movie"][data-id="' + sequel.id + '"]')
    .click();
  if (
    (await page.locator(".attached-team .award-row").count()) !==
    original.contracts.length + 1
  )
    throw Error("Attached team must survive reload");
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
