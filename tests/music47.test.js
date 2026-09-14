import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../engine.js';import * as M from '../music.js';import * as C from '../collection.js';import * as H from './helpers/life-fixture.js';
test('every style has a specialist; all composer and genre combinations work',()=>{
 assert.equal(M.STYLES.length,12);assert.equal(M.COMPOSERS.length,9);
 for(let musicStyle=0;musicStyle<M.STYLES.length;musicStyle++){
  assert(M.COMPOSERS.some(c=>c.strengths.includes(M.STYLES[musicStyle].name)));
  for(let composer=0;composer<M.COMPOSERS.length;composer++)for(const genre of C.DECKS.genre){
   const m={musicStyle,composer,genre},r=M.resolve(m,0);
   assert.equal(r.style,M.STYLES[musicStyle].name);assert(Number.isFinite(r.quality));
   if(composer===0){assert.equal(r.original,false);assert.equal(r.fans,0);assert.equal(r.critics,0);}
  }
 }
});
test('specialty helps execution; high-quality unconventional music earns discovery without a genre penalty',()=>{
 const m={composer:5,musicStyle:5,genre:'Sci-fi'};
 const ordinary=M.resolve(m,0),great=M.resolve(m,12),familiar=M.resolve({...m,genre:'Drama'},12);
 assert(ordinary.quality>M.resolve({...m,musicStyle:0},0).quality);
 assert(!ordinary.discovery);assert(great.discovery);assert.equal(great.quality,familiar.quality);
 assert.equal(great.critics,familiar.critics+2);
 const old=M.resolve({composer:1,genre:'Drama'},0);assert.equal(old.style,'Intimate piano & strings');assert.equal(old.quality,77);
});
test('style and composer lock at greenlight, reach the report and awards, and reset for sequels',()=>{
 const s=E.newGame(42);s.cash=100000;const cards=C.blank(s);
 Object.assign(cards,{setting:'Small Town',problem:'A Plea for Help',ending:'A Costly Victory'});cards.characters[0].persona='Outsider';
 const m=E.act(s,'cardMovie',{cards,title:'Jazz on the Frontier',scale:'Small'});
 for(let i=0;i<3;i++)E.act(s,'next');H.cast(s,m);
 const args={id:m.id,sets:300,crew:350,effects:200,duration:8,composer:5,musicStyle:5};
 const before=JSON.stringify(s);assert.throws(()=>E.act(s,'greenlight',{...args,musicStyle:12}),/music style/);assert.equal(JSON.stringify(s),before);
 E.act(s,'greenlight',args);assert.equal(m.musicStyle,5);assert.equal(m.composer,5);assert.throws(()=>E.act(s,'greenlight',{...args,musicStyle:0}));
 H.wrap(s,m);H.release(s,m);assert.equal(m.music.style,'Jazz');assert.equal(m.music.composer,'Nico Reyes');assert.equal(E.candidate(s,m,'Original Score').score,m.music.quality);
 s.notices=[];E.act(s,'sequel',{id:m.id});assert.equal(s.movies.at(-1).musicStyle,undefined);assert.equal(s.movies.at(-1).music,undefined);
});
