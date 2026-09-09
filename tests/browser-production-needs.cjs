const {
  chromium,
} = require("C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const b = await chromium.launch({ headless: true, channel: "msedge" });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
  await p.evaluate(async () => {
    const E = await import("./engine.js?v=0.8.0"),
      s = E.newGame(33),
      m = E.act(s, "buy", { script: s.market[0].id });
    m.scale = "Blockbuster";
    m.genre = "Horror";
    m.subgenre = "Creature";
    m.difficulty = 80;
    localStorage.setItem("moviesim-save-v1", JSON.stringify(s));
  });
  await p.reload();
  await p.locator('[data-action="movie"]').first().click();
  await p.locator('[data-action="production"]').first().click();
  for (const key of ["sets", "crew", "effects"])
    if ((await p.locator('input[name="' + key + '"]').inputValue()) !== "3")
      throw Error("Big budget must start Premium");
  if ((await p.locator('input[name="duration"]').inputValue()) !== "14")
    throw Error("Challenging big film needs 14 weeks");
  await p.locator('input[name="effects"]').fill("0");
  if (
    !(await p.locator("#effects-description").innerText()).includes(
      "Underfunded",
    )
  )
    throw Error("No shortage warning");
  if (
    (await p.locator("#production-preview").innerText()).includes(
      "Production quality: about",
    )
  )
    throw Error("Preview reveals exact quality");
  if (
    !(await p.locator("#production-total").innerText()).includes(
      "Cash after commitments",
    )
  )
    throw Error("Missing commitment balance");
  await p.screenshot({ path: "test-results/v08-production.png" });
  if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Mobile overflow");
  await b.close();
  console.log(
    "PASS: big-budget Premium defaults, script schedule and effects shortage warning",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
