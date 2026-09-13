import test from 'node:test';
import assert from 'node:assert/strict';
import * as REC from '../reception.js';
import * as SF from '../scifi.js';

test('choice guidance shares the actual ending affinity and demand rules for every ending',()=>{
 for(const genre of SF.genres){
  const sections=SF.sections(genre),cards=Object.fromEntries(sections.map(s=>[s.id,[s.cards[0]]]));
  for(const ending of REC.ENDINGS){
   const endings=[ending.name],preview=REC.guidance(cards,sections,endings);
   const result=REC.evaluate({genre,scifiCards:cards,endingCards:endings,performances:[60],quality:60},sections);
   assert.deepEqual(preview.demands,result.demands);
   for(const group of result.groups)assert.equal(preview.affinities.find(g=>g.name===group.name).value,group.breakdown.affinity);
   assert.ok(preview.focus.every(k=>result.demands[k]===Math.max(...Object.values(result.demands))));
  }
 }
});
test('partial and open endings give honest guidance without requiring a completed film',()=>{
 const empty=REC.guidance(SF.blank(),SF.sections('Comedy'),[]);
 assert.deepEqual(empty.focus,[]);
 assert.match(empty.audienceText,/Choose an ending/);
 const open=REC.guidance(SF.blank(),SF.sections('Comedy'),['Threat Escapes']);
 assert.match(open.audienceText,/thrill seekers/);
 assert.match(open.cautionText,/closure seekers/);
 assert.deepEqual(REC.guidance(SF.blank(),SF.sections('Comedy'),['Lead Dies','Goal Achieved']).affinities.map(g=>g.value),[2,2,0,2,0]);
});
