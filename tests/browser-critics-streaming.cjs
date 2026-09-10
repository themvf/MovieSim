const {chromium}=require('C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');await page.waitForSelector('h1');
 const click=sel=>page.locator(sel+':visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));
 await page.evaluate(async()=>{
  const E=await import('./engine.js'),s=E.newGame(501);s.cash=50000;
  const m=E.act(s,'buy',{script:s.market.find(x=>x.scale==='Small').id});
  const actors=s.people.filter(p=>p.kind==='actor').sort((a,b)=>a.fee-b.fee);
  for(let role=0;role<m.roles.length;role++) {const p=actors[role];E.act(s,'audition',{id:m.id,person:p.id,role});const q=E.quote(s,p,m,role);E.act(s,'hire',{id:m.id,person:p.id,role,offer:Math.ceil(q.high)});}
  const p=s.people.filter(p=>p.kind==='director').sort((a,b)=>a.fee-b.fee)[0],q=E.quote(s,p,m);
  E.act(s,'hire',{id:m.id,person:p.id,offer:Math.ceil(q.high)});
  E.act(s,'greenlight',{id:m.id,sets:250,crew:350,effects:100,duration:8});
  while(m.stage==='filming'){if(m.event)E.act(s,'event',{id:m.id,choice:'split'});s.notices=[];E.act(s,'next');}
  E.act(s,'setRelease',{id:m.id,release:s.week+1});E.act(s,'confirmMarketing',{id:m.id,none:true});E.act(s,'distribute',{id:m.id,deal:'secure'});s.notices=[];
  localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });
 await page.reload();assert.equal(await page.locator('.critic-review').count(),0);
 await click('[data-action="next"]');assert.equal(await page.locator('.critic-review').count(),3);
 await page.setViewportSize({width:390,height:650});
 assert.equal(await page.locator('[data-opening-panel="results"]').isVisible(),true);
 assert.equal(await page.locator('[data-opening-panel="reviews"]').isVisible(),false);
 await page.screenshot({path:'test-results/opening-results-mobile.png'});
 await click('[data-action="openingSection"][data-section="reviews"]');
 const text=await page.locator('dialog').innerText();for(const name of ['Anita Rewrite','Rick O’Shea','Paige Turner'])assert.ok(text.includes(name));
 await page.screenshot({path:'test-results/critics10.png'});
 await click('[data-action="openingSection"][data-section="team"]');
 assert.equal(await page.locator('[data-opening-panel="team"]').isVisible(),true);
 assert.equal(await page.locator('.compact-career:visible').count(),3);
 await page.screenshot({path:'test-results/opening-team-mobile.png'});
 assert.equal(await page.locator('.opening-footer').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight;}),true);
 await click('[data-action="openingSection"][data-section="results"]');
 assert.equal(await page.locator('.critic-review:visible').count(),0);
 let saved=await state();assert.equal(saved.movies[0].critics,Math.round(saved.movies[0].reviews.reduce((v,r)=>v+r.score,0)/3));
 await page.evaluate(async()=>{
  const E=await import('./engine.js'),s=JSON.parse(localStorage.getItem('moviesim-save-v1')),m=s.movies[0];
  while(m.stage==='theaters'){s.notices=[];E.act(s,'next');}
  localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });
 await page.reload();assert.equal(await page.locator('[data-action="reviewStreaming"]').count(),2);
 const before=await state();assert.equal(before.movies[0].catalog,0);assert.ok(before.notices.some(n=>n.kind==='streaming'));
 await page.screenshot({path:'test-results/streaming10.png'});
 await click('[data-action="deferStreaming"]');assert.equal((await state()).movies[0].streamingDeal,null);
 await click('[data-action="next"]');assert.equal((await state()).movies[0].catalog,0);
 await click('[data-action="filter"][data-filter="active"]');await click('[data-action="movie"]');await click('[data-action="streaming"]');
 await click('[data-action="reviewStreaming"][data-deal="royalty"]');await click('[data-action="signStreaming"][data-deal="royalty"]');saved=await state();assert.equal(saved.movies[0].streamingDeal.id,'royalty');
 const income=saved.movies[0].catalog;await page.reload();await click('[data-action="next"]');assert.ok((await state()).movies[0].catalog>income);
 await page.evaluate(s=>localStorage.setItem('moviesim-save-v1',JSON.stringify(s)),before);await page.reload();
 await click('[data-action="reviewStreaming"][data-deal="exclusive"]');await click('[data-action="signStreaming"][data-deal="exclusive"]');saved=await state();const amount=saved.movies[0].catalog;
 assert.equal(saved.cash,before.cash+saved.movies[0].streamingDeal.upfront);
 await page.reload();await click('[data-action="next"]');assert.equal((await state()).movies[0].catalog,amount);
 assert.equal(await page.locator('.movie-card').count(),1);
 assert.ok((await page.locator('.movie-card').innerText()).includes('Streaming'));
 assert.ok((await page.locator('.movie-card').innerText()).includes('BingeBox'));
 await page.screenshot({path:'test-results/active-streaming-mobile.png'});
 await click('[data-action="filter"][data-filter="catalog"]');assert.equal(await page.locator('.movie-card').count(),0);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('moviesim-save-v1'));s.week=s.movies[0].streamingDeal.endWeek+1;localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});
 await page.reload();assert.equal(await page.locator('.movie-card').count(),0);
 await click('[data-action="filter"][data-filter="catalog"]');assert.equal(await page.locator('.movie-card').count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 console.log('PASS: three release critics, saved aggregate, post-theater offers, defer/reopen, royalties, exclusive payout, persistence and mobile layout.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
