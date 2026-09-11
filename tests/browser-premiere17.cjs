const {chromium}=require('C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>cb(t+10000));});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');await page.waitForSelector('h1');
 const click=sel=>page.locator(sel+':visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));
 await page.evaluate(async()=>{
  const E=await import('./engine.js'),s=E.newGame(501);s.cash=50000;
  const m=E.act(s,'buy',{script:s.market.find(x=>x.scale==='Small').id});
  const actors=s.people.filter(p=>p.kind==='actor').sort((a,b)=>a.fee-b.fee);
  for(let role=0;role<m.roles.length;role++) {const p=actors[role];E.act(s,'audition',{id:m.id,person:p.id,role});const q=E.quote(s,p,m,role);E.act(s,'hire',{id:m.id,person:p.id,role,offer:Math.ceil(q.high)});}
  const p=s.people.filter(p=>p.kind==='director').sort((a,b)=>a.fee-b.fee)[0],q=E.quote(s,p,m);
  E.act(s,'audition',{id:m.id,person:p.id});
  E.act(s,'hire',{id:m.id,person:p.id,offer:Math.ceil(q.high)});
  E.act(s,'greenlight',{id:m.id,sets:250,crew:350,effects:100,duration:8});
  while(m.stage==='filming'){if(m.event)E.act(s,'event',{id:m.id,choice:'split'});s.notices=[];E.act(s,'next');}
  E.act(s,'setRelease',{id:m.id,release:s.week+1});E.act(s,'confirmMarketing',{id:m.id,none:true});E.act(s,'distribute',{id:m.id,deal:'secure'});s.notices=[];
  localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });
 await page.reload();assert.equal(await page.locator('.critic-review').count(),0);
 await click('[data-action="next"]');

 const before=await state();assert.equal(await page.locator('.opening-report').count(),0);await page.screenshot({path:'test-results/premiere17-intro.png'});
 await click('[data-action="revealOpening"]');await page.waitForTimeout(250);const early=await page.locator('#premiere-count').innerText();assert.notEqual(early,'$0');assert.ok(Number(early.replace(/[^0-9.]/g,''))<before.movies[0].opening*1000,'Delayed frame timestamp must not skip the animation');
 await page.locator('[data-action="openingReport"]').waitFor({state:'visible'});assert.ok((await page.locator('#premiere-verdict').innerText()).includes('forecast'));await page.screenshot({path:'test-results/premiere17-result.png'});
 const after=await state();assert.equal(after.cash,before.cash);assert.equal(after.week,before.week);assert.equal(after.movies[0].receipts,before.movies[0].receipts);assert.equal(after.movies[0].opening,before.movies[0].opening);assert.equal(after.movies[0].openingRevealed,true);
 await click('[data-action="openingReport"]');await page.reload();assert.equal(await page.locator('.opening-report').count(),1);
 await click('[data-action="replayOpening"]');await click('[data-action="revealOpening"]');await click('[data-action="skipOpening"]');await click('[data-action="openingReport"]');
 await page.emulateMedia({reducedMotion:'reduce'});await click('[data-action="replayOpening"]');await click('[data-action="revealOpening"]');assert.equal(await page.locator('[data-action="openingReport"]').isVisible(),true);assert.equal(await page.locator('[data-action="skipOpening"]').isVisible(),false);
 assert.equal((await state()).cash,before.cash);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);console.log('PASS animated premiere, saved result, report/reload, skip/replay, reduced motion, unchanged money/time and mobile layout');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
