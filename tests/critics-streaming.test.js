import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
function catalog() {
 const s=E.newGame(43),m=E.act(s,'buy',{script:s.market[0].id});
 Object.assign(m,{stage:'catalog',catalogStart:0,gross:10000,fans:80,share:.5,advance:0,opening:1000});
 return {s,m};
}
test('streaming requires a catalog film and a valid, once-only decision',()=>{
 const {s,m}=catalog(); const before=structuredClone(s);
 assert.throws(()=>E.act(s,'streamingDeal',{id:m.id,deal:'invalid'}));assert.deepEqual(s,before);
 m.stage='theaters';assert.throws(()=>E.act(s,'streamingDeal',{id:m.id,deal:'exclusive'}));m.stage='catalog';
 s.notices=[{kind:'streaming',id:m.id},{kind:'prestige',level:1}];
 const offer=E.streamingOffers(m)[0],cash=s.cash;
 E.act(s,'streamingDeal',{id:m.id,deal:'exclusive'});
 assert.equal(s.cash,cash+offer.upfront);assert.equal(m.receipts,offer.upfront);assert.equal(m.catalog,offer.upfront);
 assert.equal(s.notices.length,1);assert.equal(s.notices[0].kind,'prestige');
 const signed=structuredClone(s);assert.throws(()=>E.act(s,'streamingDeal',{id:m.id,deal:'royalty'}));assert.deepEqual(s,signed);
});
test('exclusive license pays once, royalties pay weekly, and both expire after 52 paid weeks',()=>{
 for(const id of ['exclusive','royalty']) {
  const {s,m}=catalog();E.act(s,'streamingDeal',{id:m.id,deal:id});const deal=m.streamingDeal;
  assert.equal(deal.endWeek,52);
  assert.equal(E.catalogIncome({...s,week:1},m),deal.weekly);
  if(id==='exclusive') assert.equal(E.catalogIncome({...s,week:52},m),0);
  else assert.ok(E.catalogIncome({...s,week:52},m)>0 && E.catalogIncome({...s,week:52},m)<deal.weekly);
  assert.ok(E.catalogIncome({...s,week:53},m)>0);
  const expected=E.catalogIncome({...s,week:1},m),cash=s.cash,receipts=m.receipts;
  E.act(s,'next');assert.ok(Math.abs(s.cash-(cash-E.overhead(s)+expected))<1e-9);assert.equal(m.receipts,receipts+expected);
 }
});
test('waiting earns nothing; legacy saves retain their automatic licensing',()=>{
 const {s,m}=catalog();assert.equal(E.catalogIncome({...s,week:1},m),0);
 E.act(s,'next');assert.equal(m.catalog,0);
 delete m.streamingDeal;assert.ok(E.catalogIncome(s,m)>0);
});
test('streaming offers have a real cash-now versus long-term tradeoff',()=>{
 const {s,m}=catalog();const [exclusive,royalty]=E.streamingOffers(m);
 const royalties=weeks=>royalty.upfront+Array.from({length:weeks},(_,i)=>royalty.weekly*(1+i/52)**-1.2).reduce((v,x)=>v+x,0);
 assert.ok(exclusive.upfront>royalties(8));assert.ok(royalties(52)>exclusive.upfront);
 s.cash=-10;E.act(s,'streamingDeal',{id:m.id,deal:'exclusive'});assert.ok(s.cash>0);
});
test('deal snapshots persist across reload and damaged financial terms are rejected',()=>{
 const {s,m}=catalog();E.act(s,'streamingDeal',{id:m.id,deal:'royalty'});
 const copy=E.migrateSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(copy.movies[0].streamingDeal,m.streamingDeal);
 const damaged=structuredClone(s);damaged.movies[0].streamingDeal.weekly=-1;assert.throws(()=>E.migrateSave(damaged));
});
test('critics have distinct interests and evidence-based, persistent reviews',()=>{
 const m={critics:65,scriptQuality:35,performances:[85,90],craft:90,fans:85,difficulty:80,genre:'Action'};
 const r=E.criticReviews(m);assert.equal(r.length,3);assert.equal(new Set(r.map(x=>x.name)).size,3);
 assert.match(r[0].quote,/screenplay/);assert.ok(r[1].score>r[0].score);
 const strong=E.criticReviews({...m,scriptQuality:95});assert.ok(strong[0].score>r[0].score);
 m.reviews=r;m.scriptQuality=99;assert.deepEqual(E.criticReviews(m),r);
 assert.ok(r.every(x=>x.score>=5 && x.score<=99));
});
