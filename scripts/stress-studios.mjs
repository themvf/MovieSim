import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as current from '../engine.js';
fs.writeFileSync('test-results/studio-baseline.mjs',execFileSync('git',['show','9441a8d:engine.js'],{encoding:'utf8'}).replace('./stories.js','../stories.js'));
const baseline=await import('../test-results/studio-baseline.mjs');
function studio(E,seed,strategy,deal){
 const s=E.newGame(seed);let started=0;
 function finance(amount){for(const b of E.BANKS){const gap=Math.ceil(amount-s.cash),available=E.bankAvailable(s,b.id);if(gap<=0)return true;if(available>=1)E.act(s,'loan',{bankId:b.id,amount:Math.min(gap,Math.floor(available))});}return s.cash>=amount;}
 function buy(){const sc=s.market.filter(m=>m.scale===(strategy.startsWith('cheap-big')?'Blockbuster':strategy==='funded-big'?'Blockbuster':'Small')).sort((a,b)=>a.price-b.price)[0];if(!sc||!finance(sc.price))return;const m=E.act(s,'buy',{script:sc.id});started++;return m;}
 for(let guard=0;guard<300&&!s.ended&&!s.epilogue;guard++){
  s.notices=[];
  for(const m of s.movies)if(m.stage==='catalog'&&m.streamingDeal===null)E.act(s,'streamingDeal',{id:m.id,deal:s.week>225?'exclusive':'royalty'});
  if(!finance(0)){E.act(s,'end');break;}
  let m=s.movies.find(m=>['packaging','filming','ready','scheduled'].includes(m.stage));
  if(!m&&s.week<235)m=buy();
  if(m?.stage==='packaging'){
   const duration=strategy.startsWith('cheap-big')?4:E.recommendedWeeks(m);
   for(let role=0;role<=m.roles.length;role++){
    const kind=role===m.roles.length?'director':'actor';
    if(kind==='director'?m.director:m.contracts.some(c=>c.role===role))continue;
    const p=s.people.filter(p=>p.kind===kind&&!p.retired&&!m.contracts.some(c=>c.id===p.id)&&E.available(p,s.week,s.week+duration)&&!E.quote(s,p,m,role).refusal).sort((a,b)=>E.quote(s,a,m,role).high-E.quote(s,b,m,role).high)[0];
    if(!p)continue;
    if(kind==='actor')E.act(s,'audition',{id:m.id,person:p.id,role});E.act(s,'hire',{id:m.id,person:p.id,role,offer:E.quote(s,p,m,role).high});
   }
   if(m.director&&m.contracts.length===m.roles.length){
    const fees=[...m.contracts,m.director].reduce((sum,c)=>sum+c.fee+c.optionCost,0);
    if(finance(fees)){const tier=strategy.startsWith('cheap-big')?0:strategy==='funded-big'?3:2;E.act(s,'greenlight',{id:m.id,...Object.fromEntries(['sets','crew','effects'].map(k=>[k,E.budgetCost(m,k,tier)])),duration});}
    else E.act(s,'cancel',{id:m.id});
   }
  }
  if(m?.event){if(!finance(0)){E.act(s,'end');break;}E.act(s,'event',{id:m.id,choice:'cut'});}
  if(m?.stage==='ready'){
   E.act(s,'setRelease',{id:m.id,release:s.week+1});
   const campaigns=strategy==='cheap-big-no-ads'?[]:strategy.startsWith('cheap-big')?[0,1,2,3]:[0,1];
   const marketing=campaigns.reduce((sum,i)=>sum+(E.campaignCost?E.campaignCost(m,i):E.CAMPAIGNS[i].cost),0);
   if(finance(marketing+E.distribution(s,m)[deal].cost)){
    E.act(s,'confirmMarketing',{id:m.id,campaigns,none:campaigns.length===0});E.act(s,'distribute',{id:m.id,deal});
   }else {E.act(s,'confirmMarketing',{id:m.id,none:true});E.act(s,'distribute',{id:m.id,deal:'secure'});}
  }
  s.notices=[];if(!finance(0)){E.act(s,'end');break;}E.act(s,'next');
 }
 return {week:s.week,bankrupt:s.week<260?1:0,net:s.cash-E.debtTotal(s),started,released:s.movies.filter(m=>['catalog','theaters'].includes(m.stage)).length};
}
const result={};
for(const [label,E] of [['before',baseline],['after',current]])for(const strategy of ['cheap-big','cheap-big-no-ads','funded-big','funded-small'])for(const deal of ['secure','partner','self']){
 const rows=[];for(let i=0;i<50;i++)rows.push(studio(E,700000+i,strategy,deal));
 result[label+'/'+strategy+'/'+deal]=Object.fromEntries(Object.keys(rows[0]).map(k=>[k,rows.reduce((sum,r)=>sum+r[k],0)/rows.length]));
 console.log(label,strategy,deal,result[label+'/'+strategy+'/'+deal]);
}
fs.writeFileSync('test-results/studio-economy.json',JSON.stringify(result,null,2));
