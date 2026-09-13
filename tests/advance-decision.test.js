import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';

function filming(s) {
  const m=E.act(s,'buy',{script:s.market.find(m=>m.scale==='Small').id});
  const actors=s.people.filter(p=>p.kind==='actor').sort((a,b)=>a.fee-b.fee);
  for(let role=0;role<m.roles.length;role++) {
    const p=actors[role];
    E.act(s,'audition',{id:m.id,person:p.id,role});
    E.act(s,'hire',{id:m.id,person:p.id,role,offer:E.quote(s,p,m,role).high});
  }
  const p=s.people.filter(p=>p.kind==='director').sort((a,b)=>a.fee-b.fee)[0];
  E.act(s,'audition',{id:m.id,person:p.id});
  E.act(s,'hire',{id:m.id,person:p.id,offer:E.quote(s,p,m).high});
  E.act(s,'greenlight',{id:m.id,sets:200,crew:250,effects:100,duration:8});
  return m;
}

test('decision advance follows the same simulation as manual weeks, stopping at wrap and incidents',()=>{
  const s=E.newGame(61),m=filming(s);
  while(m.stage==='filming') {
    if(m.event) E.act(s,'event',{id:m.id,choice:'split'});
    const manual=structuredClone(s),result=E.act(s,'nextDecision');
    assert.ok(result.weeks>0&&result.weeks<=12,result.reason);
    for(let i=0;i<result.weeks;i++) E.act(manual,'next');
    assert.deepEqual(s,manual);
    assert.ok(result.reason);
  }
  assert.equal(m.stage,'ready');
  const before=structuredClone(s);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.deepEqual(s,before);
});

test('decision advance stops at casting and never auto-resolves a pending choice',()=>{
  const s=E.newGame(64);
  E.act(s,'original',{title:'Decisions',genre:'Drama',subgenre:'Courtroom',scale:'Small'});
  assert.equal(E.act(s,'nextDecision').weeks,3);
  assert.equal(s.movies[0].stage,'packaging');
  const before=structuredClone(s);
  assert.match(E.decisionStop(s),/casting/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.deepEqual(s,before);
  s.movies=[];
  s.life.poach={choice:null,expires:s.week+1};
  assert.match(E.decisionStop(s),/rival talent/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.equal(s.life.poach.choice,null);
});

test('commission safety stops before the extension deadline and before missed unassigned briefs',()=>{
  const s=E.newGame(68);
  // Bound to a film ID to isolate calendar safety; settlement is intentionally never reached.
  s.marsTravel.deal={movie:'future-film',due:6,payment:600};
  assert.equal(E.act(s,'nextDecision').weeks,2);
  assert.equal(s.marsTravel.deal.due-s.week,4);
  assert.match(E.decisionStop(s),/commission deadline/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  s.marsTravel.deal.movie=null;
  assert.match(E.decisionStop(s),/Attach/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
});

test('cash and loan-shark safeguards stop before irreversible automatic consequences',()=>{
  const s=E.newGame(69);s.cash=1;
  assert.match(E.decisionStop(s),/Cash/);
  const before=structuredClone(s);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.deepEqual(s,before);
  s.cash=1000;s.debt=[{shark:true,due:s.week+2,balance:2000}];
  assert.match(E.decisionStop(s),/loan-shark/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.equal(s.ended,false);
});

test('new opportunities interrupt idle advancement and each click is bounded',()=>{
  const s=E.newGame(70);
  const result=E.act(s,'nextDecision');
  assert.equal(result.weeks,4);
  assert.ok(s.life.pitches.length);
  assert.match(result.reason,/pitch|commission/);
  for(let i=0;i<5;i++) {
    const result=E.act(s,'nextDecision');
    assert.ok(result.weeks>=0&&result.weeks<=12);
    if(!result.weeks)break;
  }
});

test('announcements block without altering their queue or the simulation seed',()=>{
  const s=E.newGame(71);s.notices.push({kind:'opening',id:'movie'});
  const before=structuredClone(s);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.deepEqual(s,before);
});


test('quiet advancement stops after twelve weeks even without a new decision',()=>{
  const s=E.newGame(72);
  s.life.lastPitch=1000;
  s.marsTravel.nextOffer=1000;
  for(const client of Object.values(s.clients))client.nextOffer=1000;
  const result=E.act(s,'nextDecision');
  assert.equal(result.weeks,12);
  assert.match(result.reason,/Twelve weeks/);
});


test('unseen fan sentiment interrupts advancement until its popup has been presented',()=>{
  const s=E.newGame(73);
  s.movies.push({id:'fan-film',stage:'cancelled',fanCommunity:{ready:true,choice:null,presented:false}});
  const before=structuredClone(s);
  assert.match(E.decisionStop(s),/fans/);
  assert.equal(E.act(s,'nextDecision').weeks,0);
  assert.deepEqual(s,before);
  s.movies[0].fanCommunity.presented=true;
  assert.equal(E.decisionStop(s),null);
});
