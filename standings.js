import {RIVAL_STUDIOS,rivalStudio} from './engine.js?v=0.45.0';
// Read-only run-to-date totals. Never expose unreleased films or unopened envelopes.
export function standings(s,sort='gross'){
 const rows=[{id:'player',name:s.name,player:true,gross:0,awards:0,films:0},...RIVAL_STUDIOS.map(r=>({id:r.id,name:r.name,player:false,gross:0,awards:0,films:0}))];
 const byId=new Map(rows.map(r=>[r.id,r]));
 for(const m of s.movies)if(m.release!=null&&m.release<=s.week&&['theaters','catalog'].includes(m.stage)){rows[0].gross+=m.gross??0;rows[0].films++;}
 const seen=new Set();for(const r of s.life?.rivalResults??[]){if(r.week>s.week||seen.has(r.key))continue;seen.add(r.key);const row=byId.get(r.studio);if(row){row.gross+=r.gross??0;row.films++;}}
 for(const season of s.awards??[])for(const r of season.results.slice(0,season.completed?season.results.length:season.revealed??0)){const row=byId.get(r.ours?'player':rivalStudio(r).id);if(row)row.awards++;}
 const key=sort==='awards'?'awards':'gross',other=key==='gross'?'awards':'gross';rows.sort((a,b)=>b[key]-a[key]||b[other]-a[other]||a.name.localeCompare(b.name));
 rows.forEach((r,i)=>{r.rank=i&&r[key]===rows[i-1][key]&&r[other]===rows[i-1][other]?rows[i-1].rank:i+1;});return rows;
}
