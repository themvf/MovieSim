import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
const setup=()=>{const s=E.newGame(42);s.cash=100000;const m=E.act(s,'buy',{script:s.market[0].id});return {s,m,actors:s.people.filter(p=>p.kind==='actor'),directors:s.people.filter(p=>p.kind==='director')};};
test('auditions cap unique candidates per role/movie/week and survive reload',()=>{
 const {s,m,actors}=setup();const audition=(p,role=0)=>E.act(s,'audition',{id:m.id,person:p.id,role});
 actors.slice(0,5).forEach(p=>audition(p));const snapshot=JSON.stringify(s);assert.throws(()=>audition(actors[5]),/All 5/);assert.equal(JSON.stringify(s),snapshot);
 audition(actors[0]);assert.equal(JSON.stringify(s),snapshot);assert.equal(E.auditionAllowance(s,m,0).remaining,0);
 audition(actors[5],1);assert.equal(E.auditionAllowance(s,m,1).remaining,4);
 const other=E.act(s,'buy',{script:s.market[0].id});E.act(s,'audition',{id:other.id,person:actors[5].id,role:0});assert.equal(E.auditionAllowance(s,other,0).remaining,4);
 const reloaded=E.migrateSave(JSON.parse(JSON.stringify(s))),rm=E.movie(reloaded,m.id);assert.equal(E.auditionAllowance(reloaded,rm,0).remaining,0);
 reloaded.notices=[];E.act(reloaded,'next');assert.equal(E.auditionAllowance(reloaded,rm,0).remaining,5);const result=rm.auditions[E.auditionKey(actors[0],0)];E.act(reloaded,'audition',{id:m.id,person:actors[0].id,role:0});assert.equal(E.auditionAllowance(reloaded,rm,0).remaining,5);assert.equal(rm.auditions[E.auditionKey(actors[0],0)],result);
});
test('director auditions are mandatory and have a separate five-candidate allowance',()=>{
 const {s,m,directors}=setup(),p=directors[0];assert.throws(()=>E.act(s,'hire',{id:m.id,person:p.id,offer:999}),/audition first/);
 directors.slice(0,5).forEach(p=>E.act(s,'audition',{id:m.id,person:p.id}));assert.throws(()=>E.act(s,'audition',{id:m.id,person:directors[5].id}),/All 5/);assert.equal(E.auditionAllowance(s,m,0).remaining,5);assert.equal(E.auditionAllowance(s,m,'director').remaining,0);
 p.genres[m.genre]=80;E.act(s,'hire',{id:m.id,person:p.id,offer:E.quote(s,p,m).high});assert.equal(m.director.id,p.id);
});
test('prestige unlocks 5/7/9/11/13 slots and invalid roles do not consume auditions',()=>{
 const {s,m,actors}=setup();for(const [i,level] of E.PRESTIGE_LEVELS.entries()){s.prestige=level.at;assert.equal(E.auditionAllowance(s,m,0).limit,5+2*i);}
 const snapshot=JSON.stringify(s);assert.throws(()=>E.act(s,'audition',{id:m.id,person:actors[0].id,role:99}),/Choose a role/);assert.equal(JSON.stringify(s),snapshot);
});
