import { storyFor } from "./stories.js?v=0.10.0";
// All money is in thousands of dollars. The simulation is deterministic from its saved seed.
export const VERSION = 5;
export const END = 260;
export const GENRES = {
  Drama: [
    "Character study",
    "Courtroom",
    "Coming of age",
    "Family saga",
    "Historical",
    "Biographical",
    "Sports drama",
    "Romantic drama",
    "Social drama",
    "War drama",
  ],
  Thriller: [
    "Psychological",
    "Crime",
    "Conspiracy",
    "Legal thriller",
    "Political thriller",
    "Mystery",
    "Domestic suspense",
    "Techno-thriller",
    "Survival thriller",
  ],
  Comedy: [
    "Romantic",
    "Workplace",
    "Satire",
    "Slapstick",
    "Dark comedy",
    "Buddy comedy",
    "Coming-of-age comedy",
    "Mockumentary",
    "Family comedy",
    "Fish out of water",
  ],
  Horror: [
    "Supernatural",
    "Survival",
    "Folk",
    "Slasher",
    "Creature feature",
    "Haunted house",
    "Found footage",
    "Body horror",
    "Psychological horror",
    "Vampire",
  ],
  Action: [
    "Espionage",
    "Adventure",
    "Heist",
    "Martial arts",
    "Disaster",
    "Military action",
    "Chase thriller",
    "Swashbuckler",
    "Superhero",
  ],
  "Sci-fi": [
    "Space",
    "Near future",
    "Time travel",
    "First contact",
    "Cyberpunk",
    "Dystopian",
    "Artificial intelligence",
    "Post-apocalyptic",
    "Space opera",
    "Science fantasy",
  ],
};
export const SCOPES = {
  Small: {
    name: "Low-budget film",
    description:
      "A focused story with a few locations and a lean crew. Lower production needs and a smaller potential audience. A standard production plan is around $650,000, before talent and marketing.",
  },
  "Mid-budget": {
    name: "Mid-budget film",
    description:
      "A broader story with more locations and a full crew. Higher production needs and room to reach a wider audience. A standard production plan is around $2,200,000, before talent and marketing.",
  },
  Blockbuster: {
    name: "Big-budget film",
    description:
      "A large-scale production with three featured roles and ambitious staging. The biggest audience potential and the most money at risk. A standard production plan is around $6,500,000, before talent and marketing.",
  },
};
export const scopeName = (scale) => SCOPES[scale]?.name ?? scale;
export function talentEstimate(s, p, value) {
  const width = Math.max(
    5,
    (1 + ((p.look ?? 0) % 4)) * 5 - (s.departments.Casting - 1) * 5,
  );
  const low = Math.max(
    0,
    Math.min(100 - width, Math.round((value - width / 2) / 5) * 5),
  );
  return { low, high: low + width };
}
export const estimateText = (estimate) => `${estimate.low}–${estimate.high}`;
export const directorAbility = (p, genre) =>
  p.talent * 0.8 + (p.genres[genre] ?? 50) * 0.2;
export const SCALES = ["Small", "Mid-budget", "Blockbuster"];
export const RIVAL_STUDIOS = [
  { id:"atlas", name:"Atlas Pictures", focus:"Action, sci-fi & big releases", genres:["Action","Sci-fi"] },
  { id:"velvet", name:"Velvet Lantern Films", focus:"Drama, comedy & awards contenders", genres:["Drama","Comedy"] },
  { id:"nightowl", name:"Night Owl Studios", focus:"Horror & thrillers", genres:["Horror","Thriller"] },
];
export function rivalStudio(r) {
  const hash=[...(r.title ?? r.winner ?? "")].reduce((v,c)=>v+c.charCodeAt(0),0);
  return RIVAL_STUDIOS.find(x=>x.id===r.studioId) ?? RIVAL_STUDIOS.find(x=>x.genres.includes(r.genre)) ?? RIVAL_STUDIOS[hash%3];
}
export const UPGRADE_MILESTONES = {
  Development: ["Script desk", "Story development team", "Script development department", "Prestige development slate"],
  Casting: ["Casting desk", "Talent scouts", "Specialist casting team", "Studio casting department"],
  Production: ["Production desk", "Experienced line producers", "Senior production team", "Studio production department"],
  Marketing: ["Marketing desk", "Campaign team", "Theatrical marketing department", "Studio release department"],
  Research: ["Research desk", "Audience research team", "Box-office analysis team", "Studio research department"],
  Soundstage: ["Your first soundstage", "Standing sets", "Soundstage complex", "A full studio backlot"],
  "Editing suite": ["Your first editing suite", "In-house post-production", "Post-production department", "Studio post-production center"],
  "Effects workshop": ["Your first effects workshop", "Effects production team", "Specialist effects department", "Studio effects center"],
};
export function upgradeUnlock(s,name) {
  const dept=Object.hasOwn(s.departments,name),level=(dept?s.departments:s.facilities)[name];
  if (level === undefined || !UPGRADE_MILESTONES[name]) throw Error("Unknown upgrade.");
  const next=level+1,prestige=dept ? [0,0,0,15,35][next] : [0,0,15,35,60][next];
  const benefits={
    Development:"Sharper script estimates and stronger commissioned screenplays.",
    Casting:"Narrower talent estimates help you compare auditions and director candidates.",
    Production:"A more experienced production team improves execution on future films.",
    Marketing:"Campaigns reach more people, and self-distributed films get wider access to audiences.",
    Research: next===2 ? "Unlock detailed craft and performance analysis in release reports, with narrower forecasts." : next===3 ? "Unlock competition, seasonality and campaign-reach breakdowns in release reports." : "Your narrowest box-office forecasts and more representative test screenings.",
    Soundstage:"Reuse owned sets and reduce future set-and-location costs.",
    "Editing suite":"Bring more editing in-house and reduce future crew-and-post costs.",
    "Effects workshop":"Build effects in-house and reduce future effects costs.",
  };
  return { level:next,title:UPGRADE_MILESTONES[name][next-1],prestige:prestige ?? 0,cost:upgradeCost(s,name),benefit:benefits[name],complete:level>=4 };
}
export const LOCATION_PLANS = [
 {name:"Mixed locations",cost:1,desc:"A mix of interiors and nearby exteriors."},
 {name:"Interior filming",cost:.8,desc:"Contained sets, fewer moves, controlled conditions."},
 {name:"Local exterior filming",cost:1.1,desc:"Real streets and landscapes; weather exposure."},
 {name:"Distant locations",cost:1.35,desc:"Travel and distinctive scenery; expensive logistics."},
];
export const EFFECTS_PLANS = [
 {name:"Practical + visual effects",cost:1,desc:"Use practical and digital work as needed."},
 {name:"Practical effects",cost:1.05,desc:"Build and photograph physical effects."},
 {name:"Visual effects (VFX)",cost:1.25,desc:"More digital work and post-production."},
 {name:"Minimal effects",cost:.75,desc:"Use sound, editing and performances to suggest the action."},
];
const TREND_TYPES=[
 {name:"Low-budget horror",genre:"Horror",scale:"Small",icon:"👻"},
 {name:"Historical blockbusters",scale:"Blockbuster",historical:true,icon:"🏛"},
 {name:"Feel-good comedies",genre:"Comedy",icon:"🎭"},
 {name:"Space adventures",genre:"Sci-fi",icon:"🚀"},
];
export function ensureOpportunities(s) {
 if(s.marketTrends)return;
 const t=TREND_TYPES[(s.rng>>>0)%TREND_TYPES.length];
 s.marketTrends=[{...t,start:s.week,end:s.week+130+((s.rng>>>8)%53),strength:.45}];
 s.talentOffers=[];
}
export function activeTrends(s){return (s.marketTrends??[]).filter(t=>s.week<t.end);}
export function trendMultiplier(s,m,week=s.week) {
 return (s.marketTrends??[]).reduce((v,t)=>{
 const matches=(!t.genre||t.genre===m.genre)&&(!t.scale||t.scale===m.scale)&&(!t.historical||/historical|period/i.test(m.subgenre));
 return matches&&week>=t.start&&week<t.end ? v*(1+t.strength*Math.min(1,(t.end-week)/26)):v;
 },1);
}
export function productionFit(m) {
 const location=m.location??0,effects=m.effectsApproach??0;
 let value=0;
 if(location===1)value+=['Drama','Thriller','Horror','Comedy'].includes(m.genre)?4:-3;
 if(location===2)value+=['Action','Thriller'].includes(m.genre)?4:0;
 if(location===3)value+=/adventure|historical|period|fantasy/i.test(m.subgenre)?5:0;
 if(effects===1)value+=['Horror','Action'].includes(m.genre)?4:0;
 if(effects===2)value+=['Sci-fi','Action'].includes(m.genre)?4:-2;
 if(effects===3)value+=['Drama','Thriller','Comedy'].includes(m.genre)?4:m.genre==='Horror'?2:-5;
 return value;
}
export function streamingTotals(s,m,offer) {
 const weeks=Math.min(offer.term,Math.max(0,END-s.week));
 const sum=n=>offer.upfront+Array.from({length:n},(_,i)=>offer.weekly*(1+i/52)**-1.2).reduce((a,v)=>a+v,0);
 return {full:sum(offer.term),remaining:sum(weeks),weeks};
}
export function admirationOffer(s,m) {
 if(Math.max(m.fans,m.critics)<75 || (s.talentOffers??[]).some(o=>!o.usedBy&&o.end>s.week) || random(s)>.5)return;
 const cast=new Set(m.contracts.map(c=>c.id));
 const choices=s.people.filter(p=>p.star>=50&&!p.retired&&!cast.has(p.id)&&p.id!==m.director?.id);
 if(!choices.length)return;
 const p=pick(s,choices);s.talentOffers??=[];
 s.talentOffers.push({person:p.id,film:m.title,start:s.week,end:s.week+26,usedBy:null});
 log(s,`${p.name} loved ${m.title}: offering half their usual fee for one new role.`,"success");
}
export const POSTER_FILMS = [
 {photoPoster:"beyond-the-pines",title:"Beyond the Pines",genre:"Thriller",subgenre:"Mystery",scale:"Small"},
 {photoPoster:"red-horizon",title:"Red Horizon",genre:"Action",subgenre:"Adventure",scale:"Blockbuster"},
 {photoPoster:"between-worlds",title:"Between Worlds",genre:"Sci-fi",subgenre:"Space",scale:"Mid-budget",difficulty:90,quality:85},
 {photoPoster:"lights-off",title:"Lights Off",genre:"Horror",subgenre:"Haunted house",scale:"Small"},
];
export function addPosterFilms(s) {
  if (s.posterFilmsAdded) return;
  s.posterFilmsAdded=true;
  s.market.unshift(...POSTER_FILMS.map(f=>{
    const sc=script(s);
    return {...sc,...f,...freshStory(s,f.subgenre),roles:f.scale==="Blockbuster"?["Lead","Co-lead","Supporting"]:["Lead","Supporting"]};
  }));
}
export function rangePosition(f,value) {
  if (!f || !Number.isFinite(value)) return null;
  if (value<f.low) return "Below";
  if (value>f.high) return "Exceeded";
  if (f.high===f.low) return "On target";
  const position=(value-f.low)/(f.high-f.low);
  return position<1/3 ? "Low end" : position>2/3 ? "High end" : "Mid-range";
}
export function passionProject(p,m) {
  return p.kind==="actor" && !freshFace(p) && p.star>=75 && m.difficulty>=80 && (m.scriptQuality ?? m.quality ?? 0)>=75 && (p.genres[m.genre] ?? 50)>=65;
}
export const PRESTIGE_LEVELS = [
  {
    at: 0,
    name: "New independent",
    description: "A new name with everything to prove.",
  },
  {
    at: 15,
    name: "On the radar",
    description: "Your films are getting the industry’s attention.",
  },
  {
    at: 35,
    name: "Respected studio",
    description: "Talent and distributors take your calls seriously.",
  },
  {
    at: 60,
    name: "Major player",
    description: "Your track record gives you real negotiating power.",
  },
  {
    at: 85,
    name: "Prestige powerhouse",
    description: "Your studio is a destination for ambitious filmmakers.",
  },
];
export const prestigeLevel = (value) =>
  PRESTIGE_LEVELS.findLastIndex((l) => value >= l.at);
