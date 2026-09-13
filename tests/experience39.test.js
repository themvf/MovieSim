import test from 'node:test';
import assert from 'node:assert/strict';
import {nextHire,standardOffer,deadlineWindows} from '../experience.js';

test('next hiring step skips filled roles and finishes with production',()=>{
 const m={roles:['Lead','Support'],contracts:[{role:1}],director:null};
 assert.deepEqual(nextHire(m),{kind:'casting',role:0,label:'Next role: Lead'});
 m.contracts.push({role:0});assert.equal(nextHire(m).kind,'director');
 m.director={id:'director'};assert.equal(nextHire(m).kind,'production');
});
test('deadline slack includes the earliest release week for both client types',()=>{
 const s={marsTravel:{deal:{movie:'a',due:25,payment:600}},clients:{starlight:{deal:{movie:'b',due:20,payment:450}}}};
 assert.equal(deadlineWindows(s,{id:'a'},22)[0].slack,2);
 assert.equal(deadlineWindows(s,{id:'b'},20)[0].slack,-1);
 assert.equal(deadlineWindows(s,{id:'b'},19)[0].slack,0);
 assert.deepEqual(deadlineWindows(s,{id:'c'},20),[]);
});
test('standard offer honors existing options and meets the negotiation threshold',()=>{
 for(const [low,high] of [[11,36],[100,111],[12.5,97.7]]){
  assert(standardOffer({low,high})>=Math.round((low+high)/2));
  assert.equal(standardOffer({low,high,option:true}),low);
 }
});
