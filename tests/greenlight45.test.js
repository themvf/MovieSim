import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
import * as C from '../collection.js';
import * as H from './helpers/life-fixture.js';
function movie(){
  const s=E.newGame(42);s.cash=100000;
  const cards=C.blank(s);Object.assign(cards,{setting:'Small Town',problem:'A Plea for Help',ending:'A Costly Victory'});
  cards.characters[0].persona='Outsider';
  for(const role of ['Ally','Mentor'])cards.characters.push({role,persona:'Expert',trait:'',outcome:'',name:role});
  const m=E.act(s,'cardMovie',{cards,title:'Second Draft',scale:'Small'});
  for(let i=0;i<3;i++)E.act(s,'next');H.cast(s,m);
  return {s,m};
}
function released(s,m){H.wrap(s,m);H.release(s,m);assert.equal(m.stage,'theaters');for(const n of [...m.performances,m.quality,m.fans,m.critics,m.gross])assert(Number.isFinite(n));}
test('rewriting and removing a character preserves the correct auditions through release',()=>{
  const {s,m}=movie(),before=structuredClone(m.auditions),contracts=structuredClone(m.contracts),d=structuredClone(m.movieCards);
  d.setting='Wilderness';d.characters.splice(1,1);
  E.act(s,'cardRewrite',{id:m.id,cards:d});
  assert.equal(m.contracts.length,2);
  for(const c of m.contracts){const old=contracts.find(x=>x.id===c.id);assert.equal(m.auditions[`${c.role}:${c.id}`],before[`${old.role}:${c.id}`]);}
  assert.equal(m.auditions[`director:${m.director.id}`],before[`director:${m.director.id}`]);
  assert(!Object.keys(m.auditions).some(k=>k.endsWith(`:${contracts[1].id}`)));
  H.greenlight(s,m);assert.equal(m.stage,'filming');released(s,m);
});
test('already affected drafts and filming projects recover missing scores',()=>{
  for(const filming of [false,true]){
    const {s,m}=movie();if(filming)H.greenlight(s,m);
    m.auditions={};for(const c of m.contracts)delete c.auditionScore;
    if(!filming){H.greenlight(s,m);for(const c of m.contracts)assert(Number.isFinite(m.auditions[`${c.role}:${c.id}`]));}
    released(s,m);
  }
});
