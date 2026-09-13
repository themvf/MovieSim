// Sci-fi card experiment v1. Pure evaluation; no random draws during reporting.
export const SECTIONS = [
 ['setting','Setting','Where does it happen?',['Earth','Deep Space','Alien World','Space Station','Colony']],
 ['characters','Characters','Who drives the story?',['Explorers','Scientists','Soldiers','Civilians','Outsiders']],
 ['concept','Sci-fi concept','What makes it sci-fi?',['Alien Life','Artificial Intelligence','Time Travel','Genetic Engineering','Advanced Technology']],
 ['objective','Objective','What do they try to do?',['Discover','Survive','Escape','Protect','Return Home']],
 ['complication','Complication','What stands in their way?',['Isolation','Betrayal','Malfunction','Invasion','Scarcity']],
 ['tone','Tone','What is the feeling?',['Suspenseful','Adventurous','Thoughtful','Dark','Humorous']],
].map(([id,name,question,cards])=>({id,name,question,cards}));
// Each ingredient emphasizes one of four observable execution dimensions.
const dimensions = ['craft','craft','craft','craft','story','direction','story','craft','acting','acting','story','story','story','story','craft','story','direction','direction','acting','acting','direction','acting','craft','craft','story','direction','craft','story','direction','acting'];
export const DIMENSIONS={story:'Story logic & payoff',acting:'Performances',direction:'Pacing & atmosphere',craft:'Production craft'};
export function blank(){return Object.fromEntries(SECTIONS.map(s=>[s.id,[]]));}
export function validate(d){return !!d && SECTIONS.every(s=>Array.isArray(d[s.id])&&d[s.id].length>=1&&d[s.id].length<=2&&new Set(d[s.id]).size===d[s.id].length&&d[s.id].every(c=>s.cards.includes(c)))&&Object.keys(d).every(k=>SECTIONS.some(s=>s.id===k));}
export function selected(d){return SECTIONS.flatMap((s,r)=>(d?.[s.id]??[]).map((name,rank)=>({name,rank,row:r,col:s.cards.indexOf(name),dimension:dimensions[r*5+s.cards.indexOf(name)]})));}
export function demands(d){const w={story:0,acting:0,direction:0,craft:0};for(const c of selected(d))w[c.dimension]+=c.rank?0.5:1;return Object.entries(w).sort((a,b)=>b[1]-a[1]);}
export function premise(d){
 const places={Earth:'on Earth','Deep Space':'in deep space','Alien World':'on an alien world','Space Station':'aboard a space station',Colony:'in a colony'};
 return `${d.characters.join(' and ')} face ${d.complication.join(' and ').toLowerCase()} ${d.setting.map(x=>places[x]).join(' and ')}. Their goal: ${d.objective.join(' and ').toLowerCase()}. At the heart of the story: ${d.concept.join(' and ').toLowerCase()}.`;
}
const clamp=v=>Math.max(5,Math.min(99,v));
const weights=[{name:'Spectacle seekers',w:{craft:.65,direction:.25,story:.05,acting:.05}}, {name:'Suspense fans',w:{direction:.55,story:.3,acting:.1,craft:.05}}, {name:'Idea-focused sci-fi fans',w:{story:.65,direction:.15,acting:.1,craft:.1}}, {name:'Character-focused viewers',w:{acting:.6,story:.25,direction:.1,craft:.05}}, {name:'Casual moviegoers',w:{direction:.3,craft:.25,acting:.25,story:.2}}];
export function evaluate(m,fanNoise=0,criticNoise=0){
 if(!validate(m.scifiCards))throw Error('Choose 1–2 different cards in every section.');
 const values={story:m.scriptQuality??60,acting:m.performances.reduce((a,b)=>a+b,0)/m.performances.length,direction:m.directorPerformance,craft:m.craft};
 const demand=Object.fromEntries(demands(m.scifiCards)),total=Object.values(demand).reduce((a,b)=>a+b,0);
 // Shared execution includes schedule, production fit and incident consequences.
 const adjustment=m.quality-(values.story*.25+values.acting*.3+values.direction*.2+values.craft*.25);
 const groups=weights.map(g=>{const fit=Object.keys(values).reduce((n,k)=>n+g.w[k]*demand[k]/total,0);return {name:g.name,weight:0.08+fit,score:Math.round(clamp(Object.keys(values).reduce((n,k)=>n+values[k]*g.w[k],0)+adjustment+fanNoise+(m.audienceBias??0)))};});
 const sum=groups.reduce((a,g)=>a+g.weight,0);groups.forEach(g=>g.share=g.weight/sum);
 const fans=Math.round(groups.reduce((a,g)=>a+g.score*g.share,0));
 const criticWeights=[{story:.5,acting:.25,direction:.2,craft:.05},{story:.15,acting:.15,direction:.3,craft:.4},{story:.3,acting:.4,direction:.25,craft:.05}];
 const criticScores=criticWeights.map(w=>Math.round(clamp(Object.keys(values).reduce((n,k)=>n+w[k]*values[k],0)+adjustment+criticNoise+(m.criticBias??0))));
 const critics=Math.round(criticScores.reduce((a,b)=>a+b,0)/criticScores.length);
 const feedback=selected(m.scifiCards).map(c=>({...c,value:Math.round(clamp(values[c.dimension]+adjustment)),label:DIMENSIONS[c.dimension]}));
 return {version:1,values,adjustment,groups,fans,critics,criticScores,feedback};
}
