const {chromium}=require('C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:390,height:700}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');await page.waitForSelector('h1');
 const click=sel=>page.locator(sel+':visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));
 await click('[data-action="nav"][data-tab="finance"]');await click('[data-action="nav"][data-tab="calendar"]');
 for(const name of ['Atlas Pictures','Velvet Lantern Films','Night Owl Studios'])assert.ok((await page.locator('.rival-roster').innerText()).includes(name));
 assert.ok((await page.locator('.calendar-release').allTextContents()).some(t=>/Atlas Pictures|Velvet Lantern Films|Night Owl Studios/.test(t)));
 await page.screenshot({path:'test-results/rival-studios.png'});
 await click('[data-action="nav"][data-tab="studio"]');await click('[data-action="upgrade"][data-name="Research"]');assert.ok((await page.locator('dialog').innerText()).includes('Audience research team'));
 assert.equal(await page.locator('[data-action="confirmUpgrade"]').isEnabled(),true);await click('[data-action="confirmUpgrade"]');assert.equal((await state()).departments.Research,2);
 await click('[data-action="upgrade"][data-name="Research"]');assert.equal(await page.locator('[data-action="confirmUpgrade"]').isDisabled(),true);assert.ok((await page.locator('dialog').innerText()).includes('15'));
 await page.screenshot({path:'test-results/locked-studio-unlock.png'});
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('moviesim-save-v1'));s.prestige=15;localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});await page.reload();
 await click('[data-action="nav"][data-tab="studio"]');await click('[data-action="upgrade"][data-name="Research"]');assert.equal(await page.locator('[data-action="confirmUpgrade"]').isEnabled(),true);
 await page.screenshot({path:'test-results/available-studio-unlock.png'});await click('[data-action="confirmUpgrade"]');assert.equal((await state()).departments.Research,3);
 await page.evaluate(async()=>{
  const E=await import('./engine.js'),s=E.newGame(11),m=E.act(s,'buy',{script:s.market[0].id});
  m.event={kind:'creative',title:'Two endings, two audiences',text:'Choose your ending.'};
  localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });await page.reload();await click('[data-action="movie"]');
 const text=await page.locator('.decision-box').innerText();assert.ok(text.includes('repeat business'));assert.ok(text.includes('prestige'));assert.ok(!text.includes('Fans +6'));
 await page.screenshot({path:'test-results/creative-tradeoff.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 console.log('PASS: named rivals, mobile unlock requirements, cash purchase, prestige gating and meaningful edit choices.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
