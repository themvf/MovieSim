// An archive of verified game events. Reading the magazine never advances time.
export function ensure(s) { s.press ??= {version:1, seen:{}, articles:[]}; }
function publish(s, id, category, title, text, movie=null, badge='✦') {
  if(s.press.seen[id])return;
  s.press.seen[id]=true;
  s.press.articles.unshift({id,week:s.week,category,title,text,movie,badge});
}
export function collect(s) {
  ensure(s);
  const released=s.movies.filter(m=>['theaters','catalog'].includes(m.stage));
  for(const count of [1,5,10,20])if(released.length>=count)
    publish(s,'releases:'+count,'Studio milestone',count===1?`${s.name} makes its debut`:`${s.name}: ${count} films and counting`,count===1?`${released[0].title} brings a new studio to the screen.`:'A growing catalog. A studio finding its voice.',released[count-1].id,String(count));
  for(const m of released){
    if(m.receipts>m.spent)publish(s,m.id+':profit','In the black',`${m.title} turns a profit`,'Studio receipts have overtaken film spending. Studio overhead is separate.',m.id,'↗');
    for(const [amount,label] of [[10000,'The $10M club'],[25000,'Blockbuster'],[50000,'Box-office giant']])
      if(m.gross>=amount)publish(s,m.id+':gross:'+amount,label,`${m.title} crosses $${amount/1000}M`,'A new milestone in cumulative theatrical ticket sales.',m.id,'$'+amount/1000+'M');
    if(m.critics>=100)publish(s,m.id+':perfect','Critical landmark',`A perfect 100 for ${m.title}`,'The film has reached a 100/100 aggregate critic score.',m.id,'100');
    else if(m.critics>=90)publish(s,m.id+':rave','Critics’ pick',`${m.title} earns a place among the standouts`,`Critics: ${Math.round(m.critics)}/100. A film worth talking about.`,m.id,String(Math.round(m.critics)));
    const perfect=m.reviews?.find(r=>r.score>=100);
    if(perfect&&m.critics<100)publish(s,m.id+':perfect-review','Perfect review',`${m.title} gets a perfect review`,`${perfect.name} awards 100/100. Aggregate critics: ${Math.round(m.critics)}/100.`,m.id,'100');
    if(m.fans>=90)publish(s,m.id+':fans','Audience favorite',`Moviegoers rally around ${m.title}`,`Audience score: ${Math.round(m.fans)}/100. The fans have their favorite.`,m.id,'♥');
    if(m.awards?.length)publish(s,m.id+':award','Awards night',`${m.title} takes home silver`,'The film has joined your studio’s award winners.',m.id,'★');
  }
  for(const [id,r] of Object.entries(s.clients??{}))for(const [i,x] of r.history.entries())if(x.outcome==='delivered')publish(s,'client:'+id+':'+i,'Industry partnerships',`${x.title} delivers on its brief`,`A successful commission earned the studio $${Math.round(x.payment*1000).toLocaleString('en-US')}.`,x.movie,'✓');
  for(const level of [25,50,75,100])if(s.prestige>=level)publish(s,'prestige:'+level,'Studio milestone',`${s.name} reaches ${level} prestige`,'The studio’s standing in the industry has reached a new milestone.',null,'✦');
}
