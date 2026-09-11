import { GENRE_PACKS } from "./genre-packs.js?v=0.29.0";
// Pure, deterministic story rules. Fictional character state never changes hired talent.
export const STEPS = ['Setup', 'Complication', 'Response', 'Resolution', 'Cost', 'Villain fate'];
export const CAST = [
 {id:'hero',name:'Alex Rowan',title:'Protagonist',options:[
  {id:'engineer',label:'Reluctant engineer',detail:'Built the grid. Must learn to trust people.',tags:['tech','trustFlaw','identity']},
  {id:'guardian',label:'Retired guardian',detail:'Fading powers. Wants a second chance.',tags:['powers','legacy','identity']},
  {id:'detective',label:'Rookie detective',detail:'Follows evidence, even against orders.',tags:['law','evidence','trustFlaw']}]},
 {id:'villain',name:'Dr. Silas Voss',title:'Antagonist',options:[
  {id:'mentor',label:'Corrupt mentor',detail:'Alex’s former teacher wants control of the grid.',tags:['personal','tech','redeemable']},
  {id:'magnate',label:'Corporate mastermind',detail:'Owns the power network and the officials protecting it.',tags:['conspiracy','tech']},
  {id:'rival',label:'Fallen protector',detail:'A former friend believes force will save the city.',tags:['personal','redeemable','powers']}]},
 {id:'ally',name:'Dr. Mara Vale',title:'Supporting · practical ally',options:[
  {id:'scientist',label:'Scientist / former lover',detail:'Invented the power core. Trust is strained.',tags:['science','romance','tech']},
  {id:'partner',label:'Detective / old partner',detail:'Police access, but a family to protect.',tags:['law','partner','family']},
  {id:'sidekick',label:'Sidekick / chosen family',detail:'Knows Alex’s identity and never leaves anyone behind.',tags:['sidekick','family','identity']}]},
 {id:'anchor',name:'Eli Chen',title:'Supporting · emotional anchor',options:[
  {id:'journalist',label:'Journalist / trusted friend',detail:'A broadcast channel and evidence from inside Voss’s network.',tags:['media','evidence']},
  {id:'sibling',label:'Medic / sibling',detail:'Protects civilians at the city’s emergency shelter.',tags:['family','rescue']},
  {id:'agent',label:'Double agent / lover',detail:'Close to Voss; love competes with a hidden allegiance.',tags:['romance','insider','redeemable']}]}
];
export const originalDraft = () => ({characters:['engineer','mentor','scientist','journalist'],beats:['attack','stolen','trust','shutdown','research','arrest']});
const card=(id,title,text,needs=[],add=[],extra={})=>({id,title,text,needs,add,...extra});
export const CARDS = [
 [card('attack','Survive the laboratory attack','Voss tests a stolen grid prototype. Alex vows to stop the next attack.',[],['weapon','city'],{effects:100}),
 card('accident','Wake up with unstable powers','A grid accident changes Alex. Every surge puts the city at risk.',[],['powered','city'],{effects:200}),
 card('mantle','Return to the abandoned mantle','The city asks its retired guardian to come back.',['legacy'],['powered','city','public']),
 card('frame','Become the city’s most wanted','Voss frames Alex for sabotage. Eli preserves the first piece of proof.',[],['fugitive','evidence','city']),
 card('promise','Promise to bring a loved one home','Voss abducts Mara to force Alex into the network.',[],['hostage','personal']),
 card('program','Expose the secret program','Alex discovers that the grid was built to control its users.',[],['conspiracy','evidence','city']),
 card('signal','Answer a signal from orbit','A transmission reveals that Voss can turn the grid into a global weapon.',[],['weapon','world'],{effects:400})],
 [card('stolen','Mara’s invention becomes the weapon','Voss steals Mara’s core. Her expertise may also be the way to stop it.',['science'],['weapon','guilt'],{effects:150}),
 card('capture','Mara is taken hostage','Voss removes Alex’s closest practical ally from the field.',[],['hostage']),
 card('exposed','The secret identity goes public','Voss releases Alex’s identity. Home is no longer safe.',['identity'],['exposed','public']),
 card('powerless','The powers burn out','Alex must find a way forward without superhuman strength.',['powered'],['powerless']),
 card('blackout','The city turns against Alex','A blackout is blamed on Alex. Civilians refuse to help.',['city'],['distrust'],{effects:100}),
 card('betrayal','Eli reveals a hidden allegiance','Eli has been feeding Voss information. The truth creates a way inside.',[],['betrayal','insider']),
 card('orbit','The threat reaches beyond the city','The grid links to an orbital relay. Local sabotage will no longer be enough.',['weapon'],['world'],{effects:400})],
 [card('trust','Trust Mara with the countermeasure','Alex shares control. Mara builds a shutdown using her own research.',['science'],['countermeasure','access','trust','allyPayoff']),
 card('rescue','Choose Mara over the mission','Alex rescues Mara while Voss moves the weapon.', ['hostage'],['rescued','escapeRoute','allyPayoff']),
 card('publish','Give Eli the surviving evidence','Eli builds a public case, putting the source at risk.',['evidence','media'],['proof','anchorPayoff']),
 card('infiltrate','Follow Eli inside the network','Alex risks trusting Eli again to gain access to Voss.', ['insider'],['access','trust','anchorPayoff']),
 card('evacuate','Help Eli clear the danger zone','Alex gives up the pursuit to help Eli move civilians out.',[],['evacuated','escapeRoute','anchorPayoff']),
 card('improvise','Build a physical bypass','Alex studies the grid’s access tunnels and prepares a manual shutdown.',[],['access']),
 card('decoy','Offer Alex as the decoy','Alex draws Voss away while Mara records the network controls.',[],['access','proof','allyPayoff'])],
 [card('shutdown','Shut down the city weapon','Mara’s countermeasure stops the grid before the city is destroyed.',['countermeasure'],['victory','contained','allyPayoff']),
 card('broadcast','Expose Voss in a live broadcast','Eli airs the proof. Voss loses control of the cover-up.',['proof','media'],['victory','exposedVillain','anchorPayoff']),
 card('extract','Save Mara and abandon the pursuit','Alex brings Mara home, but Voss keeps the larger operation.',['rescued'],['partial','villainFree','allyPayoff']),
 card('manual','Destroy the relay from inside','Alex reaches the controls and physically severs the network.',['access'],['victory','contained']),
 card('shelter','Save the people, lose the grid','Eli’s evacuation succeeds. Voss’s network survives.',['evacuated'],['partial','villainFree','anchorPayoff']),
 card('world','Cut the orbital connection','Alex disables the relay from inside, preventing a worldwide surge.',['world','access'],['victory','contained'],{effects:500}),
 card('alliance','Convince Voss to help stop the overload','Alex uses their personal history to turn an enemy into an uneasy ally.',['personal','trust','redeemable'],['victory','turned'])],
 [card('research','Destroy Mara’s life’s work','The core burns out with Mara’s research. The invention cannot be rebuilt.',['science','contained'],['researchLost','allyPayoff']),
 card('identity','Give up a private life','Alex takes public responsibility. Anonymity is gone.',[],['exposed']),
 card('exile','Leave home for good','Alex gets the survivors to safety, then disappears as a wanted fugitive.',[],['exiled']),
 card('sacrifice','Alex does not return','The final mission costs Alex their life. The surviving cast inherits the future.',['victory'],['heroDead']),
 card('powers','Burn out the remaining powers','Alex survives as an ordinary person.',['powered'],['powersLost']),
 card('bond','Lose Mara’s trust','The outcome survives; Alex and Mara’s relationship does not.',[],['bondBroken']),
 card('career','Eli loses their career','Eli’s involvement is exposed and their professional life collapses.',[],['careerLost','anchorPayoff'])],
 [card('arrest','Voss is arrested','The surviving evidence lets authorities hold Voss accountable.',['victory','evidence'],['arrested']),
 card('escape','Voss slips away','Alex’s priority leaves Voss an exit and a route into the sequel.',['escapeRoute'],['escaped']),
 card('redeem','Voss tries to make amends','The former enemy accepts responsibility, without undoing the harm.',['turned'],['redeemed']),
 card('kill','Voss dies in the collapse','Stopping the network kills Voss. Alex’s circle must live with the cost.',['contained'],['villainDead']),
 card('hiddenWin','A copy of the core survives','Voss’s network is stopped, but stolen research has already left the city.',['weapon','victory'],['stinger']),
 card('free','Voss remains in power','The rescue succeeds while Voss retains the network.',['villainFree'],['unresolved']),
 card('custody','Voss surrenders to protective custody','Voss helps stop the overload, then gives themself up.',['turned'],['arrested'])]
];
export function evaluate(draft){
 const pack=packFor(draft), cast=pack.characters, cards=pack.cards, labels=pack.labels;
 const tags=new Set(), errors=[], selected=[], links=[];
 if(!draft||!Array.isArray(draft.characters)||draft.characters.length!==4||!Array.isArray(draft.beats)||draft.beats.length!==6)return {valid:false,errors:[{step:0,reason:'Choose four characters and six story beats.'}],selected:[],tags:[],effects:0,links:[],weakness:'Draft is incomplete.'};
 draft.characters.forEach((id,i)=>{const c=cast[i].options.find(c=>c.id===id);if(!c)errors.push({step:-1,reason:'Choose a valid '+cast[i].title});else c.tags.forEach(t=>tags.add(t));});
 const initial=new Set(tags);let effects=0;
 const states=[];
 cards.forEach((cards,i)=>{
  states.push([...tags]);const c=cards.find(c=>c.id===draft.beats[i]);selected.push(c);
  if(!c){errors.push({step:i,reason:'Choose a story beat.'});return;}
  const missing=c.needs.filter(t=>!tags.has(t));
  if(missing.length){errors.push({step:i,reason:'Needs '+missing.map(t=>labels[t]??t).join(', ')});return;}
  c.needs.forEach(t=>{const source=selected.slice(0,i).findIndex(p=>p?.add.includes(t));if(source>=0)links.push({from:source,to:i,tag:t});});
  c.add.forEach(t=>tags.add(t));
  if(pack.id==='signal-ash'&&c.id==='arrest'&&draft.characters[3]==='journalist')tags.add('anchorPayoff');
  effects+=c.effects??0;
 });
 const weakness=!tags.has('anchorPayoff')?`${cast[3].name} has no decisive action in this draft. Give the supporting character a response or consequence.`:!tags.has('allyPayoff')?`${cast[2].name} has no decisive payoff. The practical ally needs more than an introduction.`:initial.has(pack.arc.tag)&&!tags.has(pack.arc.resolved)?pack.arc.text:tags.has('bondBroken')&&tags.has(pack.arc.resolved)?`${cast[0].name} changes, but loses the bond with ${cast[2].name}. The final scenes need to explain that rupture.`:pack.positive;
 return {valid:errors.length===0,errors,selected,tags:[...tags],states,effects,department:pack.department,departmentLabel:pack.departmentLabel,links,weakness,pressure:effects>=700?'High':effects>=300?'Moderate':'Contained'};
}
export const LABELS={science:'Mara as scientist',legacy:'retired guardian',identity:'a secret identity',powered:'established powers',city:'a city threat',weapon:'an established weapon',hostage:'Mara in danger',evidence:'surviving evidence',insider:'an inside contact',countermeasure:'Mara’s countermeasure',proof:'secured proof',media:'Eli as journalist',rescued:'Mara rescued',access:'access to the network',evacuated:'an evacuation',world:'a global threat',personal:'a personal connection',trust:'a response built on trust',redeemable:'a redeemable antagonist',contained:'the network stopped',victory:'a decisive victory',escapeRoute:'a diversion that permits escape',turned:'Voss helped in the finale',villainFree:'Voss still controls the network'};
export function choices(draft,step){const pack=packFor(draft),e=evaluate(draft),tags=e.states?.[step]??[];return (pack.cards[step]??[]).map(c=>({...c,lock:c.needs.filter(t=>!tags.includes(t)).map(t=>pack.labels[t]??t).join(' + ')}));}
export function executionPenalty(draft,budget){const e=evaluate(draft);return Math.min(8,Math.max(0,(e.effects-(budget?.[e.department]??0))/100));}
export function signalSpec(){return {id:'spec-signal-ash',title:'Signal Ash',genre:'Action',subgenre:'Superhero',scale:'Mid-budget',quality:72,difficulty:62,price:125,premise:'A reluctant engineer must stop a former mentor from turning the city’s power grid into a weapon. The scientist who helped build it may be the only person who can shut it down.',roles:['Lead · Alex Rowan','Antagonist · Silas Voss','Supporting · Mara Vale','Supporting · Eli Chen'],art:122,narrativePack:'signal-ash',narrative:originalDraft(),originalNarrative:originalDraft()};}