export function notifyPrestige(s) {
  const level = prestigeLevel(s.prestige);
  for (let i = (s.prestigeLevel ?? 0) + 1; i <= level; i++)
    s.notices.push({ kind: "prestige", level: i });
  s.prestigeLevel = Math.max(s.prestigeLevel ?? 0, level);
}
// Fictional game characters using user-supplied headshots; profiles are authored, not photo-derived.
export function addHeadshotActors(s) {
 const profiles=[
 ['Callum Reed',29,'Man',38,74],['Nico Arden',33,'Man',62,81],['Finn Mercer',21,'Man',8,67],
 ['Sloane Avery',30,'Woman',70,84],['Mara Ellis',26,'Woman',18,77],['Simone Hart',28,'Woman',45,79],
 ['Talia Brooks',24,'Woman',12,72],['Rowan Bell',27,'Woman',55,82],['Lena West',25,'Woman',30,75],['Adrian Cole',52,'Man',82,89]
 ];
 profiles.forEach(([name,age,gender,star,talent],i)=>{
  const id=`headshot-actor-${i+1}`;if(s.people.some(p=>p.id===id))return;
  s.people.push(enrichTalent({id,name,kind:'actor',age,gender,star,talent,fee:Math.round(35+star*star*.35),look:117+i*41,photoActor:i+1,history:[],awards:0,bookings:[],retired:false}));
 });
}
export function enrichTalent(p) {
  p.gender ??= ["Woman", "Man", "Nonbinary"][(p.look ?? 0) % 20 < 9 ? 0 : (p.look ?? 0) % 20 < 18 ? 1 : 2];
  if (!p.genres) {
    const n = p.look ?? 0;
    p.genres = Object.fromEntries(
      Object.keys(GENRES).map((g, i) => [
        g,
        35 + ((n * (i + 3) + i * 19) % 61),
      ]),
    );
  }
  p.presence ??= 40 + (((p.look ?? 0) * 17) % 56);
  p.majorCredits ??=
    (p.star >= 25 ? Math.max(1, Math.floor(p.star / 6)) : 0) +
    p.history.filter((f) => f.major).length;
  return p;
}
export const freshFace = (p) => p.majorCredits === 0;
export const specialties = (p) =>
  Object.entries(p.genres).sort((a, b) => b[1] - a[1]);
export const roleAbility = (p, genre) =>
  p.talent * 0.62 + p.presence * 0.15 + (p.genres[genre] ?? 50) * 0.23;
export const BUDGET_TIERS = [
  "Shoestring",
  "Lean",
  "Standard",
  "Premium",
  "Flagship",
];
export const BUDGET_DETAILS = {
  sets: [
    "Borrowed spaces & minimal dressing",
    "A few practical locations",
    "Dedicated sets & location crew",
    "Custom builds & location variety",
    "Large builds & specialist locations",
  ],
  crew: [
    "Skeleton crew & basic editing",
    "Small crew with limited coverage",
    "Full crew & dedicated post team",
    "Specialists & extra camera coverage",
    "Multiple units & extensive post",
  ],
  effects: [
    "Minimal effects & simple fixes",
    "A small effects crew",
    "Dedicated effects crew & finishing",
    "Dedicated effects team",
    "Extensive custom effects work",
  ],
};
export function productionWeights(m) {
  let effects = ["Action", "Sci-fi"].includes(m.genre)
    ? 0.4
    : m.genre === "Horror"
      ? 0.2
      : 0.05;
  if (m.genre === "Horror")
    effects = /creature|monster|supernatural|body/i.test(m.subgenre)
      ? 0.35
      : /psychological|found footage/i.test(m.subgenre)
        ? 0.1
        : 0.2;
  if (/period|historical|fantasy/i.test(m.subgenre))
    effects = Math.max(effects, 0.15);
  return { sets: 0.55 - effects, crew: 0.45, effects };
}
export function budgetCost(m, key, tier) {
  const needs =
    m.scale === "Small" ? 650 : m.scale === "Mid-budget" ? 2200 : 6500;
  return Math.max(
    key === "effects" ? 0 : 25,
    roundAmount(
      needs * productionWeights(m)[key] * [0.3, 0.65, 1, 1.5, 2.2][tier],
    ),
  );
}
export const recommendedWeeks = (m) =>
  Math.min(
    14,
    (m.scale === "Blockbuster" ? 12 : m.scale === "Mid-budget" ? 10 : 8) +
      (m.difficulty >= 75 ? 2 : 0),
  );
export function productionNeeds(m, b = m.budget) {
  const tier = m.scale === "Blockbuster" ? 3 : 2;
  return Object.entries(productionWeights(m)).map(([key, weight]) => {
    const target = budgetCost(m, key, tier),
      ratio = b[key] / target;
    return {
      key,
      weight,
      target,
      ratio,
      status:
        ratio < 0.8
          ? "Underfunded"
          : ratio < 1
            ? "Lean"
            : ratio <= 1.25
              ? "Meets needs"
              : "Above needs",
    };
  });
}
export function scheduleInfo(duration, m) {
  const target = m ? recommendedWeeks(m) : 8;
  const difference = duration - target;
  return {
    label:
      duration < target
        ? "Rushed"
        : duration === target
          ? "Recommended"
          : "Extra rehearsal",
    multiplier: (duration / 8) ** 0.6,
    quality:
      difference < 0
        ? Math.max(-16, difference * 2)
        : Math.min(3, difference * 0.75),
    target,
    risk: clamp(0.3 * (8 / duration) ** 1.5, 0.08, 0.6),
  };
}
export function auditionKey(p, role) { return `${p.kind === "director" ? "director" : role}:${p.id}`; }
export function auditionAllowance(s, m, role) {
  const limit = 5 + Math.max(0, prestigeLevel(s.prestige)) * 2;
  const record = m.auditionWeeks?.[role];
  const used = record?.week === s.week ? record.used : 0;
  return { limit, used, remaining: Math.max(0, limit - used) };
}
export function productionCosts(s, m, b, duration) {
  const saving =
    s.facilities.Soundstage * 0.09 * b.sets +
    s.facilities["Effects workshop"] * 0.09 * b.effects +
    s.facilities["Editing suite"] * 0.04 * b.crew;
  const multiplier = scheduleInfo(duration).multiplier;
  const departments = {
    sets: (b.sets * (LOCATION_PLANS[m.location??0]?.cost??1) - s.facilities.Soundstage * .09 * b.sets) * multiplier,
    crew: (b.crew - s.facilities["Editing suite"] * .04 * b.crew) * multiplier,
    effects: (b.effects * (EFFECTS_PLANS[m.effectsApproach??0]?.cost??1) - s.facilities["Effects workshop"] * .09 * b.effects) * multiplier,
  };
  const total = departments.sets + departments.crew + departments.effects;
  return { saving, total, weekly: total / duration, departments };
}
const DEBT_EPSILON = 1e-10; // Internal thousands: far below one cent; only arithmetic residue.
function validMovieFinances(m) {
  if (
    m.marketingConfirmed !== undefined &&
    typeof m.marketingConfirmed !== "boolean"
  )
    return false;
  for (const key of ["marketingBudget", "marketingSpendAtRelease"])
    if (m[key] != null && (!Number.isFinite(m[key]) || m[key] < 0))
      return false;

  const nonnegative = (value) => Number.isFinite(value) && value >= 0;
  if (m.responseExpectations && ["audience","critics"].some(k=>!m.responseExpectations[k] || !nonnegative(m.responseExpectations[k].low) || !nonnegative(m.responseExpectations[k].high) || m.responseExpectations[k].high>100 || m.responseExpectations[k].low>m.responseExpectations[k].high)) return false;
  if (m.streamingDeal && (!['exclusive','royalty'].includes(m.streamingDeal.id) || ['upfront','weekly','signedWeek','endWeek','term'].some(k=>!nonnegative(m.streamingDeal[k])) || m.streamingDeal.endWeek !== m.streamingDeal.signedWeek+52)) return false;
  const base = [
    "spent",
    "receipts",
    "gross",
    "catalog",
    "campaignSpend",
    "awardSpend",
  ];
  if (
    base.some((key) => !nonnegative(m[key])) ||
    !m.budget ||
    ["sets", "crew", "effects"].some((key) => !nonnegative(m.budget[key])) ||
    !Array.isArray(m.boxWeeks) ||
    m.boxWeeks.some((value) => !nonnegative(value))
  )
    return false;
  for (const contract of [
    ...(m.contracts ?? []),
    ...(m.director ? [m.director] : []),
  ])
    if (
      !contract ||
      !nonnegative(contract.fee) ||
      !nonnegative(contract.optionCost) ||
      (contract.participationPaid !== undefined &&
        !nonnegative(contract.participationPaid)) ||
      (contract.grossShare !== undefined &&
        (!nonnegative(contract.grossShare) || contract.grossShare > 0.05))
    )
      return false;
  const optional = [
    "recoupRemaining",
    "recouped",
    "releaseSupport",
    "distributionReach",
    "participationPaid",
    "weekly",
    "productionTotal",
    "facilitySaving",
    "advance",
    "share",
    "opening",
  ];
  if (optional.some((key) => m[key] !== undefined && !nonnegative(m[key])))
    return false;
  if (m.stage === "filming" && !nonnegative(m.weekly)) return false;
  if (
    ["scheduled", "theaters", "catalog"].includes(m.stage) &&
    (!nonnegative(m.share) || m.share > 1 || !nonnegative(m.advance))
  )
    return false;
  if (["theaters", "catalog"].includes(m.stage) && !nonnegative(m.opening))
    return false;
  if (
    m.expectations &&
    (!nonnegative(m.expectations.low) ||
      !nonnegative(m.expectations.high) ||
      m.expectations.low > m.expectations.high)
  )
    return false;
  return true;
}
export function migrateSave(s) {
  if (
    !s ||
    ![1, 2, 3, 4, VERSION].includes(s.version) ||
    !Array.isArray(s.movies) ||
    !Array.isArray(s.people) ||
    !s.departments ||
    !Number.isFinite(s.cash) ||
    !Number.isInteger(s.week) ||
    s.week < 0 ||
    s.week > END
  )
    throw Error("Invalid save");
  if (
    ["debt", "market", "rivals", "log", "notices", "awards"].some(
      (key) => !Array.isArray(s[key]),
    ) ||
    (s.seasons != null && !Array.isArray(s.seasons)) ||
    !s.facilities ||
    typeof s.name !== "string" ||
    !Number.isFinite(s.prestige) ||
    !Number.isFinite(s.invested) ||
    ["Development", "Casting", "Production", "Marketing", "Research"].some(
      (key) =>
        !Number.isInteger(s.departments[key]) ||
        s.departments[key] < 1 ||
        s.departments[key] > 4,
    ) ||
    ["Soundstage", "Editing suite", "Effects workshop"].some(
      (key) =>
        !Number.isInteger(s.facilities[key]) ||
        s.facilities[key] < 0 ||
        s.facilities[key] > 4,
    ) ||
    s.debt.some(
      (l) =>
        !l ||
        !Number.isFinite(l.balance) ||
        !Number.isFinite(l.principal) ||
        l.balance < 0 ||
        l.principal < 0 ||
        (l.apr !== undefined && (!Number.isFinite(l.apr) || l.apr < 0 || l.apr > 1)) ||
        (l.shark && (!Number.isInteger(l.due) || l.due < 0)),
    ) ||
    s.people.some(
      (p) =>
        !p ||
        typeof p.id !== "string" ||
        typeof p.name !== "string" ||
        !Array.isArray(p.history) ||
        !Array.isArray(p.bookings),
    ) ||
    s.movies.some(
      (m) =>
        !m ||
        typeof m.title !== "string" ||
        !validMovieFinances(m) ||
        !SCALES.includes(m.scale) ||
        !GENRES[m.genre] ||
        ["roles", "contracts", "campaigns", "boxWeeks", "awards"].some(
          (key) => !Array.isArray(m[key]),
        ) ||
        m.contracts.some((c) => !c || !s.people.some((p) => p.id === c.id)) ||
        (m.director && !s.people.some((p) => p.id === m.director.id)),
    ) ||
    s.awards.some((a) => !a || !Array.isArray(a.results))
  )
    throw Error("Invalid save");
  for (const p of s.people) enrichTalent(p);
  s.seasons ??= [];
  s.epilogue ??= false;
  s.prestigeLevel ??= prestigeLevel(s.prestige);
  for (const m of s.movies) {
    if (s.version === 1 && ["filming", "ready"].includes(m.stage))
      m.release = null;
  }
  for (const a of s.awards) {
    a.completed ??= true;
    a.revealed ??= a.results.length;
  }
  if (s.version === 1) {
    s.notices = s.notices.filter((n) => n.kind !== "awards");
  }
  s.version = VERSION;
  return s;
}
export const CAMPAIGNS = [
  {
    name: "Social campaign",
    cost: 65,
    reach: 11,
    desc: "A targeted two-week conversation.",
  },
  {
    name: "Theatrical trailer",
    cost: 180,
    reach: 20,
    desc: "Put your movie on the big screen.",
  },
  {
    name: "Premiere & press",
    cost: 290,
    reach: 24,
    desc: "A red carpet and a press circuit.",
  },
  {
    name: "National TV campaign",
    cost: 650,
    reach: 38,
    desc: "Broad awareness. A substantial bet.",
  },
];
const FIRST = [
  "Maya",
  "Theo",
  "June",
  "Elias",
  "Nina",
  "Oscar",
  "Zoe",
  "Rafael",
  "Iris",
  "Miles",
  "Ada",
  "Felix",
  "Sasha",
  "Leon",
  "Cleo",
  "Jude",
  "Vera",
  "Kai",
  "Arlo",
  "Lena",
  "Remy",
  "Noor",
  "Dara",
  "Emil",
  "Tessa",
  "Finn",
  "Alma",
  "Hugo",
  "Wren",
  "Luca",
];
const LAST = [
  "Park",
  "Reyes",
  "Bennett",
  "Vale",
  "Chen",
  "Cole",
  "Laurent",
  "Moss",
  "Okafor",
  "Hart",
  "Sato",
  "Stone",
  "Moreau",
  "Brooks",
  "Rivera",
  "Shaw",
  "Das",
  "Lane",
  "Cruz",
  "Blake",
  "Ali",
  "Reed",
  "Kim",
  "Silva",
  "West",
  "Price",
];
const TITLES = [
  "The Last Light",
  "Dead Air",
  "Second Chances",
  "Glass Harbor",
  "Midnight Passenger",
  "Small Hours",
  "After the Rain",
  "The Long Way Home",
  "Neon Sunday",
  "Borrowed Time",
  "The Quiet Room",
  "Paper Kingdom",
  "Summer Static",
  "Signal Lost",
  "All Our Yesterdays",
  "North of Nowhere",
  "The Other Side",
  "Exit Velocity",
  "The Open Door",
  "A Perfect Alibi",
  "Wildfire Season",
  "The Night Shift",
  "Silver Lake",
  "The Good Years",
  "Red Horizon",
  "Ghost Frequency",
  "Cold Open",
  "The Blue Hour",
  "Last Call",
  "Familiar Strangers",
];
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
export function random(s) {
  s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
const roll = (s, a, b) => Math.floor(a + random(s) * (b - a + 1));
const pick = (s, a) => a[roll(s, 0, a.length - 1)];
export const roundAmount = (v) => {
  const n = Math.abs(v),
    step =
      n >= 10000 ? 1000 : n >= 1000 ? 100 : n >= 100 ? 10 : n >= 10 ? 5 : 1;
  return Math.round(v / step) * step;
};
export const score = (v) => Math.round(v / 5) * 5;
export const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.abs(v) > 0 && Math.abs(v) < 0.001 ? 2 : 0,
  }).format(Math.abs(v) < 1 ? v * 1000 : roundAmount(v) * 1000);
