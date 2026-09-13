import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../engine.js';import * as C from '../commissions.js';import * as CL from '../clients.js';import {commissionEstimate} from '../experience.js';
test('rush requires a delivered commission, not merely an accepted or missed one',()=>{
 const s=E.newGame(1);s.week=8;assert.equal(CL.available(s,'midnight'),false);
 const before=JSON.stringify(s);assert.throws(()=>CL.accept(s,'midnight'));assert.equal(JSON.stringify(s),before);
 CL.accept(s,'starlight');assert.equal(CL.unlocked(s,'midnight'),false);s.clients.starlight.strikes=1;assert.equal(CL.unlocked(s,'midnight'),false);
 s.marsTravel.wins=1;assert(CL.available(s,'midnight'));CL.accept(s,'midnight');assert.equal(s.clients.midnight.deal.due,22);assert.equal(s.clients.midnight.deal.payment,825);
});
test('planning assumptions expose buffer and do not move accepted deadlines',()=>{
 const s=E.newGame(2);CL.accept(s,'starlight');const d=s.clients.starlight.deal;
 assert.equal(d.due,18);assert.equal(d.payment,562.5);
 assert.equal(commissionEstimate(0).total,16);assert.equal(commissionEstimate(0).buffer,2);
 assert.equal(commissionEstimate(0,{duration:12,due:18}).buffer,-2);
 assert.equal(commissionEstimate(5,{movie:{stage:'development',ready:6},duration:8,due:18}).buffer,-1);
 assert.equal(commissionEstimate(5,{movie:{stage:'packaging'},duration:6,due:18}).buffer,2);
 const before=JSON.stringify(d);commissionEstimate(5,{duration:20,due:d.due});assert.equal(JSON.stringify(d),before);
});
test('flexible extension is costly, once only, and still available two weeks before deadline',()=>{
 const s=E.newGame(3);C.accept(s);assert.equal(s.marsTravel.deal.due,22);s.week=20;C.extend(s);
 assert.equal(s.marsTravel.deal.due,24);assert.equal(s.marsTravel.deal.payment,450);
 const before=JSON.stringify(s);assert.throws(()=>C.extend(s));assert.equal(JSON.stringify(s),before);
 const t=E.newGame(3);C.accept(t);t.week=21;assert.throws(()=>C.extend(t));
});
