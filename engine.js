// All money is in thousands of dollars. The simulation is deterministic from its saved seed.
export const VERSION = 1;
export const END = 260;
export const GENRES = {
  Drama: ["Character study", "Courtroom", "Coming of age"],
  Thriller: ["Psychological", "Crime", "Conspiracy"],
  Comedy: ["Romantic", "Workplace", "Satire"],
  Horror: ["Supernatural", "Survival", "Folk"],
  Action: ["Espionage", "Adventure", "Heist"],
  "Sci-fi": ["Space", "Near future", "Time travel"],
};
export const SCALES = ["Small", "Mid-budget", "Blockbuster"];
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
const PREMISES = {
  Drama: [
    "An estranged family reunites to sell the home none of them can let go.",
    "A public defender takes the one case that could end their career.",
    "Two former friends cross their hometown one last time.",
  ],
  Thriller: [
    "An overnight operator receives a call from a house demolished years ago.",
    "A missing witness leaves a trail through a city that refuses to talk.",
    "A journalist discovers their best source has another identity.",
  ],
  Comedy: [
    "Two strangers inherit a failing neighborhood cinema.",
    "A disastrous office retreat becomes an unlikely second chance.",
    "A local celebrity hires the only person who has never heard of them.",
  ],
  Horror: [
    "A winter caretaker realizes the empty rooms are being occupied.",
    "An isolated town celebrates a festival no outsider survives.",
    "An old recording predicts what happens after dark.",
  ],
  Action: [
    "A retired getaway driver has one night to bring someone home.",
    "An extraction team discovers their target planned the mission.",
    "Two rivals must steal back the same priceless artifact.",
  ],
  "Sci-fi": [
    "A distant station receives a message in its own captain’s voice.",
    "A city rents memories, until someone refuses to return one.",
    "A researcher gets one chance to revisit an ordinary Tuesday.",
  ],
};
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
export function random(s) {
  s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
const roll = (s, a, b) => Math.floor(a + random(s) * (b - a + 1));
const pick = (s, a) => a[roll(s, 0, a.length - 1)];
export const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.abs(v) >= 1000 ? 2 : 0,
    notation: "compact",
  }).format(v * 1000);
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
  return `${Math.max(1, Math.round((value + 3) / 5) * 5 - width)}–${Math.min(99, Math.round((value + 3) / 5) * 5 + width)}`;
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
  return {
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
  };
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
  return {
    id: `s${s.next++}`,
    title,
    genre,
    subgenre: pick(s, GENRES[genre]),
    scale,
    quality: roll(s, 45, 92),
    difficulty: roll(s, 35, 95),
    price: roll(s, 45, 160) * (SCALES.indexOf(scale) + 1),
    premise: pick(s, PREMISES[genre]),
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
  log(s, "The keys are yours. Five years to build a studio worth remembering.");
  return s;
}
export const debtTotal = (s) => s.debt.reduce((a, l) => a + l.balance, 0);
export const creditLimit = (s) => 8000 + s.prestige * 60;
export const creditAvailable = (s) =>
  Math.max(0, creditLimit(s) - debtTotal(s));