// Account balances and committed payments use whole dollars, without coarse display rounding.
export const accountMoney = v => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:Math.abs(v)>0&&Math.abs(v)<.001?2:0}).format(v*1000);
export const dollarInput = (v, decimals = 0) =>
  (v * 1000).toLocaleString("en-US", { maximumFractionDigits: decimals });
export const fromDollars = (value) => {
  const text = String(value).trim().replace(/^\$/, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return NaN;
  return Number(text.replaceAll(",", "")) / 1000;
};
export function talentHonors(s, p) {
  const nominations = [];
  for (const season of s.seasons ?? [])
    for (const category of season.categories)
      for (const n of category.nominees) {
        if (n.person !== p.id) continue;
        const award = s.awards.find((a) => a.year === season.year);
        const won = !!award?.results.some(
          (r, i) =>
            (award.completed || i < award.revealed) &&
            r.person === p.id &&
            r.id === n.id &&
            r.category === category.category &&
            r.ours,
        );
        nominations.push({
          year: season.year,
          category: category.category,
          title: n.title,
          won,
        });
      }
  return { nominations, wins: p.awards ?? 0 };
}
export function productionCraft(m, b = m.budget) {
  const needs = productionNeeds(m, b);
  const adequacy = needs.reduce(
    (v, n) => v + Math.min(1.45, Math.max(0, n.ratio)) * n.weight,
    0,
  );
  const gap = needs.reduce(
    (v, n) => v + Math.max(0, 0.8 - n.ratio) * n.weight,
    0,
  );
  return clamp(65 * adequacy - 30 * gap, 5, 96);
}
export function saveForecast(s, m) {
  if (m.marketingConfirmed) m.marketingBudget = m.campaignSpend;
  const [low, high] = projection(s, m).map(roundAmount);
  const talent = [...m.contracts,...(m.director ? [m.director] : [])].map(c=>c.expectation).filter(Boolean);
  const expectedTalent=talent.length ? talent.reduce((v,f)=>v+(f.low+f.high)/2,0)/talent.length : 60;
  const [scriptLow,scriptHigh]=range(m.scriptQuality ?? 60,s.departments.Development).split("–").map(Number);
  const center=(scriptLow+scriptHigh)/2*.45+expectedTalent*.55;
  const band=value=>{const width=Math.max(10,25-s.departments.Research*5);const lo=Math.max(0,Math.min(100-width,Math.round((value-width/2)/5)*5));return {low:lo,high:lo+width};};
  m.responseExpectations={audience:band(m.screen ?? center),critics:band(center),week:s.week};
  m.expectations = {
    low,
    high,
    week: s.week,
    research: s.departments.Research,
  };
}
export function resurgenceReason(genre, month) {
  if (genre === "Horror" && month === 9) return "Halloween interest";
  if (["Action", "Sci-fi"].includes(genre) && [6, 7].includes(month))
    return "Summer audiences";
  if (["Comedy", "Action", "Sci-fi"].includes(genre) && month === 11)
    return "Holiday audiences";
  if (genre === "Drama" && [0, 1].includes(month))
    return "Awards-season interest";
  return null;
}
export function date(week) {
  const year = 2026 + Math.floor(week / 52);
  const month = Math.min(11, Math.floor(((week % 52) * 12) / 52));
  return {
    year,
    month,
    label: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]} ${year}`,
    week: (week % 52) + 1,
  };
}
export const range = (value, level = 1, history = 0) => {
  const width = Math.max(4, 21 - level * 3 - history);
  return `${Math.max(0, Math.floor((value - width) / 5) * 5)}–${Math.min(100, Math.ceil((value + width) / 5) * 5)}`;
};
export const person = (s, id) => s.people.find((p) => p.id === id);
export const movie = (s, id) => s.movies.find((p) => p.id === id);
function log(s, text, type = "news") {
  s.log.unshift({ week: s.week, text, type });
  s.log = s.log.slice(0, 80);
}
function debit(s, amount, film) {
  s.cash -= amount;
  if (film) film.spent += amount;
}
function talent(s, kind) {
  const index = s.people.length;
  let name;
  do {
    name = `${pick(s, FIRST)} ${pick(s, LAST)}`;
  } while (s.people.some((p) => p.name === name));
  const star =
    index % 7 === 0
      ? roll(s, 65, 87)
      : index % 3 === 0
        ? roll(s, 25, 50)
        : roll(s, 2, 20);
  return enrichTalent({
    id: `p${s.next++}`,
    name,
    kind,
    age: roll(s, 21, 58),
    talent: roll(s, 45, 94),
    star,
    fee: Math.round(35 + star * star * 0.35),
    look: roll(s, 0, 9999),
    history: [],
    awards: 0,
    bookings: [],
    retired: false,
  });
}
function freshStory(s, subgenre) {
  const used = new Set([...s.market, ...s.movies].map((m) => m.premise));
  const start = roll(s, 0, 7);
  for (let i = 0; i < 8; i++) {
    const story = storyFor(subgenre, (start + i) % 8);
    if (!used.has(story.premise)) return story;
  }
  const story = storyFor(subgenre, start);
  story.premise += ` At the center is ${pick(s, FIRST)} ${pick(s, LAST)}, facing a decision that will define their life.`;
  return story;
}
export function advanceToEvent(s) {
  const start = s.week,
    cash = s.cash;
  const blocked = () =>
    s.ended ||
    s.epilogue ||
    s.cash < 0 ||
    s.notices.length ||
    s.movies.some((m) => m.event || m.stage === "ready");
  if (blocked()) return { weeks: 0, cashChange: 0 };
  while (s.week < END) {
    const stages = s.movies.map((m) => `${m.id}:${m.stage}`).join("|");
    const season = s.movies.reduce(
      (n, m) => n + (m.resurgences?.length ?? 0),
      0,
    );
    const market = s.market.map((m) => m.id).join("|");
    nextWeek(s);
    notifyPrestige(s);
    if (
      blocked() ||
      stages !== s.movies.map((m) => `${m.id}:${m.stage}`).join("|") ||
      market !== s.market.map((m) => m.id).join("|") ||
      season !== s.movies.reduce((n, m) => n + (m.resurgences?.length ?? 0), 0)
    )
      break;
  }
  return { weeks: s.week - start, cashChange: s.cash - cash };
}
function script(s) {
  const genre = pick(s, Object.keys(GENRES)),
    scale = pick(s, ["Small", "Small", "Small", "Mid-budget", "Blockbuster"]);
  let title = pick(s, TITLES);
  if (
    s.market.some((m) => m.title === title) ||
    s.movies.some((m) => m.title === title)
  )
    title = `${title}: ${pick(s, ["Echoes", "Reckoning", "Daybreak", "Homecoming"])}`;
  const subgenre = pick(s, GENRES[genre]);
  const story = freshStory(s, subgenre);
  return {
    id: `s${s.next++}`,
    title,
    genre,
    subgenre,
    scale,
    quality: roll(s, 45, 92),
    difficulty: roll(s, 35, 95),
    price: roll(s, 45, 160) * (SCALES.indexOf(scale) + 1),
    ...story,
    roles:
      scale === "Blockbuster"
        ? ["Lead", "Co-lead", "Supporting"]
        : ["Lead", "Supporting"],
    art: roll(s, 0, 9999),
  };
}
export function newGame(seed = Date.now() >>> 0, name = "Silverline Pictures") {
  const s = {
    version: VERSION,
    rng: seed >>> 0,
    next: 1,
    name: name.slice(0, 40),
    week: 0,
    cash: 6000,
    prestige: 0,
    debt: [],
    movies: [],
    people: [],
    market: [],
    rivals: [],
    departments: {
      Development: 1,
      Casting: 1,
      Production: 1,
      Marketing: 1,
      Research: 1,
    },
    facilities: { Soundstage: 0, "Editing suite": 0, "Effects workshop": 0 },
    log: [],
    awards: [],
    seasons: [],
    epilogue: false,
    prestigeLevel: 0,
    notices: [],
    ended: false,
    started: false,
    invested: 0,
  };
  for (let i = 0; i < 24; i++) s.people.push(talent(s, "actor"));
  for (let i = 0; i < 8; i++) s.people.push(talent(s, "director"));
  for (let i = 0; i < 8; i++) s.market.push(script(s));
  for (let w = 2; w < END; w += 3) {
    let mo = date(w).month;
    s.rivals.push({
      week: w,
      title: pick(s, TITLES),
      genre: pick(s, Object.keys(GENRES)),
      strength: roll(s, 45, 90),
    });
    if (mo === 7 || mo === 11)
      s.rivals.push({
        week: w,
        title: pick(s, TITLES),
        genre: pick(s, ["Action", "Sci-fi", "Thriller"]),
        strength: roll(s, 70, 95),
      });
  }
  addPosterFilms(s);
  ensureOpportunities(s);
  addHeadshotActors(s);
  for (const r of s.rivals) r.studioId=rivalStudio(r).id;
  log(s, "The keys are yours. Five years to build a studio worth remembering.");
  return s;
}
export const debtTotal = (s) => s.debt.reduce((a, l) => a + l.balance, 0);
export const creditLimit = (s) => 8000 + s.prestige * 60;
export const BANKS = [
  { id: "first", name: "First Picture Bank", apr: .08, weight: .25 },
  { id: "meridian", name: "Meridian Commercial Bank", apr: .12, weight: .375 },
  { id: "premiere", name: "Premiere Capital Bank", apr: .18, weight: .375 },
];
export function bankAvailable(s, bankId) {
  const bank = BANKS.find(b => b.id === bankId);
  if (!bank) return 0;
  const legacy = s.debt.filter(l => !l.bankId && !l.shark).reduce((v,l) => v+l.balance,0);
  return Math.max(0, creditLimit(s)*bank.weight - legacy*bank.weight - s.debt.filter(l => l.bankId === bankId).reduce((v,l) => v+l.balance,0));
}
export const creditAvailable = s => BANKS.reduce((v,b) => v+bankAvailable(s,b.id),0);
export const sharkAvailable = s => BANKS.every(b => bankAvailable(s,b.id) < 1) && !s.sharkUsed && s.week <= END-13;
export const loanPayment = s => s.debt.reduce((v,l) => v + (l.shark ? 0 : Math.min(l.principal,l.balance)+l.balance*(l.apr ?? .12)/52),0);
export function castingGuidance(m, role) {
  if (m.castingDirections?.[role]) return m.castingDirections[role];
  const n = (m.art ?? 0) + Number(role)*7;
  const youth = /coming.of.age|teen/i.test(m.subgenre ?? "");
  const low = youth ? 18 : [25,35,45][n%3];
  return { gender: ["Any gender", "Woman", "Man", "Any gender"][n%4], low, high: low+(youth ? 10 : 15) };
}
export function seasonOpportunity(m, month) {
  if (month === 9 && m.genre === "Horror") return { label: "Halloween · Horror", multiplier: 1.3 };
  if (month === 1 && /roman/i.test(m.subgenre ?? "")) return { label: "Valentine’s · Romance", multiplier: 1.2 };
  if ([5,6,7].includes(month) && ["Action","Sci-fi"].includes(m.genre)) return { label: "Summer · Action & sci-fi", multiplier: 1.3 };
  if ([10,11].includes(month) && /family|animat|holiday/i.test(m.subgenre ?? "")) return { label: "Holidays · Family films", multiplier: 1.25 };
  if ([7,11].includes(month)) return { label: "Peak moviegoing", multiplier: m.scale === "Blockbuster" ? 1.45 : 1.17 };
  return { label: "Normal demand", multiplier: 1 };
}
export const overhead = (s) =>
  5 +
  Object.values(s.departments).reduce((a, v) => a + (v - 1) * 2, 0) +
  Object.values(s.facilities).reduce((a, v) => a + v * 3, 0);
export const remaining = (m) =>
  m.stage === "filming" ? m.weekly * Math.max(0, m.duration - m.progress) : 0;
export const burn = (s) =>
  overhead(s) +
  loanPayment(s) +
  s.movies
    .filter((m) => m.stage === "filming")
    .reduce((a, m) => a + m.weekly, 0);
export function available(p, start, end) {
  return !p.retired && !p.bookings.some((b) => start < b.end && end > b.start);
}
export function projectInterest(p, m) {
  if (p.star < 60 || freshFace(p)) return null;
  if ((p.genres[m.genre] ?? 50) < 45)
    return "Declines: this genre is outside their strengths.";
  if (p.look % 3 === 0 && m.difficulty < 50)
    return "Declines: they want a more challenging project.";
  return null;
}
export function fameChange(p, performance, openingGross, scale) {
  const market =
    scale === "Small" ? 1800 : scale === "Mid-budget" ? 5000 : 14500;
  const exposure = clamp(openingGross / market, 0.3, 2);
  const delivery = (performance - 60) / 7;
  const delta = Math.round(delivery * (0.6 + exposure * 0.4));
  return clamp(delta, -8, 10);
}
export function participationDemand(p, m) {
  if (freshFace(p) || p.star < 60) return 0;
  if (m.scale === "Small" && m.difficulty >= 75) return 0;
  return m.scale === "Blockbuster"
    ? 0.05
    : m.scale === "Mid-budget"
      ? 0.03
      : 0.02;
}
export const participationRate = (m) =>
  [...m.contracts, ...(m.director ? [m.director] : [])].reduce(
    (sum, c) => sum + (c.grossShare ?? 0),
    0,
  );
export function castDraw(s, m) {
  const cast = m.contracts.map((c) => ({
    p: person(s, c.id),
    weight: c.role === 0 ? 1 : 0.5,
  }));
  if (m.director) cast.push({ p: person(s, m.director.id), weight: 1 });
  return cast.length
    ? cast.reduce((sum, c) => sum + c.p.star * c.weight, 0) /
        cast.reduce((sum, c) => sum + c.weight, 0)
    : 20;
}
export function boxOfficeStatus(m) {
  const base =
    m.scale === "Small" ? 1800 : m.scale === "Mid-budget" ? 5000 : 14500;
  const final = m.stage === "catalog";
  const ratio = (final ? m.gross / 3 : (m.opening ?? 0)) / base;
  const label =
    ratio >= 3
      ? "Monster hit"
      : ratio >= 2
        ? "Blockbuster"
        : ratio >= 1
          ? "Hit"
          : ratio >= 0.5
            ? "Modest turnout"
            : "Flop";
  return {
    label: final
      ? label
      : ratio >= 3
        ? "Monster opening"
        : ratio >= 2
          ? "Huge opening"
          : ratio >= 1
            ? "Strong opening"
            : ratio >= 0.5
              ? "Modest opening"
              : "Weak opening",
    final,
  };
}
export function quote(s, p, m, role = 0) {
  const option =
    m.parent &&
    movie(s, m.parent)?.contracts.find((c) => c.id === p.id && c.option);
  if (option)
    return {
      low: option.fee,
      high: option.fee,
      option: true,
      grossShare: option.grossShare ?? 0,
    };
  const personal=(s.talentOffers??[]).find(o=>o.person===p.id&&!o.usedBy&&s.week<o.end);
  const passion = passionProject(p,m);
  const discount = personal ? .5 : passion ? 0.6 :
    p.kind === "actor" && m.difficulty >= 75 && p.talent >= 65 ? 0.76 : 1;
  const base = p.fee * discount * (1 - s.prestige / 500);
  return {
    passion,
    personal: personal?.film??null,
    normalLow: roundAmount(p.fee * (1-s.prestige/500) * .85),
    normalHigh: roundAmount(p.fee * (1-s.prestige/500) * 1.12),
    low: roundAmount(base * 0.85),
    high: roundAmount(base * 1.12),
    option: false,
    grossShare: participationDemand(p, m),
    refusal: projectInterest(p, m),
  };
}
export function returningTeam(s, original) {
  const sequel = { ...original, parent: original.id };
  return [
    ...original.contracts,
    ...(original.director ? [original.director] : []),
  ].map((c) => {
    const p = person(s, c.id),
      q = quote(s, p, sequel, c.role);
    return {
      id: p.id,
      role: c.role,
      kind: p.kind,
      fee: q.option ? q.low : Math.ceil((q.low + q.high) / 2 / 10) * 10,
      grossShare: q.grossShare,
      option: q.option,
      available:
        available(p, s.week + 3, s.week + 3 + recommendedWeeks(original)) &&
        !q.refusal,
    };
  });
}
export function competition(s, m, week = m.release ?? s.week + 1) {
  return s.rivals
    .filter((r) => Math.abs(r.week - week) <= 2)
    .reduce(
      (a, r) => a + (r.genre === m.genre ? 0.17 : 0.055) * (r.strength / 75),
      0,
    );
}
export const CRITICS = [
  { name: "Anita Rewrite", taste: "Writing & demanding performances" },
  { name: "Rick O’Shea", taste: "Spectacle, craft & crowd appeal" },
  { name: "Paige Turner", taste: "Characters, performances & emotional payoff" },
];
export function criticReviews(m) {
  if (m.reviews) return m.reviews;
  const base = m.criticBaseline ?? m.critics ?? 60;
  const acting = m.performances?.length ? m.performances.reduce((v,x)=>v+x,0)/m.performances.length : m.quality ?? 60;
  const script = m.scriptQuality ?? 60, craft = m.craft ?? 60, fans = m.fans ?? 60;
  const scores = [
    base + (script-base)*.3 + (acting-base)*.15 + ((m.difficulty ?? 60)-60)*.1,
    base + (craft-base)*.35 + (fans-base)*.2 + (["Action","Sci-fi","Horror"].includes(m.genre)?4:-2),
    base + (acting-base)*.3 + (script-base)*.15 + (fans-base)*.15 + (["Drama","Comedy"].includes(m.genre)?3:0),
  ];
  const quotes = [
    script < 55 ? "The cast brought their pencils. The screenplay still needed an eraser." : acting > 75 ? "The performances do the heavy lifting—and make it look effortless." : script > 75 ? "Someone actually finished the screenplay before turning on the cameras. A novel idea." : "A serviceable script. I have notes. Naturally.",
    craft < 50 ? "Big-screen ambitions, small-screen execution. I wanted more from the craft." : fans > 75 ? "The crowd came for a movie and got a very good night out." : craft > 75 ? "The craft earns its close-up. Somebody put that production budget on the screen." : "A respectable ride. My popcorn showed more dramatic range.",
    acting > 75 ? "The performances stayed with me after the credits. That is the part you cannot buy with a trailer." : script < 55 ? "I kept turning the page, hoping the story would catch up." : fans < 50 ? "There is a story here. Finding a reason to care proved harder." : "Enough character to keep me watching. Not quite enough to haunt the journey home.",
  ];
  return CRITICS.map((c,i)=>({...c,score:Math.round(clamp(scores[i],5,99)),quote:quotes[i]}));
}
export function streamingOffers(m) {
  const weekly = Math.max(2,m.gross*.0017) * (.7+(m.fans ?? 60)/200);
  return [
    { id: "exclusive", name: "BingeBox", label: "Exclusive streaming license", upfront: roundAmount(weekly*32), weekly: 0, term: 52 },
    { id: "royalty", name: "PictureHouse", label: "Smaller payment + weekly royalties", upfront: roundAmount(weekly*5), weekly: weekly*1.1, term: 52 },
  ];
}
export function catalogIncome(s,m) {
  if (m.streamingDeal === null) return 0;
  const deal=m.streamingDeal;
  if (deal && s.week <= deal.endWeek) {
    const age=Math.max(0,s.week-deal.signedWeek-1);
    return deal.weekly * (1+age/52)**-1.2;
  }
  return Math.max(2,m.gross*.0017)*(1+(s.week-m.catalogStart)/52)**-1.2;
}
// New films use the revised economy; existing projects retain their signed economics.
export function campaignCost(m,i) {
  return CAMPAIGNS[i].cost * (m.economyVersion >= 2 ? (m.scale === "Blockbuster" ? 4 : m.scale === "Mid-budget" ? 2 : 1) : 1);
}
export function deliveryFactor(m) {
  if(!m.economyVersion || m.economyVersion < 2) return 1;
  if(m.economyVersion>=3)return (.4+.6*Math.min(1,Math.max(0,productionCraft(m)+productionFit(m))/65)**1.2)*(.65+.35*Math.min(1,m.duration/recommendedWeeks(m)));
  const craft = productionCraft(m);
  const execution = .2 + .8 * Math.min(1,craft/65)**1.5;
  const schedule = .45 + .55 * Math.min(1,m.duration/recommendedWeeks(m));
  return execution * schedule;
}
export function campaignReach(s,m) {
  const raw=m.campaigns.reduce((v,i)=>v+CAMPAIGNS[i].reach,0)*(1+(s.departments.Marketing-1)*.09);
  return m.economyVersion >= 2 ? 95*(1-Math.exp(-raw/70)) : raw;
}
export function projection(s, m) {
  const market =
    m.scale === "Small" ? 1800 : m.scale === "Mid-budget" ? 5000 : 14500;
  const stars = castDraw(s, m);
  const reach =
    campaignReach(s,m);
  const season = seasonOpportunity(m, date(m.release ?? s.week).month).multiplier;
  const base =
    ((market * (0.36 + stars / 100 + reach / 95) * season) /
      (1 + competition(s, m))) *
    (0.55 + (m.screen ?? 60) / 145) * deliveryFactor(m) * (m.economyVersion>=3?trendMultiplier(s,m,m.release??s.week):1);
  const spread = Math.max(0.10, 0.30 - s.departments.Research * 0.05);
  return [
    base * (m.distributionReach ?? 1) * (1 - spread),
    base * (m.distributionReach ?? 1) * (1 + spread),
  ];
}
function addMovie(s, sc, parent = null, developing = false) {
  const m = {
    ...structuredClone(sc),
    id: `m${s.next++}`,
    economyVersion: 3,
    location: 0,
    effectsApproach: 0,
    parent,
    stage: developing ? "development" : "packaging",
    castingDirections: sc.roles.map((_,i) => castingGuidance(sc,i)),
    ready: s.week + 3,
    contracts: [],
    director: null,
    auditions: {},
    spent: sc.price,
    recoupRemaining: 0,
    recouped: 0,
    distributionReach: 1,
    releaseSupport: 0,
    participationPaid: 0,
    receipts: 0,
    gross: 0,
    catalog: 0,
    streamingDeal: null,
    reviews: null,
    criticBaseline: null,
    campaigns: [],
    campaignSpend: 0,
    marketingConfirmed: false,
    marketingBudget: null,
    marketingSpendAtRelease: null,
    awardSpend: 0,
    screen: null,
    budget: { sets: 200, crew: 250, effects: 100 },
    duration: 8,
    progress: 0,
    release: null,
    quality: null,
    penalty: 0,
    criticBias: 0,
    audienceBias: 0,
    productionDecisions: [],
    event: null,
    eventCount: 0,
    boxWeeks: [],
    resurgences: [],
    expectations: null,
    responseExpectations: null,
    directorPerformance: null,
    awards: [],
    cancelled: false,
  };
  m.scriptQuality = sc.scriptQuality ?? sc.quality;
  debit(s, sc.price);
  s.movies.push(m);
  s.started = true;
  log(
    s,
    `${m.title} ${developing ? "enters development" : "joins your slate"}.`,
  );
  return m;
}
function required(s, id) {
  const m = movie(s, id);
  if (!m) throw Error("Movie not found.");
  return m;
}
function live(s) {
  if (s.ended)
    throw Error("This studio run has ended. Start a new studio to play again.");
}
function stage(m, allowed) {
  if (!allowed.includes(m.stage))
    throw Error("That decision is no longer available.");
}
function amt(value, min, max, dollars = true) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max)
    throw Error(
      dollars
        ? `Choose an amount between $${dollarInput(min, 2)} and $${dollarInput(max, 2)}.`
        : `Choose a value between ${min} and ${max}.`,
    );
  return n;
}
export function act(s, type, a = {}) {
  if (!["awardReveal", "awardSummary", "ackNominations"].includes(type))
    live(s);
  if (
    s.epilogue &&
    !["awardReveal", "awardSummary", "ackNominations"].includes(type)
  )
    throw Error("Finish the final awards season to see your retrospective.");
  if (
    s.cash < 0 &&
    !["loan", "sharkLoan", "streamingDeal", "end", "awardReveal", "awardSummary", "ackNominations"].includes(
      type,
    )
  )
    throw Error("Review emergency financing before making another decision.");
  let m = a.id ? required(s, a.id) : null;
  switch (type) {
    case "buy": {
      const sc = s.market.find((x) => x.id === a.script);
      if (!sc) throw Error("This script has already sold.");
      m = addMovie(s, sc);
      s.market = s.market.filter((x) => x.id !== sc.id);
      break;
    }
    case "original": {
      if (
        !GENRES[a.genre] ||
        !GENRES[a.genre].includes(a.subgenre) ||
        !SCALES.includes(a.scale)
      )
        throw Error("Choose the genre, subgenre, and scale.");
      const title = String(a.title || "")
        .trim()
        .slice(0, 60);
      if (!title) throw Error("Give your movie a title.");
      const sc = script(s);
      Object.assign(sc, {
        title,
        genre: a.genre,
        subgenre: a.subgenre,
        scale: a.scale,
        price: 100 * (SCALES.indexOf(a.scale) + 1),
        quality: clamp(roll(s, 42, 85) + s.departments.Development * 2, 20, 96),
        roles:
          a.scale === "Blockbuster"
            ? ["Lead", "Co-lead", "Supporting"]
            : ["Lead", "Supporting"],
      });
      Object.assign(sc, freshStory(s, a.subgenre));
      m = addMovie(s, sc, null, true);
      break;
    }
    case "sequel": {
      stage(m, ["theaters", "catalog"]);
      const team = a.rehire ? returningTeam(s, m) : [];
      if (
        a.rehire &&
        (team.length !== m.roles.length + 1 || team.some((c) => !c.available))
      )
        throw Error(
          "The original team is unavailable for the recommended shoot after development. Choose your cast individually or try again later.",
        );
      const n = s.movies.filter((x) => x.parent === m.id).length + 2;
      const sc = {
        ...m,
        title: `${m.title} ${n}`.slice(0, 60),
        premise: `After ${m.title}, ${m.roleDescriptions?.[0] ?? "the returning lead"} faces a new consequence of the original story. ${storyFor(m.subgenre, n).premise.split(". ").at(-1)}`,
        careerChanges: [],
        price: 140,
        quality: clamp(roll(s, 40, 83) + s.departments.Development * 2),
        scriptQuality: null,
        art: roll(s, 0, 9999),
      };
      m = addMovie(s, sc, m.id, true);
      for (const member of team) {
        const p = person(s, member.id);
        const ability =
          p.kind === "director"
            ? directorAbility(p, m.genre)
            : clamp(
                roleAbility(p, m.genre) +
                  roll(s, -13, 13) -
                  (m.difficulty > p.talent
                    ? (m.difficulty - p.talent) * 0.2
                    : 0),
              );
        m.auditions[auditionKey(p, member.role)] = ability;
        const contract = {
          id: p.id,
          role: member.role,
          fee: member.fee,
          grossShare: member.grossShare,
          option: false,
          optionCost: 0,
          expectation: talentEstimate(s, p, ability),
        };
        if (p.kind === "director") m.director = contract;
        else m.contracts.push(contract);
      }
      break;
    }
    case "rename": {
      stage(m, ["development", "packaging"]);
      const title = String(a.title || "")
        .trim()
        .slice(0, 60);
      if (!title) throw Error("Enter a movie title.");
      m.title = title;
      break;
    }
    case "audition": {
      stage(m, ["packaging"]);
      const p = person(s, a.person);
      if (!p || p.retired) throw Error("Choose available talent.");
      const role = p.kind === "director" ? "director" : a.role;
      if (p.kind !== "director" && (!Number.isInteger(role) || role < 0 || role >= m.roles.length)) throw Error("Choose a role.");
      const key = auditionKey(p, role);
      if (m.auditions[key] !== undefined) break;
      const allowance = auditionAllowance(s, m, role);
      if (!allowance.remaining) throw Error(`All ${allowance.limit} auditions for this ${role === "director" ? "director position" : "role"} are used this week. Advance to next week for more.`);
      m.auditionWeeks ??= {};
      m.auditionWeeks[role] = {week:s.week, used:allowance.used + 1};
      m.auditions[key] = p.kind === "director" ? directorAbility(p, m.genre) : clamp(
        roleAbility(p, m.genre) + roll(s, -13, 13) - (m.difficulty > p.talent ? (m.difficulty - p.talent) * .2 : 0));
      break;
    }
    case "hire": {
      stage(m, ["packaging"]);
      const p = person(s, a.person);
      if (!p) throw Error("Choose talent.");
      if (p.retired) throw Error("This person has retired.");
      if (
        p.kind === "actor" &&
        (!Number.isInteger(a.role) || a.role < 0 || a.role >= m.roles.length)
      )
        throw Error("Choose a role.");
      if (m.contracts.some((c) => c.id === p.id))
        throw Error("This actor already has a role in this movie.");
      if (m.auditions[auditionKey(p, a.role)] === undefined)
        throw Error("Hold an audition first.");
      const q = quote(s, p, m, a.role);
      if (q.refusal) throw Error(q.refusal);
      const offer = amt(a.offer, 0, 100000);
      const threshold = q.option ? q.low : Math.round((q.low + q.high) / 2);
      if (offer < threshold)
        throw Error(
          `${p.name} is asking for ${money(threshold)}. Increase the offer or try someone else.`,
        );
      if(q.personal){const personal=s.talentOffers.find(o=>o.person===p.id&&!o.usedBy&&s.week<o.end);personal.usedBy=m.id;}
      const c = {
        id: p.id,
        role: a.role ?? null,
        fee: offer,
        grossShare: q.grossShare,
        option: !!a.option,
        optionCost: a.option ? offer * 0.2 : 0,
        expectation: talentEstimate(
          s,
          p,
          p.kind === "director"
            ? directorAbility(p, m.genre)
            : m.auditions[`${a.role}:${p.id}`],
        ),
      };
      if (p.kind === "director") m.director = c;
      else {
        m.contracts = m.contracts.filter((x) => x.role !== a.role);
        m.contracts.push(c);
      }
      break;
    }
    case "greenlight": {
      stage(m, ["packaging"]);
      if (m.contracts.length !== m.roles.length || !m.director)
        throw Error("Cast every role and hire a director first.");
      const duration = amt(a.duration, 4, 20, false);
      if (!Number.isInteger(duration)) throw Error("Choose whole weeks.");
      if (s.week + duration + 3 >= END)
        throw Error(
          "There is not enough time left to finish and release this film.",
        );
      const people = [...m.contracts, m.director].map((c) => person(s, c.id));
      if (people.some((p) => !available(p, s.week, s.week + duration)))
        throw Error(
          "Someone in your cast or directing team is booked. Choose available talent or wait until their shoot ends.",
        );
      const location=a.location??m.location??0,effectsApproach=a.effectsApproach??m.effectsApproach??0;
      if(!Number.isInteger(location)||!LOCATION_PLANS[location]||!Number.isInteger(effectsApproach)||!EFFECTS_PLANS[effectsApproach])throw Error("Choose a valid location and effects approach.");
      const b = {
        sets: amt(a.sets, 25, 15000),
        crew: amt(a.crew, 25, 15000),
        effects: amt(a.effects, 0, 20000),
      };
      m.location=location;m.effectsApproach=effectsApproach;
      m.budget = b;
      m.duration = duration;
      m.progress = 0;
      m.start = s.week;
      m.release = null;
      m.stage = "filming";
      const costs = productionCosts(s, m, b, duration);
      m.productionTotal = costs.total;
      m.weekly = costs.weekly;
      m.facilitySaving = costs.saving;
      const fees = [...m.contracts, m.director].reduce(
        (v, c) => v + c.fee + c.optionCost,
        0,
      );
      debit(s, fees, m);
      for (const p of people)
        p.bookings.push({ start: s.week, end: s.week + duration, movie: m.id });
      log(
        s,
        `Cameras roll on ${m.title}. Choose the release date after filming wraps.`,
      );
      break;
    }
    case "event": {
      if (!m.event) throw Error("There is no production decision pending.");
      if (!["pay", "cut", "split"].includes(a.choice))
        throw Error("Choose a response.");
      if(m.event.kind === "social"){
        if(a.choice==="pay")debit(s,50,m);
        const change=a.choice==="pay"?roll(s,-2,2):a.choice==="split"?roll(s,-5,5):roll(s,-9,1);
        m.audienceBias=(m.audienceBias??0)+change;
        m.productionDecisions??=[];m.productionDecisions.push({week:s.week,kind:"social",choice:a.choice,change});
        log(s,`${m.title}: ${a.choice==="pay"?"a public response and publicity support":a.choice==="split"?"the actor's own response":"no studio response"}. Audience reaction ${change>0?"improved":change<0?"weakened":"was unchanged"}.`);
        m.event=null;break;
      }
      if (m.event.kind === "creative" || m.event.kind === "performance") {
        const event = m.event;
        m.productionDecisions ??= [];
        if (event.kind === "creative") {
          m.audienceBias =
            (m.audienceBias ?? 0) +
            (a.choice === "pay" ? 6 : a.choice === "split" ? -3 : 0);
          m.criticBias =
            (m.criticBias ?? 0) +
            (a.choice === "split" ? 6 : a.choice === "pay" ? -3 : 0);
        } else {
          for (const c of m.contracts) {
            const boost =
              a.choice === "cut"
                ? 2
                : a.choice === "pay"
                  ? c.role === m.roles.length - 1
                    ? 5
                    : 0
                  : c.role === 0
                    ? 4
                    : 0;
            const key = `${c.role}:${c.id}`;
            m.auditions[key] = clamp(m.auditions[key] + boost);
          }
        }
        m.productionDecisions.push({
          week: s.week,
          kind: event.kind,
          choice: a.choice,
        });
        log(
          s,
          `${m.title}: ${event.kind === "creative" ? (a.choice === "pay" ? "a crowd-pleasing edit" : a.choice === "split" ? "the director’s challenging edit" : "the balanced edit") : a.choice === "pay" ? "extra attention for the supporting role" : a.choice === "split" ? "extra attention for the lead" : "rehearsal shared across the ensemble"} selected.`,
          "action",
        );
        m.event = null;
        break;
      }
      const cost =
        m.event.cost *
        (a.choice === "pay" ? 1 : a.choice === "split" ? 0.5 : 0);
      debit(s, cost, m);
      m.penalty +=
        a.choice === "cut"
          ? m.event.damage
          : a.choice === "split"
            ? m.event.damage * 0.4
            : 0;
      log(
        s,
        `${m.title}: ${a.choice === "pay" ? "funded the fix" : a.choice === "split" ? "approved a partial fix" : "trimmed the work"} (${money(cost)}).`,
      );
      m.event = null;
      break;
    }
    case "screen": {
      stage(m, ["ready"]);
      if (m.screen !== null)
        throw Error("A test screening has already been held.");
      debit(s, 45, m);
      m.screen = clamp(
        Math.round(
          m.quality + roll(s, -25, 25) * (1 - s.departments.Research * 0.08),
        ),
      );
      break;
    }
    case "campaign": {
      stage(m, ["ready", "scheduled", "theaters"]);
      const c = CAMPAIGNS[a.campaign];
      if (!c || m.campaigns.includes(Number(a.campaign)))
        throw Error("That campaign is already running.");
      debit(s, campaignCost(m,Number(a.campaign)), m);
      m.campaignSpend += campaignCost(m,Number(a.campaign));
      m.campaigns.push(Number(a.campaign));
      if (m.stage !== "theaters") saveForecast(s, m);
      break;
    }
    case "setRelease": {
      stage(m, ["ready"]);
      if (m.release !== null)
        throw Error("The release date is already locked.");
      const release = amt(a.release, s.week + 1, END - 1, false);
      if (!Number.isInteger(release))
        throw Error("Choose a whole release week.");
      m.release = release;
      log(
        s,
        `${m.title} opens ${date(release).label}, week ${date(release).week}.`,
      );
      break;
    }
    case "confirmMarketing": {
      stage(m, ["ready", "scheduled"]);
      if (a.none && m.campaignSpend > 0)
        throw Error("Marketing is already purchased. Confirm that budget.");
      const chosen = a.campaigns ?? [];
      if (!Array.isArray(chosen) || new Set(chosen).size !== chosen.length || chosen.some(i => !Number.isInteger(i) || !CAMPAIGNS[i] || m.campaigns.includes(i)))
        throw Error("Choose valid marketing options.");
      if (a.none && chosen.length) throw Error("Choose either no marketing or paid campaigns.");
      if (!a.none && !chosen.length && !m.campaignSpend) throw Error("Select a marketing option, including $0, before confirming.");
      for (const i of chosen) {
        debit(s, campaignCost(m,i), m);
        m.campaignSpend += campaignCost(m,i);
        m.campaigns.push(i);
      }
      m.marketingConfirmed = true;
      m.marketingBudget = m.campaignSpend;
      saveForecast(s, m);
      break;
    }
    case "distribute": {
      stage(m, ["ready"]);
      if (m.release === null) throw Error("Choose a release date first.");
      if (!["secure", "partner", "self"].includes(a.deal))
        throw Error("Choose a distribution deal.");
      if (!m.marketingConfirmed)
        throw Error(
          "Choose a marketing budget, including $0, before distribution.",
        );
      const deals = distribution(s, m),
        d = deals[a.deal];
      m.deal = a.deal;
      m.share = d.share;
      m.advance = d.advance;
      m.recoupRemaining = d.recoup;
      m.recouped = 0;
      m.distributionReach = d.reach;
      m.releaseSupport = d.support;
      m.receipts += d.advance;
      s.cash += d.advance;
      debit(s, d.cost, m);
      m.stage = "scheduled";
      saveForecast(s, m);
      log(
        s,
        `${m.title}: ${d.name} selected. Your share is ${Math.round(d.share * 100)}% of gross box office.`,
      );
      break;
    }
    case "cancel": {
      stage(m, ["development", "packaging", "filming", "ready"]);
      const exit = remaining(m) * 0.15;
      debit(s, exit, m);
      m.stage = "cancelled";
      m.cancelled = true;
      m.event = null;
      for (const p of s.people)
        p.bookings = p.bookings.filter((b) => b.movie !== m.id);
      log(s, `${m.title} is shelved. Total write-off: ${money(m.spent)}.`);
      break;
    }
    case "streamingDeal": {
      stage(m,["catalog"]);
      if (m.streamingDeal !== null) throw Error("This film already has a streaming arrangement.");
      const offer=streamingOffers(m).find(o=>o.id===a.deal);
      if (!offer) throw Error("Choose a streaming offer.");
      m.streamingDeal={...offer,signedWeek:s.week,endWeek:s.week+offer.term};
      s.cash+=offer.upfront; m.receipts+=offer.upfront; m.catalog+=offer.upfront;
      s.notices=s.notices.filter(n=>!(n.kind==="streaming" && n.id===m.id));
      log(s,`${m.title}: ${offer.name} pays ${money(offer.upfront)} for a 52-week streaming agreement.`);
      break;
    }
    case "loan": {
      const bank = BANKS.find(b => b.id === (a.bankId ?? "meridian"));
      if (!bank) throw Error("Choose a bank.");
      const amount = amt(a.amount, 1, bankAvailable(s,bank.id));
      s.cash += amount;
      s.debt.push({ bankId: bank.id, apr: bank.apr, balance: amount, principal: amount / 104 });
      log(s, `${bank.name}: ${money(amount)} at ${bank.apr*100}% APR over 104 weeks.`);
      break;
    }
    case "sharkLoan": {
      if (!sharkAvailable(s)) throw Error("The loan shark is available only once, after all bank credit is exhausted.");
      s.sharkUsed = true;
      s.cash += 2000;
      s.debt.push({ shark: true, balance: 2400, principal: 0, due: s.week+13 });
      log(s, "Loan shark accepted: $2,000,000 received. $2,400,000 due in 13 weeks or the studio closes.");
      break;
    }
    case "repay": {
      const available = Math.min(s.cash, debtTotal(s));
      const requested = amt(
        a.amount,
        0.00001,
        Math.ceil(available * 100000 - 1e-6) / 100000,
      );
      const amount =
        Math.abs(requested - available) <= 0.000005 + Number.EPSILON
          ? available
          : Math.min(requested, available);
      let left = amount;
      for (const l of [...s.debt].sort((a,b) => Number(!!b.shark)-Number(!!a.shark))) {
        const pay = Math.min(left, l.balance);
        l.balance -= pay;
        left -= pay;
      }
      s.cash -= amount;
      s.debt = s.debt.filter((l) => l.balance > DEBT_EPSILON);
      break;
    }
    case "upgrade": {
      const isDepartment = Object.hasOwn(s.departments, a.name),
        obj = isDepartment ? s.departments : s.facilities;
      if (!Object.hasOwn(obj, a.name)) throw Error("Unknown upgrade.");
      if (obj[a.name] >= 4) throw Error("Already fully upgraded.");
      const unlock=upgradeUnlock(s,a.name);
      if (s.prestige < unlock.prestige) throw Error(`Reach ${unlock.prestige} prestige to unlock ${unlock.title}.`);
      const cost = unlock.cost;
      if (s.cash < cost) throw Error(`You need ${money(cost)} available cash for ${unlock.title}.`);
      debit(s, cost);
      s.invested += cost;
      obj[a.name]++;
      log(s, `${unlock.title} is now part of your studio.`);
      break;
    }
    case "awardsCampaign": {
      stage(m, ["theaters", "catalog"]);
      if (m.awardSpend || !canCampaign(s, m))
        throw Error("This film is not eligible for a campaign this year.");
      m.awardSpend = 150;
      debit(s, 150, m);
      break;
    }
    case "ackNominations": {
      const season = s.seasons.find((x) => x.year === a.year);
      if (!season) throw Error("Nominations not announced.");
      season.acknowledged = true;
      s.notices = s.notices.filter(
        (n) => !(n.kind === "nominations" && n.year === a.year),
      );
      if (s.epilogue) ceremony(s, a.year);
      break;
    }
    case "awardReveal": {
      revealAward(s, a.year);
      break;
    }
    case "awardSummary": {
      const award = s.awards.find((x) => x.year === a.year);
      if (!award) throw Error("The ceremony has not started.");
      while (!award.completed) revealAward(s, a.year);
      break;
    }
    case "nextEvent":
      return advanceToEvent(s);
    case "next":
      nextWeek(s);
      break;
    case "end":
      s.ended = true;
      s.endReason = "Studio closed";
      break;
    default:
      throw Error("Unknown decision.");
  }
  notifyPrestige(s);
  return m;
}
export function upgradeCost(s, name) {
  return Object.hasOwn(s.departments, name)
    ? [0, 300, 900, 1800, 0][s.departments[name]]
    : [700, 2000, 3500, 5500, 0][s.facilities[name]];
}
export function distribution(s, m) {
  const market =
    m.scale === "Small" ? 1800 : m.scale === "Mid-budget" ? 5000 : 14500;
  const demand = clamp(0.7 + castDraw(s, m) / 100, 0.7, 1.7);
  const price = market * demand * (m.economyVersion >= 2 ? Math.sqrt(deliveryFactor(m)) : 1);
  return {
    secure: {
      name: "Harbor Distribution",
      advance: roundAmount(price * 0.2),
      share: 0.12,
      cost: 0,
      support: roundAmount(market * 0.12),
      recoup: 0,
      reach: 1.05,
      desc: "Guaranteed rights payment. Distributor funds the release; you keep a smaller ticket share.",
    },
    partner: {
      name: "Meridian Pictures",
      advance: roundAmount(price * 0.12),
      share: 0.4,
      cost: 80,
      support: roundAmount(market * 0.12),
      recoup: roundAmount(price * 0.12) + roundAmount(market * 0.12),
      reach: 1.15,
      desc: "Advance and release support are recovered from your ticket share before further payments.",
    },
    self: {
      name: "Independent release",
      advance: 0,
      share: 0.5,
      cost: [400, 1500, 4500][SCALES.indexOf(m.scale)],
      support: 0,
      recoup: 0,
      reach: Math.min(
        1.1,
        0.65 + (s.departments.Marketing - 1) * 0.1 + s.prestige / 500,
      ),
      desc: "You fund booking, publicity and delivery. Reach improves with your Marketing department and studio reputation.",
    },
  };
}
function finish(s, m) {
  const craft = productionCraft(m);
  const performances = m.contracts.map((c) =>
    clamp(m.auditions[`${c.role}:${c.id}`] + (()=>{const credits=person(s,c.id).majorCredits??0;const spread=m.economyVersion>=3?(credits>=4?8:credits?12:18):12;return roll(s,-spread,spread);})()),
  );
  m.performances = performances;
  m.directorPerformance = clamp(
    directorAbility(person(s, m.director.id), m.genre) + roll(s, -10, 10),
  );
  m.craft = craft;
  const scriptQuality = m.scriptQuality ?? 60;
  m.quality = clamp(
    scriptQuality * 0.25 +
      (performances.reduce((a, v) => a + v, 0) / performances.length) * 0.3 +
      m.directorPerformance * 0.2 +
      craft * 0.25 +
      productionFit(m) +
      scheduleInfo(m.duration, m).quality +
      (s.departments.Production - 1) * 2 -
      m.penalty,
    10,
    98,
  );
  m.critics = clamp(
    Math.round(
      m.quality +
        roll(s, -12, 12) +
        (m.difficulty - 60) * 0.09 +
        (m.criticBias ?? 0),
    ),
    5,
    99,
  );
  m.fans = clamp(
    Math.round(m.quality + roll(s, -17, 17) + (m.audienceBias ?? 0)),
    5,
    99,
  );
  m.criticBaseline = m.critics;
  m.reviews = criticReviews(m);
  m.critics = Math.round(m.reviews.reduce((v,r)=>v+r.score,0)/m.reviews.length);
  m.stage = "ready";
  log(
    s,
    `${m.title} has wrapped. A test screening and distribution decision are ready.`,
    "action",
  );
}
function opening(s, m) {
  const market =
    m.scale === "Small" ? 1800 : m.scale === "Mid-budget" ? 5000 : 14500;
  const stars = castDraw(s, m);
  const reach =
    campaignReach(s,m);
  const season = seasonOpportunity(m, date(s.week).month).multiplier;
  const rival = competition(s, m);
  const appeal = 0.36 + stars / 100 + reach / 95;
  const sequel = m.parent
    ? 1 + clamp(movie(s, m.parent).fans - 45, 0, 50) / 160
    : 1;
  const openingGross =
    ((market * appeal * season) / (1 + rival)) *
    (0.55 + m.fans / 145) *
    deliveryFactor(m) *
    (m.economyVersion>=3?trendMultiplier(s,m):1) *
    (0.7 + random(s) * 0.6) *
    sequel *
    (m.distributionReach ?? 1);
  m.marketingSpendAtRelease = m.campaignSpend;
  m.careerChanges = [];
  m.opening = openingGross;
  m.releaseFactors = { stars, reach, season, rival,trend:m.economyVersion>=3?trendMultiplier(s,m):1 };
  if(m.economyVersion>=3)admirationOffer(s,m);
  m.stage = "theaters";
  m.theaterStart = s.week;
  s.notices.push({ kind: "opening", id: m.id });
  for (const [i, c] of m.contracts.entries()) {
    const p = person(s, c.id),
      before = Math.round(p.star);
    const rise = fameChange(p, m.performances[i], openingGross, m.scale);
    p.star = clamp(Math.round(p.star) + rise);
    p.fee = Math.round(35 + p.star * p.star * 0.35);
    m.careerChanges.push({
      id: p.id,
      before,
      after: p.star,
      fee: p.fee,
      performance: m.performances[i],
    });
    const major = m.scale !== "Small" || openingGross >= 3000;
    if (major) p.majorCredits++;
    p.history.push({
      major,
      genre: m.genre,
      id: m.id,
      title: m.title,
      score: m.performances[i],
      year: date(s.week).year,
    });
    if (before < 25 && p.star >= 25)
      log(
        s,
        `${p.name} is breaking through after ${m.title}. Asking prices are rising.`,
      );
  }
  const d = person(s, m.director.id);
  const directorBefore = Math.round(d.star);
  if (m.scale !== "Small" || openingGross >= 3000) d.majorCredits++;
  d.history.push({
    id: m.id,
    title: m.title,
    score: m.directorPerformance ?? m.critics,
    year: date(s.week).year,
  });
  d.star = clamp(
    directorBefore +
      fameChange(d, m.directorPerformance ?? m.critics, openingGross, m.scale),
  );
  d.fee = Math.round(35 + d.star * d.star * 0.35);
  m.careerChanges.push({
    id: d.id,
    before: directorBefore,
    after: d.star,
    fee: d.fee,
    performance: m.directorPerformance ?? m.critics,
  });
  s.prestige = clamp(s.prestige + Math.max(0, m.critics - 60) / 9);
  log(
    s,
    `${m.title} opens to ${money(openingGross)}. Critics ${score(m.critics)} · Fans ${score(m.fans)}.`,
    "release",
  );
}
export const AWARD_CATEGORIES = [
  "Supporting Acting",
  "Lead Acting",
  "Director",
  "Picture",
];
export function canCampaign(s, m) {
  if (!["theaters", "catalog"].includes(m.stage)) return false;
  const year = date(m.release).year,
    current = date(s.week).year;
  return (
    year === current ||
    (year === current - 1 &&
      s.week % 52 < 10 &&
      !s.awards.some((a) => a.year === year))
  );
}
export function candidate(s, m, category) {
  const role = category === "Supporting Acting" ? m.roles.length - 1 : 0;
  const idx = m.contracts.findIndex((c) => c.role === role);
  const personId =
    category === "Director"
      ? m.director.id
      : category.includes("Acting")
        ? m.contracts[idx]?.id
        : null;
  const performance=m.performances?.[idx]??m.critics;
  const score = m.economyVersion>=3
    ? category.includes("Acting") ? performance
      : category==="Director" ? (m.directorPerformance??m.critics)*.6+(m.quality??m.critics)*.25+m.critics*.15
      : m.critics*.5+(m.quality??m.critics)*.3+(m.scriptQuality??m.critics)*.2
    : category.includes("Acting") ? performance*.8+m.difficulty*.2 : m.critics;
  return {
    id: m.id,
    title: m.title,
    person: personId,
    name: personId ? person(s, personId).name : null,
    score,
  };
}
export function nominations(s, year, epilogue = false) {
  if (
    s.seasons.some((a) => a.year === year) ||
    s.awards.some((a) => a.year === year)
  )
    return;
  const eligible = s.movies.filter(
    (m) =>
      ["theaters", "catalog"].includes(m.stage) &&
      date(m.release).year === year,
  );
  const categories = AWARD_CATEGORIES.map((category) => {
    const candidates = eligible.map((m) => ({
      ...candidate(s, m, category),
      nominationScore:
        candidate(s, m, category).score +
        (m.awardSpend ? 3 : 0) +
        roll(s, -8, 8),
    }));
    for (let i = 0; i < 4; i++) {
      const unused = TITLES.filter(
        (title) => !candidates.some((c) => c.title === title),
      );
      const title = unused.length
        ? pick(s, unused)
        : `A New Horizon ${year}-${i + 1}`;
      candidates.push({
        id: null,
        studioId: rivalStudio(s.rivals.find(r=>r.title===title && date(r.week).year===year) ?? {title}).id,
        title,
        person: null,
        name:
          category === "Picture" ? null : `${pick(s, FIRST)} ${pick(s, LAST)}`,
        score: roll(s, 66, 92),
        nominationScore: roll(s, 67, 94),
      });
    }
    return {
      category,
      nominees: candidates
        .sort((a, b) => b.nominationScore - a.nominationScore)
        .slice(0, 4),
    };
  });
  s.seasons.push({ year, categories, acknowledged: false, epilogue });
  s.notices.push({ kind: "nominations", year, epilogue });
  log(
    s,
    `${year} nominations are announced. Visit Awards to see your contenders.`,
    "award",
  );
}
export function ceremony(s, year) {
  if (s.awards.some((a) => a.year === year)) return;
  let season = s.seasons.find((a) => a.year === year);
  if (!season) {
    nominations(s, year);
    season = s.seasons.find((a) => a.year === year);
  }
  if (!season) return;
  const results = season.categories.map(({ category, nominees }) => {
    const ranked = nominees
      .map((n) => ({
        ...n,
        finalScore:
          n.score +
          (n.id && movie(s, n.id).awardSpend ? (movie(s,n.id).economyVersion>=3?1:5) : 0) +
          roll(s, -8, 8),
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
    const winner = ranked[0];
    return {
      category,
      nominees: nominees.map((n) => n.title),
      entries: nominees,
      winner: winner.title,
      studioId: winner.studioId ?? null,
      winnerName: winner.name,
      person: winner.person,
      id: winner.id,
      ours: !!winner.id,
    };
  });
  s.awards.push({ year, results, revealed: 0, completed: false });
  s.notices.push({ kind: "awards", year });
}
export function revealAward(s, year) {
  const award = s.awards.find((a) => a.year === year);
  if (!award) throw Error("The ceremony is not ready.");
  if (award.completed) return;
  const r = award.results[award.revealed];
  if (r.ours) {
    const m = movie(s, r.id);
    m.awards.push(`${year} ${r.category}`);
    s.prestige = clamp(s.prestige + 8);
    if (r.person) {
      const p = person(s, r.person);
      p.awards++;
      p.star = clamp(p.star + 12);
      p.majorCredits = Math.max(1, p.majorCredits);
      p.fee = Math.round(35 + p.star * p.star * 0.35);
    }
    log(
      s,
      `${m.title} wins ${r.category} at the ${year} Silver Screen Awards!`,
      "award",
    );
  }
  award.revealed++;
  award.completed = award.revealed === award.results.length;
  if (award.completed) {
    s.notices = s.notices.filter(
      (n) => !(n.kind === "awards" && n.year === year),
    );
    if (s.epilogue) {
      s.epilogue = false;
      s.ended = true;
      s.endReason = "Five years in pictures";
    }
  }
}
function nextWeek(s) {
  if (s.notices.some((n) => ["nominations", "awards"].includes(n.kind)))
    throw Error("Visit the awards-season announcement before advancing.");
  const pending = s.movies.find((m) => m.event);
  if (pending)
    throw Error(`Resolve the production decision on ${pending.title} first.`);
  const undated = s.movies.find(
    (m) => m.stage === "ready" && m.release == null,
  );
  if (undated && s.week < END - 1)
    throw Error(`Choose a release date for ${undated.title} before advancing.`);
  const due = s.movies.find(
    (m) => m.stage === "ready" && m.release !== null && m.release <= s.week + 1,
  );
  if (due)
    throw Error(
      `Choose distribution for ${due.title} before its locked release date.`,
    );
  s.week++;
  ensureOpportunities(s);
  if(s.week%52===0 && activeTrends(s).length<2){const available=TREND_TYPES.filter(t=>!activeTrends(s).some(x=>x.name===t.name));if(available.length){const t=pick(s,available);s.marketTrends.push({...t,start:s.week,end:s.week+104+roll(s,0,78),strength:.45});log(s,`Moviegoers are craving ${t.name.toLowerCase()}.`,"action");}}
  debit(s, overhead(s));
  for (const l of s.debt) {
    if (l.shark) continue;
    const principal = Math.min(l.principal, l.balance);
    debit(s, principal + (l.balance * (l.apr ?? .12)) / 52);
    l.balance -= principal;
  }
  s.debt = s.debt.filter((l) => l.balance > DEBT_EPSILON);
  for (const m of s.movies) {
    if (m.stage === "development" && s.week >= m.ready) m.stage = "packaging";
    if (m.stage === "filming") {
      debit(s, m.weekly, m);
      m.progress++;
      if (m.progress >= m.duration) finish(s, m);
      else if (
        m.progress > 1 &&
        m.progress < m.duration - 1 &&
        m.eventCount < SCALES.indexOf(m.scale) + 1 &&
        random(s) < Math.min(.8,scheduleInfo(m.duration).risk+(m.location===2?.1:m.location===3?.06:m.location===1?-.04:0))
      ) {
        m.eventCount++;
        const action = ["Action", "Sci-fi"].includes(m.genre);
        const incidents = action
          ? [
              [
                "The effects shot isn’t working",
                "The team needs another pass to make the centerpiece believable. Your schedule stays fixed.",
              ],
              [
                "The stunt needs another rehearsal",
                "The stunt coordinator can stage a simpler version safely, or bring in an additional unit to deliver the full sequence.",
              ],
              [
                "The centerpiece set is over budget",
                "The art department found a structural problem before the shoot. Rebuild the full set, reduce its scale, or find a middle ground.",
              ],
            ]
          : [
              [
                "The location falls through",
                "A key location is no longer available. Rebuild it, simplify the scene, or split the difference.",
              ],
              [
                "A pivotal performance needs more time",
                "Your director wants an additional rehearsal and a second camera unit. Fund the full request or work with the coverage already planned.",
              ],
              [
                "The sound recording needs repair",
                "Background noise has spoiled an important scene. Book a full studio session, repair selected lines, or work with the existing recording.",
              ],
            ];
        const incident = pick(s, incidents);
        m.event = {
          title: incident[0],
          text: incident[1],
          cost: Math.round(m.weekly * 0.8 + 35),
          damage: roll(s, 6, 12),
        };
        const kind = roll(s, 0, m.economyVersion>=3?3:2);
        if (kind === 1)
          m.event = {
            kind: "creative",
            title: "Two endings, two audiences",
            text: "The edit can favor a satisfying crowd-pleaser or a more challenging ending. The existing budget covers either version; neither guarantees good reviews.",
          };
        if (kind === 2)
          m.event = {
            kind: "performance",
            title: "Who gets the final rehearsal?",
            text: "There is time for one more rehearsal within the existing schedule. Choose which performance receives the attention.",
          };
        if(kind===3 && !(m.productionDecisions??[]).some(d=>d.kind==="social")){const actor=person(s,m.contracts[0].id);m.event={kind:"social",title:`${actor.name} sparks a backlash`,text:"An offensive social-media post is drawing attention. Decide how the studio responds.",cost:50};}
        log(s, `${m.title} needs a production decision.`, "action");
      }
    }
    if (m.stage === "scheduled" && s.week >= m.release) opening(s, m);
    if (m.stage === "theaters") {
      const age = s.week - m.theaterStart,
        hold = 0.35 + m.fans / 200;
      let gross =
        age === 0
          ? m.opening
          : m.opening * hold ** age * (1 + m.campaigns.length * 0.015);
      if(m.economyVersion>=3 && age>=1 && !m.fanLore && m.fans>=65 && random(s)<.12){m.fanLore={week:s.week,kind:["Horror","Thriller","Sci-fi"].includes(m.genre)?"lore":"buzz"};log(s,`${m.title}: fans are sharing ${m.fanLore.kind==="lore"?"theories and lore":"fan edits and favorite moments"}; new viewers are joining the conversation.`,"success");}
      if(m.fanLore&&age>0)gross*=1.2;
      m.resurgences ??= [];
      const d = date(s.week),
        monthKey = `${d.year}-${d.month}`,
        reason = resurgenceReason(m.genre, d.month);
      if (
        age >= 2 &&
        reason &&
        m.resurgences.length < 2 &&
        !m.resurgences.some((r) => r.month === monthKey) &&
        random(s) < 0.25
      ) {
        const baseline = gross;
        gross = Math.min(
          m.opening * 1.25,
          Math.max(gross * 1.65, m.boxWeeks.at(-1) * 1.15),
        );
        m.resurgences.push({
          index: age,
          week: s.week,
          month: monthKey,
          reason,
          bonus: gross - baseline,
        });
        log(
          s,
          `${m.title}: ${reason} brings a box-office resurgence this week.`,
          "success",
        );
      }
      m.boxWeeks.push(gross);
      m.gross += gross;
      const entitlement = gross * m.share;
      const recovered = Math.min(m.recoupRemaining ?? 0, entitlement);
      m.recoupRemaining = Math.max(0, (m.recoupRemaining ?? 0) - recovered);
      m.recouped = (m.recouped ?? 0) + recovered;
      const receipts = entitlement - recovered;
      m.receipts += receipts;
      s.cash += receipts;
      const payout = receipts * participationRate(m);
      m.participationPaid = (m.participationPaid ?? 0) + payout;
      m.spent += payout;
      s.cash -= payout;
      for (const c of [...m.contracts, ...(m.director ? [m.director] : [])])
        c.participationPaid =
          (c.participationPaid ?? 0) + receipts * (c.grossShare ?? 0);
      if (age >= 3 && (gross < m.opening * 0.1 || age >= 11)) {
        m.stage = "catalog";
        m.catalogStart = s.week;
        if (m.streamingDeal === null && s.week < END) s.notices.push({kind:"streaming",id:m.id});
        log(
          s,
          `${m.title} finishes its theatrical run at ${money(m.gross)}. Review streaming offers for its next chapter.`,
        );
      }
    } else if (m.stage === "catalog") {
      const income = catalogIncome(s,m);
      m.catalog += income;
      m.receipts += income;
      s.cash += income;
    }
  }
  if (s.week % 13 === 0) {
    s.market = [];
    for (let i = 0; i < 8; i++) s.market.push(script(s));
    log(s, "A new selection of scripts is available.");
    // Competing studios stay in the background, but can book talent between your films.
    for (const p of s.people) {
      if (!p.retired && available(p, s.week, s.week + 10) && random(s) < 0.12) {
        p.bookings.push({
          start: s.week + 1,
          end: s.week + roll(s, 5, 10),
          movie: null,
        });
        if (p.history.length)
          log(
            s,
            `${p.name} has accepted an outside production. Check their availability before your next film.`,
          );
      }
    }
  }
  if (s.week % 52 === 0) {
    for (const p of s.people) {
      p.age++;
      if (p.age >= 65 && random(s) < 0.25) {
        p.retired = true;
        log(s, `${p.name} announces retirement.`);
      }
    }
    for (let i = 0; i < 4; i++)
      s.people.push(talent(s, i === 3 ? "director" : "actor"));
    log(s, "New talent has arrived. Another year of movie history begins.");
  }
  const shark = s.debt.find(l => l.shark && l.due <= s.week);
  if (shark) {
    if (s.cash + DEBT_EPSILON >= shark.balance) {
      s.cash -= shark.balance;
      s.debt = s.debt.filter(l => l !== shark);
      log(s, "Loan shark repaid in full. Your studio stays open.");
    } else {
      s.ended = true;
      s.epilogue = false;
      s.endReason = "The loan shark closed your studio: the 13-week payment was missed.";
      s.notices = [];
      return;
    }
  }
  const year = date(s.week).year;
  if (s.week % 52 === 44) s.notices.push({ kind: "awardsHeadsUp", year });
  if (s.week >= 52 && s.week % 52 === 3) nominations(s, year - 1);
  if (s.week >= 52 && s.week % 52 === 10) ceremony(s, year - 1);
  if (s.week >= END) {
    s.epilogue = true;
    const finalYear = 2030;
    if (s.awards.some((a) => a.year === finalYear && a.completed)) {
      s.epilogue = false;
      s.ended = true;
      s.endReason = "Five years in pictures";
    } else nominations(s, finalYear, true);
  }
}
export function summary(s) {
  const released = s.movies.filter((m) =>
    ["catalog", "theaters"].includes(m.stage),
  );
  const unfinished = s.movies
    .filter((m) => ["filming"].includes(m.stage))
    .reduce((v, m) => v + remaining(m) * 0.15, 0);
  const catalogValue = released.reduce((v, m) => v + m.gross * 0.025, 0);
  const net =
    s.cash - debtTotal(s) - unfinished + s.invested * 0.5 + catalogValue;
  const financial = clamp(35 + (net - 6000) / 180),
    prestige = clamp(s.prestige * 1.3);
  const score = Math.round(Math.sqrt(financial * prestige));
  return {
    net,
    catalogValue,
    unfinished,
    financial,
    prestige,
    score,
    rating:
      score >= 75
        ? "A studio for the ages"
        : score >= 50
          ? "An industry contender"
          : score >= 25
            ? "A name to remember"
            : released.length
              ? "An emerging studio"
              : "An unwritten story",
    released: released.length,
    wins: s.awards.reduce(
      (v, a) =>
        v +
        a.results.slice(0, a.revealed ?? a.results.length).filter((r) => r.ours)
          .length,
      0,
    ),
  };
}
