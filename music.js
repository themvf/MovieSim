// Fees are in thousands, like the rest of the production budget.
export const COMPOSERS = [
  {name:'Library music',style:'Ready-made tracks',fee:0,skill:50,genres:[]},
  {name:'Maya Chen',style:'Intimate piano & strings',fee:60,skill:69,genres:['Drama','Romance','Family','Historical']},
  {name:'Theo Vega',style:'Electronic tension',fee:90,skill:73,genres:['Sci-fi','Horror','Thriller','Mystery','Crime']},
  {name:'Amara Okafor',style:'Sweeping orchestra',fee:150,skill:78,genres:['Adventure','Fantasy','Action','War','Epic','Disaster']},
  {name:'Jules Park',style:'Playful rhythms',fee:60,skill:69,genres:['Comedy','Animation','Musical','Western']},
];
export function cost(m){return (COMPOSERS[m.composer??0]?.fee??0)*(m.scale==='Blockbuster'?2:m.scale==='Mid-budget'?1.5:1);}
export function resolve(m,variation=0){
  const index=m.composer??0,c=COMPOSERS[index];
  if(m.musicStyle!==undefined){
    const style=STYLES[m.musicStyle],{specialty,unusual}=pairing(m);
    const quality=index===0?50:Math.max(5,Math.min(99,c.skill+(specialty?8:0)+variation));
    const discovery=index>0&&unusual&&quality>=80;
    return {composer:c.name,style:style.name,original:index>0,quality,fit:specialty,unusual,discovery,
      fans:Math.round((quality-50)/10),critics:Math.round((quality-50)/14)+(discovery?2:0)};
  }
  // Preserve the signed musical approach for films greenlit before style selection.
  const fit=c.genres.includes(m.genre);
  const quality=Math.max(5,Math.min(99,c.skill+(fit?8:0)+variation));
  return {composer:c.name,style:c.style,original:index>0,quality,fit,
    fans:Math.round((quality-50)/10),critics:Math.round((quality-50)/14)};
}

export const STYLES = [
  {name:'Orchestral',feel:'Grand, sweeping',genres:['Adventure','Fantasy','Action','War','Epic','Disaster']},
  {name:'Piano',feel:'Intimate, vulnerable',genres:['Drama','Romance','Family']},
  {name:'Strings',feel:'Romantic, bittersweet',genres:['Drama','Romance','Historical']},
  {name:'Electronic',feel:'Futuristic, uneasy',genres:['Sci-fi','Thriller','Action']},
  {name:'Ambient',feel:'Atmospheric, mysterious',genres:['Horror','Mystery','Sci-fi']},
  {name:'Jazz',feel:'Stylish, unpredictable',genres:['Crime','Comedy','Drama']},
  {name:'Rock',feel:'Rebellious, energetic',genres:['Action','Adventure','Comedy']},
  {name:'Pop',feel:'Catchy, upbeat',genres:['Comedy','Family','Musical','Animation']},
  {name:'Hip-hop',feel:'Rhythmic, assertive',genres:['Crime','Drama','Action']},
  {name:'Folk / Acoustic',feel:'Grounded, nostalgic',genres:['Western','Drama','Historical']},
  {name:'Choir',feel:'Majestic, haunting',genres:['Fantasy','Horror','Epic','Historical']},
  {name:'Percussion',feel:'Urgent, tense',genres:['Action','War','Thriller','Adventure']},
];
// Keep existing indices stable for films already in production.
const specialties=[[],['Piano','Strings'],['Electronic','Ambient'],['Orchestral','Choir'],['Pop','Percussion']];
COMPOSERS.forEach((c,i)=>{c.strengths=specialties[i];c.reputation=i===0?'Licensed tracks':i===3?'Acclaimed':'Established';});
COMPOSERS.push(
  {name:'Nico Reyes',style:'Jazz & folk',strengths:['Jazz','Folk / Acoustic'],fee:40,skill:65,reputation:'Rising',genres:[]},
  {name:'Zara Brooks',style:'Hip-hop & electronic',strengths:['Hip-hop','Electronic'],fee:80,skill:72,reputation:'Established',genres:[]},
  {name:'Kit Morgan',style:'Rock & pop',strengths:['Rock','Pop'],fee:45,skill:66,reputation:'Rising',genres:[]},
  {name:'Sofia Marin',style:'Strings & percussion',strengths:['Strings','Percussion'],fee:120,skill:76,reputation:'Acclaimed',genres:[]},
);
export function pairing(m){
  const c=COMPOSERS[m.composer??0],style=STYLES[m.musicStyle??0];
  return {specialty:c.strengths.includes(style.name),unusual:!style.genres.includes(m.genre)};
}
