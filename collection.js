// Universal story cards. Ownership is permanent; cards may be reused across roles and films.
export const DECKS = {
 genre: ['Action','Adventure','Comedy','Drama','Sci-fi','Fantasy','Horror','Thriller','Mystery','Romance','Crime','Family','Historical','War','Western','Musical','Sports','Disaster','Satire','Epic'],
 trait: ['Idealistic','Cynical','Defiant','Loyal','Ambitious','Reluctant','Fearful','Reckless','Cautious','Curious','Proud','Humble','Compassionate','Ruthless','Trusting','Suspicious','Unorthodox','Disciplined','Charming','Manipulative'],
 persona: ['Outsider','Caregiver','Student','Mentor','Leader','Worker','Expert','Wanderer','Rebel','Enforcer','Outlaw','Heir','Performer','Inventor','Investigator','Competitor','Merchant','Exile','Newcomer','Survivor'],
 setting: ['Frontier','Small Town','Big City','Wilderness','Isolated Community','Institution','Family Home','Workplace','Seat of Power','Underworld','Resort','Moving Vehicle','Borderland','Contested Territory','Hidden Sanctuary','Ruined Settlement','Gathering Place','Place of Worship','Confined Space','Unfamiliar World'],
 problem: ['A Plea for Help','A Sudden Loss','An Impossible Discovery','An Unexpected Arrival','A Disappearance','A Broken Promise','A Dangerous Offer','A False Accusation','A Stolen Possession','An Unwanted Duty','A Secret Exposed','A Chance Encounter','A Looming Deadline','A Disrupted Routine','A Rival’s Challenge','A Forbidden Connection','A Threat to Home','A Mistaken Identity','A Failing System','An Unexpected Opportunity'],
 ending: ['An Unlikely Victory','A Costly Victory','A Costly Defeat','A Fresh Start','A Homecoming','A Sacrifice','A Daring Rescue','An Escape','A Reunion','A Reconciliation','A Separation','An Emotional Breakthrough','A Truth Revealed','Justice Served','An Uneasy Peace','A Transfer of Power','A Goal Abandoned','A Dream Fulfilled','A Bitter Realization','An Uncertain Future'],
 outcome: ['Survives','Dies','Arrested','Escapes','Disappears','Triumphs','Loses','Reforms','Finds Love','Takes Power','Returns Home','Exiled','Betrays the Group','Joins the Opposition','Reconciles','Finds Peace','Trapped','Retires','Transformed','Becomes a Mentor'],
};
export const LABELS={genre:'Genre',trait:'Traits',persona:'Personas',setting:'Settings',problem:'Problems',ending:'Endings',outcome:'Outcomes'};
export const ICONS={genre:'✦',trait:'◈',persona:'♟',setting:'⌂',problem:'ϟ',ending:'◎',outcome:'↗'};
export const ROLES=['Lead','Opposition','Ally','Mentor','Love Interest','Dependent'];
export const STARTER={genre:['Drama','Adventure'],persona:['Outsider','Expert'],trait:['Idealistic','Reckless'],setting:['Small Town','Wilderness'],problem:['A Plea for Help'],ending:['A Costly Victory'],outcome:[]};
export const FAMILIES={directions:{name:'New Directions',decks:['genre','setting']},faces:{name:'Fresh Faces',decks:['persona','trait']},complications:{name:'Complications',decks:['problem']},finale:{name:'Final Curtain',decks:['ending','outcome']}};
// First reward at 1 prestige. Every later two points earns another choice, up to the full library.
export function ensure(s){s.collection??={version:1,owned:structuredClone(STARTER),claimed:[],peak:0};s.collection.peak=Math.max(s.collection.peak,Number(s.prestige)||0);return s.collection;}
export function credits(s){const c=ensure(s);return Math.max(0,(c.peak>=1?1+Math.floor((c.peak-1)/2):0)-c.claimed.length);}
export function nextPrestige(s){const c=ensure(s);return c.peak<1?1:1+2*(1+Math.floor((c.peak-1)/2));}
export function owns(s,deck,card){return !!s.collection?.owned?.[deck]?.includes(card);}
export function preview(s,family){ensure(s);const ds=FAMILIES[family]?.decks;if(!ds)return [];const pools=ds.map(deck=>DECKS[deck].filter(c=>!owns(s,deck,c)).map(card=>({deck,card}))),out=[];while(out.length<3&&pools.some(p=>p.length))for(const p of pools){if(p.length&&out.length<3)out.push(p.shift());}return out;}
export function claim(s,family){const pack=preview(s,family);if(!credits(s))throw Error('Earn more prestige to choose a pack.');if(!pack.length)throw Error('This pack is complete.');for(const {deck,card} of pack)s.collection.owned[deck].push(card);s.collection.claimed.push({family,cards:pack,prestige:s.collection.peak});return pack;}
export function blank(s){ensure(s);return {genre:s.collection.owned.genre[0],setting:'',problem:'',ending:'',characters:[{role:'Lead',persona:'',trait:'',outcome:'',name:''}]};}
export function valid(d,s=null){if(!d||!Array.isArray(d.characters)||d.characters.length<1||d.characters.length>6)return false;
 const ok=(k,v,optional=false)=>(optional&&!v)||DECKS[k].includes(v)&&(!s||owns(s,k,v));
 return ['genre','setting','problem','ending'].every(k=>ok(k,d[k]))&&d.characters[0].role==='Lead'&&new Set(d.characters.map(c=>c.role)).size===d.characters.length&&d.characters.every(c=>ROLES.includes(c.role)&&ok('persona',c.persona)&&ok('trait',c.trait,true)&&ok('outcome',c.outcome,true)&&typeof c.name==='string'&&c.name.length<=30);
}
export function selected(d){if(!d)return [];return [...['genre','setting','problem','ending'].filter(k=>d[k]).map(k=>({deck:k,card:d[k]})),...d.characters.flatMap(c=>['persona','trait','outcome'].filter(k=>c[k]).map(k=>({deck:k,card:c[k],role:c.role})))];}
export function identity(d){return {genre:d.genre,subgenre:'Original',roles:d.characters.map(c=>c.role),roleDescriptions:d.characters.map(c=>[c.name,[c.trait,c.persona].filter(Boolean).join(' '),c.outcome].filter(Boolean).join(' · ')),premise:`${[d.characters[0].trait,d.characters[0].persona].filter(Boolean).join(' ')} · ${d.setting}. ${d.problem} → ${d.ending}.`};}
export function sequel(d){const draft=structuredClone(d);for(const c of draft.characters)c.outcome='';return draft;}
export function continuity(parent,d,mode='continuation'){if(!parent||mode==='prequel')return [];return parent.characters.filter(c=>c.outcome==='Dies'&&d.characters.some(n=>n.role===c.role&&n.persona===c.persona&&n.name===c.name)).map(c=>`${c.name||c.role} died. Change their name or persona for a successor, or choose Prequel.`);}
export function has(m,deck,card){return m.movieCards?selected(m.movieCards).some(c=>c.deck===deck&&c.card===card):false;}
// Cards change the balance of execution demands, never add points for ownership or rarity.
export function weights(d){const emotional=['Drama','Romance','Family','Historical'],spectacle=['Action','Adventure','Sci-fi','Fantasy','War','Disaster','Epic'];
 const w=emotional.includes(d.genre)?{story:.35,acting:.35,direction:.2,craft:.1}:spectacle.includes(d.genre)?{story:.25,acting:.2,direction:.25,craft:.3}:{story:.3,acting:.25,direction:.3,craft:.15};
 if(['A Reconciliation','An Emotional Breakthrough','A Reunion','A Separation'].includes(d.ending)){w.acting+=.08;w.craft-=.08;}
 if(['A Daring Rescue','An Escape','An Unlikely Victory'].includes(d.ending)){w.direction+=.05;w.story-=.05;}
 const profiles={trait:'acting direction direction acting story acting direction direction direction story acting acting acting direction acting direction story direction acting story',persona:'acting acting story acting direction acting craft direction direction direction direction acting acting craft story direction story acting acting direction',setting:'craft acting craft craft direction story acting acting craft direction craft craft direction craft direction craft acting acting direction craft',problem:'story acting story acting direction acting story story direction acting story acting direction acting direction acting direction acting story story',ending:'direction story story acting acting acting direction direction acting acting acting acting story story direction story acting acting story story',outcome:'direction acting story direction direction acting acting acting acting story acting acting story story acting acting direction acting craft acting'};
 const focus={story:0,acting:0,direction:0,craft:0};let decks=0;
 for(const [deck,profile] of Object.entries(profiles)){const cards=selected(d).filter(c=>c.deck===deck);if(!cards.length)continue;decks++;for(const c of cards)focus[profile.split(' ')[DECKS[deck].indexOf(c.card)]]+=1/cards.length;}
 if(decks)for(const k of Object.keys(w))w[k]=w[k]*.75+focus[k]/decks*.25;
 return w;
}
export function evaluate(m,fanNoise=0,criticNoise=0){const values={story:m.storyExecution??m.scriptQuality??60,acting:m.performances.reduce((a,b)=>a+b,0)/m.performances.length,direction:m.directorPerformance,craft:m.craft},w=weights(m.movieCards),base=values.story*.25+values.acting*.3+values.direction*.2+values.craft*.25,adjustment=m.quality-base;
 const score=(weight,noise,bias)=>Math.round(Math.max(5,Math.min(99,Object.keys(values).reduce((n,k)=>n+values[k]*weight[k],0)+adjustment+noise+bias)));
 return {version:1,fans:score(w,fanNoise,m.audienceBias??0),critics:score({story:.35,acting:.3,direction:.25,craft:.1},criticNoise,m.criticBias??0),values,weights:w,focus:Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k)};
}
