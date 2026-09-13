// Targeted UI regression. Production completion uses explicit engine fixtures;
// the independent agent reports cover normal, unmodified two-film playthroughs.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const c=(await import('/tmp/moviesim-browser/node_modules/@sparticuz/chromium/build/index.js')).default;
 const b=await chromium.launch({headless:true,executablePath:await c.executablePath(),args:c.args});
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const click=async q=>p.locator(q+':visible').last().click();
 await p.goto('http://127.0.0.1:4173');await click('[data-tab="scripts"]');await click('[data-action="scifiNew"][data-genre="Comedy"]');
 await p.locator('[name="title"]').fill('Second Take');
 const art=await p.locator('.setting-card-art').evaluateAll(xs=>xs.map(x=>x.innerHTML));assert.equal(new Set(art).size,5);
 for(const [section,card] of [['setting','Vacation'],['characters','Family'],['concept','Bad Luck'],['objective','Get Home'],['complication','Miscommunication'],['tone','Warm']]){
  await click(`[data-action="albumTab"][data-section="${section}"]`);await click(`[data-action="sfPick"][data-card="${card}"]`);
 }
 await click('[data-action="albumTab"][data-section="ending"]');
 const end=p.locator('[data-action="endingPick"][data-card="New Beginning"]');await end.scrollIntoViewIfNeeded();
 const scroll=await p.locator('.modal-body').evaluate(x=>x.scrollTop);assert(scroll>200);await end.click();
 assert(Math.abs(await p.locator('.modal-body').evaluate(x=>x.scrollTop)-scroll)<80,'ending selection retains scroll');
 assert.match(await p.locator('.card-guidance').innerText(),/Ending appeal:/);
 await click('[form="sf-form"]');
 await p.evaluate(async()=>{
  const E=await import('./engine.js?v=0.39.0'),H=await import('./tests/helpers/life-fixture.js');
  const s=JSON.parse(localStorage.getItem('moviesim-save-v1')),m=s.movies[0];
  for(let i=0;i<3;i++){s.notices=[];E.act(s,'next');}H.cast(s,m);H.greenlight(s,m);H.wrap(s,m);H.release(s,m);
  m.openingRevealed=true;s.notices=[{kind:'opening',id:m.id}];localStorage.setItem('moviesim-save-v1',JSON.stringify(s));
 });await p.reload();
 if(!await p.locator('dialog[open]').count())await click('[data-action="announcements"]');assert(await p.locator('.next-movie').count());
 await click('.next-movie [data-action="scifiNew"]');assert.equal(await p.locator('[name="title"]').inputValue(),'');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')).notices.filter(n=>n.kind==='opening').length),0);
 await click('[data-action="close"]');assert.match(await p.locator('.next-challenge').innerText(),/Sci-fi/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await p.setViewportSize({width:1280,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);await b.close();console.log('PASS: distinct art, ending scroll, guidance, next-film announcement acknowledgement and genre-labeled challenge.');
})().catch(e=>{console.error(e);process.exit(1)});
