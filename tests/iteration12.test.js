import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
test('new film marketing prices scale with scope; old films keep original prices',()=>{
 const s=E.newGame(115),m=E.act(s,'buy',{script:s.market[0].id});
 assert.equal(m.economyVersion,2);
 for(const [scale,factor] of [['Small',1],['Mid-budget',2],['Blockbuster',4]])for(let i=0;i<4;i++){
  assert.equal(E.campaignCost({...m,scale},i),E.CAMPAIGNS[i].cost*factor);
  assert.equal(E.campaignCost({...m,scale,economyVersion:undefined},i),E.CAMPAIGNS[i].cost);
 }
});
test('advertising has diminishing marginal reach without erasing its benefit',()=>{
 const s=E.newGame(116),m={economyVersion:2,campaigns:[]};
 const individual=[0,1,2,3].reduce((sum,i)=>sum+E.campaignReach(s,{...m,campaigns:[i]}),0);
 const all=E.campaignReach(s,{...m,campaigns:[0,1,2,3]});
 assert.ok(all> E.campaignReach(s,{...m,campaigns:[0,1]}));assert.ok(all<individual);
});
test('production shortfalls affect delivery, while legacy releases preserve their economics',()=>{
 const m={scale:'Blockbuster',genre:'Action',subgenre:'Adventure',difficulty:65,economyVersion:2,duration:12};
 const budget=tier=>Object.fromEntries(['sets','crew','effects'].map(k=>[k,E.budgetCost(m,k,tier)]));
 const lean={...m,budget:budget(0)},funded={...m,budget:budget(3)};
 assert.ok(E.deliveryFactor(lean)<E.deliveryFactor(funded));assert.ok(E.deliveryFactor({...lean,duration:4})<E.deliveryFactor(lean));
 assert.equal(E.deliveryFactor({...lean,economyVersion:undefined}),1);
 const s=E.newGame(117),movie=E.act(s,'buy',{script:s.market[0].id});delete movie.economyVersion;
 const reload=E.migrateSave(JSON.parse(JSON.stringify(s)));assert.equal(reload.movies[0].economyVersion,undefined);
});
test('distributors value the delivered film rather than paying full scope advances for severe shortfalls',()=>{
 const s=E.newGame(118),m={scale:'Blockbuster',genre:'Action',subgenre:'Adventure',difficulty:65,economyVersion:2,duration:12,contracts:[],director:null};
 const funded={...m,budget:Object.fromEntries(['sets','crew','effects'].map(k=>[k,E.budgetCost(m,k,3)]))};
 const rushed={...m,duration:4,budget:Object.fromEntries(['sets','crew','effects'].map(k=>[k,E.budgetCost(m,k,0)]))};
 assert.ok(E.distribution(s,rushed).secure.advance<E.distribution(s,funded).secure.advance*.5);
 assert.equal(E.distribution(s,{...rushed,economyVersion:undefined}).secure.advance,E.distribution(s,{...funded,economyVersion:undefined}).secure.advance);
});
test('account displays reconcile transactions without coarse rounding',()=>{
 assert.equal(E.accountMoney(6000-130),'$5,870,000');
 assert.equal(E.accountMoney(1185),'$1,185,000');
 assert.equal(E.accountMoney(1800-45),'$1,755,000');
});
