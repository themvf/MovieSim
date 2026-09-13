// Compact, read-only guidance for repeated filmmaking.
import {CLIENTS} from './clients.js';
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
