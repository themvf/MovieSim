const {chromium}=require('C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
 await page.waitForSelector('h1');
 const click=sel=>page.locator(sel+':visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));
 await page.evaluate(async()=>{
  const E=await import('./engine.js');const s=E.newGame(91),m=E.act(s,'buy',{script:s.market[0].id});m.stage='ready';m.release=2;
  localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });
 await page.reload();await click('[data-action="distribution"]');
 assert.equal(await page.locator('[data-action="confirmMarketing"]').isDisabled(),true);
 const cash=(await state()).cash;
 await click('[data-action="selectNoMarketing"]');
 assert.equal((await state()).movies[0].marketingConfirmed,false);
 assert.equal((await state()).cash,cash);
 await click('[data-action="selectCampaign"][data-campaign="0"]');
 assert.equal(await page.locator('[data-action="selectNoMarketing"]').getAttribute('aria-pressed'),'false');
 assert.equal((await state()).cash,cash);
 await click('[data-action="selectNoMarketing"]');
 assert.equal(await page.locator('[data-action="selectCampaign"][data-campaign="0"]').getAttribute('aria-pressed'),'false');
 await page.screenshot({path:'test-results/marketing09.png'});
 await click('[data-action="confirmMarketing"]');assert.equal((await state()).movies[0].marketingBudget,0);
 await click('[data-action="close"]');
 // Fresh fixture for financial UI.
 await page.evaluate(async()=>{const E=await import('./engine.js');localStorage.setItem('moviesim-save-v1',JSON.stringify(E.newGame(91)));});
 await page.reload();await click('[data-action="nav"][data-tab="finance"]');
 for(const [bank,amount] of [['first','2,000,000'],['meridian','3,000,000'],['premiere','3,000,000']]) {
  await click('[data-action="bank"]');assert.equal(await page.locator('[data-action="selectBank"]').count(),3);
  await click(`[data-action="selectBank"][data-bank="${bank}"]`);
  await page.locator('#loan-form input[name="amount"]').fill(amount);
  await page.locator('#loan-form button').click();
 }
 assert.equal((await state()).cash,14000);
 await click('[data-action="bank"]');
 await page.screenshot({path:'test-results/banks09.png'});
 assert.equal(await page.locator('[data-action="sharkLoan"]').count(),1);
 await click('[data-action="sharkLoan"]');assert.equal((await state()).cash,16000);
 assert.equal((await state()).debt.at(-1).balance,2400);
 await page.reload();assert.ok((await page.locator('body').innerText()).includes('due in 13 weeks'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('moviesim-save-v1'));s.week=12;s.cash=2000;localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});
 await page.reload();await click('[data-action="next"]');assert.equal((await state()).ended,true);
 assert.ok((await page.locator('body').innerText()).includes('loan shark'));
 assert.deepEqual(errors,[]);
 console.log('PASS: reversible $0/paid selections, explicit confirmation, three bank offers, shark acceptance/save/deadline closure, mobile overflow.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
