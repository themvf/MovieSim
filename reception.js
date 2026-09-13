// Cinema Collection: pure, bounded reception rules. Stored at wrap, never rerolled by UI.
export const ENDINGS = [
 ['Reunion','People find their way back to each other.','◎',[.30,.45,.20,.05],['character','hope','closure']],
 ['Departure','Someone leaves; what they leave behind still matters.','↗',[.35,.35,.25,.05],['character','change']],
 ['Second Chance','A fresh opportunity follows an earlier setback.','↻',[.40,.35,.20,.05],['hope','change']],
 ['Truth Revealed','A hidden truth becomes known.','◈',[.55,.15,.25,.05],['revelation','closure']],
 ['Sacrifice','Something precious is willingly given up.','✦',[.30,.35,.30,.05],['character','cost','dark']],
 ['Unfinished Business','An important thread remains open.','∞',[.45,.20,.30,.05],['mystery','open']],
 ['Lead Survives','The lead makes it through.','◇',[.25,.30,.30,.15],['hope','closure']],
 ['Lead Dies','The lead’s life ends; the goal may still succeed.','✧',[.30,.35,.30,.05],['character','dark','death']],
 ['Lead Disappears','The lead’s whereabouts are unknown.','◌',[.40,.20,.30,.10],['mystery','open','missing']],
 ['Lead Transforms','The lead becomes fundamentally different.','✺',[.35,.25,.25,.15],['change','mystery']],
 ['Goal Achieved','The central objective is achieved.','⚑',[.35,.20,.30,.15],['victory','closure']],
 ['Goal Lost','The objective remains out of reach.','↘',[.40,.30,.25,.05],['dark','cost']],
 ['Threat Escapes','The opposing threat gets away.','➚',[.20,.15,.35,.30],['thrill','open']],
 ['Opposition Defeated','The opposing force loses this conflict.','⊘',[.25,.20,.35,.20],['victory','closure']],
 ['New Beginning','A different life or order begins.','❋',[.35,.30,.25,.10],['hope','change']],
 ['Uneasy Alliance','Former opponents agree to work together.','⋈',[.45,.30,.20,.05],['character','change','mystery']],
].map(([name,description,symbol,w,tags])=>({name,description,symbol,w,tags}));
export const PROMISES=['As written','Hopeful','Dark','Exciting','Thoughtful'];
const keys=['story','acting','direction','craft'], cap=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
const avg=a=>a.length?a.reduce((n,v)=>n+v,0)/a.length:0;
export const valid=d=>Array.isArray(d)&&d.length>=1&&d.length<=2&&new Set(d).size===d.length&&d.every(n=>ENDINGS.some(c=>c.name===n))&&!(d.includes('Lead Dies')&&d.includes('Lead Survives'))&&!(d.includes('Goal Achieved')&&d.includes('Goal Lost'));
export const chosen=d=>(d??[]).map(n=>ENDINGS.find(c=>c.name===n)).filter(Boolean);
export function interpretation(d,cards={}){
 const has=n=>d?.includes(n),all=Object.values(cards).flat();
 if(has('Reunion')&&has('Departure'))return all.some(x=>['Return Home','Get Home','Rescue'].includes(x))?'Reunited, they begin the journey home.':'They reunite before choosing separate paths.';
 if(has('Sacrifice')&&has('Goal Achieved'))return 'The goal is won, but something precious is lost.';
 if(has('Lead Dies')&&has('Goal Achieved'))return 'The mission succeeds. The lead does not survive.';
 if(has('Truth Revealed')&&has('Lead Disappears'))return 'The truth is known. Its witness is missing.';
 return chosen(d).map(c=>c.description).join(' ');
}
export function demand(cards,sections,endings){
 // Every section contributes exactly one equal share, even with two cards.
 const base=sections.map((s,row)=>{const picks=cards[s.id]??[];return keys.map((k,i)=>avg(picks.map(n=>{const col=s.cards.indexOf(n),focus=[[3,3,3,3,0],[2,0,3,1,1],[0,0,0,0,3],[0,2,2,1,1],[2,1,3,3,0],[2,3,0,2,1]][row][col];return i===focus?.55:.15;})));});
 if(chosen(endings).length)base.push(keys.map((k,i)=>avg(chosen(endings).map(c=>c.w[i]))));
 return Object.fromEntries(keys.map((k,i)=>[k,avg(base.map(w=>w[i]))]));
}
export function coherence(cards,endings){
 const all=Object.values(cards).flat(),has=(...a)=>a.some(x=>all.includes(x)),end=(...a)=>a.some(x=>endings.includes(x)),rules=[];
 if(end('Reunion')&&has('Family','Friends','Reconcile','Return Home','Get Home'))rules.push(['Relationships support the reunion',1]);
 if(end('Truth Revealed')&&has('Secrets','Investigate','Discover','Betrayal','Artificial Intelligence'))rules.push(['The discovery pays off the mystery',1]);
 if(end('Sacrifice')&&has('Protect','Survive','Family','Soldiers'))rules.push(['The stakes support a sacrifice',1]);
 if(end('Goal Achieved','Lead Survives')&&has('Survive','Escape','Protect','Win'))rules.push(['The ending answers the objective',1]);
 if(end('Uneasy Alliance')&&has('Rivals','Betrayal','Competition'))rules.push(['The rivalry gives the alliance context',1]);
 if(end('Lead Dies','Goal Lost')&&has('Warm','Humorous','Adventurous')&&!end('Reunion','New Beginning','Goal Achieved'))rules.push(['The bleak ending needs a tonal bridge',-1]);
 // Four possible relationships, including neutral unknowns; sparse matching cannot earn full +8.
 return {value:cap(8*rules.reduce((n,r)=>n+r[1],0)/Math.max(4,rules.length),-8,8),rules};
}
export function snapshot(s,m){
 const earlier=s.movies.filter(x=>x.id!==m.id&&['theaters','catalog'].includes(x.stage));
 const signature=x=>JSON.stringify({genre:x.genre,cards:Object.entries(x.scifiCards??{}).sort(([a],[b])=>a.localeCompare(b)),endings:[...(x.endingCards??[])].sort()});
 const repeats=earlier.slice(-5).filter(x=>signature(x)===signature(m)).length;
 const parent=earlier.find(x=>x.id===m.parent);
 const endingSeen=earlier.some(x=>JSON.stringify([...(x.endingCards??[])].sort())===JSON.stringify([...(m.endingCards??[])].sort()));
 return {version:2,endingSeen,repetition:Math.min(4,repeats*2),parentEndings:parent?.endingCards??[],parentFans:parent?.fans??null,returningLead:!!parent&&parent.contracts?.[0]?.id===m.contracts?.[0]?.id,promise:m.publicPromise??'As written'};
}
const groups=[
 ['Character fans',[.25,.50,.20,.05],['character','change']],
 ['Thrill seekers',[.15,.15,.40,.30],['thrill','victory']],
 ['World explorers',[.45,.10,.20,.25],['revelation','mystery']],
 ['Closure seekers',[.45,.25,.20,.10],['closure','hope']],
 ['Surprise seekers',[.40,.15,.30,.15],['change','mystery']],
];
export function evaluate(m,sections,fanNoise=0,criticNoise=0){
 if(!valid(m.endingCards))throw Error('Choose 1–2 compatible ending cards.');
 const values={story:m.scriptQuality??60,acting:avg(m.performances??[]),direction:m.directorPerformance??60,craft:m.craft??60};
 const w=demand(m.scifiCards,sections,m.endingCards),ends=chosen(m.endingCards),tags=ends.flatMap(c=>c.tags),context=m.receptionContext??{},h=coherence(m.scifiCards,m.endingCards);
 const adjustment=(m.quality??60)-(values.story*.25+values.acting*.30+values.direction*.20+values.craft*.25);
 const execution=keys.reduce((n,k)=>n+w[k]*values[k],0)+adjustment;
 const promiseTag={Hopeful:'hope',Dark:'dark',Exciting:'thrill',Thoughtful:'revelation'}[context.promise];
 const promise=promiseTag?(tags.includes(promiseTag)?3:-6):0;
 const continuity=context.returningLead&&context.parentEndings?.includes('Lead Dies')?-6:context.parentEndings?.some(x=>['Unfinished Business','Lead Disappears','Threat Escapes'].includes(x))&&tags.includes('closure')?4:0;
 const repetition=context.repetition??0;
 const result=groups.map(([name,gw,likes],i)=>{
 const affinity=cap(avg(ends.map(c=>c.tags.some(t=>likes.includes(t))?4:(i===3&&c.tags.includes('open'))?-4:0)),-6,6);
 const skill=keys.reduce((n,k,j)=>n+values[k]*(.5*w[k]+.5*gw[j]),0)+adjustment;
 const breakdown={execution:skill,coherence:h.value,affinity,promise,continuity,repetition:-repetition,uncertainty:cap(fanNoise,-2,2)};
 const score=Math.round(cap(Object.values(breakdown).reduce((a,b)=>a+b,0)));
 const genreBoost=({'Sci-fi':2,Horror:1,Comedy:0})[m.genre]===i?.10:0;
 return {name,score,weight:.20+affinity*.01+genreBoost+(promiseTag&&likes.includes(promiseTag)?.08:0),breakdown};
 });
 const total=result.reduce((n,g)=>n+g.weight,0);result.forEach(g=>g.share=g.weight/total);
 const criticExecution=values.story*.40+values.direction*.25+values.acting*.20+values.craft*.15+adjustment;
 const contrasting=tags.includes('open')&&tags.includes('closure')||tags.includes('dark')&&tags.includes('hope');
 const originality=contrasting&&!context.endingSeen&&execution>=75&&h.value>=0?2:0;
 const criticBreakdown={execution:criticExecution,coherence:h.value,originality,repetition:-repetition,uncertainty:cap(criticNoise,-2,2)};
 const critics=Math.round(cap(Object.values(criticBreakdown).reduce((a,b)=>a+b,0)));
 return {version:2,values,adjustment,execution,demands:w,groups:result,fans:Math.round(result.reduce((n,g)=>n+g.score*g.share,0)),critics,criticScores:[critics,critics,critics],criticBreakdown,coherence:h,interpretation:interpretation(m.endingCards,m.scifiCards),feedback:[],continuity,promise,repetition};
}
export const retention=(fans,critics)=>cap(.65+.003*(fans-60)+.001*(critics-60),.35,.90);
