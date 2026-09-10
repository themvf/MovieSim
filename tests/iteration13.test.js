import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
test('audience trends match scope and genre, persist, then fade without calendar dates in UI data helpers',()=>{
 const s=E.newGame(1);s.marketTrends=[{name:'Low-budget horror',genre:'Horror',scale:'Small',start:0,end:156,strength:.45}];
 assert.equal(E.trendMultiplier(s,{genre:'Horror',scale:'Small'},10),1.45);
 assert.equal(E.trendMultiplier(s,{genre:'Horror',scale:'Blockbuster'},10),1);
 assert.ok(E.trendMultiplier(s,{genre:'Horror',scale:'Small'},150)<1.45);
 assert.equal(E.trendMultiplier(s,{genre:'Horror',scale:'Small'},156),1);
 assert.deepEqual(E.migrateSave(JSON.parse(JSON.stringify(s))).marketTrends,s.marketTrends);
});
test('production choices change actual costs and fit without automatically rewarding exotic locations',()=>{
 const s=E.newGame(2),m={genre:'Drama',subgenre:'Family',location:1,effectsApproach:3},b={sets:300,crew:400,effects:100};
 assert.ok(E.productionCosts(s,m,b,8).total<E.productionCosts(s,{...m,location:3,effectsApproach:2},b,8).total);
 assert.ok(E.productionFit(m)>E.productionFit({...m,location:3,effectsApproach:2}));
});
test('admiration quotes halve normal fees once, without stacking passion discounts',()=>{
 const s=E.newGame(3),m=E.act(s,'buy',{script:s.market[0].id}),p=s.people.find(p=>p.kind==='actor');
 p.fee=1000;p.genres[m.genre]=80;s.talentOffers=[{person:p.id,film:'My debut',end:26,usedBy:null}];
 const q=E.quote(s,p,m,0);assert.equal(q.personal,'My debut');assert.ok(Math.abs(q.low/q.normalLow-.5)<.02);
 E.act(s,'audition',{id:m.id,person:p.id,role:0});E.act(s,'hire',{id:m.id,person:p.id,role:0,offer:q.high});
 assert.equal(s.talentOffers[0].usedBy,m.id);assert.equal(E.quote(s,p,m,1).personal,null);
});
test('streaming comparison sums the unchanged payouts and clips only the demo horizon',()=>{
 const s=E.newGame(4),m={gross:10000,fans:80};s.week=250;
 for(const o of E.streamingOffers(m)){const t=E.streamingTotals(s,m,o);assert.equal(t.weeks,10);assert.ok(t.remaining<=t.full);if(o.id==='exclusive')assert.equal(t.full,o.upfront);else assert.ok(t.full>o.upfront);}
});
test('social response costs are booked once and fan lore increases actual ticket receipts',()=>{
 const s=E.newGame(5),m=E.act(s,'buy',{script:s.market[0].id});m.event={kind:'social',cost:50};const before=s.cash;
 E.act(s,'event',{id:m.id,choice:'pay'});assert.equal(s.cash,before-50);assert.equal(m.event,null);assert.throws(()=>E.act(s,'event',{id:m.id,choice:'pay'}));
 Object.assign(m,{stage:'theaters',theaterStart:0,opening:1000,fans:60,share:.5,fanLore:{week:0},gross:1000,receipts:500,boxWeeks:[1000]});s.week=0;s.notices=[];const cash=s.cash;E.act(s,'next');
 assert.ok(Math.abs(m.boxWeeks[1]-1000*.65*1.2)<1e-9);assert.ok(Math.abs(s.cash-(cash-E.overhead(s)+m.boxWeeks[1]*.5))<1e-9);
});
test('awards recognize direction separately and difficulty cannot rescue a poor performance',()=>{
 const s=E.newGame(6),m=E.act(s,'buy',{script:s.market[0].id});m.critics=70;m.quality=70;m.scriptQuality=70;m.director={id:s.people.find(p=>p.kind==='director').id};m.directorPerformance=95;m.performances=[30];m.contracts=[{id:s.people.find(p=>p.kind==='actor').id,role:0}];m.difficulty=100;
 assert.ok(E.candidate(s,m,'Director').score>E.candidate(s,m,'Picture').score);
 assert.equal(E.candidate(s,m,'Lead Acting').score,30);
});

