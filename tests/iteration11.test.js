import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
test('range positions distinguish thirds and outside bounds',()=>{
 const f={low:60,high:90};
 for(const [v,label] of [[59,'Below'],[60,'Low end'],[75,'Mid-range'],[90,'High end'],[91,'Exceeded']]) assert.equal(E.rangePosition(f,v),label);
 assert.equal(E.rangePosition({low:0,high:0},0),'On target');
 assert.equal(E.rangePosition(null,70),null);
});
test('special superstar quotes require demanding quality scripts and genre fit',()=>{
 const s=E.newGame(92),p={...s.people.find(p=>p.kind==='actor'),star:90,majorCredits:3,fee:1000,genres:{Drama:80}},m={difficulty:90,scriptQuality:85,genre:'Drama',scale:'Small'};
 assert.equal(E.passionProject(p,m),true);
 const q=E.quote(s,p,m);assert.equal(q.passion,true);assert.ok(Math.abs(q.low/q.normalLow-.6)<.02);
 for(const changed of [{difficulty:79},{scriptQuality:74}]) assert.equal(E.passionProject(p,{...m,...changed}),false);
 for(const changed of [{star:74},{majorCredits:0},{genres:{Drama:64}},{kind:'director'}]) assert.equal(E.passionProject({...p,...changed},m),false);
 assert.deepEqual(E.quote(s,p,m),q);
});
test('four photo scripts are added once without replacing existing projects',()=>{
 const s=E.newGame(93),market=structuredClone(s.market);
 assert.equal(s.market.filter(m=>m.photoPoster).length,4);
 E.addPosterFilms(s);assert.deepEqual(s.market,market);
 assert.equal(new Set(s.market.filter(m=>m.photoPoster).map(m=>m.photoPoster)).size,4);
});
test('streaming economics sweep reconciles all 52 weeks and expiry across 30 scenarios',()=>{
 for(const gross of [0,1000,10000,50000,200000]) for(const fans of [5,60,99]) for(const id of ['exclusive','royalty']) {
  const s=E.newGame(43);s.cash=1000000;const m=E.act(s,'buy',{script:s.market[0].id});
  Object.assign(m,{stage:'catalog',catalogStart:0,gross,fans,share:.5,advance:0,opening:1000});
  const offer=E.streamingOffers(m).find(x=>x.id===id);E.act(s,'streamingDeal',{id:m.id,deal:id});
  let expected=offer.upfront;
  for(let i=0;i<52;i++) {s.notices=[];expected+=offer.weekly*(1+i/52)**-1.2;E.act(s,'next');}
  assert.ok(Math.abs(m.catalog-expected)<1e-7);assert.ok(Math.abs(m.receipts-expected)<1e-7);
  assert.ok(E.catalogIncome({...s,week:53},m)>0);
 }
});
test('late streaming contracts pay only earned weeks before the demo ends',()=>{
 for(const id of ['exclusive','royalty']) {
  const s=E.newGame(43);s.cash=100000;s.week=250;
  const m=E.act(s,'buy',{script:s.market[0].id});
  Object.assign(m,{stage:'catalog',catalogStart:250,gross:10000,fans:80,share:.5,advance:0,opening:1000});
  const offer=E.streamingOffers(m).find(x=>x.id===id);E.act(s,'streamingDeal',{id:m.id,deal:id});
  let expected=offer.upfront;
  for(let i=0;i<10;i++){s.notices=[];expected+=offer.weekly*(1+i/52)**-1.2;E.act(s,'next');}
  assert.equal(s.week,260);assert.ok(Math.abs(m.catalog-expected)<1e-7);
  assert.ok(id==='exclusive'||m.catalog<600);
 }
});
