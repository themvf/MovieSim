import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
function instrument(source) {return source.replace('./stories.js','../stories.js').replace('function finish(s, m) {','function finish(s, m) { s.rng=m.auditQualitySeed;').replace('function opening(s, m) {','function opening(s, m) { s.rng=m.auditOpeningSeed;');}
fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/baseline-engine.mjs',instrument(execFileSync('git',['show',(process.env.BASELINE || '9441a8d')+':engine.js'],{encoding:'utf8'})));
fs.writeFileSync('test-results/current-engine.mjs',instrument(fs.readFileSync('engine.js','utf8')));
const current=await import('../test-results/current-engine.mjs');
const baseline=await import('../test-results/baseline-engine.mjs');
const deal=process.env.DEAL || 'self';
const genres=['Action','Comedy','Drama','Horror','Sci-fi','Thriller'];
const templates=new Map();
function template(E,seed){const key=(E===current?'new':'old')+seed;if(!templates.has(key)) templates.set(key,E.newGame(seed));return structuredClone(templates.get(key));}
function rng(seed,phase){return (Math.imul(seed+1,2654435761)^Math.imul(phase,1597334677))>>>0;}
function run(E,seed,genre,scale,tier,schedule,marketing){
 const s=template(E,seed);s.cash=1000000;s.rivals=[];
 const sc=s.market[0];Object.assign(sc,{genre,subgenre:genre==='Horror'?'Supernatural':'Adventure',scale,quality:75,difficulty:65,roles:['Lead','Supporting'],price:100});
 const m=E.act(s,'buy',{script:sc.id});m.auditQualitySeed=rng(seed,500);m.auditOpeningSeed=rng(seed,1000);
 const people=[...s.people.filter(p=>p.kind==='actor').slice(0,2),s.people.find(p=>p.kind==='director')];
 for(const [i,p] of people.entries()) {Object.assign(p,{fee:150,star:35,talent:75,presence:70,bookings:[],look:1});p.genres[genre]=80;if(i<2)E.act(s,'audition',{id:m.id,person:p.id,role:i});E.act(s,'hire',{id:m.id,person:p.id,role:i<2?i:undefined,offer:E.quote(s,p,m).high});}
 const duration=schedule==='short'?4:schedule==='extended'?E.recommendedWeeks(m)+4:E.recommendedWeeks(m);
 const b=Object.fromEntries(['sets','crew','effects'].map(k=>[k,E.budgetCost(m,k,tier)]));
 E.act(s,'greenlight',{id:m.id,...b,duration});
 while(m.stage==='filming'){s.notices=[];if(m.event)E.act(s,'event',{id:m.id,choice:'cut'});s.rng=rng(seed,m.progress===duration-1?500:m.progress+100);E.act(s,'next');}
 E.act(s,'setRelease',{id:m.id,release:24});E.act(s,'confirmMarketing',{id:m.id,none:marketing===0,campaigns:marketing===0?[]:marketing===1?[0,1]:[0,1,2,3]});E.act(s,'distribute',{id:m.id,deal});
 while(m.stage!=='catalog'){s.notices=[];s.rng=rng(seed,1000+s.week);E.act(s,'next');}
 const theatrical=m.receipts-m.spent;E.act(s,'streamingDeal',{id:m.id,deal:'royalty'});
 for(let i=0;i<52;i++){s.notices=[];E.act(s,'next');}
 return {profit:m.receipts-m.spent,roi:(m.receipts-m.spent)/m.spent,loss:theatrical<0?1:0,opening:m.opening,gross:m.gross,cost:m.spent,theatrical,streaming:m.catalog};
}
const results={};const n=Number(process.env.SEEDS||100);
for(const [model,E] of [['before',baseline],['after',current]]) {
 for(const sample of ['development','validation'])for(let j=0;j<n;j++)for(const genre of genres)for(const scale of ['Small','Mid-budget','Blockbuster'])for(const tier of [0,2,3])for(const schedule of ['short','recommended','extended'])for(const marketing of [0,1,2]) {
 const seed=(sample==='development'?1000:900000)+j;
 const r=run(E,seed,genre,scale,tier,schedule,marketing),key=[model,sample,scale,tier,schedule,marketing].join('/');
 const a=results[key]??={count:0,profit:0,roi:0,loss:0,opening:0,gross:0,cost:0,theatrical:0,streaming:0};a.count++;for(const k of Object.keys(r))a[k]+=r[k];
 }
 console.log(model+' complete');
}
for(const r of Object.values(results))for(const k of Object.keys(r))if(k!=='count')r[k]/=r.count;
fs.writeFileSync('test-results/economy-matrix-'+deal+'.json',JSON.stringify(results,null,2));
for(const model of ['before','after'])for(const tier of [0,2,3])for(const schedule of ['short','recommended']){const key=[model,'validation','Blockbuster',tier,schedule,2].join('/');console.log(key,results[key]);}
