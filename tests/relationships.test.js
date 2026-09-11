import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
const company='Harbor Distribution';
test('relationships: refusal changes terms, cooldown expires, and repairs persist',()=>{
 const s=E.newGame(7);const cash=s.cash;
 E.act(s,'relationship',{company,choice:'decline'});
 assert.equal(E.executiveRelationship(s,company).trust,30);
 assert.equal(E.relationshipOffer(s,{name:company,advance:100}).advance,75);
 assert.equal(E.executiveRelationship(s,company).blocked,8);
 assert.throws(()=>E.act(s,'relationship',{company,choice:'accept'}));
 E.act(s,'relationship',{company,choice:'repair'});
 assert.equal(s.cash,cash-50);assert.equal(E.executiveRelationship(s,company).blocked,4);
 assert.throws(()=>E.act(s,'relationship',{company,choice:'repair'}));
 s.week+=4;assert.equal(E.executiveRelationship(JSON.parse(JSON.stringify(s)),company).blocked,0);
});
test('relationships: trust gates negotiation and opportunities cannot repeat',()=>{
 const s=E.newGame(7);assert.throws(()=>E.act(s,'relationship',{company,choice:'counter'}));
 E.act(s,'relationship',{company,choice:'accept'});
 assert.equal(E.executiveRelationship(s,company).trust,65);
 assert.throws(()=>E.act(s,'relationship',{company,choice:'accept'}));
 s.week+=12;E.act(s,'relationship',{company,choice:'accept'});
 assert.equal(E.relationshipOffer(s,{name:company,advance:100}).advance,115);
 E.act(s,'relationship',{company,choice:'opportunity'});
 assert.throws(()=>E.act(s,'relationship',{company,choice:'opportunity'}));
});
test('relationships: invalid or unaffordable requests do not mutate state',()=>{
 const s=E.newGame(7);s.cash=1;const before=JSON.stringify(s);
 assert.throws(()=>E.act(s,'relationship',{company,choice:'accept'}));
 assert.equal(JSON.stringify(s),before);
 assert.throws(()=>E.act(s,'relationship',{company:'missing',choice:'repair'}));
 assert.equal(JSON.stringify(s),before);
});
test('production crisis: ally rescue spends trust, preserves quality, and cannot repeat',()=>{
 const s=E.newGame(7);s.relationships={[company]:{trust:80}};
 const m={id:'crisis-test',title:'Test',event:{kind:'crisis',cost:200,damage:18},penalty:0,spent:0};s.movies.push(m);
 const cash=s.cash;E.act(s,'event',{id:m.id,choice:'split'});
 assert.equal(s.cash,cash-100);assert.equal(m.penalty,0);assert.equal(E.executiveRelationship(s,company).trust,55);
 assert.throws(()=>E.act(s,'event',{id:m.id,choice:'split'}));
});
test('streaming refusal blocks new agreements without changing film or cash',()=>{
 const s=E.newGame(7);const m={id:'stream-test',title:'Test',stage:'catalog',streamingDeal:null,gross:1000,fans:60};s.movies.push(m);
 E.act(s,'relationship',{company:'BingeBox',choice:'decline'});const before=JSON.stringify(s);
 assert.throws(()=>E.act(s,'streamingDeal',{id:m.id,deal:'exclusive'}),/reopen/);
 assert.equal(JSON.stringify(s),before);
 assert.equal(E.streamingOffers(m,s)[0].blocked,8);
});
