import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
import * as CH from '../chemistry.js';
function fixture(){
 const s=E.newGame(7);s.cash=100000;
 E.act(s,'original',{title:'Shared Orbit',genre:'Sci-fi',subgenre:E.GENRES['Sci-fi'][0],scale:'Small'});
 const m=s.movies[0];for(let i=0;i<3;i++){s.notices=[];E.act(s,'next');}
 const actors=s.people.filter(p=>p.kind==='actor').sort((a,b)=>a.fee-b.fee);
 for(let role=0;role<m.roles.length;role++){const p=actors[role];E.act(s,'audition',{id:m.id,person:p.id,role});E.act(s,'hire',{id:m.id,person:p.id,role,offer:E.quote(s,p,m,role).high});}
 const d=s.people.filter(p=>p.kind==='director').sort((a,b)=>a.fee-b.fee)[0];E.act(s,'audition',{id:m.id,person:d.id});E.act(s,'hire',{id:m.id,person:d.id,offer:E.quote(s,d,m).high});return {s,m};
}
function wrap(s,m){for(let i=0;i<60&&m.stage!=='ready';i++){if(m.event)E.act(s,'event',{id:m.id,choice:m.event.kind==='delay'?'wait':'pay'});s.notices=[];E.act(s,'next');}assert.equal(m.stage,'ready');}
test('previews are symmetric, read-only and exclude the replaced role',()=>{
 const {s,m}=fixture(),a=E.person(s,m.contracts[0].id),b=E.person(s,m.contracts[1].id),before=JSON.stringify(s);
 assert.equal(CH.pair(s,a,b).effect,CH.pair(s,b,a).effect);
 const preview=CH.preview(s,m,a,1);assert(!preview.some(p=>p.ids.includes(b.id)));assert.equal(JSON.stringify(s),before);
});
test('chemistry locks, changes actual performances, persists, and does not rewrite a parent film',()=>{
 const {s,m}=fixture();E.act(s,'greenlight',{id:m.id,sets:300,crew:350,effects:200,duration:8});
 const control=structuredClone(s),n=control.movies[0];delete n.castChemistry;
 const snapshot=JSON.stringify(m.castChemistry);CH.pairs(s,m);assert.equal(JSON.stringify(m.castChemistry),snapshot);
 wrap(s,m);wrap(control,n);
 for(let i=0;i<m.contracts.length;i++)assert.equal(m.performances[i],E.clamp(n.performances[i]+CH.adjustment(m,m.contracts[i].id)));
 assert(m.castChemistry.settled);assert(Object.keys(s.castRelationships).length>0);assert.equal(control.castRelationships&&Object.keys(control.castRelationships).length,0);
 const before=JSON.stringify(s);CH.finish(s,m);assert.equal(JSON.stringify(s),before);
 const restored=E.migrateSave(JSON.parse(before));assert.deepEqual(restored.castRelationships,s.castRelationships);assert.deepEqual(restored.movies[0].castChemistry,m.castChemistry);
 E.act(s,'setRelease',{id:m.id,release:s.week+1});E.act(s,'confirmMarketing',{id:m.id,none:true});E.act(s,'distribute',{id:m.id,deal:'secure'});s.notices=[];E.act(s,'next');
 const parent=JSON.stringify(m.castChemistry);E.act(s,'sequel',{id:m.id});assert.equal(s.movies[1].castChemistry,undefined);assert.equal(JSON.stringify(m.castChemistry),parent);
});
test('good and difficult shared performances build bounded history once per film',()=>{
 const {s,m}=fixture();
 for(let i=0;i<12;i++){CH.lock(s,m);m.performances=m.contracts.map(()=>90);CH.finish(s,m);}
 assert(Object.values(s.castRelationships).every(r=>r.bond===4&&r.films===12));
 for(let i=0;i<12;i++){CH.lock(s,m);m.performances=m.contracts.map(()=>20);CH.finish(s,m);}
 assert(Object.values(s.castRelationships).every(r=>r.bond===-4&&r.films===24));assert(CH.pairs(s,m).every(p=>Math.abs(p.effect)<=4));
});
test('legacy films remain unchanged and cancelled productions earn no shared history',()=>{
 const {s,m}=fixture();delete s.castRelationships;const before=JSON.stringify(m),rng=s.rng,cash=s.cash;CH.ensure(s);CH.ensure(s);CH.finish(s,m);assert.equal(JSON.stringify(m),before);assert.equal(s.rng,rng);assert.equal(s.cash,cash);
 E.act(s,'greenlight',{id:m.id,sets:300,crew:350,effects:200,duration:8});E.act(s,'cancel',{id:m.id});s.notices=[];E.act(s,'next');assert.deepEqual(s.castRelationships,{});
});
