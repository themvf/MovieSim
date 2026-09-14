// Fame builds a combined audience, with overlap between stars. No random draws.
export function performanceRetention(score){return Number.isFinite(score)?Math.max(0,Math.min(1,(score-20)/30)):1;}
export function snapshot(s,m){const entries=[...m.contracts.map(c=>({...c,kind:'actor'})),...(m.director?[{...m.director,kind:'director'}]:[])];return entries.map(c=>({id:c.id,kind:c.kind,role:c.kind==='actor'?c.role:null,fame:Math.max(0,Math.min(100,s.people.find(p=>p.id===c.id)?.star??0)),weight:c.kind==='director'?.3:c.role===0?1:.65}));}
export function evaluate(s,m){const entries=(m.castAppeal??snapshot(s,m)).map(c=>{const i=m.contracts.findIndex(x=>x.id===c.id),performance=c.kind==='director'?m.directorPerformance:m.performances?.[i];return {...c,performance:Number.isFinite(performance)?performance:null,retained:performanceRetention(performance)};});
 const score=effective=>100*(1-Math.exp(-entries.reduce((n,c)=>n+c.fame*c.weight*(effective?c.retained:1),0)/100));
 const fame=score(false),effective=score(true);return {version:1,fame,effective,draw:effective*1.5,entries};
}
