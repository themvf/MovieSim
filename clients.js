// Recurring industry clients. Rewards are in thousands of dollars.
export const CLIENTS = [
 {id:'starlight',name:'Mira Sol',initials:'MS',company:'Starlight Cinemas',role:'Cinema owner',start:0,weeks:32,payment:450,bonus:100,cooldown:10,
  title:'An adventure close to home',cards:[['setting','Earth'],['tone','Adventurous']],
  pitch:'Give me Earth, a big adventure, and a reason for people to leave their sofas.',success:'That brought a little life back to the lobby. I have another slot for you.',failure:'I held that slot for your film. Next time, promise me a date you can keep.'},
 {id:'lantern',name:'Tomas Reed',initials:'TR',company:'Lantern Film Society',role:'Festival programmer',start:4,weeks:44,payment:700,bonus:150,cooldown:16,
  title:'A machine with something to say',cards:[['concept','Artificial Intelligence'],['tone','Thoughtful']],score:'critics',minimum:75,
  pitch:'An AI story that leaves the room arguing. Bring the idea—and the execution.',success:'The discussion went on after we turned the lights off. Bring me your next idea.',failure:'The ambition was there. The film did not meet the brief. Let’s take some time.'},
 {id:'midnight',name:'Kit Mercer',initials:'KM',company:'Midnight Signal',role:'Late-night film host',start:8,weeks:36,payment:550,bonus:125,cooldown:12,
  title:'Nowhere to turn',cards:[['complication','Isolation'],['tone','Dark']],score:'fans',minimum:65,
  pitch:'Trap them somewhere dark. My audience loves shouting advice at the screen.',success:'They yelled at the screen. Then they asked when your next one was coming.',failure:'My regulars were counting on this one. I’ll give the slot to someone else for a while.'},
];
export function ensure(s){s.clients??={};for(const c of CLIENTS)s.clients[c.id]??={wins:0,strikes:0,nextOffer:c.start,deal:null,history:[],last:c.pitch};}
export function definition(id){const c=CLIENTS.find(c=>c.id===id);if(!c)throw Error('Unknown client.');return c;}
export function available(s,id){const c=definition(id),r=s.clients?.[id];return !!r&&!r.deal&&r.strikes<2&&s.week>=r.nextOffer&&s.week+c.weeks<260;}
export function occupied(s,m){return s.marsTravel?.deal?.movie===m.id||Object.values(s.clients??{}).some(r=>r.deal?.movie===m.id);}
export function eligible(s,m){return !!m&&m.genre==='Sci-fi'&&['development','packaging'].includes(m.stage)&&!!m.scifiCards&&!occupied(s,m);}
export function matches(m,c){return c.cards.every(([section,card])=>m.scifiCards?.[section]?.includes(card));}
export function accept(s,id){ensure(s);const c=definition(id),r=s.clients[id];if(!available(s,id))throw Error('This client has no offer available.');r.deal={accepted:s.week,due:s.week+c.weeks,payment:c.payment+Math.min(3,r.wins)*c.bonus,movie:null};}
export function bind(s,id,m){const c=definition(id),d=s.clients?.[id]?.deal;if(!d||d.movie||!eligible(s,m))throw Error('Attach one uncommitted sci-fi card film before filming.');if(!matches(m,c))throw Error('Choose a film with both requested cards.');d.movie=m.id;}
export function decline(s,id){const c=definition(id);if(!available(s,id))throw Error('No offer is waiting.');s.clients[id].nextOffer=s.week+c.cooldown;s.clients[id].last='Thanks for saying so. I’ll ask again another time.';}
function settle(s,c,m,ok,reason,notify){const r=s.clients[c.id],d=r.deal;if(!d)return;
 if(ok){s.cash+=d.payment;m.receipts+=d.payment;m.sponsorIncome=(m.sponsorIncome??0)+d.payment;r.wins++;r.nextOffer=s.week+c.cooldown;r.last=c.success;}
 else{r.strikes++;r.nextOffer=s.week+40;r.last=r.strikes>=2?'Two missed briefs. I’m taking future requests elsewhere.':c.failure;}
 r.history.push({week:s.week,movie:d.movie,title:m?.title??'Unassigned brief',outcome:ok?'delivered':'missed',payment:ok?d.payment:0,reason});r.deal=null;
 notify(`${c.name}: ${ok?`$${Math.round(d.payment*1000).toLocaleString('en-US')} paid for ${m.title}.`:reason}`);
}
export function deliver(s,m,notify=()=>{}){ensure(s);for(const c of CLIENTS){const d=s.clients[c.id].deal;if(!d||d.movie!==m.id||m.stage!=='theaters'||m.release==null||s.week<m.release)continue;
 const reason=s.week>d.due?'Release deadline missed.':(m.genre!=='Sci-fi'||!matches(m,c))?'The released film changed the requested cards.':c.score&&!(m[c.score]>=c.minimum)?`${c.score==='critics'?'Critics':'Fans'} scored below ${c.minimum}.`:null;
 settle(s,c,m,!reason,reason??'Released on time and met the brief.',notify);
}}
export function tick(s,notify=()=>{}){ensure(s);for(const c of CLIENTS){const d=s.clients[c.id].deal;if(!d)continue;const m=s.movies.find(m=>m.id===d.movie);if(s.week>d.due||m?.cancelled||m?.stage==='cancelled')settle(s,c,m,false,m?.cancelled||m?.stage==='cancelled'?'Attached film was shelved.':'Release deadline missed.',notify);}}
