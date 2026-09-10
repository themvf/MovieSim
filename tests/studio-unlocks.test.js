import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
test('all three named studios have releases; old rivals get stable identities without rerolling',()=>{
 const s=E.newGame(77);assert.equal(new Set(s.rivals.map(r=>r.studioId)).size,3);
 for(const r of s.rivals){const legacy={...r};delete legacy.studioId;assert.equal(E.rivalStudio(legacy).id,r.studioId);}
 const before=s.rng;E.rivalStudio({title:'Unlisted film'});assert.equal(s.rng,before);
 const copy=E.migrateSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(copy.rivals,s.rivals);
 E.nominations(s,2026);for(const category of s.seasons[0].categories)assert.ok(category.nominees.filter(n=>!n.id).every(n=>E.RIVAL_STUDIOS.some(r=>r.id===n.studioId)));
});
test('first investments require money; later milestones require prestige and money without partial mutation',()=>{
 const s=E.newGame(77);E.act(s,'upgrade',{name:'Research'});assert.equal(s.departments.Research,2);
 const before=structuredClone(s);assert.throws(()=>E.act(s,'upgrade',{name:'Research'}),/15 prestige/);assert.deepEqual(s,before);
 s.prestige=15;const cost=E.upgradeCost(s,'Research'),cash=s.cash;E.act(s,'upgrade',{name:'Research'});assert.equal(s.departments.Research,3);assert.equal(s.cash,cash-cost);
 assert.throws(()=>E.act(s,'upgrade',{name:'Research'}),/35 prestige/);
 s.prestige=35;s.cash=0;const empty=structuredClone(s);assert.throws(()=>E.act(s,'upgrade',{name:'Research'}),/available cash/);assert.deepEqual(s,empty);
 s.cash=10000;E.act(s,'upgrade',{name:'Research'});assert.equal(s.departments.Research,4);assert.equal(E.upgradeUnlock(s,'Research').complete,true);
});
test('facility progression uses 0, 15, 35 and 60 prestige; ownership survives reload',()=>{
 const s=E.newGame(77);s.cash=30000;
 for(const prestige of [0,15,35,60]) {const u=E.upgradeUnlock(s,'Soundstage');assert.equal(u.prestige,prestige);s.prestige=prestige;E.act(s,'upgrade',{name:'Soundstage'});}
 const copy=E.migrateSave(JSON.parse(JSON.stringify(s)));assert.equal(copy.facilities.Soundstage,4);
 assert.throws(()=>E.act(s,'upgrade',{name:'Soundstage'}),/fully upgraded/);
});
