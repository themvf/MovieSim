const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{
 const c=(await import('/tmp/moviesim-browser/node_modules/@sparticuz/chromium/build/index.js')).default;
 const b=await chromium.launch({executablePath:await c.executablePath(),args:c.args,headless:true});
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173');
 await p.evaluate(async()=>{
  const E=await import('./engine.js'),C=await import('./collection.js'),H=await import('./tests/helpers/life-fixture.js'),s=E.newGame(42),d=C.blank(s);
  Object.assign(d,{setting:'Wilderness',problem:'A Plea for Help',ending:'A Costly Victory'});d.characters[0].persona='Outsider';
  const m=E.act(s,'cardMovie',{cards:d,title:'Greenlight Check',scale:'Small'});for(let i=0;i<3;i++)E.act(s,'next');H.cast(s,m);
  E.person(s,m.contracts[0].id).bookings.push({start:s.week,end:s.week+20,movie:'other-film'});s.notices=[];
  localStorage.setItem('moviesim-collection-save-v1',JSON.stringify(s));localStorage.setItem('moviesim-build','0.42.0');
 });
 async function plan(){await p.reload();await p.locator('[data-action="movie"]:visible').last().tap();await p.locator('[data-action="production"]:visible').last().tap();await p.locator('[name="musicStyle"]').selectOption('3');}
 await plan();await p.locator('[form="production-form"]').tap();
 assert.match(await p.locator('#dialog-feedback').innerText(),/booked/);
 assert(await p.locator('#dialog-feedback').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-collection-save-v1')).movies[0].stage),'packaging');
 await p.screenshot({path:'test-results/greenlight48-blocked.png'});
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('moviesim-collection-save-v1'));s.people.forEach(p=>p.bookings=p.bookings.filter(b=>b.movie!=='other-film'));localStorage.setItem('moviesim-collection-save-v1',JSON.stringify(s));});
 await plan();await p.locator('[form="production-form"]').tap();
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('moviesim-collection-save-v1')).movies[0].stage),'filming');assert.deepEqual(errors,[]);
 await b.close();console.log('PASS: visible named conflict, unchanged blocked film, successful touch greenlight with Electronic/library music.');
})().catch(e=>{console.error(e);process.exit(1)});
