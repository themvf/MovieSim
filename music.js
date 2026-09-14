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
  const fit=c.genres.includes(m.genre);
  const quality=Math.max(5,Math.min(99,c.skill+(fit?8:0)+variation));
  return {composer:c.name,style:c.style,original:index>0,quality,fit,
    fans:Math.round((quality-50)/10),critics:Math.round((quality-50)/14)};
}
