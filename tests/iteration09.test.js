import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
const exhaust = s => { for (const b of E.BANKS) E.act(s,'loan',{bankId:b.id,amount:E.bankAvailable(s,b.id)}); };
test('three banks enforce individual limits and charge their own APR', () => {
 for(const b of E.BANKS) {
  const s=E.newGame(14),before=s.cash;
  E.act(s,'loan',{bankId:b.id,amount:1000});
  assert.equal(s.cash,before+1000);
  const cash=s.cash; E.act(s,'next');
  assert.ok(Math.abs(cash-s.cash-E.overhead(s)-1000/104-1000*b.apr/52)<1e-8);
  const snap=structuredClone(s);
  assert.throws(()=>E.act(s,'loan',{bankId:b.id,amount:E.bankAvailable(s,b.id)+1}));
  assert.deepEqual(s,snap);
 }
});
test('shark requires exhausted banks, lends once and survives save reload', () => {
 const s=E.newGame(20); assert.throws(()=>E.act(s,'sharkLoan'));
 exhaust(s); assert.equal(E.creditAvailable(s),0);
 s.cash=-500; E.act(s,'sharkLoan'); assert.equal(s.cash,1500);
 assert.equal(s.debt.at(-1).due,13); assert.equal(s.debt.at(-1).balance,2400);
 assert.throws(()=>E.act(s,'sharkLoan'));
 const copy=E.migrateSave(JSON.parse(JSON.stringify(s))); assert.equal(copy.debt.at(-1).due,13);
 assert.equal(copy.sharkUsed,true);
});
test('shark automatically collects after 13 weeks and closes studio only on missed payment', () => {
 for(const succeeds of [true,false]) {
  const s=E.newGame(20); exhaust(s); E.act(s,'sharkLoan'); s.cash=succeeds?10000:2000;
  for(let i=0;i<12;i++) E.act(s,'next');
  assert.equal(s.ended,false); assert.equal(s.debt.at(-1).balance,2400);
  const cash=s.cash,pay=E.loanPayment(s); E.act(s,'next');
  assert.equal(s.week,13);
  if(succeeds) { assert.equal(s.ended,false); assert.ok(!s.debt.some(l=>l.shark)); assert.ok(Math.abs(s.cash-(cash-pay-E.overhead(s)-2400))<1e-8); }
  else { assert.equal(s.ended,true); assert.match(s.endReason,/loan shark/); assert.throws(()=>E.act(s,'loan',{amount:1000}),/ended/); }
 }
});
test('early payments reduce shark first; paid shark cannot be borrowed again', () => {
 const s=E.newGame(20); exhaust(s); E.act(s,'sharkLoan');
 E.act(s,'repay',{amount:400}); assert.equal(s.debt.at(-1).balance,2000); assert.equal(E.creditAvailable(s),0);
 E.act(s,'repay',{amount:2000}); assert.ok(!s.debt.some(l=>l.shark)); assert.equal(E.sharkAvailable(s),false);
 const late=E.newGame(20);exhaust(late);late.week=248;assert.equal(E.sharkAvailable(late),false);
});
test('forecast is bounded and research improves its precision; seasons improve matching openings', () => {
 const s=E.newGame(20),m=E.act(s,'buy',{script:s.market[0].id});
 const widths=[];
 for(let research=1;research<=4;research++) {s.departments.Research=research;const [lo,hi]=E.projection(s,m);assert.ok(hi/lo<=1.667); widths.push(hi-lo);}
 assert.ok(widths.every((v,i)=>!i || v<widths[i-1]));
 for(const [genre,subgenre,month] of [['Horror','Slasher',9],['Comedy','Romantic',1],['Action','Heist',6],['Sci-fi','Space',5],['Comedy','Family comedy',10]]) {
  assert.ok(E.seasonOpportunity({genre,subgenre,scale:'Small'},month).multiplier>1);
 }
 assert.equal(E.seasonOpportunity({genre:'Drama',subgenre:'Courtroom',scale:'Small'},9).multiplier,1);
});
test('marketing selection validates fully before charges, and zero needs an explicit choice', () => {
 const s=E.newGame(20),m=E.act(s,'buy',{script:s.market[0].id});m.stage='ready';
 assert.throws(()=>E.act(s,'confirmMarketing',{id:m.id}),/Select/);
 const before=s.cash;
 assert.throws(()=>E.act(s,'confirmMarketing',{id:m.id,campaigns:[0,99]}));assert.equal(s.cash,before);
 E.act(s,'confirmMarketing',{id:m.id,campaigns:[0,1]});
 assert.equal(s.cash,before-245);assert.equal(m.marketingBudget,245);assert.equal(m.marketingConfirmed,true);
});
test('gender and age guidance are persistent creative hints, not eligibility filters', () => {
 const s=E.newGame(20),m=E.act(s,'buy',{script:s.market[0].id});
 assert.ok(s.people.every(p=>['Woman','Man','Nonbinary'].includes(p.gender)));
 const g=E.castingGuidance(m,0);assert.ok(g.low<g.high);
 const p=s.people.find(p=>p.kind==='actor' && p.star<60);
 const original=E.quote(s,p,m,0);p.gender='Nonbinary';p.age=78;
 const different=E.quote(s,p,m,0);assert.deepEqual(different,original);
 assert.deepEqual(E.castingGuidance(E.migrateSave(JSON.parse(JSON.stringify(s))).movies[0],0),g);
});