const SIGNAL_PACK={id:'signal-ash',title:'Signal Ash',genre:'Action',theme:'superhero',headline:'One city. Four lives. Your version.',tagline:'ONE CITY. FOUR LIVES.',department:'effects',departmentLabel:'Effects',characters:CAST,cards:CARDS,labels:LABELS,steps:STEPS,questions:['What starts this movie?','What breaks the original plan?','What does Alex choose to do?','How is the conflict resolved?','What does the outcome take away?','What remains of Voss’s threat?'],arc:{tag:'trustFlaw',resolved:'trust',text:'Alex’s difficulty trusting people remains unchallenged by the chosen response.'},positive:'Both supporting characters influence the outcome; the next challenge is delivering these moments in production.'};
export const PACKS=[SIGNAL_PACK,...GENRE_PACKS];
export function packFor(draft){const id=draft?.pack??'signal-ash';const pack=PACKS.find(p=>p.id===id);if(!pack)throw Error('Unknown story pack.');return pack;}
export function authoredSpecs(){return [signalSpec(),...GENRE_PACKS.map(p=>{const draft={pack:p.id,...structuredClone(p.original)};return {id:'spec-'+p.id,title:p.title,genre:p.genre,subgenre:p.subgenre,scale:p.scale,quality:p.quality,difficulty:p.difficulty,price:p.price,premise:p.premise,roles:p.characters.map((c,i)=>(i===0?'Lead':i===1?'Opposition':'Supporting')+' · '+c.name),art:122,narrativePack:p.id,narrative:draft,originalNarrative:structuredClone(draft)};})];}
