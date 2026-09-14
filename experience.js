// Compact, read-only guidance for repeated filmmaking.
import {CLIENTS} from './clients.js?v=0.46.0';
export function nextHire(m) {
 const role=m.roles.findIndex((_,i)=>!m.contracts.some(c=>c.role===i));
 return role>=0?{kind:'casting',role,label:`Next role: ${m.roles[role]}`}:
  !m.director?{kind:'director',role:0,label:'Next role: Director'}:
  {kind:'production',label:'Review production plan'};
}
export function standardOffer(q) {return q.option?q.low:Math.ceil((q.low+q.high)/2/10)*10;}
export function deadlineWindows(s,m,wrap) {
 const deals=[...(s.marsTravel?.deal?.movie===m.id?[{name:'Mars Travel',...s.marsTravel.deal}]:[]),
 ...CLIENTS.flatMap(c=>s.clients?.[c.id]?.deal?.movie===m.id?[{name:c.company,...s.clients[c.id].deal}]:[])];
 return deals.map(d=>({...d,earliestRelease:wrap+1,slack:d.due-wrap-1}));
}

// Planning allowance is explicit, not a promise or a hidden deadline extension.
export function commissionEstimate(week,{movie=null,duration=8,due=week+18}={}) {
 const development=movie?movie.stage==='development'?Math.max(0,movie.ready-week):0:3;
 const shoot=Number.isInteger(duration)&&duration>=4&&duration<=20?duration:8;
 const setbackAllowance=4,releasePreparation=1;
 const total=development+shoot+setbackAllowance+releasePreparation;
 return {development,shoot,setbackAllowance,releasePreparation,total,releaseWeek:week+total,buffer:due-week-total};
}
