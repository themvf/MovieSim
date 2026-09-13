// Controlled timing study: fixed starting week/prior win, normal engine production.
// Measures earliest release feasibility, not score-qualified payouts or human play.
import * as E from '../engine.js';
import * as H from './helpers/life-fixture.js';
import * as CL from '../clients.js';
const result=[];
for(const [id,hiringWeeks] of [['starlight',0],['starlight',3],['midnight',0]])for(const policy of ['rest','protect-date']){
 let ontime=0,total=0,quality=0,decisions=0;
 for(let seed=1;seed<=30;seed++){
  const s=E.newGame(seed);s.week=8;s.marsTravel.wins=1;E.act(s,'clientAccept',{client:id});const start=s.week,due=s.clients[id].deal.due;
  const c=H.cards();for(const [k,v]of CL.definition(id).cards)c[k]=[v];
  E.act(s,'original',{title:'Deadline study',genre:'Sci-fi',scale:'Small',subgenre:'Space',scifiCards:c});const m=s.movies.at(-1);E.act(s,'clientBind',{client:id,id:m.id});
  for(let i=0;i<3;i++){s.notices=[];E.act(s,'next');}for(let j=0;j<hiringWeeks;j++){s.notices=[];E.act(s,'next');}cast(s,m);H.greenlight(s,m);
  for(let i=0;i<60&&m.stage!=='ready';i++){
   if(m.event){if(m.event.kind==='delay'){const options=E.delayChoices(s,m),wait=options.find(x=>x.choice==='wait');let chosen=wait;
    if(policy==='protect-date'&&wait.wrap+1>due){chosen=options.slice().sort((a,b)=>a.weeks-b.weeks||a.damage-b.damage)[0];if(chosen.choice!=='wait')decisions++;}E.act(s,'event',{id:m.id,choice:chosen.choice});
   }else E.act(s,'event',{id:m.id,choice:'pay'});}
   s.notices=[];E.act(s,'next');
  }
  if(m.stage!=='ready')throw Error('did not wrap');const release=s.week+1;ontime+=Number(release<=due);total+=release-start;quality+=m.quality;
 }
 result.push({client:id,hiringWeeks,policy,onTime:ontime,outOf:30,avgWeeks:+(total/30).toFixed(1),avgQuality:+(quality/30).toFixed(1),changedDelayChoices:decisions});
}
console.log(JSON.stringify(result,null,2));

function cast(s,m){for(let role=0;role<=m.roles.length;role++){
 const kind=role===m.roles.length?'director':'actor';const p=s.people.filter(p=>p.kind===kind&&!m.contracts.some(c=>c.id===p.id)&&E.available(p,s.week,s.week+8)&&!E.quote(s,p,m,role).refusal).sort((a,b)=>a.fee-b.fee)[0];
 E.act(s,'audition',{id:m.id,person:p.id,role:kind==='director'?0:role});E.act(s,'hire',{id:m.id,person:p.id,role:kind==='director'?0:role,offer:E.quote(s,p,m,role).high});
}}
