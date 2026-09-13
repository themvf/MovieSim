const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const options={headless:true};if(process.env.CHROMIUM_EXECUTABLE)options.executablePath=process.env.CHROMIUM_EXECUTABLE;
 if(process.env.CHROMIUM_PACKAGE){const c=(await import(process.env.CHROMIUM_PACKAGE)).default;options.executablePath=await c.executablePath();options.args=c.args;}
 const browser=await chromium.launch(options),p=await browser.newPage({viewport:{width:1360,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const click=async q=>p.locator(q).first().click();
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 await p.evaluate(async()=>{const E=await import('./engine.js?v=0.30.0');localStorage.setItem('moviesim-save-v1',JSON.stringify(E.newGame(7)));localStorage.setItem('moviesim-build','0.10.0');});await p.reload();
 await click('[data-action="nav"][data-tab="scripts"]');await click('[data-action="scifiNew"]');
 assert.equal(await p.locator('.sf-card').count(),30);assert(await p.locator('[form="sf-form"]').isDisabled());
 await p.locator('[name="title"]').fill('Silent Orbit');
 const selected={setting:['Space Station'],characters:['Scientists','Civilians'],concept:['Artificial Intelligence'],objective:['Survive','Escape'],complication:['Malfunction','Isolation'],tone:['Suspenseful','Dark']};
 for(const [section,cards] of Object.entries(selected))for(const card of cards)await click(`[data-section="${section}"][data-card="${card}"]`);
 await click('[data-section="tone"][data-card="Humorous"]');assert.equal(await p.locator('[data-section="tone"][aria-pressed="true"]').count(),2);
 assert.equal(await p.locator('[name="title"]').inputValue(),'Silent Orbit');
 await p.locator('#dialog .modal-body').evaluate(el=>el.scrollTop=0);await p.screenshot({path:'test-results/scifi30-builder-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.locator('#dialog .modal-body').evaluate(el=>el.scrollTop=0);await p.screenshot({path:'test-results/scifi30-builder-mobile.png'});assert.equal(await p.locator('#dialog').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
 await click('[form="sf-form"]');await p.reload();let saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));assert.deepEqual(saved.movies[0].scifiCards,selected);
 // Actual engine actions advance the newly UI-created film; no fabricated result fixture.
 await p.evaluate(async()=>{const E=await import('./engine.js?v=0.30.0'),s=JSON.parse(localStorage.getItem('moviesim-save-v1')),m=s.movies[0];for(let i=0;i<3;i++){s.notices=[];E.act(s,'next');}localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});await p.reload();await click('[data-action="movie"]');await click('[data-action="scifiEdit"]');await click('[data-section="tone"][data-card="Dark"]');await click('[data-section="tone"][data-card="Thoughtful"]');await click('[form="sf-form"]');
 saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-save-v1')));assert.deepEqual(saved.movies[0].scifiCards.tone,['Suspenseful','Thoughtful']);assert.equal(saved.movies[0].spent,150);
 await p.evaluate(async()=>{const E=await import('./engine.js?v=0.30.0'),s=JSON.parse(localStorage.getItem('moviesim-save-v1')),m=s.movies[0];const actors=s.people.filter(p=>p.kind==='actor').sort((a,b)=>a.fee-b.fee);for(let role=0;role<m.roles.length;role++){const a=actors[role];E.act(s,'audition',{id:m.id,person:a.id,role});E.act(s,'hire',{id:m.id,person:a.id,role,offer:E.quote(s,a,m,role).high});}const d=s.people.filter(p=>p.kind==='director').sort((a,b)=>a.fee-b.fee)[0];E.act(s,'audition',{id:m.id,person:d.id});E.act(s,'hire',{id:m.id,person:d.id,offer:E.quote(s,d,m).high});localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});await p.reload();await click('[data-action="movie"]');await click('[data-action="production"]');await click('button[form="production-form"]');
 await p.evaluate(async()=>{const E=await import('./engine.js?v=0.30.0'),s=JSON.parse(localStorage.getItem('moviesim-save-v1')),m=s.movies[0];if(m.stage!=='filming')throw Error('UI greenlight failed');for(let i=0;i<30&&m.stage!=='ready';i++){if(m.event)E.act(s,'event',{id:m.id,choice:'pay'});s.notices=[];E.act(s,'next');}E.act(s,'setRelease',{id:m.id,release:s.week+1});E.act(s,'confirmMarketing',{id:m.id,none:true});E.act(s,'distribute',{id:m.id,deal:'secure'});s.notices=[];E.act(s,'next');localStorage.setItem('moviesim-save-v1',JSON.stringify(s));});await p.reload();await click('[data-action="revealOpening"]');await click('[data-action="skipOpening"]');await click('[data-action="openingReport"]');
 assert(await p.locator('.sf-report').isVisible());assert.equal(await p.locator('.sf-audience').count(),5);assert((await p.locator('.sf-report').innerText()).includes('Still to recover')||(await p.locator('.sf-report').innerText()).includes('Movie profit to date'));assert.equal(await p.locator('#dialog').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
 await p.locator('#dialog .modal-body').evaluate(el=>el.scrollTop=0);await p.screenshot({path:'test-results/scifi30-report-mobile.png'});
 await p.setViewportSize({width:1360,height:1000});await p.locator('#dialog .modal-body').evaluate(el=>el.scrollTop=0);await p.screenshot({path:'test-results/scifi30-report-desktop.png'});
 await p.locator('.sf-report-panel').nth(1).scrollIntoViewIfNeeded();await p.screenshot({path:'test-results/scifi30-feedback-desktop.png'});await p.setViewportSize({width:390,height:844});await p.locator('.sf-report-panel').nth(1).scrollIntoViewIfNeeded();await p.screenshot({path:'test-results/scifi30-feedback-mobile.png'});
 await click('[data-action="dismissNotice"]');await click('[data-action="movie"]');assert(await p.locator('.sf-report').isVisible());await click('.sf-details>summary');assert((await p.locator('.sf-details').innerText()).includes('Total movie costs'));
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: 30 cards, limits, title preservation, mobile layout, commission, reload, paid revision, UI greenlight, actual release, premiere report and full finances.');
})().catch(e=>{console.error(e);process.exit(1)});
