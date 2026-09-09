const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 320, height: 740 } });
  const errors = [];
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
  await click('[data-action="nav"][data-tab="finance"]');
  await click('[data-action="bank"]');
  for (const value of [
    "120",
    "0",
    "-1",
    "1e6",
    "1,20,000",
    "8000001",
    "NaN",
    "Infinity",
  ]) {
    await page.locator("#loan-form input").fill(value);
    await page.locator("#loan-form button").click();
    assert.equal((await state()).cash, 6000);
    assert.match(
      await page.locator("#toast").innerText(),
      /\$1,000.*\$8,000,000/,
    );
  }
  await page.locator("#loan-form input").fill("$120,000");
  await page.locator("#loan-form button").click();
  assert.equal((await state()).cash, 6120);
  await click('[data-action="repay"]');
  await page.locator("#repay-form input").fill("999999999");
  await page.locator("#repay-form button").click();
  assert.match(await page.locator("#toast").innerText(), /\$0\.01.*\$120,000/);
  await page.locator("#repay-form input").fill("120,000");
  await page.locator("#repay-form button").click();
  assert.equal((await state()).cash, 6000);
  await fixture(async () => {
    const E = await import("./engine.js");
    const s = E.newGame(912);
    s.name = "X".repeat(40);
    s.cash = 123456789;
    const m = E.act(s, "buy", { script: s.market[0].id });
    m.title = "W".repeat(60);
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  for (const tab of [
    "slate",
    "scripts",
    "talent",
    "studio",
    "finance",
    "calendar",
  ]) {
    await click('[data-action="nav"][data-tab="' + tab + '"]');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      320,
      tab + " should fit minimum viewport",
    );
  }
  await click('[data-action="nav"][data-tab="slate"]');
  await click('[data-action="movie"]');
  assert.ok(await page.locator("dialog").evaluate((e) => e.scrollWidth <= 320));
  await click('[data-action="close"]');
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(920);
    s.notices = [
      { kind: "prestige", level: 1 },
      { kind: "awardsHeadsUp", year: 2026 },
    ];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await page.keyboard.press("Escape");
  assert.match(await page.locator(".advance").innerText(), /New announcement/);
  await click('[data-action="announcements"]');
  assert.match(
    await page.locator("dialog").innerText(),
    /Awards season is approaching/,
  );
  await click('[data-action="close"]');
  assert.match(await page.locator(".advance").innerText(), /Next week/);
  assert.equal((await state()).notices.length, 0);
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(926);
    const m = E.act(s, "buy", { script: s.market[0].id }),
      actor = s.people.find((p) => p.kind === "actor");
    s.seasons = [
      {
        year: 2026,
        acknowledged: true,
        categories: [
          {
            category: "Lead Acting",
            nominees: [{ person: actor.id, id: m.id, title: m.title }],
          },
        ],
      },
    ];
    s.awards = [
      {
        year: 2026,
        revealed: 0,
        completed: false,
        results: [
          { person: actor.id, id: m.id, category: "Lead Acting", ours: true },
        ],
      },
    ];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="nav"][data-tab="talent"]');
  const card = await page.locator(".talent-card").first().innerText();
  assert.match(card, /1 NOMINATION/);
  assert.match(card, /0 AWARDS WON/);
  await click('[data-action="person"]');
  assert.match(
    await page.locator(".talent-awards-history").innerText(),
    /NOMINEE/,
  );
  assert.doesNotMatch(
    await page.locator(".talent-awards-history").innerText(),
    /WINNER/,
  );
  await click('[data-action="close"]');
  await click('[data-action="nav"][data-tab="slate"]');
  await click('[data-action="movie"]');
  await click('[data-action="casting"]');
  await click('[data-action="audition"]');
  await click('[data-action="offer"]');
  for (const value of ["-1", "120,00", "Infinity", "999999999999"]) {
    await page.locator('#offer-form input[name="offer"]').fill(value);
    await page.locator("#offer-form .primary").click();
    assert.match(
      await page.locator("#toast").innerText(),
      /\$0.*\$100,000,000/,
    );
    assert.equal((await state()).movies[0].contracts.length, 0);
  }
  await click('[data-action="close"]');
  await click('[data-action="help"]');
  const beforeImport = await state(),
    broken = { ...beforeImport };
  delete broken.rivals;
  await page.locator("#import-save").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(broken)),
  });
  await page.waitForTimeout(100);
  assert.match(await page.locator("#toast").innerText(), /not a supported/);
  assert.deepEqual(
    await state(),
    beforeImport,
    "Rejected import preserves existing saved state",
  );
  for (const field of ["spent", "receipts", "gross", "catalog"]) {
    const damaged = structuredClone(beforeImport);
    delete damaged.movies[0][field];
    await page
      .locator("#import-save")
      .setInputFiles({
        name: `missing-${field}.json`,
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(damaged)),
      });
    await page.waitForTimeout(100);
    assert.match(await page.locator("#toast").innerText(), /not a supported/);
    assert.deepEqual(
      await state(),
      beforeImport,
      `Missing ${field} must preserve the working save`,
    );
    assert.doesNotMatch(await page.locator("body").innerText(), /\$NaN/);
  }
  await click('[data-action="close"]');
  await click('[data-action="next"]');
  assert.equal(
    (await state()).week,
    beforeImport.week + 1,
    "Rejected import leaves game playable",
  );
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(945);
    s.week = 259;
    const m = E.act(s, "buy", { script: s.market[0].id });
    m.stage = "ready";
    m.quality = 60;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="movie"]');
  await click('[data-action="release"]');
  assert.equal(
    await page.locator("#release-form").count(),
    0,
    "Final week must not offer impossible release confirmation",
  );
  await click('[data-action="close"]');
  await fixture(async () => {
    const E = await import("./engine.js"),
      s = E.newGame(946);
    s.debt = [{ balance: 0.75, principal: 0.1 }];
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await click('[data-action="nav"][data-tab="finance"]');
  await click('[data-action="repay"]');
  assert.equal(await page.locator("#repay-form input").inputValue(), "750");
  await page.locator("#repay-form button").click();
  assert.ok((await state()).debt.reduce((n, d) => n + d.balance, 0) < 0.001);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: independent alpha UI boundaries — exact-dollar fields, invalid values, 320px long names and large balances, queued notices, nomination visibility without winner spoilers, salary validation.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