export const loanPayment = (s) =>
  s.debt.reduce(
    (a, l) => a + Math.min(l.principal, l.balance) + (l.balance * 0.12) / 52,
    0,
  );
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
export function quote(s, p, m, role = 0) {
  const option =
    m.parent &&
    movie(s, m.parent)?.contracts.find((c) => c.id === p.id && c.option);
  if (option) return { low: option.fee, high: option.fee, option: true };
  const discount =
    p.kind === "actor" && m.difficulty >= 75 && p.talent >= 65 ? 0.76 : 1;
  const base = p.fee * discount * (1 - s.prestige / 500);
  return {
    low: Math.round(base * 0.85),
    high: Math.round(base * 1.12),
    option: false,
  };
}
export function competition(s, m, week = m.release) {
  return s.rivals
    .filter((r) => Math.abs(r.week - week) <= 2)
    .reduce(
      (a, r) => a + (r.genre === m.genre ? 0.17 : 0.055) * (r.strength / 75),
      0,
    );
}
export function projection(s, m) {
  const market =
    m.scale === "Small" ? 1800 : m.scale === "Mid-budget" ? 5000 : 14500;
  const stars = m.contracts.length
    ? m.contracts.reduce((v, c) => v + person(s, c.id).star, 0) /
      m.contracts.length
    : 20;
  const reach =
    m.campaigns.reduce((v, c) => v + CAMPAIGNS[c].reach, 0) *
    (1 + (s.departments.Marketing - 1) * 0.09);
  const season = [7, 11].includes(date(m.release ?? s.week).month)
    ? m.scale === "Blockbuster"
      ? 1.45
      : 1.17
    : 1;
  const base =
    ((market * (0.36 + stars / 100 + reach / 95) * season) /
      (1 + competition(s, m))) *
    (0.55 + (m.screen ?? 60) / 145);
  const spread = Math.max(0.25, 0.95 - s.departments.Research * 0.12);
  return [base * (1 - spread), base * (1 + spread)];
}
function addMovie(s, sc, parent = null, developing = false) {
  const m = {
    ...structuredClone(sc),
    id: `m${s.next++}`,
    parent,
    stage: developing ? "development" : "packaging",
    ready: s.week + 3,
    contracts: [],
    director: null,
    auditions: {},
    spent: sc.price,
    receipts: 0,
    gross: 0,
    catalog: 0,
    campaigns: [],
    campaignSpend: 0,
    awardSpend: 0,
    screen: null,
    budget: { sets: 200, crew: 250, effects: 100 },
    duration: 8,
    progress: 0,
    release: null,
    quality: null,
    penalty: 0,
    event: null,
    eventCount: 0,
    boxWeeks: [],
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
function amt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max)
    throw Error(`Choose an amount between ${min} and ${max}.`);
  return n;
}
export function act(s, type, a = {}) {
  live(s);
  if (s.cash < 0 && !["loan", "end"].includes(type))
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
      sc.premise = "An original screenplay commissioned by your studio.";
      m = addMovie(s, sc, null, true);
      break;
    }
    case "sequel": {
      stage(m, ["theaters", "catalog"]);
      const n = s.movies.filter((x) => x.parent === m.id).length + 2;
      const sc = {
        ...m,
        title: `${m.title} ${n}`.slice(0, 60),
        price: 140,
        quality: clamp(roll(s, 40, 83) + s.departments.Development * 2),
        scriptQuality: null,
        art: roll(s, 0, 9999),
      };
      m = addMovie(s, sc, m.id, true);
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
      if (!p || p.kind !== "actor") throw Error("Choose an actor.");
      const key = `${a.role}:${p.id}`;
      if (!m.auditions[key])
        m.auditions[key] = clamp(
          p.talent +
            roll(s, -13, 13) -
            (m.difficulty > p.talent ? (m.difficulty - p.talent) * 0.2 : 0),
        );
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
      if (p.kind === "actor" && m.auditions[`${a.role}:${p.id}`] === undefined)
        throw Error("Audition the actor first.");
      const q = quote(s, p, m, a.role);
      const offer = amt(a.offer, 0, 100000);
      const threshold = q.option ? q.low : Math.round((q.low + q.high) / 2);
      if (offer < threshold)
        throw Error(
          `${p.name} is asking for ${money(threshold)}. Increase the offer or try someone else.`,
        );
      const c = {
        id: p.id,
        role: a.role ?? null,
        fee: offer,
        option: !!a.option,
        optionCost: a.option ? offer * 0.2 : 0,
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
      const duration = amt(a.duration, 4, 20);
      if (!Number.isInteger(duration)) throw Error("Choose whole weeks.");
      if (s.week + duration + 3 >= END)
        throw Error(
          "There is not enough time left to finish and release this film.",
        );
      const people = [...m.contracts, m.director].map((c) => person(s, c.id));
      if (people.some((p) => !available(p, s.week, s.week + duration)))
        throw Error(
          "Someone in your package is booked. Choose available talent or wait until their shoot ends.",
        );
      const b = {
        sets: amt(a.sets, 25, 15000),
        crew: amt(a.crew, 25, 15000),
        effects: amt(a.effects, 0, 20000),
      };
      const release = amt(
        a.release ?? s.week + duration + 3,
        s.week + duration + 3,
        END - 1,
      );
      if (!Number.isInteger(release))
        throw Error("Choose a whole release week.");
      m.budget = b;
      m.duration = duration;
      m.progress = 0;
      m.start = s.week;
      m.release = release;
      m.stage = "filming";
      const facilitySaving =
        s.facilities.Soundstage * 0.09 * b.sets +
        s.facilities["Effects workshop"] * 0.09 * b.effects +
        s.facilities["Editing suite"] * 0.04 * b.crew;
      m.productionTotal =
        (b.sets + b.crew + b.effects - facilitySaving) * (duration / 8) ** 0.6;
      m.weekly = m.productionTotal / duration;
      m.facilitySaving = facilitySaving;
      const fees = [...m.contracts, m.director].reduce(
        (v, c) => v + c.fee + c.optionCost,
        0,
      );
      debit(s, fees, m);
      for (const p of people)
        p.bookings.push({ start: s.week, end: s.week + duration, movie: m.id });
      log(
        s,
        `Cameras roll on ${m.title}. Release locked for ${date(m.release).label}, week ${date(m.release).week}.`,
      );
      break;
    }
    case "event": {
      if (!m.event) throw Error("There is no production decision pending.");
      if (!["pay", "cut", "split"].includes(a.choice))
        throw Error("Choose a response.");
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
      debit(s, c.cost, m);
      m.campaignSpend += c.cost;
      m.campaigns.push(Number(a.campaign));
      break;
    }
    case "distribute": {
      stage(m, ["ready"]);
      if (!["secure", "partner", "self"].includes(a.deal))
        throw Error("Choose a distribution deal.");
      const deals = distribution(s, m),
        d = deals[a.deal];
      m.deal = a.deal;
      m.share = d.share;
      m.advance = d.advance;
      m.receipts += d.advance;
      s.cash += d.advance;
      debit(s, d.cost, m);
      m.stage = "scheduled";
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
    case "loan": {
      const amount = amt(a.amount, 1, creditAvailable(s));
      s.cash += amount;
      s.debt.push({ balance: amount, principal: amount / 104 });
      log(
        s,
        `Bank financing accepted: ${money(amount)} at 12% APR over 104 weeks.`,
      );
      break;
    }
    case "repay": {
      const amount = amt(a.amount, 1, Math.min(s.cash, debtTotal(s)));
      let left = amount;
      for (const l of s.debt) {
        const pay = Math.min(left, l.balance);
        l.balance -= pay;
        left -= pay;
      }
      s.cash -= amount;
      s.debt = s.debt.filter((l) => l.balance > 0.01);
      break;
    }
    case "upgrade": {
      const isDepartment = Object.hasOwn(s.departments, a.name),
        obj = isDepartment ? s.departments : s.facilities;
      if (!Object.hasOwn(obj, a.name)) throw Error("Unknown upgrade.");
      if (obj[a.name] >= 4) throw Error("Already fully upgraded.");
      const cost = upgradeCost(s, a.name);
      debit(s, cost);
      s.invested += cost;
      obj[a.name]++;
      log(s, `${a.name} upgraded to level ${obj[a.name]}.`);
      break;
    }
    case "awardsCampaign": {
      stage(m, ["theaters", "catalog"]);
      if (m.awardSpend || date(m.release).year !== date(s.week).year)
        throw Error("This film is not eligible for a campaign this year.");
      m.awardSpend = 150;
      debit(s, 150, m);
      break;
    }
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
  return m;
}
export function upgradeCost(s, name) {
  return Object.hasOwn(s.departments, name)
    ? 300 * s.departments[name] ** 1.6
    : 700 * (s.facilities[name] + 1) ** 1.5;
}
export function distribution(s, m) {
  const prestige = 1 + s.prestige / 200;
  return {
    secure: {
      name: "Harbor Distribution",
      advance: Math.round(m.spent * 0.4 * prestige),
      share: 0.13 + s.prestige / 2000,
      cost: 0,
      desc: "A larger guaranteed payment. A smaller share of ticket sales.",
    },
    partner: {
      name: "Meridian Pictures",
      advance: Math.round(m.spent * 0.15 * prestige),
      share: 0.31 + s.prestige / 2000,
      cost: 80,
      desc: "A modest advance with more long-term upside.",
    },
    self: {
      name: "Independent release",
      advance: 0,
      share: 0.5,
      cost: 240 * (SCALES.indexOf(m.scale) + 1),
      desc: "Fund the booking and delivery yourself. Keep 50% after theaters.",
    },
  };
}
function finish(s, m) {
  const needs =
    m.scale === "Small" ? 650 : m.scale === "Mid-budget" ? 2200 : 6500;
  const effectsWeight = ["Action", "Sci-fi"].includes(m.genre)
    ? 0.4
    : m.genre === "Horror"
      ? 0.2
      : 0.05;
  const craft = clamp(
    ((m.budget.crew / (needs * 0.45)) * 0.45 +
      (m.budget.sets / (needs * (0.55 - effectsWeight))) *
        (0.55 - effectsWeight) +
      (effectsWeight
        ? (m.budget.effects / (needs * effectsWeight)) * effectsWeight
        : 0)) *
      65,
    15,
    96,
  );
  const performances = m.contracts.map((c) =>
    clamp(m.auditions[`${c.role}:${c.id}`] + roll(s, -12, 12)),
  );
  m.performances = performances;
  m.craft = craft;
  const scriptQuality = m.scriptQuality ?? 60;
  m.quality = clamp(
    scriptQuality * 0.25 +
      (performances.reduce((a, v) => a + v, 0) / performances.length) * 0.3 +
      person(s, m.director.id).talent * 0.2 +
      craft * 0.25 +
      (m.duration - 8) * 1.1 +
      (s.departments.Production - 1) * 2 -
      m.penalty,
    10,
    98,
  );
  m.critics = clamp(
    Math.round(m.quality + roll(s, -12, 12) + (m.difficulty - 60) * 0.09),
    5,
    99,
  );
  m.fans = clamp(Math.round(m.quality + roll(s, -17, 17)), 5, 99);
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
  const stars =
    m.contracts.reduce((v, c) => v + person(s, c.id).star, 0) /
    m.contracts.length;
  const reach =
    m.campaigns.reduce((v, c) => v + CAMPAIGNS[c].reach, 0) *
    (1 + (s.departments.Marketing - 1) * 0.09);
  const season = [7, 11].includes(date(s.week).month)
    ? m.scale === "Blockbuster"
      ? 1.45
      : 1.17
    : 1;
  const rival = competition(s, m);
  const appeal = 0.36 + stars / 100 + reach / 95;
  const sequel = m.parent
    ? 1 + clamp(movie(s, m.parent).fans - 45, 0, 50) / 160
    : 1;
  const openingGross =
    ((market * appeal * season) / (1 + rival)) *
    (0.55 + m.fans / 145) *
    (0.7 + random(s) * 0.6) *
    sequel;
  m.opening = openingGross;
  m.releaseFactors = { stars, reach, season, rival };
  m.stage = "theaters";
  m.theaterStart = s.week;
  s.notices.push({ kind: "opening", id: m.id });
  for (const [i, c] of m.contracts.entries()) {
    const p = person(s, c.id),
      before = p.star;
    const rise = Math.max(
      -3,
      Math.round(
        (m.performances[i] - 48) / 6 +
          Math.log2(Math.max(0.5, openingGross / 900)) * 2,
      ),
    );
    p.star = clamp(p.star + rise);
    p.fee = Math.round(35 + p.star * p.star * 0.35);
    p.history.push({
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
  d.history.push({
    id: m.id,
    title: m.title,
    score: m.critics,
    year: date(s.week).year,
  });
  d.star = clamp(d.star + Math.max(0, (m.critics - 55) / 9));
  d.fee = Math.round(35 + d.star * d.star * 0.35);
  s.prestige = clamp(s.prestige + Math.max(0, m.critics - 60) / 9);
  log(
    s,
    `${m.title} opens to ${money(openingGross)}. Critics ${m.critics} · Fans ${m.fans}.`,
    "release",
  );
}
function ceremony(s) {
  const year = date(s.week - 1).year;
  const eligible = s.movies.filter(
    (m) =>
      ["theaters", "catalog"].includes(m.stage) &&
      date(m.release).year === year,
  );
  const categories = [
    "Picture",
    "Director",
    "Lead Acting",
    "Supporting Acting",
  ];
  const results = [];
  for (const cat of categories) {
    const nominees = eligible
      .map((m) => {
        const idx =
          cat === "Supporting Acting"
            ? m.contracts.findIndex((c) => c.role === m.roles.length - 1)
            : m.contracts.findIndex((c) => c.role === 0);
        const score = cat.includes("Acting")
          ? (m.performances[idx] || m.critics) * 0.8 + m.difficulty * 0.2
          : m.critics;
        return {
          id: m.id,
          title: m.title,
          score: score + (m.awardSpend ? 5 : 0) + roll(s, -8, 8),
          person:
            cat === "Director"
              ? m.director.id
              : cat.includes("Acting")
                ? m.contracts[idx]?.id
                : null,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const rival = { title: pick(s, TITLES), score: roll(s, 70, 93), id: null };
    const winner = nominees[0]?.score > rival.score ? nominees[0] : rival;
    if (winner.id) {
      const m = movie(s, winner.id);
      m.awards.push(`${year} ${cat}`);
      s.prestige = clamp(s.prestige + 8);
      if (winner.person) {
        const p = person(s, winner.person);
        p.awards++;
        p.star = clamp(p.star + 12);
        p.fee = Math.round(35 + p.star * p.star * 0.35);
      }
      log(
        s,
        `${m.title} wins ${cat} at the ${year} Silver Screen Awards!`,
        "award",
      );
    }
    results.push({
      category: cat,
      nominees: nominees.map((n) => n.title),
      winner: winner.title,
      ours: !!winner.id,
    });
  }
  s.awards.push({ year, results });
  s.notices.push({ kind: "awards", year });
}
function nextWeek(s) {
  const pending = s.movies.find((m) => m.event);
  if (pending)
    throw Error(`Resolve the production decision on ${pending.title} first.`);
  const due = s.movies.find(
    (m) => m.stage === "ready" && m.release <= s.week + 1,
  );
  if (due)
    throw Error(
      `Choose distribution for ${due.title} before its locked release date.`,
    );
  s.week++;
  debit(s, overhead(s));
  for (const l of s.debt) {
    const principal = Math.min(l.principal, l.balance);
    debit(s, principal + (l.balance * 0.12) / 52);
    l.balance -= principal;
  }
  s.debt = s.debt.filter((l) => l.balance > 0.01);
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
        random(s) < 0.3
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
        log(s, `${m.title} needs a production decision.`, "action");
      }
    }
    if (m.stage === "scheduled" && s.week >= m.release) opening(s, m);
    if (m.stage === "theaters") {
      const age = s.week - m.theaterStart,
        hold = 0.35 + m.fans / 200;
      const gross =
        age === 0
          ? m.opening
          : m.opening * hold ** age * (1 + m.campaigns.length * 0.015);
      m.boxWeeks.push(gross);
      m.gross += gross;
      const receipts = gross * m.share;
      m.receipts += receipts;
      s.cash += receipts;
      if (age >= 3 && (gross < m.opening * 0.1 || age >= 11)) {
        m.stage = "catalog";
        m.catalogStart = s.week;
        log(
          s,
          `${m.title} finishes its theatrical run at ${money(m.gross)}. Streaming and licensing begin next week.`,
        );
      }
    } else if (m.stage === "catalog") {
      const income =
        Math.max(2, m.gross * 0.0017) *
        (1 + (s.week - m.catalogStart) / 52) ** -1.2;
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
    ceremony(s);
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
  if (s.week >= END) {
    s.ended = true;
    s.endReason = "Five years in pictures";
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
      (v, a) => v + a.results.filter((r) => r.ours).length,
      0,
    ),
  };
}
