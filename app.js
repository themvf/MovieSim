import {standings} from "./standings.js?v=0.48.0";
import * as COL from "./collection.js?v=0.48.0";
import * as COMM from './commissions.js?v=0.48.0';
import {nextHire, standardOffer, deadlineWindows, commissionEstimate} from './experience.js?v=0.48.0';
import * as REC from "./reception.js?v=0.48.0";
import * as LIFE from "./studio-life.js?v=0.48.0";
import {GENRE_SYMBOLS} from "./card-genres.js?v=0.48.0";
import * as CL from "./clients.js?v=0.48.0";
import * as CH from "./chemistry.js?v=0.48.0";
import * as SF from "./scifi.js?v=0.48.0";
import * as N from "./narrative.js?v=0.48.0";
import * as E from "./engine.js?v=0.48.0";
import { portrait, poster, studioArt, settingCardArt, escapeHtml as h } from "./art.js?v=0.48.0";
const BUILD = "0.42.0";
const KEY = "moviesim-collection-save-v1",
  app = document.querySelector("#app"),
  dialog = document.querySelector("#dialog");
let s,
  saveError = false;
try {
  const raw =
    localStorage.getItem("moviesim-build") === BUILD
      ? localStorage.getItem(KEY)
      : null;
  s = raw ? E.migrateSave(JSON.parse(raw)) : E.newGame();
  if (s.version !== E.VERSION || !Array.isArray(s.movies) || !s.departments)
    throw Error("Old save");
} catch {
  s = E.newGame();
}
E.addPosterFilms(s);
E.ensureOpportunities(s);
E.addHeadshotActors(s);
COL.ensure(s);
E.ensurePersonalities(s);
E.ensureCommissions(s);
let standingsSort="gross";
let tab = "slate",
  filter = "active",
  view = null,
  castingGenre = "all",
  castingSort = "fit",
  talentFilter = "all",
  budgetFilter = "all",
  productionPlans = new Map();
const icons = {
  slate: "▤",
  scripts: "▱",
  talent: "♙",
  studio: "▦",
  calendar: "▦",
  finance: "＄",
  awards: "♜",
  standings: "≡",
  press: "▧",
};
const titles = {
  slate: "Your slate",
  scripts: "Cinema Collection",
  talent: "The talent directory",
  studio: "Build something lasting",
  calendar: "The release calendar",
  finance: "Keep the cameras rolling",
  awards: "For your consideration",
  standings: "Studio standings",
  press: "The Final Cut",
};
const subs = {
  standings: "Your studio. Your competition.",
  slate: "Every great studio starts with a story.",
  scripts: "Mix your cards. Make your movie.",
  talent: "An unfamiliar name today. A household name tomorrow.",
  studio: "The movies come and go. This place is yours.",
  calendar: "A good movie still needs the right moment.",
  finance: "Big ambitions. Real commitments.",
  awards: "Make a little room on the shelf.",
  press: "The films. The people. The headlines.",
};
const labels = {
  development: "In development",
  packaging: "Casting & planning",
  filming: "In production",
  ready: "Ready to release",
  scheduled: "Release scheduled",
  theaters: "In theaters",
  catalog: "In your catalog",
  cancelled: "Shelved",
};
const $ = (id) => document.getElementById(id);
const button = (text, action, data = "", cls = "") =>
  `<button type="button" class="${cls}" data-action="${action}" ${data}>${text}</button>`;
const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;
const stat = (name, value, cls = "") =>
  `<div class="stat ${cls}"><span>${name}</span><strong>${value}</strong></div>`;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    localStorage.setItem("moviesim-build", BUILD);
    saveError = false;
  } catch {
    saveError = true;
    toast(
      "Your browser could not save progress. Export your save from the help menu.",
    );
  }
}
function toast(text) {
  if(dialog.open){
    let feedback=dialog.querySelector('#dialog-feedback');
    if(!feedback){
      feedback=document.createElement('div');feedback.id='dialog-feedback';
      feedback.setAttribute('role','alert');feedback.tabIndex=-1;
      (dialog.querySelector('.production-footer')??dialog.querySelector('.modal-body')).prepend(feedback);
    }
    feedback.textContent=text;
    feedback.focus({preventScroll:true});
  }
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.classList.remove("show"); t.textContent = ""; }, 4500);
}
function transact(type, args = {}, after) {
  try {
    const previousKind = view?.kind;
    const result = E.act(s, type, args);
    save();
    if (after) after(result);
    render();
    if (view) {
      drawDialog();
      if (view.kind !== previousKind || type === "awardReveal")
        focusDialogHeading();
    }
    checkEmergency();
    return result || true;
  } catch (e) {
    toast(e.message);
    return false;
  }
}
function requireReleaseDate() {
  if (
    s.ended ||
    s.epilogue ||
    s.cash < 0 ||
    s.notices.length ||
    s.week >= E.END - 1
  )
    return false;
  const m = s.movies.find((m) => m.stage === "ready" && m.release == null);
  if (!m) return false;
  open("release", { id: m.id, back: { kind: "movie", id: m.id } });
  return true;
}
function close() {
  view = null;
  dialog.close();
  dialog.innerHTML = "";
  render();
}
function open(kind, args = {}) {
  view = { ...args, kind };
  drawDialog();
  if (!dialog.open) dialog.showModal();
  focusDialogHeading();
}
function focusDialogHeading() {
  dialog.scrollTop = 0;
  dialog.querySelector(".modal-head h2")?.focus({ preventScroll: true });
}
function modal(title, body, eyebrow = "STUDIO DESK") {
  dialog.classList.toggle("card-sheet",view?.kind==="cards"&&!!view.panel);
  dialog.innerHTML = `<div class="modal-head"><div><span class="eyebrow">${eyebrow}</span><h2 tabindex="-1" autofocus>${title}</h2></div>${view?.kind==="cards"&&view.panel?button("←","cardDone","","icon-button back-button"):view?.back ? button("←", "back", "", "icon-button back-button") : ""}${(["awardsInvite", "nominations", "ceremony"].includes(view?.kind)||view?.kind==="cards"&&view.panel) ? "" : button("×", view?.kind==="cards"&&view.panel?"cardDone":"close", "", "icon-button close-button")}</div><div class="modal-body">${body}</div>`;
}
function isStreaming(m) {
  return m.stage === "catalog" && m.streamingDeal && s.week <= m.streamingDeal.endWeek;
}
function isActiveMovie(m) {
  return !["catalog","cancelled"].includes(m.stage);
}
function movieStageLabel(m) {
  return isStreaming(m) ? "Streaming" : m.stage === "catalog" && m.streamingDeal === null ? "Streaming deal needed" : labels[m.stage];
}
function render() {
  COL.ensure(s);
  const d = E.date(s.week),
    active = s.movies.filter(
      isActiveMovie,
    );
  const decisions = active.filter(
    (m) => m.event || ["packaging", "ready"].includes(m.stage),
  );
  app.innerHTML = `<aside class="sidebar"><a href="#" class="brand" data-action="nav" data-tab="slate"><span class="brand-mark">M<span>▰</span></span><span>MOVIE<span class="brand-light">SIM</span><small>THE STUDIO YEARS</small></span></a><div class="studio-label"><span class="status-dot"></span>${h(s.name)}<small>INDEPENDENT • EST. 2026</small></div><nav>${[
    ["slate", "Your slate"],
    ["scripts", "Cards"],
    ["talent", "Talent"],
    ["studio", "Studio"],
    ["calendar", "Calendar"],
    ["finance", "Finances"],
    ["awards", "Awards"],
    ["press", "The Final Cut"],
    ["standings", "Standings"],
  ]
    .map(
      ([key, name]) =>
        `<button data-action="nav" data-tab="${key}" class="nav-item ${tab === key ? "selected" : ""}"><span>${icons[key]}</span>${name}${key === "slate" && decisions.length ? `<b>${decisions.length}</b>` : ""}</button>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><div class="year-progress"><span>YOUR FIVE-YEAR STORY</span><strong>Year ${Math.min(5, Math.floor(s.week / 52) + 1)} <i>/ 5</i></strong><div class="bar"><i style="width:${(s.week / 260) * 100}%"></i></div></div>${button("How to play ↗", "help", "", "quiet")}<small>DEMO 0.48.0 · SAVED ${saveError ? "UNAVAILABLE" : "ON THIS DEVICE"}</small></div></aside>
  <div class="workspace"><header class="topbar"><span class="mobile-brand">▰ MOVIESIM</span><div class="date"><span class="status-dot"></span><strong>${d.label}</strong><span>Week ${d.week}</span></div><div class="top-stats"><div><small>AVAILABLE CASH</small><strong class="${s.cash < 0 ? "negative" : ""}">${E.accountMoney(s.cash)}</strong></div><div><small>STUDIO PRESTIGE</small><strong><span class="gold">✦</span> ${Math.round(s.prestige)}<em> / 100</em></strong></div></div>${button(s.ended ? "Studio recap" : s.cash < 0 && !s.epilogue ? "Review financing" : s.epilogue ? "Final awards →" : s.notices.length ? "New announcement →" : decisions.some((m) => m.event) ? "Next decision →" : s.movies.some((m) => m.stage === "ready" && m.release == null) ? "Choose release date →" : "Next week →", s.ended ? "recap" : s.cash < 0 && !s.epilogue ? "bank" : s.epilogue || s.notices.length ? "announcements" : decisions.some((m) => m.event) ? "nextDecision" : "next", "", "primary advance")}</header>
  <main>${COL.credits(s)?`<div class="notice-banner">✦ ${COL.credits(s)} card packs ready ${button("Choose packs","packs","","outline")}</div>`:""}<div class="page-heading"><div><span class="eyebrow">${tab === "slate" ? "THE PRODUCTION OFFICE" : tab === "scripts" ? "YOUR SHARED CARD LIBRARY" : tab === "talent" ? "CASTING & DIRECTION" : tab === "awards" ? "THE SILVER SCREEN AWARDS" : "SILVERLINE / STUDIO OPERATIONS"}</span><h1>${titles[tab]}</h1><p>${subs[tab]}</p></div>${tab === "slate" ? button("+ New movie", "nav", 'data-tab="scripts"', "primary") : tab === "scripts" ? button("+ Build movie", "cardNew", "", "primary") : ""}</div>
  ${s.ended ? `<div class="notice-banner">${h(s.endReason || "Your studio run is complete.")} Explore your studio or ${button("see your retrospective →", "recap", "", "text-button")}.</div>` : ""}
  ${tab === "slate" ? slate() : tab === "scripts" ? scripts() : tab === "talent" ? talents() : tab === "studio" ? studio() : tab === "calendar" ? calendar() : tab === "finance" ? finance() : tab === "press" ? pressPage() : tab === "standings" ? standingsPage() : awards()}
  <footer><span>MOVIESIM <i> / </i> FIVE YEARS. YOUR STORY.</span>${button("Guide & save", "help", "", "text-button")}</footer></main></div>
  <nav class="mobile-nav">${[
    ["slate", "Movies"],
    ["scripts", "Cards"],
    ["talent", "Talent"],
    ["studio", "Studio"],
    ["finance", "More"],
  ]
    .map(
      ([key, name]) =>
        `<button data-action="nav" data-tab="${key}" class="${tab === key ? "selected" : ""}"><span>${icons[key]}</span>${name}</button>`,
    )
    .join("")}</nav>`;
}
function opportunityBoard() {
 const offers=(s.talentOffers??[]).filter(o=>!o.usedBy&&s.week<o.end);
 return `<section class="opportunity-board" aria-label="Market opportunities">${E.activeTrends(s).map(t=>`<article><span class="opportunity-icon">${t.icon}</span><div><strong>Moviegoers are craving ${h(t.name.toLowerCase())}</strong><small>Audience interest is elevated. Future demand is uncertain.</small></div>${button("Find a script","nav",'data-tab="scripts"',"text-button")}</article>`).join("")}${offers.map(o=>`<article><span class="opportunity-icon">🌟</span><div><strong>${h(E.person(s,o.person).name)} loved ${h(o.film)}</strong><small>Half their usual fee for one new role. Availability and role fit still apply.</small></div>${button("Find a role","personalOffer",`data-person="${o.person}"`,"text-button")}</article>`).join("")}</section>`;
}
function slate() {
  const active = s.movies.filter(
      isActiveMovie,
    ),
    released = s.movies.filter((m) =>
      ["theaters", "catalog"].includes(m.stage),
    );
  let list =
    filter === "active"
      ? active
      : filter === "streaming"
        ? s.movies.filter(m=>isStreaming(m) || (m.stage === "catalog" && m.streamingDeal === null))
      : filter === "catalog"
        ? s.movies.filter((m) => !isActiveMovie(m) && !isStreaming(m) && m.streamingDeal !== null)
        : s.movies;
  return `${sharkWarning()}<section class="hero ${s.started ? "compact-hero" : ""}"><div class="hero-copy"><span class="eyebrow mint">${s.started ? "ON THE LOT THIS WEEK" : "WELCOME TO THE LOT"}</span><h2>${s.started ? `${active.length} picture${active.length === 1 ? "" : "s"} in motion.` : "Small studio.<br>Big picture."}</h2><p>${s.started ? `${active.filter((m) => m.stage === "filming").length} filming · ${released.length} released · Your next decision is below.` : "You have $6 million, an empty slate, and five years. Find a script. Discover a star. Make something that lasts."}</p>${button(s.started ? "Visit your studio ↗" : "Find your first script →", "nav", `data-tab="${s.started ? "studio" : "scripts"}"`, "light-button")}</div><div class="hero-art">${studioArt(s)}<span class="art-caption">${h(s.name)} · LOS ANGELES, ${E.date(s.week).year}</span></div></section>
 <div class="metrics">${stat("ACTIVE PRODUCTIONS", active.filter((m) => m.stage === "filming").length)}${stat("WEEKLY COMMITMENTS", E.money(E.burn(s)))}${stat("TOTAL BOX OFFICE", E.money(released.reduce((v, m) => v + m.gross, 0)))}${stat(
   "AWARDS WON",
   s.awards.reduce(
     (v, a) =>
       v +
       a.results.slice(0, a.revealed ?? a.results.length).filter((r) => r.ours)
         .length,
     0,
   ),
   "gold",
 )}</div>
 ${advanceControl()}${nextChallenge()}${lifeBanner()}${pressTeaser()}${clientBoard()}${commissionBoard()}${peopleBoard()}${opportunityBoard()}<div class="slate-layout"><section><div class="section-title"><h2>Your productions <span>${s.movies.length}</span></h2><div class="segmented">${[
   ["active", "Active"],
   ["streaming", "Streaming"],
   ["catalog", "Catalog"],
   ["all", "All"],
 ]
   .map(([k, t]) =>
     button(t, "filter", `data-filter="${k}"`, filter === k ? "selected" : ""),
   )
   .join(
     "",
   )}</div></div>${list.length ? `<div class="movie-list">${list.map(movieCard).join("")}</div>` : `<div class="empty-state"><span class="empty-icon">▰</span><h3>${filter === "streaming" ? "Your next audience awaits." : filter === "catalog" ? "Your legacy starts here." : s.movies.length ? "Your active slate is clear." : "Your opening credits are unwritten."}</h3><p>${filter === "streaming" ? "When a theatrical run ends, review its streaming deal here." : filter === "catalog" ? "Completed streaming contracts continue earning library licensing income." : s.movies.length ? "Check Streaming for your released films, or start your next movie." : "Find your next movie in the script room."}</p>${button("Explore scripts →", "nav", 'data-tab="scripts"', "outline")}</div>`}</section><aside class="right-rail"><section class="panel"><span class="eyebrow">THE STUDIO WIRE</span><h3>From the lot</h3>${s.log
   .slice(0, 5)
   .map(
     (l) =>
       `<div class="wire-item"><span class="wire-dot ${l.type}"></span><div><small>WEEK ${E.date(l.week).week} · ${E.date(l.week).year}</small><p>${h(l.text)}</p></div></div>`,
   )
   .join(
     "",
   )}</section><section class="tip-card"><span class="eyebrow">A PRODUCER’S NOTE</span><h3>${s.movies.length ? "A hit isn’t always a profit." : "An unknown isn’t unproven."}</h3><p>${s.movies.length ? "Gross box office is ticket sales. Your studio receives only its contracted share. Keep an eye on total costs." : "Auditions are free. A promising newcomer can outperform a star in the right role—and leave room in your budget for the release."}</p></section></aside></div>`;
}
function filmResult(m) {
  const net = m.receipts - m.spent;
  return `<span class="film-result ${net < 0 ? 'film-loss' : net > 0 ? 'film-profit' : 'film-even'}">${net < 0 ? 'Loss to date' : net > 0 ? 'Profit to date' : 'Break-even'} <strong>${net < 0 ? '−' : net > 0 ? '+' : ''}${E.accountMoney(Math.abs(net))}</strong></span>`;
}
function movieCard(m) {
  const cast = m.contracts.map((c) => E.person(s, c.id));
  const needs = m.event
    ? "Decision needed"
    : m.stage === "catalog" && m.streamingDeal === null
      ? "Choose streaming deal"
    : m.stage === "ready"
      ? m.release == null
        ? "Choose release date"
        : "Choose distribution"
      : m.stage === "packaging"
        ? "Choose cast & director"
        : null;
  return `<article class="movie-card" data-action="${m.stage === "ready" && m.release != null ? "distribution" : "movie"}" data-id="${m.id}" tabindex="0" role="button" aria-label="Manage ${h(m.title)}">${poster(m)}<div class="movie-info"><div class="movie-meta">${pill(movieStageLabel(m), m.stage === "theaters" ? "mint-pill" : "")}${m.parent ? pill("SEQUEL", "gold-pill") : ""}</div><h3>${h(m.title)}</h3><p>${h(m.genre)} / ${h(m.subgenre)} <span>·</span> ${E.scopeName(m.scale)}</p><div class="cast-mini">${cast.map((p) => portrait(p, 28)).join("")}<span>${cast.length ? cast.map((p) => h(p.name.split(" ")[0])).join(", ") : "Your cast is waiting to be discovered"}</span></div>${m.stage === "filming" ? `<div class="production-progress"><span>Filming</span><span>${m.progress} / ${m.duration} weeks</span><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div></div>` : ""}${m.boxWeeks.length ? `<p><strong>${E.boxOfficeStatus(m).label}</strong> · ${filmResult(m)}</p>${isStreaming(m) ? `<p class="streaming-card-info"><strong>${h(m.streamingDeal.name)}</strong> · ${Math.max(0,m.streamingDeal.endWeek-s.week)} weeks left<br>Streaming earned: <strong>${E.accountMoney(m.catalog)}</strong><br>${m.streamingDeal.id === "exclusive" ? "Upfront license paid · no weekly royalties" : `Next week: <strong>${E.accountMoney(E.catalogIncome({...s,week:s.week+1},m))}</strong>`}</p>` : weeklyChart(m)}` : ""}<div class="movie-bottom"><span>${["theaters", "catalog"].includes(m.stage) ? `Box office <strong>${E.accountMoney(m.gross)}</strong>` : `Spent <strong>${E.accountMoney(m.spent)}</strong>`}</span><span class="${needs ? "peach" : "muted"}">${needs ? `${needs} →` : m.release ? `${E.date(m.release).label} →` : "View project →"}</span></div></div></article>`;
}
function scripts() {
 COL.ensure(s);const count=Object.values(s.collection.owned).flat().length;
 return `<section class="collection-hero"><span class="eyebrow">CINEMA COLLECTION</span><h2>A few cards. Your movie.</h2><p>${count} reusable cards · ${COL.credits(s)} packs ready</p>${button('Build a movie →','cardNew','','primary')}${button('Open collection','packs','','outline')}</section>${packShelf()}`;
}

function talentAccolades(p) {
  const honors = E.talentHonors(s, p);
  if(!honors.nominations.length&&!honors.wins)return "";
  return `<div class="talent-accolades">${pill(`${honors.nominations.length} nomination${honors.nominations.length === 1 ? "" : "s"}`, "gold-pill")}${pill(`${honors.wins} award${honors.wins === 1 ? "" : "s"} won`, "gold-pill")}</div>`;
}
function talentAwardsHistory(p) {
  const honors = E.talentHonors(s, p);
  return `<section class="talent-awards-history"><h3>Awards & nominations</h3>${honors.nominations.map((n) => `<div class="award-row"><span><strong>${h(n.title)}</strong><small class="block">${n.year} · ${h(n.category)}</small></span>${pill(n.won ? "Winner" : "Nominee", "gold-pill")}</div>`).join("") || '<p class="muted small">No nominations recorded yet.</p>'}</section>`;
}
function talentBadge(p) {
  if (p.kind === "director")
    return pill(
      p.majorCredits > 0 || p.history.length >= 3
        ? "Established director"
        : "Emerging director",
      p.star >= 60 ? "gold-pill" : "",
    );
  return E.freshFace(p)
    ? pill("Fresh face", "mint-pill")
    : pill(
        p.star >= 60 ? "Established star" : "Working actor",
        p.star >= 60 ? "gold-pill" : "",
      );
}
function ratingRange(value) {
  const text = typeof value === "string" ? value : E.estimateText(value);
  const [low, high = low] = text.split("–").map(Number);
  const mid = (low + high) / 2;
  const band =
    mid >= 80 ? "green" : mid >= 60 ? "yellow" : mid >= 40 ? "orange" : "red";
  return `<span class="rating-range rating-${band}" title="Range midpoint: green 80+, yellow 60–79, orange 40–59, red below 40">${h(text)}</span>`;
}
const ratingLegend =
  '<p class="rating-legend">Range midpoint: <span class="rating-green">80+ green</span> · <span class="rating-yellow">60–79 yellow</span> · <span class="rating-orange">40–59 orange</span> · <span class="rating-red">Below 40 red</span>. The range still shows uncertainty.</p>';
function talentRatings(p, genre) {
  const level = s.departments.Casting;
  return `<div class="actor-ratings">${stat("OVERALL RATING", ratingRange(E.talentEstimate(s, p, p.talent)))}${p.kind === "actor" ? stat("SCREEN PRESENCE", ratingRange(E.talentEstimate(s, p, p.presence))) : ""}${stat("FAME", `${Math.round(p.star)}/100`)}${genre ? stat(`${genre.toUpperCase()} ABILITY`, ratingRange(E.talentEstimate(s, p, p.genres[genre]))) : ""}</div>`;
}
function genreStrengths(p) {
  const sorted = E.specialties(p);
  return `${p.personality?`<p class="personality-tag">${p.kind==="director"?h(E.workingStyle(p).name):`Wants to try ${h(p.personality.goal)}`}</p>`:""}<div class="genre-strengths"><span><b aria-label="Strong in">↑</b> ${sorted
    .slice(0, 2)
    .map(([g]) => g)
    .join(
      " · ",
    )}</span><span><b aria-label="Less comfortable">↓</b> ${sorted.at(-1)[0]}</span></div>`;
}
function talents() {
  const list = s.people.filter(
    (p) => talentFilter === "all" || p.kind === talentFilter,
  );
  return `<div class="section-title"><h2>The people behind the pictures</h2><div class="segmented">${[
    ["all", "All"],
    ["actor", "Actors"],
    ["director", "Directors"],
  ]
    .map(([k, v]) =>
      button(
        v,
        "talentFilter",
        `data-filter="${k}"`,
        talentFilter === k ? "selected" : "",
      ),
    )
    .join(
      "",
    )}</div></div><div class="talent-grid">${list.map((p) => `<button class="talent-card" data-action="person" data-person="${p.id}">${portrait(p, 64)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? "Actor" : "Director"} · ${h(p.gender)} · Age ${p.age}</p><div class="talent-tags">${p.retired ? pill("Retired") : talentBadge(p)}</div>${talentAccolades(p)}${E.freshFace(p) ? '<p class="fresh-note">Still building recognition beyond independent films.</p>' : ""}${genreStrengths(p)}${talentRatings(p)}<p class="fee-line">Expected fee <strong>${E.money(p.fee * 0.85)}–${E.money(p.fee * 1.12)}</strong></p></div></button>`).join("")}</div>`;
}
function studio() {
  const desc = {
    Development: "Sharper script estimates. Stronger commissioned screenplays.",
    Casting:
      "Narrower talent and audition estimates. Find overlooked potential.",
    Production: "Better execution adds to your finished film’s quality.",
    Marketing: "Every campaign reaches more people.",
    Research:
      "More representative screenings and narrower commercial forecasts.",
    Soundstage:
      "Build and reuse your own sets. Each upgrade saves about $90,000 on a $1,000,000 set-and-location budget.",
    "Editing suite":
      "Edit in-house with your own team. Each upgrade saves about $40,000 on a $1,000,000 crew-and-post budget.",
    "Effects workshop":
      "Create effects in-house. Each upgrade saves about $90,000 on a $1,000,000 effects budget.",
  };
  return `${industryDirectory()}<section class="studio-panorama">${studioArt(s)}<div><span class="eyebrow">YOUR PERMANENT HOME</span><h2>${h(s.name)}</h2><p>Build your studio with money and reputation. Early improvements need cash; later milestones require prestige too.</p></div></section><div class="section-title"><h2>Department unlocks</h2><span class="muted small">People, insight and better execution</span></div><div class="upgrade-grid">${Object.entries(
    s.departments,
  )
    .map(([name, level]) => upgradeCard(name, level, desc[name], true))
    .join(
      "",
    )}</div><div class="section-title"><h2>Build your studio lot</h2><span class="muted small">Ownership that lowers future production costs</span></div><div class="upgrade-grid">${Object.entries(
    s.facilities,
  )
    .map(([name, level]) => upgradeCard(name, level, desc[name], false))
    .join("")}</div>`;
}
function upgradeCard(name, level, desc, dept) {
  const u=E.upgradeUnlock(s,name),owned=level ? E.UPGRADE_MILESTONES[name][level-1] : "Renting as needed";
  return `<article class="panel upgrade-card"><span class="eyebrow">${dept ? "DEPARTMENT" : "FACILITY"} · ${h(name)}</span><small class="muted">Current: ${h(owned)}</small><h3>${u.complete ? "Fully established" : "Unlock: "+h(u.title)}</h3><p>${u.complete ? desc : h(u.benefit)}</p>${!dept ? `<small class="muted">${desc}</small>` : ""}${u.complete ? pill("All improvements owned","mint-pill") : `<div class="unlock-requirements"><span class="${s.prestige>=u.prestige ? "mint" : "muted"}">${s.prestige>=u.prestige ? "✓" : "○"} ${u.prestige ? `${u.prestige} prestige required · you have ${Math.round(s.prestige)}` : "Available now"}</span><span>${E.accountMoney(u.cost)} upfront · ${E.accountMoney(dept?2:3)}/week</span></div>${button(s.prestige<u.prestige ? "View unlock requirements" : s.cash<u.cost ? "Review funding needed" : "Review upgrade","upgrade",`data-name="${name}"`,"outline full")}`}<details class="unlock-roadmap"><summary>View future upgrades</summary>${E.UPGRADE_MILESTONES[name].map((title,i)=>`<p>${i<level ? "✓ " : ""}${h(title)}<small class="block">${dept ? ["Starting team","Money only","15 prestige + investment","35 prestige + investment"][i] : ["Money only","15 prestige + investment","35 prestige + investment","60 prestige + investment"][i]}</small></p>`).join("")}</details></article>`;
}
function calendar() {
  return `<div class="notice-banner">August & December: larger blockbuster audiences, heavier competition. Choose a release date after filming wraps. It locks when you confirm it.</div><section class="panel rival-roster"><h3>The other studios in town</h3>${E.RIVAL_STUDIOS.map(r=>`<section>${companyHead(r.name)}<p class="small">${h(r.focus)}</p></section>`).join("")}</section><div class="calendar-grid">${Array.from(
    { length: 12 },
    (_, i) => {
      const start = Math.floor(s.week / 52) * 52 + Math.ceil((i * 52) / 12),
        end = Math.floor(s.week / 52) * 52 + Math.ceil(((i + 1) * 52) / 12);
      const rivals = s.rivals.filter((r) => r.week >= start && r.week < end),
        ours = s.movies.filter(
          (m) =>
            m.release !== null &&
            m.release >= start &&
            m.release < end &&
            !m.cancelled,
        );
      return `<section class="calendar-month ${[7, 11].includes(i) ? "peak" : ""} ${E.date(s.week).month === i ? "current" : ""}"><div><h3>${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]}</h3>${({1:"ROMANCE",5:"ACTION & SCI-FI",6:"ACTION & SCI-FI",7:"SUMMER / PEAK",9:"HORROR",10:"FAMILY",11:"HOLIDAYS / PEAK"})[i] ? pill(({1:"ROMANCE",5:"ACTION & SCI-FI",6:"ACTION & SCI-FI",7:"SUMMER / PEAK",9:"HORROR",10:"FAMILY",11:"HOLIDAYS / PEAK"})[i], "gold-pill") : ""}</div>${ours.map((m) => `<button data-action="movie" data-id="${m.id}" class="calendar-release ours"><small>YOUR STUDIO · WEEK ${E.date(m.release).week}</small><strong>${h(m.title)}</strong><span>${h(m.genre)}</span></button>`).join("")}${rivals.map((r) => `<div class="calendar-release"><small>WEEK ${E.date(r.week).week} · ${h(E.rivalStudio(r).name)}</small><strong>${h(r.title)}</strong><span>${r.genre} · ${r.strength >= 75 ? "Major release" : "Independent release"}</span></div>`).join("")}</section>`;
    },
  ).join("")}</div>`;
}
function finance() {
  return `${sharkWarning()}<div class="mobile-more">${button("Studio standings", "nav", 'data-tab="standings"', "outline")}${button("Release calendar", "nav", 'data-tab="calendar"', "outline")}${button("Annual awards", "nav", 'data-tab="awards"', "outline")}${button("The Final Cut", "nav", 'data-tab="press"', "outline")}${button("Guide & save", "help", "", "outline")}</div><div class="metrics">${stat("AVAILABLE CASH", E.accountMoney(s.cash))}${stat("OUTSTANDING DEBT", E.accountMoney(E.debtTotal(s)))}${stat("WEEKLY OUTFLOW", E.accountMoney(E.burn(s)))}${stat("REMAINING CREDIT", E.accountMoney(E.creditAvailable(s)))}</div><div class="two-columns"><section class="panel"><span class="eyebrow">THREE BANKS · THREE OFFERS</span><h2>Room to take a chance.</h2><p>Borrow from day one. Banks offer 8%, 12%, or 18% annual interest, with separate lending limits and 104 weekly principal payments. Interest declines as the balance falls.</p><div class="finance-lines"><div><span>Total bank lending capacity</span><strong>${E.accountMoney(E.creditLimit(s))}</strong></div><div><span>Current weekly debt payment</span><strong>${E.accountMoney(E.loanPayment(s))}</strong></div><div><span>Operating overhead / week</span><strong>${E.accountMoney(E.overhead(s))}</strong></div><div><span>Committed filming costs remaining</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + E.remaining(m), 0))}</strong></div></div><div class="button-row">${button("Review a loan →", "bank", "", "primary")}${E.debtTotal(s) > 0 ? button("Repay debt", "repay", "", "outline") : ""}</div></section><section class="panel"><span class="eyebrow">THE FINANCIAL PICTURE</span><h2>Know what comes home.</h2><p>Gross box office is what audiences pay. Your studio receives its distribution share, plus any advance and later catalog earnings.</p><div class="finance-lines"><div><span>Total movie spending</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.spent, 0))}</strong></div><div><span>Studio movie receipts</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.receipts, 0))}</strong></div><div><span>Streaming & licensing receipts</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.catalog, 0))}</strong></div><div><span>Facility & department investments</span><strong>${E.accountMoney(s.invested)}</strong></div></div></section></div><div class="section-title"><h2>Project accounts</h2></div><div class="table-wrap"><table><thead><tr><th>Movie</th><th>Spent</th><th>Studio receipts</th><th>Net to date</th></tr></thead><tbody>${s.movies.map((m) => `<tr><td><button class="text-button" data-action="movie" data-id="${m.id}">${h(m.title)}</button></td><td>${E.accountMoney(m.spent)}</td><td>${E.accountMoney(m.receipts)}</td><td class="${m.receipts - m.spent >= 0 ? "mint" : "negative"}">${E.accountMoney(m.receipts - m.spent)}</td></tr>`).join("") || '<tr><td colspan="4">No projects yet. Your first ledger entry is waiting.</td></tr>'}</tbody></table></div>`;
}
function awards() {
  const eligible = s.movies.filter((m) => E.canCampaign(s, m)),
    latest = s.seasons.at(-1),
    pending = s.awards.find((a) => !a.completed);
  return `<section class="awards-hero"><span class="laurel">❧ ♜ ❧</span><span class="eyebrow gold">THE SILVER SCREEN AWARDS</span><h2>A season worth<br>looking forward to.</h2><div class="awards-timeline"><span>DECEMBER<small>Eligibility closes</small></span><span>JANUARY<small>Nominations announced</small></span><span>MARCH<small>Winners revealed</small></span></div><p>Each season celebrates the previous year’s films.</p>${pending ? button("Awards ceremony · watch the winners →", "awardsInvite", `data-year="${pending.year}"`, "primary") : latest ? button(`View ${latest.year} nominations`, "nominations", `data-year="${latest.year}"`, "outline") : ""}</section><div class="section-title"><h2>Your contenders</h2></div><p class="muted small">🎟 Campaigns fund screenings and publicity. Visibility helps; nominations and wins are never guaranteed.</p>${eligible.length ? eligible.map((m) => `<div class="contender"><div><h3>${h(m.title)}</h3><p>${E.date(m.release).year} releases · Critics ${E.score(m.critics)} · Fans ${E.score(m.fans)}</p><small class="block">🏆 Best prospect: ${h(E.AWARD_CATEGORIES.slice().sort((a,b)=>E.candidate(s,m,b).score-E.candidate(s,m,a).score)[0])} · Competition still matters</small></div>${m.awardSpend ? pill("Campaign funded", "gold-pill") : button("Fund campaign · $150,000", "awardCampaign", `data-id="${m.id}"`, "outline")}</div>`).join("") : '<div class="empty-state compact"><h3>Your next nomination starts with a film.</h3><p>Release by December to enter the following spring’s awards.</p></div>'}<div class="section-title"><h2>Awards history</h2></div>${s.seasons.map((a) => `<div class="contender"><div><h3>${a.year} film season</h3><p>${a.categories.reduce((v, c) => v + c.nominees.filter((n) => n.id).length, 0)} studio nominations</p></div>${button("Nominations", "nominations", `data-year="${a.year}"`, "outline")}</div>`).join("")}${
    s.awards
      .filter((a) => a.completed)
      .map(
        (a) =>
          `<section class="panel"><h3>${a.year} Silver Screen Awards</h3><p>${a.results.filter((r) => r.ours).length} awards for your studio</p>${button("Revisit winners →", "awardsResults", `data-year="${a.year}"`, "outline")}</section>`,
      )
      .join("") || '<p class="muted">Your first ceremony is ahead of you.</p>'
  }`;
}
function nomineeRows(entries) {
  return entries
    .map(
      (n) =>
        `<div class="nominee-row ${n.id ? "studio-nominee" : ""}"><div>${n.name ? `<strong>${h(n.name)}</strong>` : ""}<span>${h(n.title)}</span></div>${n.id ? pill("Your studio", "gold-pill") : pill(E.rivalStudio(n).name)}</div>`,
    )
    .join("");
}
function nominationsDialog(year) {
  const season = s.seasons.find((x) => x.year === year);
  if (!season) return;
  const total = season.categories.reduce(
    (v, c) => v + c.nominees.filter((n) => n.id).length,
    0,
  );
  modal(
    `${year} nominations`,
    `${season.epilogue ? '<div class="notice-banner">Final awards-season epilogue. Your five operating years are complete; no cash or production time advances here.</div>' : ""}<div class="ceremony-mark" aria-label="Award">🏆</div><h3>${total ? `${total} nomination${total === 1 ? "" : "s"} for ${h(s.name)}` : "No nominations for your studio this season"}</h3><p>These are the nominees. Winners are announced in March.</p>${season.categories.map((c) => `<section class="nomination-category"><span class="eyebrow gold">${c.category}</span>${nomineeRows(c.nominees)}</section>`).join("")}${season.acknowledged ? button("Back to awards", "nominationBack", "", "outline full") : button(season.epilogue ? "Continue to the March ceremony →" : "Back to the lot · ceremony in March", "ackNominations", `data-year="${year}"`, "primary full")}`,
    "JANUARY / THE NOMINATIONS",
  );
}
function awardsInvite(year) {
  const a = s.awards.find((x) => x.year === year);
  if (!a) return;
  if (a.completed) {
    view = { kind: "awardsResults", year };
    return awardsResults(year);
  }
  modal(
    "Awards ceremony tonight",
    `<div class="ceremony-mark">❧ ♜ ❧</div><div class="ceremony-invite"><span class="eyebrow gold">MARCH · HONORING ${year} FILMS</span><h2>Want to watch the winners?</h2><p>Four categories. Your nominees. One reveal at a time.</p><p class="muted small">Nothing advances automatically. You choose when each envelope opens.</p>${button(a.revealed ? "Continue watching →" : "Watch the ceremony →", "watchAwards", `data-year="${year}"`, "primary full")}${button("Show all results instead", "summarizeAwards", `data-year="${year}"`, "outline full")}</div>`,
    "THE SILVER SCREEN AWARDS",
  );
}
function ceremonyDialog(year) {
  const a = s.awards.find((x) => x.year === year);
  if (!a) return;
  const index = view.category ?? Math.min(a.revealed, a.results.length - 1),
    r = a.results[index],
    revealed = index < a.revealed;
  modal(
    `${r.category}`,
    `<div class="award-steps" aria-label="Category ${index+1} of ${a.results.length}">${a.results.map((x,i)=>`<span class="${i===index?'current':i<index?'complete':''}">${i+1}</span>`).join('')}</div>${revealed ? `<section class="winner-card ${r.ours?'studio-winner':'rival-winner'}"><span class="eyebrow gold">${r.ours?"🏆 YOUR STUDIO WINS":"AND THE WINNER IS"}</span>${r.person ? portrait(E.person(s,r.person),72):""}${r.winnerName ? `<h2>${h(r.winnerName)}</h2>` : ""}<h3>${h(r.winner)}</h3><p>${r.ours ? "Studio prestige +8" : h(E.rivalStudio(r).name)}</p>${r.person&&E.person(s,r.person)?`<small>${E.person(s,r.person).awards===1?'First career award':`${E.person(s,r.person).awards} career awards`}</small>`:''}${!r.ours?(r.entries??[]).filter(n=>n.id).map(n=>`<small class="block">Your nominee: ${h(n.name??n.title)}</small>`).join(''):''}</section>${button(index === a.results.length - 1 ? "See the ceremony recap →" : `Next: ${a.results[index+1]?.category ?? "Recap"} →`, "nextAward", `data-year="${year}" data-category="${index}"`, "primary full")}` : `<h3>The nominees</h3>${nomineeRows(r.entries || r.nominees.map((title) => ({ title })))}${button("Open the envelope · reveal winner", "revealAward", `data-year="${year}" data-category="${index}"`, "primary full")}`}`,
    "MARCH / THE CEREMONY",
  );
}
function awardsResults(year) {
  const a = s.awards.find((x) => x.year === year);
  if (!a) return;
  modal(
    `${year} ceremony recap`,
    `<div class="ceremony-mark">❧ ♜ ❧</div><h3>${a.results.filter((r) => r.ours).length} wins for your studio</h3>${a.results
      .slice(0, a.revealed ?? a.results.length)
      .map(
        (r) =>
          `<div class="ceremony-category ${r.ours ? "winner" : ""}"><span class="eyebrow gold">${r.category}</span>${r.winnerName ? `<h3>${h(r.winnerName)}</h3>` : ""}<strong>${h(r.winner)}</strong><p>${r.ours ? "Your studio · +8 prestige" : h(E.rivalStudio(r).name)}</p></div>`,
      )
      .join("")}${button("Continue →", "afterAwards", "", "primary full")}`,
    "THE AWARDS ARCHIVE",
  );
}
function productionDecision(m) {
  const kind = m.event.kind;
  if(kind==='delay')return delayPanel(m);
  if(kind==='crisis'){
   const ally=E.COMPANY_HEADS.find(h=>{const r=E.executiveRelationship(s,h.company);return r.trust>=75&&!r.blocked;});
   return `<section class="decision-box"><span class="eyebrow peach">PRODUCTION CRISIS</span><h3>${h(m.event.title)}</h3><p>${h(m.event.text)}</p><div class="choice-stack">${button(`Fund the full repair · ${E.money(m.event.cost)}<small>Protect quality. This spending cannot be recovered by undoing the decision.</small>`,'event',`data-id="${m.id}" data-choice="pay"`,'choice')}${button(`Call in a favor · ${E.money(m.event.cost/2)}<small>${ally?h(ally.name)+' covers half; costs 25 trust.':'Requires an available executive with 75 trust. Build relationships in Studio.'}</small>`,'event',`data-id="${m.id}" data-choice="split" ${ally?'':'disabled'}`,'choice')}${button(`Accept the compromised footage<small>No extra spending; permanent ${m.event.damage}-point production quality penalty.</small>`,'event',`data-id="${m.id}" data-choice="cut"`,'choice')}</div></section>`;
  }
  const choices =
    kind === "social" ? [
      ["pay","Issue a studio response · $50,000","Publicity support and a clear response. Reaction remains uncertain."],
      ["split","Ask the actor to respond","Let them address it directly. No added cost; response could help or backfire."],
      ["cut","Make no studio statement","No added cost. The controversy may continue without a response."],
    ] : kind === "creative"
      ? [
          ["pay", "Crowd-pleasing edit", "Favor audience appeal: a stronger opening and better repeat business, with less critical appeal. No added cost."],
          [
            "split",
            "Challenging director’s edit",
            "Favor critical appeal: stronger prestige and awards prospects, with softer ticket demand. No added cost.",
          ],
          [
            "cut",
            "Keep the balanced edit",
            "Keep the current balance of audience and critical appeal. No added cost.",
          ],
        ]
      : kind === "performance"
        ? [
            [
              "pay",
              "Give the supporting role the spotlight",
              "Supporting performance +5. No added cost.",
            ],
            [
              "split",
              "Focus on the lead",
              "Lead performance +4. No added cost.",
            ],
            [
              "cut",
              "Rehearse as an ensemble",
              "Each performance +2. No added cost.",
            ],
          ]
        : [
            [
              "pay",
              `Fund the fix · ${E.money(m.event.cost)}`,
              "Protect quality and stay on schedule",
            ],
            ["split", "Split the difference", "Half the cost, some compromise"],
            ["cut", "Cut the work", "No extra cost. Quality takes a hit."],
          ];
  return `<section class="decision-box"><span class="eyebrow peach">PRODUCTION NEEDS YOU</span><h3>${h(m.event.title)}</h3><p>${h(m.event.text)}</p>${kind === "creative" ? '<p class="muted small">Fans influence opening ticket sales, repeat business, sequel interest and streaming offers. Critics build prestige and help film and directing award prospects; acting awards also depend on the performance. Neither edit guarantees a hit or a trophy.</p>' : ""}<div class="choice-stack">${choices.map(([choice, label, detail]) => button(`${h(label)}<small>${h(detail)}</small>`, "event", `data-id="${m.id}" data-choice="${choice}"`, "choice")).join("")}</div></section>`;
}
function projectAction(m) {
  if (m.event)
    return {
      label: "Resolve production decision",
      action: "jumpDecision",
      text: "Your crew needs a decision",
    };
  if (m.stage === "packaging") {
    const role = m.roles.findIndex(
      (_, i) => !m.contracts.some((c) => c.role === i),
    );
    const hired = m.contracts.length + Number(!!m.director),
      text = `${hired}/${m.roles.length + 1} hired`;
    return role >= 0
      ? {
          label: `Cast ${m.roles[role].toLowerCase()}`,
          action: "casting",
          extra: `data-role="${role}"`,
          text,
        }
      : !m.director
        ? { label: "Find your director", action: "director", text }
        : {
            label: "Plan production",
            action: "production",
            text: "Cast & director ready",
          };
  }
  if (m.stage === "ready")
    return {
      label:
        m.release == null
          ? "Choose release week"
          : !m.marketingConfirmed
            ? "Choose marketing budget"
            : "Choose distribution",
      action:
        m.release == null
          ? "release"
          : !m.marketingConfirmed
            ? "marketing"
            : "distribution",
      text: "Filming wrapped",
    };
  return {
    label: "Next week →",
    action: "next",
    text:
      m.stage === "scheduled"
        ? `Opening in ${m.release - s.week} weeks`
        : m.stage === "filming"
          ? `Filming ${m.progress}/${m.duration} weeks`
          : "Your studio continues",
  };
}
function projectFooter(m) {
  if (s.ended || s.epilogue) return;
  const a = projectAction(m);
  dialog.insertAdjacentHTML(
    "beforeend",
    `<div class="action-footer"><span>${h(a.text)}</span>${button(a.label, a.action, `data-id="${m.id}" ${a.extra ?? ""}`, "primary")}${a.action==="next"?advanceControl():""}</div>`,
  );
}
function successSummary(m) {
  const result = E.boxOfficeStatus(m),
    net = m.receipts - m.spent;
  return `<section class="panel"><span class="eyebrow">BOX-OFFICE RESPONSE</span><h3>${result.label}</h3><p>${result.final ? "Final theatrical result" : "Opening assessment · final verdict after the run"} · Compared with films of this scope.</p><strong>${net >= 0 ? "Movie profit so far" : result.final ? "Movie loss so far" : "Costs still to recover"}: ${E.money(Math.abs(net))}</strong><p class="muted small">Ticket popularity and profit are separate. Talent revenue shares paid: ${E.money(m.participationPaid ?? 0)}. Studio overhead is separate; licensing can keep earning.</p></section>`;
}
function careerResults(m) {
  const changes=[...(m.careerChanges ?? [])].sort((a,b)=>{
    const rank=c=>E.person(s,c.id).kind === "director" ? 99 : m.contracts.find(x=>x.id===c.id)?.role ?? 98;
    return rank(a)-rank(b);
  });
  return `<section class="career-results"><h3>Cast & director: career changes</h3>${changes.map(c=>{
    const p=E.person(s,c.id),before=Math.round(c.before),after=Math.round(c.after),delta=after-before;
    return `<div class="career-headline compact-career">${portrait(p,40)}<div><strong>${h(p.name)}</strong><small class="block">${p.kind === "director" ? "Director" : h(m.roles[m.contracts.find(x=>x.id===p.id)?.role] ?? "Actor")} · Performance ${E.score(c.performance)}/100</small><span class="career-fame">Fame ${before} → ${after}</span></div><strong class="career-delta ${delta>0 ? "mint" : delta<0 ? "negative" : "muted"}">${delta>0 ? "↑ +"+delta : delta<0 ? "↓ "+delta : "—"}</strong></div>`;
  }).join("") || '<p>No career changes recorded for this earlier film.</p>'}<p class="muted small">Changes reflect each person’s performance and the film’s opening exposure. Fame can rise, fall, or stay unchanged.</p></section>`;
}
function openingContext(m) {
  const f = m.expectations,
    forecast = !f
      ? "No saved forecast"
      : m.opening < f.low
        ? "↓ Below forecast"
        : m.opening > f.high
          ? "↑ Beat forecast"
          : "✓ Within forecast";
  const recovered=m.spent>0?Math.min(100,Math.floor(m.receipts/m.spent*100)):100;
  return `<div class="opening-context"><p class="opening-verdict">${forecast} · ${E.boxOfficeStatus(m).label}</p><div class="finance-lines"><div><span>💵 Studio earnings</span><strong>${E.accountMoney(m.receipts)}</strong></div><div><span>Movie spending recovered</span><strong>${recovered}%</strong></div></div><progress class="recovery-progress" max="100" value="${recovered}" aria-label="Movie spending recovered">${recovered}%</progress><p><strong>${m.receipts>=m.spent?'✓ Profit to date':'Still to recover'}: ${E.accountMoney(Math.abs(m.receipts-m.spent))}</strong><small class="block">🎟 Still earning in theaters</small></p><details><summary>How is this calculated?</summary><p>Ticket sales measure popularity, not profit. Studio earnings include advances and your ticket payments after distribution deductions. Movie spending includes talent shares; studio overhead is separate.</p></details></div>`;
}
function attachedTeam(m) {
  const team = [...m.contracts, ...(m.director ? [m.director] : [])];
  if (!team.length) return "";
  return `<section class="panel attached-team"><h3>Returning team attached</h3>${team.map((c) => `<div class="award-row"><span>${h(E.person(s, c.id).name)}<small class="block">${c === m.director ? "Director" : h(m.roles[c.role])}</small></span><strong>${E.money(c.fee)}<small class="block">${Math.round((c.grossShare ?? 0) * 100)}% of studio ticket receipts</small></strong></div>`).join("")}<p>Agreed fees: ${E.money(team.reduce((v, c) => v + c.fee + c.optionCost, 0))}. Paid at greenlight. Availability is checked again before filming.</p></section>`;
}
function releaseRecap(m) {
  const unrecovered = Math.max(0, m.spent - m.receipts);
  return `<section class="personal-recap"><div class="scores">${stat("STUDIO RECEIPTS SO FAR", E.accountMoney(m.receipts))}${stat(unrecovered ? "COSTS STILL TO RECOVER" : "MOVIE PROFIT SO FAR", E.money(unrecovered || m.receipts - m.spent))}</div><p class="muted small">Includes the advance and ticket share. This run is still earning; studio overhead is separate.</p>${careerResults(m)}<p>${m.fans >= 75 ? "Strong audience response gives this run a better chance to hold." : m.fans < 50 ? "Weak audience response may shorten this run." : "Audience response is mixed; watch the next few weeks."} ${m.releaseFactors?.reach < 20 ? "Your campaign reached a relatively small audience." : "Your campaign increased opening awareness."}</p></section>`;
}
function sequelReview(m) {
  const team = E.returningTeam(s, m),
    canReturn =
      team.length === m.roles.length + 1 && team.every((c) => c.available);
  modal(
    "Bring the team back",
    `<h3>${h(m.title)}</h3><p>Rehire the original actors and director for the sequel. Review their return terms:</p>${team.map((c) => `<div class="award-row"><span>${h(E.person(s, c.id).name)}<small class="block">${c.kind === "director" ? "Director" : h(m.roles[c.role])} · ${c.available ? "Available" : "Unavailable"}${c.option ? " · Option fee honored" : ""}</small></span><strong>${E.money(c.fee)}<small class="block">+ ${Math.round(c.grossShare * 100)}% of studio ticket receipts</small></strong></div>`).join("")}<p>Talent fees: <strong>${E.money(team.reduce((v, c) => v + c.fee, 0))}</strong>, paid at greenlight. Only the $140,000 screenplay development fee is paid now.</p><p class="muted small">Availability assumes a ${E.recommendedWeeks(m)}-week shoot after three weeks of development. Schedules are checked again at greenlight. You can replace anyone before filming. Existing options apply to this return; no additional sequel options are purchased.</p>${button("Rehire original cast & director · $140,000 now", "confirmSequel", `data-id="${m.id}" data-rehire="true" ${canReturn ? "" : "disabled"}`, "primary full")}${!canReturn ? '<p class="peach">The full team is unavailable. Choose talent individually or return later.</p>' : ""}${button("Choose cast individually · $140,000 now", "confirmSequel", `data-id="${m.id}"`, "outline full")}<p>Original audience score: ${E.score(m.fans)}/100. Audience interest carries into the sequel; a hit is not guaranteed.</p>`,
    "CONTINUE THE STORY",
  );
}
function movieDetail(m) {
  const cast = [...m.contracts].sort((a, b) => a.role - b.role);
  return `${hiringNext(m)}<div class="detail-hero">${poster(m, true)}<div>${pill(movieStageLabel(m))}<h2>${h(m.title)}</h2><p>${h(m.genre)} / ${h(m.subgenre)} · ${E.scopeName(m.scale)}</p><p class="muted">${h(m.premise)}</p><p class="scope-description">${E.SCOPES[m.scale].description}</p>${m.release ? `<p class="small peach">Release locked: ${E.date(m.release).label}, week ${E.date(m.release).week}</p>` : ""}</div></div><div class="detail-stats">${stat("SPENT", E.accountMoney(m.spent))}${stat("STUDIO RECEIPTS", E.accountMoney(m.receipts))}<div class="film-result-stat">${filmResult(m)}<small>Studio receipts minus film spending</small></div>${stat("SCRIPT ESTIMATE", ratingRange(E.range(m.scriptQuality, s.departments.Development)))}</div>
 ${m.movieCards?movieCardSummary(m)+(['development','packaging','filming'].includes(m.stage)?castAppealPanel(m):''):''}
 ${['development','packaging'].includes(m.stage)?button(m.parent?'Change sequel cards':'Revise cards','cardEdit',`data-id="${m.id}"`,'outline full'):''}
 ${filmLife(m)}${clientFilm(m)}${commissionFilm(m)}${delayStatus(m)}${chemistryFilm(m)}
 ${m.stage==="packaging"?peopleFilm(m):""}
 ${m.event ? productionDecision(m) : ""}
 ${m.stage === "development" ? `<div class="notice-banner">Your development department is writing. Ready in ${Math.max(0, m.ready - s.week)} weeks.</div>${attachedTeam(m)}` : ""}
 ${
   m.stage === "packaging"
     ? `<section><div class="section-title"><h3>Cast & director</h3>${button("Rename movie", "rename", `data-id="${m.id}"`, "text-button")}</div><p class="muted small">Role difficulty ${E.score(m.difficulty)}/100. Auditions are free and immediate. Agreements are paid when cameras roll.</p><div class="role-list">${m.roles
         .map((r, i) => {
           const c = cast.find((c) => c.role === i),
             p = c && E.person(s, c.id);
           return `<div class="role-row">${p ? portrait(p, 44) : '<span class="vacant">♙</span>'}<div><small>${r.toUpperCase()}</small><span class="role-description">${h(m.roleDescriptions?.[i] ?? "")}<small>${roleGuidance(m,i)}</small></span><strong>${p ? h(p.name) : "Find your actor"}</strong>${c ? `<span>${E.money(c.fee)}${c.grossShare ? ` + ${Math.round(c.grossShare * 100)}% of studio ticket receipts` : ""} ${c.option ? "· sequel option +20%" : ""}</span>` : ""}</div>${button(p ? "Recast" : "Audition →", "casting", `data-id="${m.id}" data-role="${i}"`, "outline")}</div>`;
         })
         .join(
           "",
         )}<div class="role-row">${m.director ? portrait(E.person(s, m.director.id), 44) : '<span class="vacant">▰</span>'}<div><small>DIRECTOR</small><strong>${m.director ? h(E.person(s, m.director.id).name) : "Find your director"}</strong>${m.director ? `<span>${E.money(m.director.fee)}${m.director.grossShare ? ` + ${Math.round(m.director.grossShare * 100)}% of studio ticket receipts` : ""}</span>` : ""}</div>${button(m.director ? "Replace" : "Browse →", "director", `data-id="${m.id}"`, "outline")}</div></div>${button("Plan production →", "production", `data-id="${m.id}"`, "primary full")}</section>`
     : ""
 }
 ${m.stage === "filming" ? `<section class="panel"><span class="eyebrow">CAMERAS ROLLING</span><h3>Week ${m.progress} of ${m.duration}</h3><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div><p>${E.money(m.weekly)} per week · ${E.money(E.remaining(m))} left in planned filming costs.</p><p class="muted small">Advance time from your slate. Production problems may require your attention.</p></section>` : ""}
 ${m.stage === "ready" ? `<section class="panel"><span class="eyebrow">THE FIRST AUDIENCE</span><h3>${m.screen === null ? "What will they think?" : `Test-screening score: ${E.score(m.screen)}/100`}</h3><p>${m.screen === null ? "Pay for a small audience screening before committing your marketing budget. It is a signal, not a prediction." : (m.screeningModel?.version===2?`Audience sample; expected wider-audience range ${m.screeningModel.low}–${m.screeningModel.high}. More research narrows sampling uncertainty.`:"Legacy screening sampled overall production quality; it may differ from card-based fan reception.")}</p>${m.screen === null ? button("Hold test screening · $45,000", "screen", `data-id="${m.id}"`, "outline") : ""}</section>` : ""}
 ${["ready", "scheduled", "theaters"].includes(m.stage) ? campaigns(m) : ""}
 ${m.stage === "ready" ? releaseAndDistribution(m) : ""}
 ${m.stage === "scheduled" ? `<div class="notice-banner">Distribution is signed. Your movie opens in ${m.release - s.week} weeks. ${button("View competition →", "calendarFromMovie", "", "text-button")}</div>` : ""}
 ${["theaters", "catalog"].includes(m.stage) ? report(m) : ""}
 ${["theaters", "catalog"].includes(m.stage) ? button("Commission a sequel · $140,000", "sequel", `data-id="${m.id}"`, "primary full") : ""}
 ${["development", "packaging", "filming", "ready"].includes(m.stage) ? button("Shelve this movie", "cancel", `data-id="${m.id}"`, "danger-link") : ""}`;
}
function marketingChoices(m) {
  const chosen = view.selectedCampaigns ?? [];
  const preview = { ...m, campaigns: [...m.campaigns,...chosen] };
  const forecast = E.projection(s,preview);
  return `<div class="campaign-grid"><button class="campaign ${view.marketingChoice === "none" ? "purchased" : ""}" data-action="selectNoMarketing" aria-pressed="${view.marketingChoice === "none"}" ${m.campaignSpend ? "disabled" : ""}><strong>${view.marketingChoice === "none" ? "✓ " : ""}No marketing</strong><span>Rely on your movie and its cast to attract an audience.</span><b>$0</b></button>${E.CAMPAIGNS.map((c,i) => `<button class="campaign ${chosen.includes(i) || m.campaigns.includes(i) ? "purchased" : ""}" data-action="selectCampaign" data-campaign="${i}" aria-pressed="${chosen.includes(i) || m.campaigns.includes(i)}" ${m.campaigns.includes(i) ? "disabled" : ""}><strong>${chosen.includes(i) ? "✓ " : ""}${c.name}</strong><span>${c.desc}</span><b>${m.campaigns.includes(i) ? "Already purchased" : E.money(E.campaignCost(m,i))}</b></button>`).join("")}</div><p class="forecast">Rough opening estimate: <strong>${E.money(forecast[0])}–${E.money(forecast[1])}</strong><small>Actual results can fall outside this range.</small></p>`;
}
function roleGuidance(m,role) {
  const g = E.castingGuidance(m,role);
  return `${g.gender} · playing age ${g.low}–${g.high}. Creative direction only; you may cast outside it.`;
}
function sharkWarning() {
  const l = s.debt.find(l => l.shark);
  return l ? `<div class="notice-banner"><strong>Loan shark: ${E.money(l.balance)} due in ${Math.max(0,l.due-s.week)} weeks</strong><p>Payment is collected automatically after that week’s receipts. If you cannot pay, your studio closes. Early debt repayments go to this loan first.</p>${button("Review finances", "bank", "", "outline")}${s.cash > 0 ? button("Repay loan", "repay", "", "outline") : ""}</div>` : "";
}
function campaigns(m) {
  const proj =
    m.stage === "scheduled" && m.expectations
      ? [m.expectations.low, m.expectations.high]
      : E.projection(s, m);
  return `<section><div class="section-title"><h3>Make some noise</h3><span class="muted small">${E.accountMoney(m.campaignSpend)} committed</span></div><div class="campaign-grid">${E.CAMPAIGNS.map((c, i) => `<button class="campaign ${m.campaigns.includes(i) ? "purchased" : ""}" data-action="campaign" data-id="${m.id}" data-campaign="${i}" ${m.campaigns.includes(i) ? "disabled" : ""}><strong>${c.name}</strong><span>${c.desc}</span><b>${m.campaigns.includes(i) ? "✓ Campaign launched" : E.money(E.campaignCost(m,i))}</b></button>`).join("")}</div><p class="forecast"><span>RESEARCH / LEVEL ${s.departments.Research}</span>Rough opening estimate: <strong>${E.money(proj[0])}–${E.money(proj[1])}</strong><small>Uncertain gross box office. Actual results can fall outside this range.</small></p></section>`;
}
function weeklyChart(m) {
  const peak = Math.max(...m.boxWeeks, 1),
    last = (m.resurgences ?? []).find((r) => r.index === m.boxWeeks.length - 1);
  return `<div class="card-box-office"><div class="section-title"><span class="eyebrow">WEEKLY BOX OFFICE</span><strong>${E.money(m.boxWeeks.at(-1))} latest week</strong></div><div class="mini-box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div title="Week ${i + 1}: ${E.money(v)}"><i class="${(m.resurgences ?? []).some((r) => r.index === i) ? "resurgence" : ""}" style="height:${Math.max(3, (v / peak) * 48)}px"></i><small>${i + 1}</small></div>`).join("")}</div>${last ? `<p class="gold small">↗ ${h(last.reason)} · Audiences are returning</p>` : ""}</div>`;
}
function expectationsReview(m) {
  const rows = [];
  const add = (name, expected, actual, verdict = "", forecast = null, value = null) => {
    const tone=verdict === "Exceeded" ? "exceeded" : verdict === "Below" ? "below" : "met";
    const score=String(actual).endsWith('/100');
    const max=score?100:Math.max(1,(forecast?.high??0)*1.2,(value??0)*1.1);
    const position=forecast && Number.isFinite(value)?Math.max(0,Math.min(100,value/max*100)):null;
    const low=forecast?forecast.low/max*100:0,high=forecast?forecast.high/max*100:100;
    const label=verdict==='Below'?`↓ ${score?Math.round(forecast.low-value)+' below forecast':'Below forecast'}`:verdict==='Exceeded'?`↑ ${score?Math.round(value-forecast.high)+' above forecast':'Exceeded forecast'}`:verdict?`✓ Within · ${verdict.toLowerCase()}`:'';
    rows.push(`<article class="comparison-row"><div class="comparison-heading"><div class="comparison-name">${name}</div><strong class="comparison-actual">${actual}</strong></div><div class="comparison-values"><span>Expected ${expected}</span>${label?`<span class="expectation-status status-${tone}">${h(label)}</span>`:''}</div>${position==null?'':`<div class="result-track" role="img" aria-label="${h(label)}; ${score?'scale 0 to 100':'ticket sales scale'}"><span class="expected-zone" style="left:${low}%;width:${high-low}%"></span><i style="left:${position}%"></i></div>${score?'<div class="scale-labels"><span>0</span><span>100</span></div>':''}`}</article>`);
  };
  const verdict = (f,actual) => E.rangePosition(f,actual) ?? "";
  add(
    `Opening ticket sales${m.marketingBudget != null ? `<small>With the ${E.accountMoney(m.marketingBudget)} marketing plan</small>` : ""}`,
    m.expectations
      ? `${E.accountMoney(m.expectations.low)}–${E.accountMoney(m.expectations.high)}`
      : "Not recorded",
    E.accountMoney(m.opening),
    verdict(m.expectations, m.opening), m.expectations, m.opening,
  );
  for (const [i, c] of m.contracts.entries()) {
    const result = m.performances?.[i];
    add(
      `${h(E.person(s, c.id).name)}<small>${h(m.roles[c.role])}</small>`,
      c.expectation ? ratingRange(c.expectation) : "Not recorded",
      result == null ? "Not recorded" : `${E.score(result)}/100`,
      verdict(c.expectation, result == null ? null : E.score(result)), c.expectation, result == null ? null : E.score(result),
    );
  }
  if (m.director) {
    const c = m.director,
      result = m.directorPerformance;
    add(
      `${h(E.person(s, c.id).name)}<small>Director</small>`,
      c.expectation ? ratingRange(c.expectation) : "Not recorded",
      result == null ? "Not recorded" : `${E.score(result)}/100`,
      verdict(c.expectation, result == null ? null : E.score(result)), c.expectation, result == null ? null : E.score(result),
    );
  }
  add("Audience response",m.responseExpectations ? ratingRange(m.responseExpectations.audience) : "Not recorded",`${E.score(m.fans)}/100`,verdict(m.responseExpectations?.audience,E.score(m.fans)),m.responseExpectations?.audience,E.score(m.fans));
  add("Critics",m.responseExpectations ? ratingRange(m.responseExpectations.critics) : "Not recorded",`${E.score(m.critics)}/100`,verdict(m.responseExpectations?.critics,E.score(m.critics)),m.responseExpectations?.critics,E.score(m.critics));
  return `<section class="expectations-review talent-review"><h3>Expectations vs. results</h3><div class="comparison-list">${rows.join("")}</div><details class="comparison-help"><summary>How to read these results</summary><p class="muted small">Below and Exceeded fall outside the forecast. Low end, Mid-range and High end divide the expected range into thirds. Talent expectations are saved at hiring; box office is saved before release. The opening forecast includes your marketing plan; actual sales also depend on the film, cast, timing and distribution. Marketing spending is measured through opening. Audience and critic forecasts are saved before release; a test screening can inform the audience forecast. Marketing is an exact spending plan, not an invented uncertainty range. Scores measure performance, not fame.</p>${ratingLegend}</details></section>`;
}
function releaseSignals(m) {
 const signals=[];
 if(m.economyVersion>=2&&E.deliveryFactor(m)<.6)signals.push(["🎬","Production shortfall","Limited ticket demand"]);
 if(m.economyVersion>=3&&E.productionFit(m)>0)signals.push(["📍","Approach suited the film","Execution benefited"]);
 if((m.releaseFactors?.trend??1)>1)signals.push(["📈","Audience trend","Boosted opening demand"]);
 if(m.fanLore)signals.push(["💬",m.fanLore.kind==="buzz"?"Fan buzz":"Fan theories","Extra ticket interest"]);
 if(m.fans>=75)signals.push(["♥","Strong audience response","Better staying power"]);
 else if(m.fans<50)signals.push(["↓","Weak audience response","Faster ticket decline"]);
 if((m.releaseFactors?.rival??0)>.4)signals.push(["🎟","Crowded release","More competition"]);
 return `<div class="outcome-tiles">${signals.slice(0,3).map(([icon,title,detail])=>`<div><span aria-hidden="true">${icon}</span><strong>${title}</strong><small>${detail}</small></div>`).join("")}</div>`;
}
function premiereDialog(m) {
 const team=[...m.contracts,m.director].filter(Boolean).map(c=>E.person(s,c.id));
 modal(h(m.title),`<section class="premiere"><div class="premiere-marquee">★ OPENING WEEK ★</div><div class="premiere-poster">${poster(m,true)}</div><div class="premiere-cast">${team.map(p=>`<span>${portrait(p,36)}<small>${h(p.name)}</small></span>`).join('')}</div><p class="premiere-invitation">The numbers are in.</p><div id="premiere-results" hidden><span class="eyebrow">OPENING WEEK TICKET SALES</span><strong id="premiere-count" class="opening-number">$0</strong>${m.expectations?`<p class="small">Your forecast: ${E.accountMoney(m.expectations.low)}–${E.accountMoney(m.expectations.high)}</p><div class="premiere-track"><span class="premiere-band"></span><i id="premiere-marker"></i></div>`:'<p>No saved forecast for this release.</p>'}<p id="premiere-verdict" role="status" aria-live="polite"></p></div></section>`,'THE PREMIERE');
 dialog.insertAdjacentHTML('beforeend',`<footer class="deal-footer"><button type="button" class="primary full" data-action="revealOpening">Reveal opening results →</button><button type="button" class="text-button" data-action="skipOpening" hidden>Skip animation</button><button type="button" class="primary full" data-action="openingReport" hidden>View opening report →</button></footer>`);
}
function revealOpening(m,skip=false) {
 const root=dialog.querySelector('.premiere');if(!root)return;
 const results=$('premiere-results'),counter=$('premiere-count'),verdict=$('premiere-verdict');
 const reveal=dialog.querySelector('[data-action="revealOpening"]'),skipButton=dialog.querySelector('[data-action="skipOpening"]'),report=dialog.querySelector('[data-action="openingReport"]');
 if(root.dataset.running&&!skip)return;
 root.dataset.running='true';reveal.hidden=true;results.hidden=false;skipButton.hidden=false;
 root.querySelector('.premiere-invitation').hidden=true;root.classList.add('counting');dialog.querySelector('.modal-body').scrollTop=0;paintInitial();
 function paintInitial(){counter.textContent='$0';}
 const maximum=Math.max(1,m.opening*1.12,(m.expectations?.high??0)*1.2);
 const band=root.querySelector('.premiere-band');if(band){band.style.left=`${m.expectations.low/maximum*100}%`;band.style.width=`${(m.expectations.high-m.expectations.low)/maximum*100}%`;}
 const paint=value=>{counter.textContent=E.accountMoney(value);const marker=$('premiere-marker');if(marker)marker.style.left=`${value/maximum*100}%`;};
 const finish=()=>{if(!root.isConnected)return;root.dataset.done='true';paint(m.opening);const tone=!m.expectations?'met':m.opening<m.expectations.low?'below':m.opening>m.expectations.high?'exceeded':'met';verdict.className=`expectation-status status-${tone}`;verdict.textContent=!m.expectations?'Opening results are in':tone==='below'?'↓ Missed forecast':tone==='exceeded'?'↑ Beat forecast':'✓ Met forecast';skipButton.hidden=true;report.hidden=false;m.openingRevealed=true;save();report.focus({preventScroll:true});};
 if(skip||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
 let previous=null,elapsed=0;
 const frame=now=>{if(!root.isConnected||root.dataset.done)return;
 if(previous!==null&&!document.hidden)elapsed+=Math.min(64,Math.max(0,now-previous));
 previous=now;const progress=Math.min(1,elapsed/3000);paint(m.opening*(1-Math.pow(1-progress,2)));
 if(progress<1)requestAnimationFrame(frame);else finish();};
 requestAnimationFrame(()=>requestAnimationFrame(frame));
}
function openingDialog(m) {
  if(!m.openingRevealed || view.replayPremiere)return premiereDialog(m);
  const section=view.openingTab ?? "results";
  modal(h(m.title),`<div class="opening-report">
    <section data-opening-panel="results" ${section !== "results" ? "hidden" : ""}>${m.movieCards ? cardReleaseReport(m)+openingContext(m) : m.scifiReception ? scifiReport(m)+`<details class="sf-details"><summary>Opening forecast & financial detail</summary>${openingContext(m)}${expectationsReview(m)}</details>` : `${peopleFilm(m)}<div class="opening-hero"><span class="eyebrow">OPENING WEEK BOX OFFICE</span><strong class="opening-number">${E.accountMoney(m.opening)}</strong></div>${button("↻ Replay premiere","replayOpening","","text-button")}${openingContext(m)}<p class="release-spending">Marketing spent: <strong>${E.accountMoney(m.marketingSpendAtRelease ?? m.campaignSpend)}</strong></p>${releaseSignals(m)}${storyReport(m)}${expectationsReview(m)}<p class="muted small">This movie is still earning. Studio overhead is separate.</p>`}</section>
    <section data-opening-panel="reviews" ${section !== "reviews" ? "hidden" : ""}>${criticsPanel(m)}</section>
    <section data-opening-panel="team" ${section !== "team" ? "hidden" : ""}><div class="personal-recap">${careerResults(m)}</div>${button("Consider a sequel", "openingSequel", `data-id="${m.id}"`, "outline full")}</section>
  </div>`,"OPENING NIGHT");
  dialog.querySelector(".modal-body").insertAdjacentHTML("beforebegin",`<nav class="opening-nav" aria-label="Opening night sections">${[["results","Results"],["reviews","Reviews"],["team",`Cast & Director${(m.careerChanges??[]).some(c=>Math.round(c.after)!==Math.round(c.before))?' <span class="career-dot" aria-label="Career changes">●</span>':''}`]].map(([key,label])=>button(label,"openingSection",`data-section="${key}" aria-pressed="${section===key}"`,section===key?"selected":"")).join("")}</nav>`);
  dialog.insertAdjacentHTML("beforeend",`<div class="action-footer opening-footer">${button("Back to the lot →","dismissNotice","","primary full")}</div>`);
}
function criticsPanel(m) {
  return `<section class="panel"><span class="eyebrow">THE REVIEWS ARE IN</span><h3>Three critics. Three perspectives.</h3><p>Overall critics score: <strong>${E.score(m.critics)}/100</strong></p>${E.criticReviews(m).map(r=>`<article class="critic-review"><div class="section-title"><h3>${h(r.name)}</h3><strong class="critic-score ${r.score >= 75 ? "mint" : r.score >= 50 ? "gold" : r.score >= 25 ? "peach" : "negative"}">${E.score(r.score)}<small>/100</small></strong></div><small class="muted">${h(r.taste)}</small><p>“${h(r.quote)}”</p></article>`).join("")}</section>`;
}
function streamingSummary(m) {
  if (m.stage !== "catalog") return "";
  const deal=m.streamingDeal;
  if (deal === null) return `<section class="panel"><span class="eyebrow">AFTER THEATERS</span><h3>Your movie has another chapter.</h3><p>No streaming income until you choose a deal.</p>${!s.ended && !s.epilogue ? button("Compare streaming offers →", "streaming", `data-id="${m.id}"`, "primary full") : '<p>No streaming agreement was signed during this run.</p>'}</section>`;
  return `<section class="panel"><h3>${deal ? h(deal.name) : "Streaming & licensing"}</h3>${deal ? `<p>${h(deal.label)} · ${Math.max(0,deal.endWeek-s.week)} weeks remaining</p><p>Paid upfront: <strong>${E.money(deal.upfront)}</strong></p>` : ""}<p>Earned to date: <strong>${E.accountMoney(m.catalog)}</strong></p><p>Next week: <strong>${E.accountMoney(E.catalogIncome({...s,week:s.week+1},m))}</strong></p><small class="muted">${deal && s.week < deal.endWeek ? "After 52 weeks, this agreement expires and automatic catalog licensing resumes. Sequel rights remain yours." : "Your catalog earns ongoing licensing income that declines over time."}</small></section>`;
}
function streamingDialog(m) {
 if(m.streamingDeal!==null||s.ended||s.epilogue)return modal("Streaming",streamingSummary(m),"YOUR FILM");
 const offers=E.streamingOffers(m,s),selected=offers.find(o=>o.id===view.streamingChoice);
 return modal("Your movie’s next chapter",`<p><strong>${h(m.title)}</strong> · 52-week streaming offers</p><div class="table-wrap"><table class="streaming-comparison"><thead><tr><th>Platform</th><th>💵 Now</th><th>📅 Total</th></tr></thead><tbody>${offers.map(o=>{const t=E.streamingTotals(s,m,o);return `<tr><td><strong>${h(o.name)}</strong><small class="block">${o.id==="exclusive"?"🔒 Upfront license":"📈 Weekly royalties"}</small>${o.blocked?`<small class="block peach">New deals reopen in ${o.blocked} weeks</small>`:""}${button("Review offer","reviewStreaming",`data-deal="${o.id}"`,"text-button")}</td><td>${E.accountMoney(o.upfront)}</td><td><strong>${E.accountMoney(t.full)}</strong><small class="block">Over 52 weeks</small>${t.weeks<52?`<small class="block peach">Before demo ends: ${E.accountMoney(t.remaining)}</small>`:""}</td></tr>`;}).join("")}</tbody></table></div>${selected?`<section class="panel"><h3>${h(selected.name)}</h3>${companyHead(selected.name)}<p>${selected.id==="exclusive"?"🔒 Entire payment now · no royalties during the license.":`📈 First royalty: ${E.accountMoney(selected.weekly)} · payments decline weekly.`}</p>${button("Sign with "+selected.name,"signStreaming",`data-id="${m.id}" data-deal="${selected.id}" ${selected.blocked?"disabled":""}`,"primary full")}</section>`:'<p class="muted small">Tap Review offer, then sign your choice.</p>'}<details><summary>Contract terms</summary><p>Licensing resumes after 52 weeks. You keep sequel rights. No recoupment or talent ticket shares apply. Future royalties are not paid early when the demo ends.</p></details>${button("Decide later · no streaming income yet","deferStreaming",`data-id="${m.id}"`,"outline full")}`,"STREAMING OFFERS");
}
function report(m) {
  if(m.movieCards&&!m._cardReport)return cardReleaseReport(m)+`<details><summary>Finances & release history</summary>${report({...m,_cardReport:true})}</details>`;
  if(m.scifiReception && !m._sfDetails){return `${scifiReport(m)}<details class="sf-details"><summary>View full finances & release details</summary>${report({...m,_sfDetails:true,scifiReception:null})}</details>${careerResults(m)}`;}
  const f = m.releaseFactors;
  return `${m.scifiReception?scifiReport(m):`<section class="panel"><div class="scores">${stat("FANS",E.score(m.fans))}${stat("CRITICS",E.score(m.critics))}${stat("BOX OFFICE",E.accountMoney(m.gross))}</div>${filmResult(m)}</section>${peopleFilm(m)}`}<details class="sf-details"><summary>Full release details</summary>${(m.productionDecisions??[]).some(d=>d.outcome)?`<section class="panel"><h3>Your producer decisions</h3>${m.productionDecisions.filter(d=>d.outcome).map(d=>`<p>${h(d.outcome)}</p>`).join('')}</section>`:''}${streamingSummary(m)}${releaseSignals(m)}${successSummary(m)}${expectationsReview(m)}${criticsPanel(m)}${careerResults(m)}<section><div class="section-title"><h3>The release report</h3>${m.awards.length ? pill(`♜ ${m.awards.length} awards`, "gold-pill") : ""}</div><div class="scores">${stat("TEST SCREENING", m.screen == null ? "Not held" : E.score(m.screen))}${stat("CRITICS", E.score(m.critics))}${stat("FANS", E.score(m.fans))}</div><div class="box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div><i style="height:${Math.max(3, (v / Math.max(...m.boxWeeks)) * 110)}px"></i><small>W${i + 1}</small></div>`).join("")}</div><div class="finance-lines"><div><span>Gross box office</span><strong>${E.accountMoney(m.gross)}</strong></div><div><span>Your share of ticket sales</span><strong>${Math.round(m.share * 100)}%</strong></div><div><span>Release costs / advance recovered by distributor</span><strong>${E.money(m.recouped ?? 0)}</strong></div><div><span>Still to recover before ticket payments</span><strong>${E.money(m.recoupRemaining ?? 0)}</strong></div><div><span>Upfront payment received</span><strong>${E.money(m.advance)}</strong></div><div><span>Sponsorship payments</span><strong>${E.accountMoney(m.sponsorIncome??0)}</strong></div><div><span>Streaming & licensing</span><strong>${E.accountMoney(m.catalog)}</strong></div><div><span>Total studio receipts</span><strong>${E.accountMoney(m.receipts)}</strong></div><div><span>Talent revenue shares paid</span><strong>${E.money(m.participationPaid ?? 0)}</strong></div><div><span>Total movie costs (including talent shares)</span><strong>${E.accountMoney(m.spent)}</strong></div><div><span>Movie profit / loss to date</span><strong class="${m.receipts >= m.spent ? "mint" : "negative"}">${E.accountMoney(m.receipts - m.spent)}</strong></div></div><div class="analysis-note"><span class="eyebrow">WHAT WE LEARNED / RESEARCH LEVEL ${s.departments.Research}</span><p>${m.craft < 45 ? "Production values fell short of the project’s ambition." : m.craft > 75 ? "Production spending translated into strong craft." : "Production values were serviceable, with room to improve."} ${m.fans > 75 ? "Audiences are giving the movie strong word of mouth." : m.fans < 50 ? "Weak audience response is limiting repeat business." : "Audience response is mixed to positive."} ${f.reach < 20 ? "Limited marketing held back opening awareness." : "Your campaign put the film in front of an audience."} ${f.rival > 0.3 ? "A crowded release window divided attention." : "Competition was manageable."} ${f.season > 1 ? "The seasonal audience boost helped." : ""}</p>${s.departments.Research >= 2 ? `<p>Average performance ${Math.round(m.performances.reduce((a, v) => a + v, 0) / m.performances.length)}/100 · Craft ${Math.round(m.craft)}/100. ${m.penalty ? `Production compromises reduced quality by approximately ${Math.round(m.penalty)} points.` : "No unresolved production compromises."}</p>` : ""}${s.departments.Research >= 3 ? `<p>Estimated competition reduction: ${Math.round((1 - 1 / (1 + f.rival)) * 100)}%. Seasonal audience boost: ${Math.round((f.season - 1) * 100)}%. Awareness index: ${Math.round(f.reach)}. The opening also includes unpredictable audience demand.</p>` : ""}</div></section></details>`;
}
function drawDialog() {
  if (!view) return;
  const v = view,
    m = v.id && E.movie(s, v.id);
  if(v.kind==='life')return lifeDialog(v.section);
  if(v.kind==='cult')return cultDialog(m);
  if(v.kind==='sequelCards')return sequelCardsDialog(m);
  if(v.kind==='releaseTalk')return releaseTalk(m,v.week);
  if(v.kind==="client")return clientDialog(v.client);
  if(v.kind==="fanSentiment")return fanSentiment(m);
  if(v.kind==="commission")return commissionDialog();
  if(v.kind==="productionDelay")return modal(m.event?.index===5?"A word from your production manager":"A word from your director",delayPanel(m),"PRODUCTION DELAY");
  if (v.kind === "movie") {
    modal("Project desk", movieDetail(m), "YOUR SLATE");
    projectFooter(m);
    return;
  }
  if (v.kind === "careers")
    return modal("Cast & director careers", careerResults(m), h(m.title));
  if(v.kind==="personalOffer"){
    const actor=E.person(s,v.person),offer=(s.talentOffers??[]).find(o=>o.person===actor.id&&!o.usedBy&&s.week<o.end);
    return modal(h(actor.name),offer?`<p>🌟 Half their usual fee for one role. Audition before agreeing terms.</p>${s.movies.filter(x=>x.stage==="packaging").map(x=>`<section><h3>${h(x.title)}</h3>${(actor.kind==='director'?['Director']:x.roles).map((r,i)=>button(`Audition for ${r}`,"auditionInterest",`data-id="${x.id}" data-person="${actor.id}" data-role="${i}"`,"outline")).join("")}</section>`).join("")||`<p>Acquire or develop a screenplay to give them a role.</p>${button('Find a screenplay','nav','data-tab="scripts"','primary full')}`}`:'<p>This opportunity is no longer available.</p>',"TALENT OPPORTUNITY");
  }
  if (v.kind === "sequelReview") return sequelReview(m);
  if (v.kind === "script") {
    const sc = s.market.find((x) => x.id === v.script);
    if (!sc) {
      close();
      return;
    }
    return modal(
      h(sc.title),
      `<div class="detail-hero">${poster(sc, true)}<div>${pill(E.scopeName(sc.scale))}<h3>${h(sc.genre)} / ${h(sc.subgenre)}</h3><p>${h(sc.premise)}</p><p>Script quality estimate: <strong>${ratingRange(E.range(sc.quality, s.departments.Development))}</strong></p><p>Role difficulty: <strong>${E.score(sc.difficulty)}/100</strong></p><p>Cast: ${sc.roles.join(", ")}</p></div></div><p class="scope-description">${E.SCOPES[sc.scale].description}</p><p>Includes the screenplay and sequel rights. You can rename the movie after acquisition. Production, talent, and marketing are separate expenses.</p>${button(`Acquire screenplay · ${E.accountMoney(sc.price)}`, "buy", `data-script="${sc.id}"`, "primary full")}`,
      "SCRIPT ACQUISITION",
    );
  }
  if (v.kind === "cards") return cardRoom();
  if (v.kind === "packs") return modal("Your collection",packShelf()+collectionGallery(),"PRESTIGE PACKS");
  if (v.kind === "casting" || v.kind === "director")
    return casting(m, v.kind === "director");
  if (v.kind === "offer") {
    const p = E.person(s, v.person),
      q = E.quote(s, p, m, v.role);
    if (q.refusal)
      return modal(
        "Not interested",
        `<p>${h(p.name)}: ${h(q.refusal)}</p>`,
        "TALENT DECISION",
      );
    const aud=m.auditions[E.auditionKey(p,v.role)],share=Math.round(q.grossShare*100);
    modal(`An offer for ${h(p.name)}`,`<div class="person-heading">${portrait(p,64)}<div><h3>${h(p.name)}</h3><p>${p.kind==='actor'?h(m.roles[v.role]):'Director'} · ${h(m.title)}</p>${aud!==undefined?`<p>Audition ${ratingRange(E.talentEstimate(s,p,aud))}</p>`:''}</div></div>${q.personal?`<div class="offer-opportunity">🌟 Loved ${h(q.personal)} · half-rate offer for this role</div>`:q.passion?`<div class="offer-opportunity"><strong>🌟 Passion-project discount</strong><p>“This is a role I want to be part of.”</p><small>Usual fee: ${E.accountMoney(q.normalLow)}–${E.accountMoney(q.normalHigh)}</small></div>`:''}<p>Asking now: <strong>${E.accountMoney(q.low)}–${E.accountMoney(q.high)}</strong>${q.option?' · Existing sequel option':''}</p><form id="offer-form"><label>Your offer ($)<input name="offer" type="text" inputmode="decimal" value="${E.dollarInput(standardOffer(q))}" required></label><small>Paid when filming starts.</small><section class="offer-share"><strong>🎟 ${share?`Requires ${share}% of studio ticket income`:'No revenue share required'}</strong>${share?`<p>${E.accountMoney(1000*q.grossShare)} for every $1,000,000 your studio receives.<small class="block">Paid even before the movie becomes profitable.</small></p>`:''}<details><summary>Revenue-share details</summary><p>Applies to ticket income only; advances and licensing are excluded. Combined cast and director share after this hire: ${Math.round((E.participationRate(m)-(p.kind==='director'?(m.director?.grossShare??0):(m.contracts.find(c=>c.role===v.role)?.grossShare??0))+q.grossShare)*100)}%.</p></details></section>${p.kind==='actor'?'<label class="checkbox"><input type="checkbox" name="option"><span>Lock in their fee for a sequel — <strong id="option-price"></strong> extra</span></label><small>Keeps this fee and revenue-share rate for their return. Availability is not guaranteed.</small>':''}</form>`,'TALENT NEGOTIATION');
    dialog.insertAdjacentHTML('beforeend',`<footer class="deal-footer"><div id="offer-total"></div><button class="primary full" form="offer-form">Make offer →</button></footer>`);
    moneyPreview();return;
  }

  if (v.kind === "production") return production(m);
  if (v.kind === "release") return releasePlanner(m);
  if (
    v.kind === "marketing" ||
    (v.kind === "distribution" && !m.marketingConfirmed)
  ) {
    view.kind = "marketing";
    return modal(
      "Choose your marketing budget",
      `<p>Select your marketing plan, including $0 if you want no campaign. Nothing is purchased until you confirm.</p>${marketingChoices(m)}<p><strong>Budget: ${E.money(m.campaignSpend + (v.selectedCampaigns ?? []).reduce((sum,i) => sum+E.campaignCost(m,i),0))}</strong></p>${button("Confirm marketing budget →", "confirmMarketing", `data-id="${m.id}" ${!v.marketingChoice && !m.campaignSpend ? "disabled" : ""}`, "primary full")}`,
      h(m.title),
    );
  }
  if (v.kind === "distribution")
    return modal("Choose distribution", `${m.responseExpectations ? `<div class="forecast">👥 Audience ${ratingRange(m.responseExpectations.audience)} · 📝 Critics ${ratingRange(m.responseExpectations.critics)}<details><summary>About these estimates</summary><p>Based on your script, hiring reports and any test screening. Actual results can fall outside these ranges.</p></details></div>` : ""}${distributionOffers(m)}`, h(m.title));
  if (v.kind === "dealReview") {
    const d = E.distribution(s, m)[v.deal],
      example = Math.max(0, 10000 * d.share - d.recoup);
    return modal(
      "Your deal, in dollars",
      `<h3>${h(d.name)}</h3>${companyHead(d.name)}<div class="finance-lines"><div><span>Cash paid to your studio now</span><strong>${E.money(d.advance)}</strong></div><div><span>Release fee paid by you now</span><strong>${E.money(d.cost)}</strong></div><div><span>If audiences buy $10,000,000 in tickets</span><strong>You receive ${E.money(example)}</strong></div></div><p>${h(d.desc)} Release support funded by the distributor: ${E.money(d.support)}. Amount recovered from your ticket share before further payments: ${E.money(d.recoup)}. The example is additional ticket income after recovery and before talent participation. Optional marketing campaigns remain separate.</p>${button("Choose this deal", "distribute", `data-id="${m.id}" data-deal="${v.deal}" ${d.blocked?"disabled":""}`, "primary full")}`,
      "DISTRIBUTION REVIEW",
    );
  }
  if (v.kind === "bank") return bank();
  if (v.kind === "repay")
    return modal(
      "Reduce your debt",
      `<form id="repay-form"><label>Repayment ($)<input name="amount" type="text" inputmode="decimal" value="${E.dollarInput(Math.min(1000, E.debtTotal(s), s.cash), 2)}" required></label><p>No early repayment penalty. Any loan shark balance is repaid first, including its fixed fee. Keep enough cash for upcoming weekly commitments.</p><button class="primary full">Repay principal</button></form>${s.cash>=E.debtTotal(s)&&E.debtTotal(s)>0?button("Pay in full · includes remaining cents","repayAll","","outline full"):""}`,
      "FIRST PICTURE BANK",
    );
  if (v.kind === "person") {
    const p = E.person(s, v.person);
    return modal(
      h(p.name),
      `<div class="person-heading">${portrait(p, 100)}<div>${pill(p.kind.toUpperCase())}<h3>${h(p.name)}</h3><p>${h(p.gender)} · Age ${p.age} · ${Math.round(p.star)}/100 box-office draw</p><p>Talent estimate ${ratingRange(E.talentEstimate(s, p, p.talent))} · ${p.awards} awards</p></div></div>${talentBadge(p)}${talentAccolades(p)}${talentAwardsHistory(p)}${personalityProfile(p)}${E.freshFace(p) ? `<p class="fresh-note">${p.kind === "director" ? "Emerging director" : "Fresh face"} · no major credits yet.</p>` : ""}${talentRatings(p)}${genreStrengths(p)}<div class="genre-scores">${Object.entries(
        p.genres,
      )
        .map(
          ([g, value]) =>
            `<span>${g}<b>${ratingRange(E.talentEstimate(s, p, value))}</b></span>`,
        )
        .join("")}</div><h3>Availability</h3>${
        p.retired
          ? "<p>Retired from new productions.</p>"
          : p.bookings
              .filter((b) => b.end > s.week)
              .map(
                (b) =>
                  `<p>Booked: weeks ${E.date(b.start).week}–${E.date(b.end).week} (${h(E.movie(s, b.movie)?.title || "Outside production")})</p>`,
              )
              .join("") ||
            '<p class="mint">Available for your next production.</p>'
      }<h3>Films with your studio</h3>${p.history.map((f) => `<div class="award-row"><span>${h(f.title)} · ${f.year}</span><strong>${E.score(f.score)}/100</strong></div>`).join("") || '<p class="muted">No films with your studio yet.</p>'}`,
      "CAREER FILE",
    );
  }
  if (v.kind === "rename")
    return modal(
      "Make it yours",
      `<form id="rename-form"><label>Movie title<input name="title" value="${h(m.title)}" maxlength="60" required></label><button class="primary full">Save title</button></form>`,
    );
  if (v.kind === "cancel")
    return modal(
      "Shelve this picture?",
      `<h3>${h(m.title)}</h3><p>You have spent ${E.accountMoney(m.spent)}. That money is not returned.</p><p>Contract closeout: <strong>${E.money(E.remaining(m) * 0.15)}</strong><br>Future filming spending avoided: <strong>${E.money(E.remaining(m) * 0.85)}</strong></p><p class="muted">Talent fees already paid are nonrefundable. Outstanding bank debt remains.</p>${button("Shelve movie", "confirmCancel", `data-id="${m.id}"`, "danger full")}`,
      "CANCELLATION REVIEW",
    );
  if (v.kind === "upgrade") {
    const u=E.upgradeUnlock(s,v.name),ready=s.prestige>=u.prestige && s.cash>=u.cost;
    return modal(h(u.complete ? v.name : u.title),`<p>${h(u.benefit)}</p><div class="finance-lines"><div><span>Prestige required</span><strong>${u.prestige} · You have ${Math.round(s.prestige)}</strong></div><div><span>Upfront investment</span><strong>${E.money(u.cost)}</strong></div><div><span>Your available cash</span><strong>${E.accountMoney(s.cash)}</strong></div><div><span>Added weekly overhead</span><strong>${E.money(Object.hasOwn(s.departments,v.name)?2:3)}</strong></div></div><p>${s.prestige<u.prestige ? "Build prestige through strong critical reception and awards, then fund this improvement." : s.cash<u.cost ? "The prestige requirement is met. Build cash or arrange financing before investing." : "Both requirements are met. This improvement is permanent."}</p>${!u.complete ? button("Approve investment","confirmUpgrade",`data-name="${h(v.name)}" ${ready ? "" : "disabled"}`,"primary full") : pill("Already owned")}`,"STUDIO UNLOCK");
  }
  if (v.kind === "streaming") return streamingDialog(m);
  if (v.kind === "opening") return openingDialog(m);
  if (v.kind === "awardsInvite") return awardsInvite(v.year);
  if (v.kind === "nominations") return nominationsDialog(v.year);
  if (v.kind === "ceremony") return ceremonyDialog(v.year);
  if (v.kind === "awardsResults") return awardsResults(v.year);
  if (v.kind === "awardsHeadsUp")
    return modal(
      "Awards season is approaching",
      `<div class="ceremony-mark" aria-label="Award">🏆</div><h3>Your ${v.year} releases are in the running.</h3><p>Nominations arrive in January. Winners are announced in March. Release by the end of December to qualify.</p><p class="muted">You can fund a campaign from the Awards screen. A nomination is never guaranteed.</p>${button("Got it · back to the lot", "dismissNotice", "", "primary full")}`,
      "SAVE THE DATES",
    );
  if (v.kind === "prestige") {
    const level = E.PRESTIGE_LEVELS[v.level],
      at = level.at;
    return modal(
      "Your studio just moved up",
      `<div class="prestige-reveal"><span class="laurel">✦</span><span class="eyebrow gold">PRESTIGE LEVEL ${v.level + 1}</span><h2>${h(level.name)}</h2><p>${level.description}</p><div class="benefit-list"><div><strong>${5 + v.level * 2} auditions per role each week</strong><span>Includes a separate allowance for directors on every movie.</span></div><div><strong>Talent negotiations</strong><span>Your reputation helps you negotiate lower talent fees.</span></div><div><strong>Release reach</strong><span>Your reputation helps self-distributed films reach more audiences.</span></div><div><strong>More borrowing room</strong><span>Bank credit limit at least ${E.money(8000 + at * 60)}.</span></div></div><p class="muted small">${at===15 ? "New prestige requirements cleared: specialist departments and expanded facilities." : at===35 ? "New prestige requirements cleared: top-tier departments and advanced facilities." : at===60 ? "New prestige requirements cleared: a full backlot and studio-scale post-production and effects facilities." : "Your reputation keeps improving negotiation and borrowing power."} Each investment still needs cash and the preceding improvements.</p>${button("Choose card packs →", "packs", "", "primary full")}${button("Studio upgrades", "viewUnlocks", "", "outline full")}${button("Back to the lot", "dismissNotice", "", "outline full")}</div>`,
      "AN INDUSTRY MILESTONE",
    );
  }
  if (v.kind === "recap") {
    const r = E.summary(s),
      best = [...s.movies]
        .filter((m) => m.gross > 0)
        .sort((a, b) => b.receipts - b.spent - (a.receipts - a.spent))[0];
    return modal(
      s.endReason || "Your studio so far",
      `<div class="recap"><span class="laurel">❧ ♜ ❧</span><h2>${r.rating}</h2><p>${h(s.name)} · ${Math.min(5, Math.floor(s.week / 52))} years in pictures</p><strong class="opening-number">${r.score}<small> / 100</small></strong><div class="scores">${stat("FINANCIAL HEALTH", Math.round(r.financial))}${stat("PRESTIGE", Math.round(r.prestige))}${stat("AWARDS", r.wins)}</div><p>${r.released} movies released. ${E.money(r.net)} estimated studio value after debt and closeout obligations.</p>${best ? `<p>Your strongest investment: <strong>${h(best.title)}</strong></p>` : ""}<p class="muted small">Rating balances financial health and prestige using their geometric mean. Value includes cash, less debt and unfinished-production closeout, 50% of upgrade investment, and a conservative catalog estimate (${E.money(r.catalogValue)}). Unreleased films receive no speculative value.</p>${button("Explore your studio", "close", "", "outline full")}${button("Start a new studio", "restart", "", "text-button full")}</div>`,
      "YOUR FIVE-YEAR RETROSPECTIVE",
    );
  }
  if (v.kind === "restart")
    return modal(
      "A new opening chapter",
      `<p>This replaces the studio saved on this device with a new cast and a fresh $6,000,000 start. You can export your current save first from Guide & save.</p><form id="restart-form"><label>Studio name<input name="name" value="Silverline Pictures" maxlength="40" required></label><button class="primary full">Start a new five-year run</button></form>`,
    );
  if (v.kind === "help")
    return modal(
      "Welcome to the studio",
      `<div class="guide"><p><strong>Your aim:</strong> build a profitable, respected movie studio over five years. Different mixes of commercial hits and acclaimed films can succeed.</p><ol><li><strong>Build a movie.</strong> Choose a genre, persona, setting, problem and ending in Cards.</li><li><strong>Choose your cast and director.</strong> Audition actors, compare ranges and fees, then hire your cast and director.</li><li><strong>Greenlight.</strong> Split production spending and choose your schedule. Talent is paid immediately; filming is paid weekly.</li><li><strong>Advance weeks.</strong> Resolve production decisions. You can run several movies if your finances and talent schedules allow.</li><li><strong>Release.</strong> Optionally pay for a test screening, select marketing campaigns, and choose a release date after filming, and compare simple distribution offers.</li><li><strong>Build your history.</strong> Follow weekly receipts, make sequels, invest in departments, and campaign for annual awards.</li></ol><p><strong>Money matters.</strong> Ticket sales are not your revenue. Watch studio receipts, weekly commitments, and debt. If cash falls below zero, choose an emergency loan or close your studio.</p><p><strong>Your save:</strong> stored automatically in this browser. Export it before clearing browser data or switching devices. No account or purchase required.</p><div class="button-row">${button("Export save", "export", "", "outline")}<label class="import-label">Import save<input type="file" id="import-save" accept="application/json,.json"></label></div>${button("Start a new studio", "restart", "", "danger-link")}</div>`,
      "THE PRODUCER’S HANDBOOK",
    );
}
function castingShortlist(people, director, count = 3) {
  if (director) return people.slice(0, count);
  const group = (p) =>
    E.freshFace(p) ? "fresh" : p.star >= 60 ? "star" : "working";
  const selected = ["fresh", "working", "star"]
    .map((kind) => people.find((p) => group(p) === kind))
    .filter(Boolean);
  return [...selected, ...people.filter((p) => !selected.includes(p))].slice(
    0,
    count,
  );
}
function interestedIn(p,m,role) {const q=E.quote(s,p,m,role);return !q.refusal && !!(q.personal||q.passion);}
function casting(m, director) {
  const role = view.role ?? 0,
    plan = getProductionPlan(m),
    genre = castingGenre === "all" ? m.genre : castingGenre;
  const people = s.people.filter(
    (p) => p.kind === (director ? "director" : "actor") && !p.retired && (!view.interestedOnly || interestedIn(p,m,role)),
  );
  modal(
    director ? "Find your director" : `Casting: ${m.roles[role].split(" · ")[0]}`,
    `<div class="casting-context"><strong>${h(m.title)}</strong><small>${h(director ? "Lead the creative team" : m.roleDescriptions?.[role] ?? m.roles[role])}</small><span>${director ? "" : roleGuidance(m,role)+"<br>"}${m.genre} · ${plan.duration}-week shoot${view.returnTo === "production" ? " · Returning to your production plan" : ""}</span></div><div class="audition-compact"><strong>▰ Auditions ${E.auditionAllowance(s,m,director ? "director" : role).remaining}/${E.auditionAllowance(s,m,director ? "director" : role).limit}</strong><span>This week · free</span><details><summary aria-label="Audition rules">?</summary><p>Resets next week. More studio prestige unlocks more auditions.</p></details></div>${m.movieCards?'<p class="small muted cast-lift-note">Ticket lift vs current cast. Assumes solid performance; fees excluded.</p>':''}<div class="casting-mode">${button(view.interestedOnly ? "✓ Interested only · Show everyone" : "🌟 Interested talent", "interestedCasting", "", "outline")}${button(view.showAll ? "Show shortlist" : "Browse all", "castingMode", "", "outline")}${!director ? button(view.showAll ? "Audition shown" : "Audition shortlist", "auditionShortlist", `data-id="${m.id}"`, "outline") : ""}</div><details class="casting-filter-details"><summary>Budget, genre & sorting</summary><div class="casting-filters"><label>Fee range<select id="casting-budget">${[
      ["all", "All budgets"],
      ["250", "Under $250,000"],
      ["750", "Under $750,000"],
      ["2000", "Under $2,000,000"],
    ]
      .map(
        ([k, v]) =>
          `<option value="${k}" ${budgetFilter === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Compare genre<select id="casting-genre">${[["all", `${m.genre} (this film)`], ...Object.keys(E.GENRES).map((g) => [g, g])].map(([k, v]) => `<option value="${k}" ${castingGenre === k ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>Sort by<select id="casting-sort">${[
      ["fit", "Genre ability"],
      ["fee", "Lowest fee"],
      ["presence", "Screen presence"],
      ["fame", "Fame"],
      ["fresh", director ? "Emerging directors first" : "Fresh faces first"],
    ]
      .map(
        ([k, v]) =>
          `<option value="${k}" ${castingSort === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select></label></div></details><details class="casting-help"><summary>Ratings & chemistry</summary>${ratingLegend}<p>Chemistry averages across co-stars, up to ±4 performance points. Locks at filming.</p></details><div class="casting-list ${view.showAll ? "" : "shortlist"}">${people
      .filter(
        (p) =>
          budgetFilter === "all" ||
          E.quote(s, p, m, role).low <= Number(budgetFilter),
      )
      .sort((a, b) =>
        !view.showAll &&
        m.parent &&
        E.quote(s, a, m, role).option !== E.quote(s, b, m, role).option
          ? Number(E.quote(s, b, m, role).option) -
            Number(E.quote(s, a, m, role).option)
          : castingSort === "fee"
            ? a.fee - b.fee
            : castingSort === "presence"
              ? b.presence - a.presence
              : castingSort === "fame"
                ? b.star - a.star
                : castingSort === "fresh"
                  ? Number(E.freshFace(b)) - Number(E.freshFace(a)) ||
                    a.fee - b.fee
                  : view.showAll
                    ? b.genres[genre] - a.genres[genre]
                    : b.genres[genre] -
                      Math.log2(1 + b.fee) * 5 -
                      (a.genres[genre] - Math.log2(1 + a.fee) * 5),
      )
      .filter(
        (p) =>
          view.showAll ||
          (E.available(p, s.week, s.week + plan.duration) &&
            !E.quote(s, p, m, role).refusal &&
            !m.contracts.some((c) => c.id === p.id)),
      )
      .flatMap((p, i, list) =>
        view.showAll
          ? [p]
          : i === 0
            ? castingShortlist(list, director, view.visibleCount ?? 3)
            : [],
      )
      .map((p) => {
        const q = E.quote(s, p, m, role),
          aud = m.auditions[E.auditionKey(p, role)],
          booked = !E.available(p, s.week, s.week + plan.duration),
          cast = m.contracts.some((c) => c.id === p.id);
        return `<article class="casting-card"><div class="person-heading">${portrait(p, 52)}<div><h3>${h(p.name)}</h3>${talentBadge(p)}</div>${button("Career ↗", "person", `data-person="${p.id}"`, "text-button")}</div>${talentAccolades(p)}${director?"":chemistryCandidate(m,p,role)}${q.personal ? `<p class="fresh-note">🌟 Loved ${h(q.personal)} · half-rate offer for this role</p>` : q.passion ? '<p class="fresh-note">Passion project · special reduced fee</p>' : ""}<details class="talent-secondary"><summary>Profile & terms</summary><p>Age ${p.age}${p.kind==='actor'?` · Plays ${Math.max(18,p.age-5)}–${p.age+5}`:''}</p>${genreStrengths(p)}${talentRatings(p, genre)}<p>Standard hire adds no new sequel option. Negotiate to add one.</p></details><div class="casting-metrics">${m.movieCards?`<span>Fame<b>★ ${Math.round(p.star)}/100</b></span><span>Est. ticket lift<b>${E.candidateAppeal(s,m,p,role).percent>=0?'+':''}${Math.round(E.candidateAppeal(s,m,p,role).percent)}%</b></span>`:''}${aud===undefined?`<span>Fee<b>${E.money(q.low)}–${E.money(q.high)}</b></span>`:""}${aud === undefined ? "" : `<span>Audition <b>${ratingRange(E.talentEstimate(s,p,aud))}</b></span>`}</div><div class="card-bottom"><small class="${booked ? "peach" : "muted"}">${q.refusal ? h(q.refusal) : cast ? "Already in this cast" : booked ? `Unavailable during your ${plan.duration}-week shoot` : q.option ? "Sequel option available" : ""}</small>${q.refusal ? pill("Not interested") : cast ? "" : booked ? pill("Schedule conflict") : aud === undefined ? E.auditionAllowance(s,m,director ? "director" : role).remaining === 0 ? pill("Weekly limit reached") : button("Hold audition", "audition", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline") : `<div class="quick-offer"><small>${q.grossShare?`${Math.round(q.grossShare*100)}% ticket share · `:""}Due at filming</small>${button("Hire · "+E.accountMoney(standardOffer(q)), "standardOffer", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "primary")}${button("Negotiate →", "offer", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "text-button")}</div>`}</div></article>`;
      })
      .join("")}</div>`,
    director ? "DIRECTOR SEARCH" : "CASTING ROOM",
  );
  const matching = people.filter(
    (p) =>
      !E.quote(s, p, m, role).refusal &&
      (budgetFilter === "all" ||
        E.quote(s, p, m, role).low <= Number(budgetFilter)) &&
      E.available(p, s.week, s.week + plan.duration) &&
      !m.contracts.some((c) => c.id === p.id),
  );
  if (!view.showAll && matching.length > (view.visibleCount ?? 3))
    dialog
      .querySelector(".casting-list")
      .insertAdjacentHTML(
        "afterend",
        button(
          director ? "More directors ↓" : "More actors ↓",
          "moreCasting",
          "",
          "outline full",
        ),
      );
  if (!dialog.querySelector(".casting-card"))
    dialog.querySelector(".casting-list").innerHTML =
      `<p>No candidates match these filters. Try Show everyone or adjust the budget.</p>`;
}
function getProductionPlan(m) {
  if (!productionPlans.has(m.id))
    productionPlans.set(m.id, {
      composer:m.composer??0,
      musicStyle:m.musicStyle??0,
      location:m.location??0,
      effectsApproach:m.effectsApproach??0,
      duration: E.recommendedWeeks(m),
      sets: m.scale === "Blockbuster" ? 3 : 2,
      crew: m.scale === "Blockbuster" ? 3 : 2,
      effects: m.scale === "Blockbuster" ? 3 : 2,
    });
  return productionPlans.get(m.id);
}
function production(m) {
  const plan = getProductionPlan(m);
  modal(
    "Plan the shoot",
    `<p>${h(m.title)} · ${E.scopeName(m.scale)} · ${h(m.genre)}</p>${m.narrativePack?`<div class="story-budget-note">Your story calls for ${E.accountMoney(N.evaluate(m.narrative).effects)} in base ${h(N.packFor(m.narrative).departmentLabel.toLowerCase())} allocation. Underfunding loses 1 quality point per $100,000 short, capped at 8. This is separate from normal production craft.</div>`:""}<form id="production-form"><label>♫ Music style<select name="musicStyle">${E.MUSIC_STYLES.map((style,i)=>`<option value="${i}" ${plan.musicStyle===i?"selected":""}>${h(style.name)}</option>`).join("")}</select><small id="music-style-summary"></small></label><label>Composer<select name="composer">${E.COMPOSERS.map((c,i)=>`<option value="${i}" ${plan.composer===i?"selected":""}>${h(c.name)} · ${i?E.accountMoney(E.scoreCost({...m,composer:i})):"Included"}</option>`).join("")}</select><small id="composer-summary"></small></label><div class="production-choices">${[["location","📍 Filming locations",E.LOCATION_PLANS],["effectsApproach","🎬 Effects approach",E.EFFECTS_PLANS]].map(([key,label,options])=>`<label>${label}<select name="${key}">${options.map((o,i)=>`<option value="${i}" ${plan[key]===i?"selected":""}>${o.name}</option>`).join("")}</select><small id="${key}-summary"></small></label>`).join("")}</div>${["sets", "crew", "effects"].map((key) => `<label class="budget-slider"><span class="slider-heading"><strong>${{ sets: "Sets & locations", crew: "Crew & post-production", effects: "Effects" }[key]}</strong><output id="${key}-cost"></output></span><input type="range" name="${key}" min="0" max="4" step="1" value="${plan[key]}" aria-label="${key} production tier"><span class="slider-ends"><span>Shoestring</span><span>Flagship</span></span><span class="tier-summary" id="${key}-description"></span></label>`).join("")}<label class="budget-slider"><span class="slider-heading"><strong>Filming schedule</strong><output id="duration-value"></output></span><input type="range" name="duration" min="4" max="20" step="2" value="${plan.duration}" aria-label="Filming weeks"><span class="slider-ends"><span>4 weeks · faster</span><span>20 weeks · more time</span></span></label><div id="production-preview"></div></form>`,
    "COSTS YOU CAN SEE",
  );
  dialog.insertAdjacentHTML(
    "beforeend",
    `<div class="action-footer production-footer"><div id="production-total"></div><button type="submit" form="production-form" class="primary">Greenlight production →</button></div>`,
  );
  productionPreview(m);
}
function productionPreview(m) {
  const f = $("production-form");
  if (!f) return;
  const plan = Object.fromEntries(
    [...new FormData(f)].map(([k, v]) => [k, Number(v)]),
  );
  productionPlans.set(m.id, plan);
  m={...m,location:plan.location,effectsApproach:plan.effectsApproach,composer:plan.composer,musicStyle:plan.musicStyle};
  const composer=E.COMPOSERS[plan.composer],pairing=E.musicPairing(m);
  $("music-style-summary").textContent=E.MUSIC_STYLES[plan.musicStyle].feel;
  $("composer-summary").textContent=plan.composer?`${composer.reputation} · ${composer.strengths.join(" / ")}${pairing.specialty?" · Style match":""}`:"Included · Not eligible for Original Score";
  const b = Object.fromEntries(
    ["sets", "crew", "effects"].map((key) => [
      key,
      E.budgetCost(m, key, plan[key]),
    ]),
  );
  if(m.narrativePack){let note=document.getElementById("story-budget-preview");if(!note){note=document.createElement("p");note.id="story-budget-preview";note.className="story-budget-note";f.append(note);}note.textContent=`Story execution: ${N.executionPenalty(m.narrative,b).toFixed(1)} quality points at risk with this ${N.packFor(m.narrative).departmentLabel.toLowerCase()} allocation.`;}
  const breakdown = E.productionCosts(s, m, b, plan.duration).departments;
  for (const [key, department, options] of [["location", "sets", E.LOCATION_PLANS], ["effectsApproach", "effects", E.EFFECTS_PLANS]]) {
    [...f.elements[key].options].forEach((option, i) => {
      const amount = E.productionCosts(s, {...m, [key]: i}, b, plan.duration).departments[department];
      option.textContent = `${options[i].name} — ${E.accountMoney(amount)}`;
    });
    $(`${key}-summary`).textContent = options[plan[key]].desc;
  }
  for (const key of ["sets", "crew", "effects"]) {
    $(`${key}-cost`).textContent = E.accountMoney(breakdown[key]);
    $(`${key}-description`).textContent =
      `${E.BUDGET_TIERS[plan[key]]} · ${E.BUDGET_DETAILS[key][plan[key]]}`;
  }
  $("duration-value").textContent = `${plan.duration} weeks`;
  const costs = E.productionCosts(s, m, b, plan.duration),
    base = E.productionCosts(s, m, b, 8),
    schedule = E.scheduleInfo(plan.duration, m),
    fee = [...m.contracts, m.director]
      .filter(Boolean)
      .reduce((v, c) => v + c.fee + c.optionCost, 0);
  if ($("production-total"))
    $("production-total").innerHTML =
      `<strong>Plan total ${E.accountMoney(m.spent + fee + costs.total)}</strong><small>Production still to pay: ${E.accountMoney(costs.total + s.movies.filter((x) => x.id !== m.id).reduce((v, x) => v + E.remaining(x), 0))} across your slate</small><strong class="${s.cash - fee - costs.total - s.movies.filter((x) => x.id !== m.id).reduce((v, x) => v + E.remaining(x), 0) < 0 ? "negative" : ""}">Cash after commitments: ${E.accountMoney(s.cash - fee - costs.total - s.movies.filter((x) => x.id !== m.id).reduce((v, x) => v + E.remaining(x), 0))}</strong><small>Before overhead, loan payments and release costs.</small>`;
  const booked = [
    ...m.contracts.map((c) => ({ ...c, director: false })),
    ...(m.director ? [{ ...m.director, director: true }] : []),
  ].filter(
    (c) => !E.available(E.person(s, c.id), s.week, s.week + plan.duration),
  );
  $("production-preview").innerHTML =
    `<div class="budget-impact"><span class="eyebrow">WHAT THIS BUDGET BUYS</span><h3>Your production plan</h3><p>Option prices cover your selected shoot length and include owned-facility savings. Adjust the sliders to set each department’s budget.</p><small>Talent fees and marketing are separate. Higher spending does not guarantee a better film.</small></div><div class="schedule-explainer"><span class="eyebrow">FILMING SCHEDULE</span><h3>${plan.duration} weeks on set</h3><p>More weeks allow more rehearsal and coverage, but add costs and exposure to production setbacks.</p><strong>${costs.total >= base.total ? "+" : "−"}${E.accountMoney(Math.abs(costs.total - base.total))} versus an 8-week shoot.</strong></div><div class="finance-lines"><div><span>Cast, director & options · paid now</span><strong>${E.accountMoney(fee)}</strong></div><div><span>Production · paid over ${plan.duration} weeks</span><strong>${E.accountMoney(costs.total)}</strong></div><div><span>Production cost each week</span><strong>${E.accountMoney(costs.weekly)}</strong></div><div><span>Planned total including script</span><strong>${E.accountMoney(m.spent + fee + costs.total)}</strong></div><div><span>Cash after immediate fees</span><strong class="${s.cash - fee < 0 ? "negative" : ""}">${E.accountMoney(s.cash - fee)}</strong></div></div>${
      booked.length
        ? `<section class="conflict-panel"><h3>Let’s fix the casting conflicts</h3>${booked
            .map((c) => {
              const p = E.person(s, c.id);
              return `<div class="role-row">${portrait(p, 40)}<div><strong>${h(p.name)}</strong><small>${c.director ? "Director" : m.roles[c.role]} · Booked during this shoot</small></div>${button("Replace →", "replaceConflict", `data-id="${m.id}" data-role="${c.role ?? 0}" data-director="${c.director}"`, "outline")}</div>`;
            })
            .join(
              "",
            )}<p>Your sliders stay exactly as you set them.</p></section>`
        : ""
    }<p class="muted small">${costs.saving ? `Owned facilities save ${E.accountMoney(costs.saving * schedule.multiplier)}. ` : ""}Marketing and distribution are paid later. You’ll choose your release date once the film is finished.</p>`;
}
function releaseAndDistribution(m) {
  if (m.release === null)
    return `<section class="panel"><span class="eyebrow">THE FILM IS FINISHED</span><h3>Find its opening weekend.</h3><p>Compare audience demand and competing releases, then lock your date.</p>${button("Choose release date →", "release", `data-id="${m.id}"`, "primary full")}</section>`;
  return `<section class="panel"><span class="eyebrow">NEXT ACTION</span><h3>Choose your distribution deal</h3><p>Your release date is set. Choose who releases the film and how much of each ticket payment your studio receives.</p>${button("Choose distribution →", "distribution", `data-id="${m.id}"`, "primary full")}</section>`;
}
function distributionOffers(m) {
 return `<section class="distribution-cards"><p class="muted small">Select a deal to review it before signing.</p>${Object.entries(E.distribution(s,m)).map(([key,d])=>`<article class="distribution-card"><span class="eyebrow">${h(key==='self'?s.name:d.name)}</span><h3>${key==='secure'?'Guaranteed payment':key==='partner'?'Distribution partner':'Self-distribute'}</h3><div class="finance-lines"><div><span>${d.advance-d.cost>=0?'💵 Receive now':'💸 Pay now'}</span><strong>${E.accountMoney(Math.abs(d.advance-d.cost))}</strong></div><div><span>🎟 Your ticket share</span><strong>${Math.round(d.share*100)}%</strong></div><div><span>Reach</span><strong>${d.reach>=1.1?'Wide':d.reach>=1?'Established':'Limited'}</strong></div></div>${d.recoup?`<p>Your ticket payments begin after the distributor recovers ${E.accountMoney(d.recoup)}.</p>`:'<p>Ticket payments start with the first sale.</p>'}${d.blocked?`<p class="peach">New deals reopen in ${d.blocked} weeks</p>`:''}${button('Review this deal →','dealReview',`data-id="${m.id}" data-deal="${key}"`,'outline full')}</article>`).join('')}<small>Ticket shares are before talent payouts.</small></section>`;
}

function releasePlanner(m) {
  if (s.week >= E.END - 1)
    return modal(
      "No release weeks remain",
      `<p>Your five-year run has no future opening weeks left. This film can no longer reach theaters during this run.</p><p class="muted">You can return to the film or continue to your final studio recap.</p>${button("Back to the film", "back", "", "primary full")}`,
      "RELEASE CALENDAR",
    );
  const start = s.week + 1;
  view.releaseWeek ??= start;
  view.calendarMonth ??=
    E.date(view.releaseWeek).year * 12 + E.date(view.releaseWeek).month;
  const weeks = Array.from(
    { length: Math.max(0, E.END - start) },
    (_, i) => start + i,
  ).filter((w) => E.date(w).year * 12 + E.date(w).month === view.calendarMonth);
  const year = Math.floor(view.calendarMonth / 12),
    month = view.calendarMonth % 12;
  const title = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  modal(
    "Release calendar",
    `<section class="screening-option">${m.screen == null ? `<p class="muted small">Optional: hear from a test audience before choosing your release and marketing.</p>${button("Hold test screening · $45,000", "screen", `data-id="${m.id}"`, "outline full")}` : `<p><strong>Test audience: ${E.score(m.screen)}/100</strong><small class="block muted">One audience, not a guarantee of ticket sales.</small></p>`}</section><form id="release-form"><input type="hidden" name="release" id="release-select" value="${view.releaseWeek}"><div class="calendar-nav">${button("←", "releaseMonth", `data-step="-1" aria-label="Previous month" ${view.calendarMonth <= E.date(start).year * 12 + E.date(start).month ? "disabled" : ""}`, "outline")}<h3>${title}</h3>${button("→", "releaseMonth", `data-step="1" aria-label="Next month" ${view.calendarMonth >= E.date(E.END - 1).year * 12 + E.date(E.END - 1).month ? "disabled" : ""}`, "outline")}</div><p class="muted small">Choose an opening week. Time stays paused until you confirm. Only remaining release weeks are shown.</p><div class="release-calendar">${weeks.map((w) => `<button type="button" class="release-week ${w === view.releaseWeek ? "selected" : ""}" data-action="releaseWeek" data-week="${w}" aria-pressed="${w === view.releaseWeek}"><strong>Week ${E.date(w).week}</strong><span>${E.seasonOpportunity(m,month).label}</span><small>${s.rivals.filter((r) => Math.abs(r.week - w) <= 2).length} competing release(s) within 2 weeks</small></button>`).join("")}</div><p><strong>Selected: ${E.date(view.releaseWeek).label} · Week ${E.date(view.releaseWeek).week}</strong></p><div id="release-preview"></div><p class="muted small">The date locks when you confirm. Finish marketing and distribution before opening week.</p><button class="primary full">Lock this release date</button>${button("Discuss this window","releaseTalk",`data-id="${m.id}" data-week="${view.releaseWeek}"`,"outline full")}</form>`,
    "THE FILM HAS WRAPPED",
  );
  releasePreview(m);
}
function releasePreview(m) {
  const week = Number($("release-select").value),
    rivals = s.rivals.filter((r) => Math.abs(r.week - week) <= 2),
    season = E.seasonOpportunity(m,E.date(week).month);
  $("release-preview").innerHTML =
    `<div class="notice-banner"><strong>${season.multiplier>1 ? "Seasonal boost for your film" : "No seasonal boost for this genre"} · ${rivals.length > 2 ? "Crowded" : rivals.length ? "Some competition" : "Quiet window"}</strong></div>${rivals.map((r) => `<div class="award-row"><span>${h(r.title)}<small class="block">${h(E.rivalStudio(r).name)} · ${r.genre} · Week ${E.date(r.week).week}</small></span>${pill(r.genre === m.genre ? "Similar audience" : "Different audience", r.genre === m.genre ? "gold-pill" : "")}</div>`).join("") || "<p>No competing releases announced nearby.</p>"}`;
}
function moneyPreview() {
 const form=$('offer-form')||$('loan-form');if(!form)return;
 const input=form.elements[form.id==='offer-form'?'offer':'amount'];
 let amount;try{amount=E.fromDollars(input.value.replaceAll(",", ""));}catch{amount=NaN;}
 const valid=Number.isFinite(amount)&&amount>=0;
 if(form.id==='offer-form'){
  const q=E.quote(s,E.person(s,view.person),E.movie(s,view.id),view.role);
  if($('option-price'))$('option-price').textContent=valid?E.accountMoney(amount*.2):'—';
  $('offer-total').innerHTML=valid?`<strong>Due when filming starts: ${E.accountMoney(amount*(form.elements.option?.checked?1.2:1))}</strong><small class="block">${q.grossShare?`Plus ${Math.round(q.grossShare*100)}% of studio ticket income`:'No revenue share'}</small>`:'Enter a valid offer.';
  dialog.querySelector('[form="offer-form"]').disabled=!valid;
 }else{
  const bank=E.BANKS.find(b=>b.id===form.elements.bankId.value),max=E.bankAvailable(s,bank.id),ok=valid&&amount>=1&&amount<=max;
  $('loan-preview').innerHTML=valid?`<div class="finance-lines"><div><span>💵 Cash after borrowing</span><strong>${E.accountMoney(s.cash+amount)}</strong></div><div><span>📅 First payment on this loan</span><strong>${E.accountMoney(amount/104+amount*bank.apr/52)}</strong></div></div><small>2 years · Weekly payments decrease. Existing loans are separate.</small>${!ok?'<p class="negative">Choose an amount between $1,000 and '+E.accountMoney(max)+'.</p>':''}`:'Enter a valid loan amount.';
  $('loan-submit').textContent=valid?'Borrow '+E.accountMoney(amount):'Borrow';$('loan-submit').disabled=!ok;
 }
}
function bank() {
  const emergency = s.cash < 0;
  const selected = E.BANKS.find(b => b.id === view.bankId);
  const credit = selected ? E.bankAvailable(s,selected.id) : 0;
  modal(emergency ? "Your studio needs a lifeline." : "Finance your next move.",
    `<p>Choose a bank, then review the payments for your loan.</p>${sharkWarning()}<div class="bank-options">${E.BANKS.map(b => `<button class="campaign ${selected?.id === b.id ? "purchased" : ""}" data-action="selectBank" data-bank="${b.id}" aria-pressed="${selected?.id === b.id}"><strong>${selected?.id===b.id?"✓ Selected · ":""}${b.name}</strong><b>${Math.round(b.apr*100)}% annual interest</b><span>${E.accountMoney(E.bankAvailable(s,b.id))} available</span></button>`).join("")}</div>${selected ? credit >= 1 ? `<form id="loan-form"><input type="hidden" name="bankId" value="${selected.id}"><label>Loan amount ($)<input type="text" inputmode="decimal" name="amount" value="${E.dollarInput(Math.min(Math.floor(credit),Math.max(1000,Math.ceil(-s.cash+E.burn(s)*2))))}" required></label><div class="loan-shortcuts">${button("Cover cash shortfall","loanShortcut",'data-size="shortfall"',"outline")}${button("Maximum available","loanShortcut",'data-size="max"',"outline")}</div><div id="loan-preview"></div><details><summary>Loan terms</summary><p>${Math.round(selected.apr*100)}% annual interest on the balance. Repayment over 2 years. Payments decrease as the balance falls. No early repayment penalty.</p></details><button class="primary full" id="loan-submit">Borrow</button></form>` : `<p>This bank has no further loan available.</p>` : `<p>Select a bank to review its loan.</p>`}${E.sharkAvailable(s) ? `<section class="panel"><h3>Last resort: the loan shark</h3><p>Receive <strong>$2,000,000</strong> now. A fixed $400,000 fee makes <strong>$2,400,000 due in 13 weeks</strong> (about three months). No weekly installments. Payment is automatic after that week’s income. If you cannot pay the full balance, the studio closes. Available once per studio, while at least 13 weeks remain in the demo.</p>${button("Accept loan shark terms · $2,000,000", "sharkLoan", "", "primary full")}</section>` : ""}${emergency ? button("End this studio’s run", "end", "", "danger-link") : ""}`, "STUDIO FINANCING");
  moneyPreview();
  if (s.cash < 0) for (const m of s.movies.filter(m=>m.stage === "catalog" && m.streamingDeal === null)) dialog.querySelector(".modal-body").insertAdjacentHTML("afterbegin",button(`Review streaming offers: ${h(m.title)}`,"streaming",`data-id="${m.id}"`,"outline full"));
}
function checkEmergency() {
  if (s.cash < 0 && !s.ended && !s.epilogue && view?.kind !== "bank")
    open("bank");
}
function nextNotice() {
  if (s.cash < 0 && !s.ended && !s.epilogue && !s.epilogue) {
    open("bank");
    return;
  }
  const n = s.notices[0];
  if (n) {
    const kind = {
      streaming: "streaming",
      opening: "opening",
      awards: "awardsInvite",
      nominations: "nominations",
      prestige: "prestige",
      awardsHeadsUp: "awardsHeadsUp",
    }[n.kind];
    if (kind) open(kind, n);
  } else if (s.ended) open("recap");
  else if(s.movies.some(m=>m.event?.kind==="delay"))open("productionDelay",{id:s.movies.find(m=>m.event?.kind==="delay").id});
  else if(s.movies.some(m=>m.fanCommunity?.ready&&!m.fanCommunity.choice&&!m.fanCommunity.presented))open("fanSentiment",{id:s.movies.find(m=>m.fanCommunity?.ready&&!m.fanCommunity.choice&&!m.fanCommunity.presented).id});
  else render();
}
function lockedAnnouncement() {
  return ["awardsInvite", "nominations", "ceremony"].includes(view?.kind);
}
function acknowledgeCurrentNotice() {
  if (["opening", "prestige", "awardsHeadsUp"].includes(view?.kind)) {
    s.notices.shift();
    save();
  }
}
app.addEventListener("click", handle);
dialog.addEventListener("click", handle);
app.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches('[role="button"]'))
    e.target.click();
});
dialog.addEventListener("cancel", (e) => {
  if(view?.kind==="cards"&&view.panel){e.preventDefault();view.panel=null;view.character=null;view.naming=false;drawDialog();return;}
  if ((s.cash < 0 && !s.ended && !s.epilogue) || lockedAnnouncement())
    e.preventDefault();
  else {
    acknowledgeCurrentNotice();
    view = null;
    render();
  }
});
function handle(e) {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  e.preventDefault();
  const a = b.dataset.action,
    id = b.dataset.id;
  switch (a) {
    case "life":open('life',{section:b.dataset.section});break;
    case "cult":open('cult',{id});break;
    case "sequelCards":open('sequelCards',{id});break;
    case "lifeCult":transact('lifeCult',{id,choice:b.dataset.choice});break;
    case "lifeRival":transact('lifeRival',{rival:b.dataset.rival});break;
    case "lifePoach":transact('lifePoach',{choice:b.dataset.choice});break;
    case "lifeComeback":transact('lifeComeback',{id,person:b.dataset.person});break;
    case "lifeReleasePitch":transact('lifeReleasePitch',{id});break;
    case "lifePassPitch":transact('lifePassPitch',{pitch:b.dataset.pitch});break;
    case "lifePitch":{const x=s.life.pitches.find(x=>x.id===b.dataset.pitch);open("cards",{cards:structuredClone(x.movieCards??COL.blank(s)),title:"",scale:"Small",slot:"genre",pitch:x.id});break;}
    case "passionAudition":{const m=E.movie(s,id),person=m.passion.person;transact('audition',{id,person,role:0},()=>{view={kind:'offer',id,person,role:0,back:{kind:'movie',id}};});break;}
    case "releaseTalk":open('releaseTalk',{id,week:Number(b.dataset.week)});break;
    case "releaseNegotiation":transact('releaseNegotiation',{id,week:Number(b.dataset.week),choice:b.dataset.choice},()=>{view={kind:'movie',id};});break;
    case "client":open("client",{client:b.dataset.client});break;
    case "clientAccept":transact("clientAccept",{client:b.dataset.client});break;
    case "clientDecline":transact("clientDecline",{client:b.dataset.client});break;
    case "clientBind":transact("clientBind",{id,client:b.dataset.client});break;
    case "commission": open("commission");break;
    case "commissionAccept": transact("commissionAccept");break;
    case "commissionBind": transact("commissionBind",{id});break;
    case "commissionExtend": transact("commissionExtend");break;
    case "commissionDecline": transact("commissionDecline");break;
    case "actorPromise": transact("actorPromise",{person:b.dataset.person});break;
    case "directorApproach": transact("directorApproach",{id,choice:b.dataset.choice});break;
    case "fanSentiment":open("fanSentiment",{id});break;
    case "fanResponse": transact("fanResponse",{id,choice:b.dataset.choice});break;
    case "relationship":{const company=b.dataset.company;const directory=document.querySelector('.industry-directory')?.open;transact("relationship",{company,choice:b.dataset.choice});if(directory)document.querySelector('.industry-directory')?.setAttribute('open','');for(const card of document.querySelectorAll('.company-head'))if(card.querySelector('.executive-company>span')?.textContent===company)card.querySelector('details')?.setAttribute('open','');break;}
    case "revealOpening":revealOpening(E.movie(s,view.id));break;
    case "skipOpening":revealOpening(E.movie(s,view.id),true);break;
    case "openingReport":view.replayPremiere=false;drawDialog();focusDialogHeading();break;
    case "replayOpening":view.replayPremiere=true;drawDialog();focusDialogHeading();break;
    case "viewUnlocks":
      acknowledgeCurrentNotice();close();tab="studio";render();break;
    case "openingSection":
      view.openingTab=b.dataset.section;
      drawDialog();
      dialog.querySelector(`[data-section="${view.openingTab}"]`)?.focus({preventScroll:true});
      break;
    case "streaming":
      open("streaming",{id});
      break;
    case "reviewStreaming":
      view.streamingChoice=b.dataset.deal;drawDialog();break;
    case "signStreaming":
      transact("streamingDeal",{id,deal:b.dataset.deal},()=>{view={kind:"movie",id};});
      break;
    case "deferStreaming":
      s.notices=s.notices.filter(n=>!(n.kind==="streaming" && n.id===id));
      save();close();nextNotice();
      break;
    case "marketing":
      open("marketing", { id, back: { kind: "movie", id } });
      break;
    case "selectNoMarketing":
      view.selectedCampaigns = [];
      view.marketingChoice = "none";
      drawDialog();
      break;
    case "selectCampaign": {
      const i = Number(b.dataset.campaign);
      const chosen = view.selectedCampaigns ?? [];
      view.selectedCampaigns = chosen.includes(i) ? chosen.filter(x => x !== i) : [...chosen,i];
      view.marketingChoice = view.selectedCampaigns.length ? "paid" : null;
      drawDialog();
      break;
    }
    case "selectBank":
      view.bankId = b.dataset.bank;
      drawDialog();
      break;
    case "sharkLoan":
      transact("sharkLoan", {}, () => { if (s.cash >= 0) close(); });
      break;
    case "confirmMarketing":
      transact(
        "confirmMarketing",
        { id, none: view.marketingChoice === "none", campaigns: view.selectedCampaigns ?? [] },
        () => {
          view = { kind: "distribution", id, back: { kind: "movie", id } };
        },
      );
      break;

    case "viewCareers":
      open("careers", { id, back: { kind: "opening", id } });
      break;
    case "moreCasting": {
      const scroll = dialog.querySelector(".modal-body").scrollTop;
      view.visibleCount = (view.visibleCount ?? 3) + 3;
      drawDialog();
      dialog.querySelector(".modal-body").scrollTop = scroll;
      break;
    }
    case "castingMode":
      view.showAll = !view.showAll;
      view.visibleCount = 3;
      drawDialog();
      break;
    case "interestedCasting":
      view.interestedOnly=!view.interestedOnly;view.showAll=true;budgetFilter="all";drawDialog();break;
    case "loanShortcut": {
      const f=$('loan-form'),max=E.bankAvailable(s,f.elements.bankId.value);
      f.elements.amount.value=E.dollarInput(b.dataset.size==='max'?Math.floor(max):Math.min(Math.floor(max),Math.max(1,Math.ceil(-s.cash))));moneyPreview();break;
    }
    case "auditionShortlist": {
      const cards = [
        ...dialog.querySelectorAll('[data-action="audition"]'),
      ].map((b) => ({ ...b.dataset }));
      for (const c of cards) {
        const m = E.movie(s,id), p = E.person(s,c.person);
        if (!E.auditionAllowance(s,m,p.kind === "director" ? "director" : Number(c.role)).remaining) break;
        E.act(s, "audition", { id, person: c.person, role: Number(c.role) });
      }
      save();
      drawDialog();
      break;
    }
    case "jumpDecision":
      dialog
        .querySelector(".decision-box")
        ?.scrollIntoView({ block: "center" });
      break;
    case "distribution":
      open("distribution", { id, back: { kind: "movie", id } });
      break;
    case "openingCareer":
      open("person", {
        person: b.dataset.person,
        back: { kind: "opening", id },
      });
      break;
    case "openingSequel":
      acknowledgeCurrentNotice();
      open("sequelReview", { id, back: { kind: "movie", id } });
      render();
      break;
    case "nav":
      close();
      tab = b.dataset.tab;
      render();
      window.scrollTo(0, 0);
      break;
    case "close":
      if (lockedAnnouncement()) return;
      if (s.cash < 0 && !s.ended && !s.epilogue) {
        toast("Accept financing or choose to end the studio run.");
        return;
      }
      acknowledgeCurrentNotice();
      close();
      break;
    case "back": {
      const back = view.back;
      if (back) {
        view = back;
        drawDialog();
      }
      break;
    }
    case "announcements":
      nextNotice();
      break;
    case "replaceConflict":
      budgetFilter = "all";
      castingGenre = "all";
      open(b.dataset.director === "true" ? "director" : "casting", {
        id,
        role: Number(b.dataset.role),
        returnTo: "production",
        back: { kind: "production", id },
      });
      break;
    case "releaseMonth":
      view.calendarMonth += Number(b.dataset.step);
      drawDialog();
      break;
    case "releaseWeek":
      view.releaseWeek = Number(b.dataset.week);
      drawDialog();
      break;
    case "release":
      open("release", { id, back: { kind: "movie", id } });
      break;
    case "dealReview":
      open("dealReview", {
        id,
        deal: b.dataset.deal,
        back: { kind: "distribution", id, back: { kind: "movie", id } },
      });
      break;
    case "nominations":
      open("nominations", { year: Number(b.dataset.year) });
      break;
    case "ackNominations":
      transact("ackNominations", { year: Number(b.dataset.year) }, () =>
        close(),
      );
      nextNotice();
      break;
    case "nominationBack":
      close();
      tab = "awards";
      render();
      break;
    case "awardsInvite":
      open("awardsInvite", { year: Number(b.dataset.year) });
      break;
    case "watchAwards": {
      const year = Number(b.dataset.year),
        a = s.awards.find((x) => x.year === year);
      open("ceremony", {
        year,
        category: Math.min(a.revealed, a.results.length - 1),
      });
      break;
    }
    case "revealAward": {
      const year = Number(b.dataset.year),
        category = Number(b.dataset.category),
        award = s.awards.find((a) => a.year === year);
      if (award.revealed === category) transact("awardReveal", { year });
      break;
    }
    case "nextAward": {
      const year = Number(b.dataset.year),
        category = Number(b.dataset.category) + 1;
      open(category >= 4 ? "awardsResults" : "ceremony", { year, category });
      break;
    }
    case "summarizeAwards": {
      const year = Number(b.dataset.year);
      transact("awardSummary", { year }, () => {
        view = { kind: "awardsResults", year };
      });
      break;
    }
    case "awardsResults":
      open("awardsResults", { year: Number(b.dataset.year) });
      break;
    case "afterAwards":
      close();
      nextNotice();
      break;
    case "filter":
      filter = b.dataset.filter;
      render();
      break;
    case "talentFilter":
      talentFilter = b.dataset.filter;
      render();
      break;
    case "movie":
      open("movie", { id });
      break;
    case "script":
      open("script", { script: b.dataset.script });
      break;
    case "buy":
      transact("buy", { script: b.dataset.script }, (m) => {
        tab = "slate";
        view = { kind: "movie", id: m.id };
      });
      break;
    case "original":
    case "cardNew": if(view?.kind==='opening'){s.notices=s.notices.filter(n=>!(n.kind==='opening'&&n.id===view.id));save();}open('cards',{cards:COL.blank(s),title:'',scale:'Small',slot:'genre'});break;
    case "cardEdit": {const m=E.movie(s,id);open('cards',{id,cards:structuredClone(m.movieCards??COL.blank(s)),title:m.title,scale:m.scale,slot:'genre',mode:m.sequelMode??'continuation'});break;}
    case "packs": open('packs',{back:view?structuredClone(view):null});break;
    case "claimPack": transact('claimPack',{family:b.dataset.family},()=>{toast('New cards added to your collection.');});break;
    case "standingsSort": standingsSort=b.dataset.sort;render();break;
    case "cardSlot":view.panel='picker';view.slot=b.dataset.deck;view.character=null;drawDialog();break;
    case "characterEdit":view.panel='picker';view.character=Number(b.dataset.character);view.slot='persona';drawDialog();break;
    case "characterTab":view.slot=b.dataset.deck;drawDialog();break;
    case "cardDone":view.panel=null;view.character=null;view.naming=false;drawDialog();break;
    case "characterName":view.naming=!view.naming;drawDialog();if(view.naming)dialog.querySelector('[data-character-name]')?.focus();break;
    case "chooseRole":view.panel='roles';drawDialog();break;
    case "cardCheckout":view.panel='checkout';drawDialog();break;
    case "cardPick":{const deck=view.slot,value=b.dataset.card;if(view.character!=null){view.cards.characters[view.character][deck]=value;}else{view.cards[deck]=value;view.panel=null;}drawDialog();break;}
    case "addCharacter":{const role=b.dataset.role;if(!COL.ROLES.includes(role)||view.cards.characters.some(c=>c.role===role))break;view.cards.characters.push({role,persona:'',trait:'',outcome:'',name:''});view.character=view.cards.characters.length-1;view.slot='persona';view.panel='picker';drawDialog();break;}
    case "removeCharacter":{const i=view.character;if(i>0)view.cards.characters.splice(i,1);view.character=null;view.panel=null;drawDialog();break;}
    case "casting":
      budgetFilter = "all";
      castingGenre = "all";
      open("casting", {
        id,
        role: Number(b.dataset.role),
        back: { kind: "movie", id },
      });
      break;
    case "director":
      budgetFilter = "all";
      open("director", { id, back: { kind: "movie", id } });
      break;
    case "offer":
      open("offer", {
        id,
        person: b.dataset.person,
        role: Number(b.dataset.role),
        back: { ...view },
        returnTo: view.returnTo,
      });
      break;
    case "standardOffer": {
      const p=E.person(s,b.dataset.person),m=E.movie(s,id),role=Number(b.dataset.role),q=E.quote(s,p,m,role),returnTo=view?.returnTo;
      transact('hire',{id,person:p.id,role,offer:standardOffer(q),option:false},()=>{
        view={kind:returnTo==='production'?'production':'movie',id,hired:p.id};
        toast('Terms agreed. Payment is due at greenlight.');
      });break;
    }
    case "nextHire": {
      const next=nextHire(E.movie(s,id));budgetFilter='all';castingGenre='all';open(next.kind,{id,role:next.role,back:{kind:'movie',id}});break;
    }
    case "audition": {
      const personId = b.dataset.person;
      const bodyScroll = dialog.querySelector(".modal-body").scrollTop;
      const dialogScroll = dialog.scrollTop;
      if (transact("audition", {
        id,
        person: personId,
        role: Number(b.dataset.role),
      }) && ["casting", "director"].includes(view?.kind)) {
        // Rendering replaces the dialog body. Restore this actor's place, then
        // move keyboard focus to the negotiation action without jumping up.
        const offer = [...dialog.querySelectorAll('[data-action="offer"]')]
          .find(el => el.dataset.person === personId);
        dialog.scrollTop = dialogScroll;
        dialog.querySelector(".modal-body").scrollTop = bodyScroll;
        offer?.focus({ preventScroll: true });
        offer?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      break;
    }
    case "personalOffer":
      open("personalOffer",{person:b.dataset.person});break;
    case "auditionInterest":
      transact("audition",{id,person:b.dataset.person,role:Number(b.dataset.role)},()=>{view={kind:"offer",id,person:b.dataset.person,role:Number(b.dataset.role),back:{kind:"movie",id}};});break;
    case "person":
      open("person", {
        person: b.dataset.person,
        back: view ? { ...view } : null,
      });
      break;
    case "production":
    case "rename":
    case "cancel":
      open(a, { id });
      break;
    case "screen":
      transact("screen", { id });
      break;
    case "campaign":
      transact("campaign", { id, campaign: Number(b.dataset.campaign) });
      break;
    case "distribute":
      transact("distribute", { id, deal: b.dataset.deal }, () => {
        view = { kind: "movie", id };
      });
      break;
    case "event":
      transact("event", { id, choice: b.dataset.choice },()=>{if(view?.kind==="productionDelay")view={kind:"movie",id};});
      break;
    case "confirmCancel":
      transact("cancel", { id }, () => close());
      break;
    case "sequel":
      open("sequelReview", { id, back: { kind: "movie", id } });
      break;
    case "confirmSequel":
      transact("sequel", { id, rehire: b.dataset.rehire === "true" }, (m) => {
        view = { kind: "movie", id: m.id };
        tab = "slate";
      });
      break;
    case "awardCampaign":
      transact("awardsCampaign", { id });
      break;
    case "upgrade":
      open("upgrade", { name: b.dataset.name });
      break;
    case "confirmUpgrade":
      transact("upgrade", { name: b.dataset.name }, () => close());
      break;
    case "repayAll":
      transact("repay",{amount:E.debtTotal(s)},()=>close());break;
    case "bank":
    case "repay":
    case "help":
    case "recap":
    case "restart":
      open(a);
      break;
    case "end":
      transact("end", {}, () => {
        view = { kind: "recap" };
      });
      break;
    case "calendarFromMovie":
      close();
      tab = "calendar";
      render();
      break;
    case "advanceDecision": {
      const blocked=E.decisionStop(s);
      if(blocked){toast(blocked);break;}
      close();
      const result=transact('nextDecision');
      if(result){nextNotice();if(!view){
        const m=s.movies.find(x=>x.event||['packaging','ready'].includes(x.stage));
        if(m)open('movie',{id:m.id});
      }toast(`${result.weeks} week${result.weeks===1?'':'s'} advanced. ${result.reason}`);}
      break;
    }
    case "nextDecision": {
      const m = s.movies.find((m) => m.event);
      if (m) open("movie", { id: m.id });
      break;
    }
    case "next": {
      if (requireReleaseDate()) break;
      if (s.notices.length || s.epilogue) {
        nextNotice();
        break;
      }
      close();
      const due = s.movies.find(
        (m) =>
          m.stage === "ready" && m.release !== null && m.release <= s.week + 1,
      );
      if (due) {
        open("distribution", {
          id: due.id,
          back: { kind: "movie", id: due.id },
        });
        toast("Choose a distributor before the release date.");
        break;
      }
      if (transact("next")) {
        nextNotice();
        if (!view) requireReleaseDate();
      }
      break;
    }
    case "dismissNotice":
      s.notices.shift();
      save();
      close();
      nextNotice();
      break;
    case "export": {
      const blob = new Blob([JSON.stringify(s)], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "moviesim-studio-save.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Studio save exported.");
      break;
    }
  }
}
dialog.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target,
    d = Object.fromEntries(new FormData(f)),
    v = { ...view };
  if(f.id === "card-form") {
    transact(view.id?'cardRewrite':'cardMovie',{id:view.id,title:d.title,scale:view.scale,cards:view.cards,pitch:view.pitch,mode:view.mode??'continuation'},m=>{view={kind:'movie',id:m.id};tab='slate';});
  }
  if (f.id === "offer-form")
    transact(
      "hire",
      {
        id: v.id,
        person: v.person,
        role: v.role,
        offer: E.fromDollars(d.offer.replaceAll(",", "")),
        option: d.option === "on",
      },
      () => {
        view = {
          kind: v.returnTo === "production" ? "production" : "movie",
          id: v.id, hired: v.person,
        };
        toast("Terms agreed. Payment is due at greenlight.");
      },
    );
  if (f.id === "production-form")
    transact(
      "greenlight",
      {
        id: v.id,
        ...Object.fromEntries(
          Object.entries(d).map(([k, val]) => [
            k,
            ["duration","location","effectsApproach","composer","musicStyle"].includes(k)
              ? Number(val)
              : E.budgetCost(E.movie(s, v.id), k, Number(val)),
          ]),
        ),
      },
      () => {
        view = { kind: "movie", id: v.id };
      },
    );
  if (f.id === "release-form")
    transact("setRelease", { id: v.id, release: Number(d.release) }, () => {
      view = {
        kind: "marketing",
        id: v.id,
        back: { kind: "movie", id: v.id },
      };
    });
  if (f.id === "loan-form")
    transact("loan", { amount: E.fromDollars(d.amount.replaceAll(",", "")), bankId: d.bankId }, () => {
      if (s.cash >= 0) close();
    });
  if (f.id === "repay-form")
    transact("repay", { amount: E.fromDollars(d.amount) }, () => close());
  if (f.id === "rename-form")
    transact("rename", { id: v.id, title: d.title }, () => {
      view = { kind: "movie", id: v.id };
    });
  if (f.id === "restart-form") {
    s = E.newGame(Date.now() >>> 0, d.name);
    productionPlans.clear();
    castingGenre = talentFilter = budgetFilter = "all";
    castingSort = "fit";
    tab = "slate";
    filter = "active";
    save();
    close();
    render();
  }
});
dialog.addEventListener("input", (e) => {
  if(e.target.name==="publicPromise"){view.publicPromise=e.target.value;}
  if (e.target.closest("#offer-form, #loan-form")) moneyPreview();
  if (e.target.closest("#production-form"))
    productionPreview(E.movie(s, view.id));
});
dialog.addEventListener("change", async (e) => {
  if (e.target.id === "release-select") releasePreview(E.movie(s, view.id));
  if (e.target.id === "casting-genre") {
    castingGenre = e.target.value;
    drawDialog();
  }
  if (e.target.id === "casting-sort") {
    castingSort = e.target.value;
    drawDialog();
  }
  if (e.target.id === "casting-budget") {
    budgetFilter = e.target.value;
    drawDialog();
  }
  if (e.target.id === "import-save") {
    const previousState = s;
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3000000) throw Error("File too large");
      const data = JSON.parse(await file.text());
      if (
        ![1, 2, 3, 4, E.VERSION].includes(data.version) ||
        !Array.isArray(data.movies) ||
        !Array.isArray(data.people) ||
        !data.departments ||
        !Number.isFinite(data.cash) ||
        !Number.isInteger(data.week) ||
        data.week < 0 ||
        data.week > 260
      )
        throw Error("Invalid save");
      s = E.migrateSave(data);
      render();
      close();
      checkEmergency();
      save();
      toast("Studio save restored.");
    } catch {
      s = previousState;
      render();
      toast(
        "This file is not a supported MovieSim save. Your current studio has been kept.",
      );
    }
  }
});
save();
render();
checkEmergency();
if (s.notices.length || s.epilogue) nextNotice();

if (!view) requireReleaseDate();

document.addEventListener('focusout',e=>{
 if(!e.target.matches('#offer-form input[name="offer"], #loan-form input[name="amount"]'))return;
 try{const value=E.fromDollars(e.target.value.replaceAll(",", ""));if(Number.isFinite(value)&&value>=0)e.target.value=E.dollarInput(value);}catch{}moneyPreview();
});

function companyHead(company) {
 const head=E.COMPANY_HEADS.find(x=>x.company===company);
 const type=head?.role==='Distribution head'?'distribution':head?.role==='Streaming head'?'streaming':'studio';
 const title={distribution:'President of Distribution',streaming:'Head of Film Acquisitions',studio:'Studio President'}[type];
 return head?`<article class="company-head executive-${type}" aria-label="${h(head.name)}, ${h(title)}, ${h(head.company)}"><div class="executive-company"><span>${h(head.company)}</span><small>${type==='streaming'?'STREAMING':type==='distribution'?'DISTRIBUTION':'FILM STUDIO'}</small></div><div class="executive-identity"><img src="./assets/executives/head-${head.photo}.jpg" width="96" height="112" alt="${h(head.name)}" loading="lazy"><div><h3>${h(head.name)}</h3><p class="executive-title">${h(title)}</p></div></div><div class="executive-priority"><span>BUSINESS PRIORITIES</span><p>${h(head.priority)}</p></div>${relationshipPanel(head)}</article>`:'';
}
function industryDirectory() {
 return `<details class="panel industry-directory"><summary>Meet the company heads</summary><p class="muted small">The people behind the studios, distributors and streaming services.</p>${E.COMPANY_HEADS.map(x=>companyHead(x.company)).join('')}</details>`;
}

function relationshipPanel(head){
 const r=E.executiveRelationship(s,head.company),args=`data-company="${h(head.company)}"`;
 const action=(label,choice,disabled=false)=>button(label,'relationship',`${args} data-choice="${choice}" ${disabled?'disabled':''}`,'outline full');
 const request={campaign:'Co-fund an industry campaign',screening:'Sponsor a private filmmaker screening',introduction:'Underwrite a talent networking showcase'}[r.request];
 return `<section class="relationship-panel"><strong>${h(r.label)} · ${r.trust}/100 trust</strong><meter min="0" max="100" value="${r.trust}" aria-label="Trust with ${h(head.name)}">${r.trust}</meter><p class="small">${r.blocked?`New deals reopen in ${r.blocked} weeks. Existing contracts continue.`:r.trust>=75?'15% higher advances and upfront streaming payments.':r.trust>=60?'5% higher advances and upfront streaming payments.':r.trust<35?'25% lower advances and upfront streaming payments.':'Standard deal terms.'}</p>${r.last?`<p class="small muted">${h(r.last)}</p>`:''}<details><summary>Meet & negotiate</summary>${r.available?`<h4>${request}</h4><p class="small">${h(head.name)} requests ${E.money(r.cost)}. Accept: +15 trust. Counter at 60 trust: half cost, +5 trust. Refuse: −20 trust and eight weeks without new business. The next request is available 12 weeks after your response.</p>${action('Accept · '+E.money(r.cost),'accept')}${action('Counter · '+E.money(r.cost/2),'counter',r.trust<60)}${action('Refuse request','decline')}`:`<p class="small">Next request available in ${r.nextRequest} weeks.</p>`}<p class="small">Resolution meeting: $50,000, +10 trust and four weeks off a refusal. Once every eight weeks.</p>${action(r.nextMeeting?`Meeting available in ${r.nextMeeting} weeks`:'Arrange resolution meeting','repair',r.nextMeeting>0||(r.trust>=75&&!r.blocked))}<p class="small">At 75 trust: a one-time sponsor introduction pays $125,000 and uses 10 trust.</p>${action(r.opportunityUsed?'Introduction already used':'Request sponsor introduction','opportunity',r.trust<75||r.blocked>0||r.opportunityUsed)}</details></section>`;
}

function storyReport(m){return m.scifiReception?scifiReport(m):'';}

function sfArt(row,col){return `<span class="sf-art" style="--sx:${col*25}%;--sy:${row===5?100:row*171.4/950.6*100}%;--sh:${row===5?423.4:654.6}%" aria-hidden="true"></span>`;}
function receptionDetails(r){
 if(r.version!==2)return '';
 const signed=n=>(n>0?'+':'')+Math.round(n*10)/10;
 return `<section class="sf-report-panel"><h3>Your ending landed</h3><p>${h(r.interpretation)}</p><details><summary>Why these scores?</summary><p class="small">Execution drives the score. Card effects are bounded; these results are saved.</p>${r.groups.map(g=>`<h4>${h(g.name)} · ${g.score} / 100 · ${Math.round(g.share*100)}% of audience</h4><div class="reception-breakdown">${Object.entries(g.breakdown).map(([k,v])=>`<span>${h(k)} <strong>${signed(v)}</strong></span>`).join('')}</div>`).join('')}<h4>Critics</h4><div class="reception-breakdown">${Object.entries(r.criticBreakdown).map(([k,v])=>`<span>${h(k)} <strong>${signed(v)}</strong></span>`).join('')}</div>${r.coherence.rules.map(([reason,v])=>`<p>${v>0?'✓':'△'} ${h(reason)}</p>`).join('')}${r.continuity<0?'<p>Returning the same lead after their death breaks continuity. This version does not yet offer prequel or revival cards.</p>':''}</details></section>`;
}
function scifiReport(m){
 const r=m.scifiReception;if(!r)return '';
 const verdict=value=>value>=80?'Loved it':value>=65?'Positive':value>=50?'Mixed':'Disappointed';
 const feedback=[...r.feedback].sort((a,b)=>b.value-a.value),unique=feedback.filter((c,i,a)=>a.findIndex(x=>x.dimension===c.dimension)===i);
 const rows=unique.length>3?[unique[0],unique[1],unique.at(-1)]:unique;
 const recovered=m.receipts>=m.spent,forecast=m.expectations,opening=!forecast?'No saved forecast':m.opening<forecast.low?'Below expectations':m.opening>forecast.high?'Above expectations':'Within expectations';
 const weeks=m.boxWeeks.length,hold=weeks>1?m.boxWeeks.at(-1)/Math.max(1,m.boxWeeks.at(-2)):null;
 const state=m.stage==='catalog'?'Theatrical run complete':`Week ${Math.max(1,weeks)} in theaters`;
 return `<article class="sf-report"><header class="sf-report-hero">${poster(m,true)}<div><span class="eyebrow">POST-RELEASE REPORT</span><h2>${h(m.title)}</h2><p>${h(m.genre)} · ${state}</p><p>${h(m.premise)}</p><em>${m.fans>=75?'An audience worth building on.':m.fans<50?'A concept still searching for its audience.':'A mixed reception. Lessons for the next film.'}</em></div></header><div class="sf-score-grid"><section><span>FANS</span><strong>${Math.round(m.fans)}<small> / 100</small></strong><p>${verdict(m.fans)}</p></section><section><span>CRITICS</span><strong>${Math.round(m.critics)}<small> / 100</small></strong><p>${verdict(m.critics)}</p></section><section><span>BOX OFFICE</span><strong>${E.accountMoney(m.gross)}</strong><p>Gross ticket sales to date</p></section></div><div class="sf-finances"><div>Studio receipts<strong>${E.accountMoney(m.receipts)}</strong></div><div>Total film spending<strong>${E.accountMoney(m.spent)}</strong></div><div>${filmResult(m)}</div></div>${receptionDetails(r)}<section class="sf-report-panel"><h3>Who connected with it?</h3><p class="muted small">Simulated reception among viewers drawn to this concept.</p>${[...r.groups].sort((a,b)=>b.share-a.share).map(g=>`<div class="sf-audience"><strong>${h(g.name)}</strong><meter min="0" max="100" value="${g.score}" aria-label="${h(g.name)} reception: ${g.score} out of 100"></meter><span>${verdict(g.score)} · ${g.score}</span></div>`).join('')}</section>${r.version===2?`<section class="sf-report-panel"><h3>What worked. What held it back.</h3>${REC.observations(m).map(x=>`<p>${h(x)}</p>`).join('')}</section>`:rows.length?`<section class="sf-report-panel"><h3>What worked. What held it back.</h3>${rows.map(c=>`<div class="sf-feedback"><div class="sf-mini">${cardArt(m.genre,c.row,c.col)}<strong>${h(c.name)}</strong></div><div><h4>${c.value>=75?'Strong':c.value<55?'Needs work:':'Room to develop:'} ${h(c.label.toLowerCase())}</h4><p>${h(c.name)} put emphasis on ${h(c.label.toLowerCase())}. ${c.value>=75?'The finished production delivered well in this area.':c.value<55?'Execution fell short in this area.':'Execution was serviceable, with room to improve.'}</p></div></div>`).join('')}<p class="small muted">These observations use delivered writing, performances, direction and craft, including production consequences.</p></section>`:''}${nextMovieExperiment(m)}<section class="sf-report-panel"><h3>Release trajectory</h3><div class="sf-trajectory"><div><small>OPENING</small><strong>${opening}</strong></div><div><small>AUDIENCE RESPONSE</small><strong>${m.fans>=75?'Strong':m.fans<50?'Weak':'Mixed to positive'}</strong></div><div><small>${m.stage==='catalog'?'THEATRICAL RUN':'LATEST WEEK'}</small><strong>${m.stage==='catalog'?'Complete':hold===null?'Too early to assess':hold>=.75?'Holding well':hold>=.5?'Easing':'Falling quickly'}</strong></div></div></section><p class="small muted">${recovered?'Film receipts exceed its costs so far.':'The film has not yet recovered its costs.'} Studio overhead is separate. ${m.stage==='theaters'?'The theatrical run is still earning.':''}</p><details><summary>People & production history</summary>${filmLife(m)}${clientFilm(m)}${commissionFilm(m)}${delayStatus(m)}${chemistryFilm(m)}${peopleFilm(m)}</details></article>`;
}

function personalityProfile(p){
 const x=p.personality;if(!x)return '';const q=x.promise;
 return `<section class="people-panel"><span class="eyebrow">THE PERSON BEHIND THE PORTRAIT</span><h3>${p.kind==='director'?h(E.workingStyle(p).name):'A new chapter'}</h3>${p.kind==='actor'?chemistryProfile(p):''}<p>${p.kind==='director'?h(E.workingStyle(p).pitch):`“I’d like a chance to make ${h(x.goal)}.”`}</p>${p.kind==='director'?`<p>${h(E.workingStyle(p).detail)} Choose whether to back it for each film.</p>`:q?`<p class="promise-note">${q.movie?`Your promise is in production: ${h(E.movie(s,q.movie)?.title??'the project')}. Fulfilled when the film releases.`:`You promised a ${h(q.genre)} role. ${Math.max(0,q.due-s.week)} weeks left to start filming.`}</p>`:!p.retired&&s.week<=225?`${button('Promise a '+h(x.goal)+' role','actorPromise',`data-person="${p.id}"`,'outline')}<p class="small muted">Start filming with this actor in that genre within 26 weeks. +4 to their delivered performance on the promised project; the relationship strengthens when it releases. A missed promise hurts trust. No immediate charge.</p>`:''}<p class="small">Relationship: ${x.rapport>=8?'Trusted collaborator':x.rapport<0?'Trust needs rebuilding':'Getting to know each other'}. New fee quotes reflect up to a 5% relationship adjustment; signed contracts stay fixed.</p>${x.memories.length?`<h4>What they remember</h4>${x.memories.slice(-3).reverse().map(a=>`<p class="people-memory">${h(a.text)}</p>`).join('')}`:'<p class="small muted">Your shared story is still unwritten.</p>'}</section>`;
}
function peopleBoard(){
 const fans=s.movies.filter(m=>m.fanCommunity?.ready&&!m.fanCommunity.choice),promises=s.people.filter(p=>p.personality?.promise);
 if(!fans.length&&!promises.length)return '';
 return `<section class="people-panel"><span class="eyebrow">PEOPLE & AUDIENCES</span><h3>Stories beyond the screen</h3>${fans.map(m=>`<div class="people-row"><div><strong>${h(m.title)}</strong><small>${h(m.fanCommunity.title)}</small></div>${button('Fan sentiment','fanSentiment',`data-id="${m.id}"`,'outline')}</div>`).join('')}${promises.map(p=>`<div class="people-row"><div><strong>${h(p.name)}</strong><small>${p.personality.promise.movie?'Promised project underway':`${h(p.personality.promise.genre)} role · ${Math.max(0,p.personality.promise.due-s.week)} weeks to start filming`}</small></div>${button('Your promise','person',`data-person="${p.id}"`,'outline')}</div>`).join('')}</section>`;
}
function peopleFilm(m){
 if(m._sfDetails)return "";
 let content='';const d=m.director&&E.person(s,m.director.id);
 if(m.stage==='packaging'){
  const promises=m.contracts.map(c=>E.person(s,c.id)).filter(p=>p.personality?.promise?.genre===m.genre&&!p.personality.promise.movie);
  if(promises.length)content+=`<p>${promises.map(p=>h(p.name)).join(', ')}: this film can fulfill your promise. Start filming before the deadline; release completes it.</p>`;
  if(d){const style=E.workingStyle(d),choice=m.directorApproach?.person===d.id?m.directorApproach.choice:'balanced';content+=`<div class="people-director">${portrait(d,64)}<div><h3>${h(d.name)} · ${h(style.name)}</h3><p>“${h(style.pitch)}”</p></div></div><p>${h(style.detail)}</p><div class="people-options">${button('Back this approach','directorApproach',`data-id="${m.id}" data-choice="back" aria-pressed="${choice==='back'}"`,choice==='back'?'primary':'outline')}${button('Keep a balanced approach','directorApproach',`data-id="${m.id}" data-choice="balanced" aria-pressed="${choice==='balanced'}"`,choice==='balanced'?'primary':'outline')}</div><p class="small muted">Balanced adds no style modifiers. Your choice locks at filming; replacing the director resets it.</p>`;}
 }
 if(m.peopleStory?.released){const promises=m.peopleStory.actors.filter(a=>a.supported);if(promises.length)content+=`<h3>A promise kept</h3><p>${promises.map(a=>h(E.person(s,a.id).name)).join(', ')} got the ${h(m.genre)} opportunity you promised in ${h(m.title)}. They remember your support.</p>`;if(m.peopleStory.backed)content+=`<p>${h(d?.name??'Your director')} remembers that you backed their approach.</p>`;}
 const f=m.fanCommunity;
 if(f?.ready)content+=`<div class="people-row"><strong>♥ ${h(f.title)}</strong>${button(f.choice?'View response':'Hear from fans','fanSentiment',`data-id="${m.id}"`,'outline')}</div>`;
 return content?`<section class="people-panel">${content}</section>`:'';
}

function commissionBoard(){const c=s.marsTravel,d=c.deal;return `<section class="commission-banner"><div class="ceo-avatar" aria-hidden="true">EV</div><div><span class="eyebrow">MARS TRAVEL · ELENA VALE, CEO</span><h3>${d?'A future to deliver':E.commissionAvailable(s)?'A colony. A deadline. A commission.':'Your relationship with Mars Travel'}</h3><p>${d?`${E.accountMoney(d.payment)} on delivery · ${Math.max(0,d.due-s.week)} weeks remaining`:h(c.last)}</p></div>${button(d?'Review commitment':'Meet Elena','commission','','outline')}</section>`;}
function commissionDialog(){
 const c=s.marsTravel,d=c.deal,available=E.commissionAvailable(s),payment=d?.payment??Math.min(1000,600+c.wins*200);
 const film=d?.movie&&E.movie(s,d.movie);
 return modal('Mars Travel',`<div class="brief-person"><span class="ceo-avatar">EV</span><span>Elena Vale · CEO<br><em>“Put a colony on the big screen.”</em></span></div><div class="client-metrics">${stat('ON DELIVERY',E.accountMoney(payment))}${stat(d?'TIME LEFT':'DEADLINE',`${d?Math.max(0,d.due-s.week):COMM.WEEKS} weeks`)}</div><div class="client-requirements"><span>Sci-fi</span><span>Frontier</span><span>No score target</span></div>${d||available?briefEstimate(COMM.WEEKS,null,d):''}${d?film?`<p>Attached: <strong>${h(film.title)}</strong></p>${button('Open film →','movie',`data-id="${film.id}"`,'primary full')}`:`<p>Attach one film before shooting.</p>${s.movies.filter(E.commissionEligible).map(m=>button('Attach '+h(m.title),'commissionBind',`data-id="${m.id}"`,'outline full')).join('')}${button('Create movie →','cardNew','','primary full')}`:available?`${button('Accept · '+E.accountMoney(payment),'commissionAccept','','primary full')}${button('Pass','commissionDecline','','text-button full')}`:`<p>${!COL.owns(s,'genre','Sci-fi')||!COL.owns(s,'setting','Frontier')?'Collect Sci-fi and Frontier to unlock.':c.strikes>=2?'Requests ended.':s.week+COMM.WEEKS>=E.END?'No time for another brief.':`Returns in ${Math.max(0,c.nextOffer-s.week)} weeks.`}</p>`}<p class="brief-stakes">Miss: no payment · 52-week cooldown.</p><details class="brief-details"><summary>Terms & history</summary><p>Release with Frontier by the agreed date. Attach before filming; attachment is final. No score or budget target. Normal movie costs apply. Payment counts as studio receipts, not box office; you retain rights.</p><p>One extension: +2 weeks, −25% fee. Request at least two weeks before the deadline. Two misses end requests; success unlocks another offer after 12 weeks.</p>${d?button(d.extended?'Extension used':`Extend +2 weeks · fee ${E.accountMoney(d.payment*.75)}`,'commissionExtend',`${d.extended||s.week>d.due-2||d.due+2>=E.END?'disabled':''}`,'outline full'):''}${c.history.slice(-5).reverse().map(x=>`<p>${h(x.title)} · ${h(x.outcome)}${x.payment?' · '+E.accountMoney(x.payment):''}</p>`).join('')}</details>`,'CLIENT BRIEF');
}
function commissionFilm(m){const d=s.marsTravel?.deal;if(d?.movie===m.id)return `<section class="people-panel"><span class="eyebrow">MARS TRAVEL COMMISSION</span><p>${E.accountMoney(d.payment)} for release within ${Math.max(0,d.due-s.week)} weeks. Frontier must remain in your Setting cards.</p><p>${COL.has(m,'setting','Frontier')?'✓ Required card is present.':'Frontier is missing. Revise the cards before filming to qualify.'}</p>${button('Review deadline & extension','commission','','outline')}</section>`;if(d&&!d.movie&&E.commissionEligible(m))return `<section class="people-panel"><p>Mars Travel is waiting for a film. Attaching this project is final; release it with Frontier by the agreed deadline.</p>${button('Attach this film to Mars Travel','commissionBind',`data-id="${m.id}"`,'outline')}</section>`;const paid=(s.marsTravel?.history??[]).filter(x=>x.movie===m.id&&x.outcome==='delivered').reduce((n,x)=>n+x.payment,0);if(paid)return `<p class="commission-paid">Mars Travel paid ${E.accountMoney(paid)}. Included in studio receipts; excluded from box office.</p>`;return '';}
function delayPanel(m){const crew=m.event?.index===5,d=E.person(s,m.director.id),choices=E.delayChoices(s,m);return `<section class="decision-box"><div class="people-director">${crew?'<span class="client-avatar">NR</span>':portrait(d,72)}<div><span class="eyebrow">${crew?'NORA REED · PRODUCTION MANAGER':h(d.name)+' · DIRECTOR'}</span><h3>${h(m.event.title)}</h3></div></div><blockquote>${h(m.event.text)}</blockquote><p>Choose a creative response. Paying more cannot remove the time requirement.</p><div class="choice-stack">${choices.map(c=>button(`${h(c.label)}<small>${c.weeks} extra week(s) · ${c.damage?c.damage+' quality penalty':'quality protected'}${c.conflictWeeks?' · includes '+c.conflictWeeks+' weeks waiting for existing talent bookings':''}</small><small>${c.weeks?E.accountMoney(c.holdingPerWeek*c.weeks)+' total holding costs over the pause':'No pause holding costs'}. Expected wrap: ${E.date(c.wrap).label}, week ${E.date(c.wrap).week}.${c.wrap>=E.END?' Beyond the five-year window.':''}</small>${deadlineWindows(s,m,c.wrap).map(d=>`<small class="${d.slack<0?'negative':d.slack<3?'peach':'mint'}">${h(d.name)} · ${E.accountMoney(d.payment)} · ${d.slack<0?`${-d.slack} weeks past deadline at earliest release`:d.slack===0?'No schedule slack':`${d.slack} weeks of schedule slack`}</small>`).join('')}`,'event',`data-id="${m.id}" data-choice="${c.choice}"`,'choice')).join('')}</div><p class="small muted">Paused productions retain crew at 10% of their normal weekly filming cost; studio overhead and loan payments continue. Filming progress stops, but other movies continue. Booking conflicts can extend the pause. Release is scheduled after wrap.</p>${s.marsTravel?.deal?.movie===m.id?`<p class="promise-note">Mars Travel deadline: ${Math.max(0,s.marsTravel.deal.due-s.week)} weeks away. You still need at least one week after wrap to release.</p>`:''}</section>`;}
function delayStatus(m){
 const d=m.delayPlan;if(!d)return '';
 if(m.stage==='filming'&&d.remaining)return `<p class="compact-status">Paused · ${d.remaining}w · ${E.accountMoney(m.weekly*.1)}/week</p>`;
 if(!d.history.length)return '';
 return `<details class="delay-history"><summary>Setbacks · +${d.elapsed}w · ${E.accountMoney(d.holdingPaid)}</summary>${d.history.map(x=>`<div class="compact-history"><span>${h(x.label?.split(' · ')[0]??x.title)}</span><strong>+${x.weeks}w</strong><span>${x.damage?'−'+x.damage+' quality':'✓ Quality kept'}</span></div>`).join('')}<small>Holding costs included in film spending.</small></details>`;
}

function chemistryEffect(n){return `${n>0?'+':''}${Number(n.toFixed(1))}`;}
function chemistryCandidate(m,p,role){
 const pairs=CH.preview(s,m,p,role);
 return `<div class="chemistry-inline"><span>${h(CH.style(p))}</span>${pairs.map(pair=>`<span>${h(E.person(s,pair.ids[1]).name)} <b class="${pair.effect>0?'mint':pair.effect<0?'negative':'muted'}">${chemistryEffect(pair.effect)}</b></span>`).join('')}</div>`;
}
function chemistryFilm(m){
 const snapshot=m.castChemistry;if(!snapshot&&!['development','packaging'].includes(m.stage))return '';
 const pairs=snapshot?.pairs??CH.pairs(s,m);if(!pairs.length)return '';
 return `<details class="chemistry-panel"><summary>Cast chemistry · ${pairs.length} pair${pairs.length===1?'':'s'}</summary>${pairs.map(pair=>`<div class="chemistry-compact"><span>${pair.ids.map(id=>h(E.person(s,id).name)).join(' & ')}</span><b class="${pair.effect>0?'mint':pair.effect<0?'negative':'muted'}">${chemistryEffect(pair.effect)}</b></div>`).join('')}<details><summary>Details</summary><p>Locks at filming. Pair contributions average up to ±4 performance points.</p>${pairs.filter(p=>p.outcome).map(p=>`<p>${h(p.outcome)}</p>`).join('')}</details></details>`;
}
function chemistryProfile(p){
 const history=CH.relationships(s,p.id).slice(0,4);
 return `<div class="chemistry-note"><strong>${h(CH.style(p))}</strong>${history.map(r=>`<p>With ${h(E.person(s,r.other).name)} · ${r.films} shared films · ${r.bond>0?'Growing trust':r.bond<0?'Unresolved tension':'Neutral history'}<br>${h(r.last.text)}</p>`).join('')}</div>`;
}

function fanSentiment(m){
 const f=m?.fanCommunity;if(!f?.ready)return modal('Fan reaction','<p>No reactions yet.</p>');
 if(!f.presented){f.presented=true;save();}
 const lead=E.person(s,m.peopleStory?.actors[0]?.id),remaining=m.stage==='theaters'?Math.max(0,(f.until??s.week)-s.week):0;
 const result=f.choice==='spotlight'?`Spotlight · $25,000<br>${remaining?`+8% demand · ${remaining}w left`:'Campaign finished'}`:f.choice==='thanks'?`Cast credited · ${h(lead?.name??'Lead')} +2 trust`:'Listened · no change';
 return modal('Fan reaction',`<div class="fan-summary">${poster(m,true)}<div><strong>${h(m.title)}</strong><span class="fan-score">♥ ${Math.round(m.fans)}<small>/100</small></span></div></div>${f.text?`<blockquote class="fan-quote">${h(f.text)}</blockquote>`:''}${f.choice?`<p class="compact-status">✓ ${result}</p>`:`<div class="fan-actions">${button('<strong>Spotlight · $25,000</strong><small>+8% demand · 4w in theaters</small>','fanResponse',`data-id="${m.id}" data-choice="spotlight" ${m.stage!=='theaters'?'disabled':''}`,'outline')}${button('<strong>Credit cast · Free</strong><small>Lead trust +2</small>','fanResponse',`data-id="${m.id}" data-choice="thanks"`,'outline')}${button('<strong>Just listen · Free</strong><small>No change</small>','fanResponse',`data-id="${m.id}" data-choice="listen"`,'outline')}</div>`}${button(f.choice?'Back to movie':'Later','movie',`data-id="${m.id}"`,'text-button full')}<details><summary>Details</summary><p>Spotlight affects ticket demand while in theaters, not reviews. ${f.choice?h(f.response):'One response per film.'}</p></details>`,'AUDIENCE');
}
function pressTeaser(){
 const latest=s.press?.articles[0];
 return `<section class="press-teaser"><div><span class="eyebrow">THE FINAL CUT</span><strong>${latest?h(latest.title):'Every studio has a story. Make yours.'}</strong></div>${button('Read →','nav','data-tab="press"','outline')}</section>`;
}
function pressPage(){
 const articles=s.press?.articles??[];
 const article=(a,i)=>{const m=a.movie&&E.movie(s,a.movie);return `<article class="press-story ${i===0?'press-lead':''}"><div class="press-art">${m?poster(m,true):`<span aria-hidden="true">✦</span>`}<b>${h(a.badge)}</b></div><div><span class="press-kicker">${h(a.category)} · ${E.date(a.week).label}, W${E.date(a.week).week}</span><h3>${h(a.title)}</h3><p>${h(a.text)}</p>${m?button('View film →','movie',`data-id="${m.id}"`,'text-button'):''}</div></article>`;};
 return `<section class="press-paper">${annualCovers()}<header class="press-masthead"><div>THE BUSINESS OF MAKING BELIEVE</div><h2>The Final Cut<span>●</span></h2><p>YOUR INDUSTRY JOURNAL <span>${E.date(s.week).label} · WEEK ${E.date(s.week).week}</span></p></header>${articles.length?`<div class="press-grid">${articles.slice(0,6).map(article).join('')}</div>${articles.length>6?`<details class="press-archive"><summary>Earlier headlines · ${articles.length-6}</summary><div class="press-grid">${articles.slice(6).map(a=>article(a,1)).join('')}</div></details>`:''}`:'<div class="press-empty"><span>✦</span><h3>The next headline is yours.</h3><p>Release your first film. We’ll cover the milestones.</p></div>'}<footer>Recorded when discovered. Box office means ticket sales; profit uses studio receipts.</footer></section>`;
}

function clientBoard(){
 return `<section class="client-board"><div class="section-title"><h2>People with a brief</h2></div><div class="client-grid">${CL.CLIENTS.map(c=>{const r=s.clients[c.id],d=r.deal;return `<button class="client-tile" data-action="client" data-client="${c.id}"><span class="client-avatar client-${c.id}" aria-hidden="true">${c.initials}</span><span><strong>${h(c.name)}</strong><small>${h(c.company)}</small><b>${d?`${Math.max(0,d.due-s.week)} weeks left`:CL.available(s,c.id)?'New brief':!CL.unlocked(s,c.id)?'Deliver a brief to unlock':r.strikes>=2?'Requests ended':s.week+c.weeks>=E.END?'No new briefs':`Returns in ${Math.max(0,r.nextOffer-s.week)} weeks`}</b></span><span aria-hidden="true">→</span></button>`;}).join('')}</div></section>`;
}
function clientDialog(id){
 const c=CL.definition(id),r=s.clients[id],d=r.deal,payment=d?.payment??c.payment+Math.min(3,r.wins)*c.bonus;
 const args=`data-client="${c.id}"`,film=d?.movie&&E.movie(s,d.movie);
 return modal(c.title,`<div class="client-intro"><span class="client-avatar client-${c.id}">${c.initials}</span><div><h3>${h(c.name)}</h3><small>${h(c.role)} · ${h(c.company)}</small></div></div><div class="client-metrics">${stat('ON DELIVERY',E.accountMoney(payment))}${stat(d?'DEADLINE':'RELEASE WITHIN',d?`${Math.max(0,d.due-s.week)} weeks`:`${c.weeks} weeks`)}</div><div class="client-requirements"><span>${h(c.genre)}</span>${c.collectionCards.map(([section,card])=>`<span>${h(card)} ${film?(COL.has(film,section,card)?'✓':'— missing'):''}</span>`).join('')}<span>${c.score?`${c.score==='critics'?'Critics':'Fans'} ≥ ${c.minimum}`:'No score target'}</span></div><p class="small">${h(c.reason)}</p>${briefEstimate(c.weeks,c,d)}${d?`<p class="small muted">Release by ${E.date(d.due).label}, W${E.date(d.due).week}.</p>${film?`<div class="people-row"><strong>${h(film.title)}</strong>${button('Open film','movie',`data-id="${film.id}"`,'outline')}</div>`:`<h3>Attach a film</h3>${s.movies.filter(m=>CL.eligible(s,m)&&CL.matches(m,c)).map(m=>button(h(m.title)+' →','clientBind',`${args} data-id="${m.id}"`,'outline full')).join('')||'<p class="small muted">No uncommitted films match yet.</p>'}${button('Build with cards','cardNew','','primary full')}<p class="small muted">Choose before filming. Attachment is final.</p>`}`:CL.available(s,id)?`${button('Accept brief','clientAccept',args,'primary full')}${button('Pass for now','clientDecline',args,'text-button full')}`:`<p>${!CL.collectionReady(s,c)?'Collect the requested genre and cards to unlock this brief.':!CL.unlocked(s,id)?'Deliver any commission successfully to unlock rush orders.':r.strikes>=2?'This client is no longer commissioning your studio.':s.week+c.weeks>=E.END?'Not enough time remains for a new brief.':`Next conversation in ${Math.max(0,r.nextOffer-s.week)} weeks.`}</p>`}<p class="client-stakes">Miss: no payment · 40-week cooldown.</p><details><summary>Terms & history</summary><p>${h(c.tier)} · +${c.premium}% fee. On-time release${c.score?' and score target':''} required. No extensions. Two misses end requests.</p><p class="small">Deliveries increase future fees, up to three increases. Pass without penalty. One client per film, including Mars Travel. Payment adds to studio receipts; ticket sales and rights are unchanged.</p>${r.history.slice(-4).reverse().map(x=>`<p><strong>${h(x.title)} · ${h(x.outcome)}</strong><small class="block">${h(x.reason)} ${x.payment?E.accountMoney(x.payment):''}</small></p>`).join('')}</details>`,'AN INDUSTRY BRIEF');
}
function clientFilm(m){
 return CL.CLIENTS.map(c=>{const r=s.clients[c.id],d=r.deal;if(d?.movie===m.id)return `<div class="client-film"><strong>${h(c.company)} · ${Math.max(0,d.due-s.week)} weeks · ${E.accountMoney(d.payment)}</strong>${button('Review brief','client',`data-client="${c.id}"`,'text-button')}${!CL.matches(m,c)?'<small class="negative">Required cards missing</small>':''}</div>`;const paid=r.history.find(x=>x.movie===m.id&&x.outcome==='delivered');return paid?`<p class="commission-paid">${h(c.company)} paid ${E.accountMoney(paid.payment)}.</p>`:'';}).join('');
}

function cardArt(genre,row,col){return settingCardArt(genre,row,col) ?? (genre==='Sci-fi'?sfArt(row,col):`<span class="genre-card-art genre-${genre.toLowerCase()}" style="--card-variant:${col}" aria-hidden="true"><i>${GENRE_SYMBOLS[genre]?.[row]??'✦'}</i></span>`);}

function lifeBanner(){const pending=s.life.pitches.filter(x=>!x.movie&&!x.passed&&x.expires>=s.week).length+s.movies.filter(m=>m.cult?.ready&&!m.cult.choice).length+(s.life.poach&&!s.life.poach.choice?1:0);return `<section class="press-teaser"><div><span class="eyebrow">BEYOND THE SCREEN</span><strong>Studio life ${pending?`· ${pending} opportunities`:''}</strong></div>${button('Open →','life','','outline')}</section>`;}
function lifeDialog(section){
 const x=s.life,activePitches=x.pitches.filter(p=>!p.passed&&!p.movie&&p.expires>=s.week);
 const home=`<div class="life-stats">${stat('CREW LOYALTY',Math.round(x.crew.loyalty)+'/100')}${stat('FATIGUE',Math.round(x.crew.fatigue)+'/100')}</div><div class="life-tags">${x.identity.genres.map(g=>pill('Home of '+g)).join('')}${x.identity.launches>=3?pill('Launches new stars'):''}${x.identity.variety>=3?pill('Takes creative risks'):''}${!x.identity.genres.length&&x.identity.launches<3&&x.identity.variety<3?pill('Finding your identity'):''}</div><details><summary>Your studio’s advantages</summary><p>Three releases in a genre: its original scripts cost 10% less. Release three different genres: all original scripts cost 10% less. Launch three debut actors: new quotes from actors below 30 fame cost 5% less. Discounts do not compound.</p><p>Nora Reed manages crew welfare. At 70 loyalty, new films get +2 quality; below 35, −2. Fatigue builds on active shoots and recovers during breaks.</p></details><div class="life-menu">${[['pitches','Passion projects',activePitches.length],['careers','Second chances',''],['rivals','Rival studios',''],['cult','Cult films',s.movies.filter(m=>m.cult).length]].map(([id,label,n])=>button(label+(n!==''?' · '+n:'')+' →','life',`data-section="${id}"`,'outline full')).join('')}${button('Annual magazine covers →','nav','data-tab="press"','outline full')}</div>`;
 let body=home,title='The people around your studio';
 if(section==='pitches'){title='Passion projects';body=activePitches.map(a=>{const p=E.person(s,a.person);return `<section class="people-panel"><div class="people-director">${portrait(p,56)}<div><h3>${h(p.name)}</h3><small>${h(p.kind)} · ${h(a.genre)}</small></div></div><blockquote>“Keep ${a.protect.map(([,c])=>h(c)).join(' and ')}. That’s the movie I want to make.”</blockquote><p>25% lower fee for this talent. Start filming within 26 weeks of commissioning.</p>${button('Develop this pitch','lifePitch',`data-pitch="${a.id}"`,'primary full')}${button('Pass','lifePassPitch',`data-pitch="${a.id}"`,'text-button full')}</section>`;}).join('')||'<p>No pitches waiting. New voices arrive as time passes.</p>';}
 if(section==='careers'){title='A second chance';const candidates=s.people.filter(p=>LIFE.comebackEligible(p)&&!x.comebacks[p.id]);body=candidates.slice(0,12).map(p=>`<section class="people-panel"><div class="people-director">${portrait(p,48)}<h3>${h(p.name)}</h3></div><p>“The last one hurt. I still have a good film in me.”</p>${s.movies.filter(m=>m.stage==='packaging'&&[...m.contracts,m.director].filter(Boolean).some(c=>c.id===p.id)).map(m=>button('Back them in '+h(m.title),'lifeComeback',`data-id="${m.id}" data-person="${p.id}"`,'outline full')).join('')||'<small>Cast them in a film to back a comeback.</small>'}</section>`).join('')||'<p>No comeback candidates right now.</p>';body+='<p class="small muted">One attempt per person. Performance ≥75 and critics ≥70: +8 fame and +6 trust. Otherwise, +2 trust for your support. No upfront cost.</p>'+Object.entries(x.comebacks).map(([id,c])=>`<p><strong>${h(E.person(s,id).name)} · ${h(c.status)}</strong><small class="block">${h(c.text??'A comeback project is underway.')}</small></p>`).join('');}
 if(section==='rivals'){title='Competitors with long memories';body='';const offer=x.poach;if(offer&&!offer.choice)body+=`<section class="people-panel"><h3>${h(E.person(s,offer.person).name)} has a rival offer</h3><p>${h(LIFE.BOSSES.find(b=>b.id===offer.studio).company)} wants a four-week shoot. Existing bookings take priority.</p>${button('Keep them available · $50,000','lifePoach','data-choice="retain"','primary full')}${button('Let them take it','lifePoach','data-choice="pass"','outline full')}<small>Retainer: +3 trust. No reply within ${Math.max(0,offer.expires-s.week)} weeks lets them take the offer. Their fee on your next film is separate.</small></section>`;body+=LIFE.BOSSES.map(b=>{const r=LIFE.rivalRelation(s,b.id),next=s.rivals.filter(a=>a.studioId===b.id&&a.week>=s.week).sort((a,b)=>a.week-b.week)[0];return `<section class="people-panel"><span class="eyebrow">${h(b.company)}</span><h3>${h(b.name)}</h3><p>“${h(b.agenda)}”</p><p>${h(r.last)}</p><small>Trust ${r.trust}/100 ${r.owed?'· You owe a release window':''}</small>${next?`<p>Next: <strong>${h(next.title)}</strong> · ${E.date(next.week).label}, W${E.date(next.week).week}</p>`:''}${button('Joint showcase · $50,000 · trust +10','lifeRival',`data-rival="${b.id}" ${s.week<(r.nextMeeting??0)?'disabled':''}`,'outline full')}</section>`;}).join('')+'<p class="small muted">Negotiate dates in the release calendar. A rival may move for you once before you return the favor. Showcases are available every 26 weeks.</p>';}
 if(section==='cult'){title='Films that found their people';body=s.movies.filter(m=>m.cult).map(m=>`<div class="people-row"><strong>${h(m.title)}</strong>${button(m.cult.choice?'View story':'Hear from fans','cult',`data-id="${m.id}"`,'outline')}</div>`).join('')||'<p>A film can find its audience long after opening. Watch for well-liked catalog films still recovering their costs.</p>';}
 return modal(title,body+(section?button('← Studio life','life','','text-button full'):''),'BEYOND THE SCREEN');
}
function filmLife(m){let body='';if(m.passion&&['development','packaging'].includes(m.stage)){body+=`<div class="people-panel"><strong>Passion project · ${h(E.person(s,m.passion.person).name)}</strong><p>${m.passion.protect.map(([,c])=>h(c)).join(' + ')} · Start within ${Math.max(0,m.passion.due-s.week)} weeks.</p>${m.stage==='packaging'?button('Audition the pitching talent','passionAudition',`data-id="${m.id}"`,'outline'):''}${button('Release the promise','lifeReleasePitch',`data-id="${m.id}"`,'text-button')}<small>Release removes their discounted contract from this project; trust −5.</small></div>`;}if(m.life?.sequel)body+=`<div class="client-film"><strong>Sequel · ${m.life.sequel.kept.length} retained · ${m.life.sequel.new.length} new</strong>${button('Compare cards','sequelCards',`data-id="${m.id}"`,'text-button')}</div>`;if(m.cult)body+=button('Cult following ♥','cult',`data-id="${m.id}"`,'outline');return body;}
function cultDialog(m){const c=m.cult;return modal('They found your movie',`<div class="fan-popup-hero">${poster(m,true)}<div><h3>${h(m.title)}</h3><p>“How did everyone miss this?”</p></div></div>${c.choice?`<p>${c.choice==='rerelease'?c.settled?`Special screenings earned ${E.accountMoney(c.gross)} in tickets; ${E.accountMoney(c.receipts)} reached your studio.`:`Special screenings in ${Math.max(0,c.due-s.week)} weeks.`:c.choice==='convention'?'You backed the fan convention. Future sequels gain 8% opening demand.':'You let the fans lead the conversation.'}</p>`:`<div class="fan-actions">${button(`<strong>Special screenings · $100,000</strong><small>In two weeks · studio receipts ${E.accountMoney(Math.max(0,120*(m.share??0)-(m.recoupRemaining??0)))}–${E.accountMoney(Math.max(0,360*(m.share??0)-(m.recoupRemaining??0)))}</small><small>Existing ticket terms and talent shares apply. Future sequels: +4% demand.</small>`,'lifeCult',`data-id="${m.id}" data-choice="rerelease" ${m.streamingDeal?.id==='exclusive'&&s.week<=m.streamingDeal.endWeek?'disabled':''}`,'outline')}${button('<strong>Support a convention · $30,000</strong><small>Future sequels: +8% opening demand</small>','lifeCult',`data-id="${m.id}" data-choice="convention"`,'outline')}${button('<strong>Let it grow naturally · free</strong><small>No financial or demand change</small>','lifeCult',`data-id="${m.id}" data-choice="leave"`,'outline')}</div><small>One event per film. Special screenings wait until an exclusive streaming license ends.</small>`}`,'CULT CLASSIC');}
function sequelCardsDialog(m){const x=m.life.sequel;return modal('A new chapter',`<h3>${h(m.title)}</h3><p>${h(x.reaction??'The cast is bringing this chapter to life.')}</p><div class="life-stats">${stat('ORIGINAL FANS',Math.round(x.originalFans))}${stat('SEQUEL FANS',m.fans==null?'Pending':Math.round(m.fans))}</div><h3>Familiar ingredients</h3><div class="life-tags">${x.kept.map(c=>pill(h(c))).join('')||'None'}</div><h3>New directions</h3><div class="life-tags">${x.new.map(c=>pill(h(c))).join('')||'None'}</div><details><summary>Audience expectations</summary><p>Matching or beating the original’s audience score adds 4% opening demand, or 8% with new cards. Changing most cards and earning a lower audience score reduces opening demand by 8%. Cards do not guarantee reviews.</p></details>`,'SEQUEL EXPECTATIONS');}
function releaseTalk(m,week){const options=LIFE.releaseOptions(s,m,week);return modal('Can we share the calendar?',`<h3>${h(m.title)}</h3><p>Your selected window: ${E.date(week).label}, W${E.date(week).week}.</p>${options.map(o=>button(`<strong>${h(o.title)}</strong><small>${h(o.detail)}</small><small>Release: ${E.date(o.week).label}, W${E.date(o.week).week}${o.rival!==undefined?' · '+h(s.rivals[o.rival].title):''}</small>`,'releaseNegotiation',`data-id="${m.id}" data-week="${week}" data-choice="${o.choice}"`,'choice full')).join('')||'<p>No alternate arrangements available in this window.</p>'}<p class="small muted">Accepting locks your release date. Arrangements that miss an attached client’s deadline are unavailable.</p>${button('Back to calendar','release',`data-id="${m.id}"`,'outline full')}`,'RELEASE NEGOTIATION');}
function annualCovers(){return s.life.covers.map(c=>`<details class="annual-issue"><summary>The Final Cut Annual · ${c.year}</summary><article class="annual-cover"><span class="eyebrow">THE YEAR IN PICTURES</span><strong class="annual-year">${c.year}</strong><h2>${h(c.studio)}</h2><p>STUDIO OF THE YEAR</p><div class="annual-picks"><div><small>BREAKOUT STAR</small><strong>${h(c.breakout?.name??'No qualifying breakthrough')}</strong><span>${c.breakout?'+'+c.breakout.gain+' fame · '+h(c.breakout.movie):''}</span></div><div><small>SURPRISE HIT</small><strong>${h(c.hit?.title??'No profitable release yet')}</strong><span>${c.hit?c.hit.ratio+'× film spending recovered':''}</span></div><div><small>BIGGEST DISAPPOINTMENT</small><strong>${h(c.loss?.title??'No completed-run loss')}</strong><span>${c.loss?E.accountMoney(c.loss.amount)+' still to recover':''}</span></div></div><small>${c.films} studio releases. Selections frozen at year-end. Studio ranking uses audience/critic scores and release count; rivals have simulated results. Hit and loss selections cover your studio.</small></article></details>`).join('');}

function hiringNext(m){
 if(m.stage!=='packaging'||!view?.hired)return '';
 const n=nextHire(m),p=E.person(s,view.hired);
 return `<section class="hiring-next"><strong>✓ ${h(p.name)} signed</strong>${button(h(n.label)+' →','nextHire',`data-id="${m.id}"`,'primary')}</section>`;
}
function nextChallenge(){
 if(!s.movies.some(m=>['theaters','catalog'].includes(m.stage))||s.ended||s.epilogue||s.marsTravel?.deal||Object.values(s.clients??{}).some(r=>r.deal))return '';
 const c=CL.CLIENTS.find(c=>CL.available(s,c.id));if(!c)return '';
 const r=s.clients[c.id];
 return `<section class="next-challenge"><span class="eyebrow">YOUR NEXT CHALLENGE · OPTIONAL</span><strong>${h(c.company)} has a brief</strong><span>${E.accountMoney(c.payment+Math.min(3,r.wins)*c.bonus)} · ${c.weeks} weeks from acceptance · ${h(c.genre)} · ${c.collectionCards.map(([,card])=>h(card)).join(' + ')}${c.score?` · ${c.score} ≥ ${c.minimum}`:''}</span>${button('Review the brief →','client',`data-client="${c.id}"`,'outline')}</section>`;
}
function nextMovieExperiment(m){
 const previous=s.movies.filter(x=>x.id!==m.id&&x.genre===m.genre&&x.release!=null&&x.release<m.release&&x.scifiReception?.version===2).sort((a,b)=>b.release-a.release)[0];
 const delta=n=>(n>0?'+':'')+Math.round(n);
 return `<section class="sf-report-panel next-movie"><h3>What will you try next?</h3>${previous?`<p>Compared with ${h(previous.title)}: fans ${delta(m.fans-previous.fans)} · critics ${delta(m.critics-previous.critics)}.</p><small>Different casts and production choices also affect these results.</small>`:''}<p class="small">Try a different ending. Who do you expect to connect with it?</p>${!s.ended&&!s.epilogue?button('Create another '+h(m.genre)+' movie →','cardNew',`data-genre="${h(m.genre)}"`,'outline'):''}</section>`;
}

function cardGuidance(cards,genre,endings){
 const g=REC.guidance(cards,SF.sections(genre),endings);
 return `<aside class="card-guidance" aria-label="Creative guidance"><span>◈ ${h(g.demandText)}</span><span>♥ ${h(g.audienceText)}</span>${g.cautionText?`<span>△ ${h(g.cautionText)}</span>`:''}<small>Priorities, not predicted scores.</small></aside>`;
}

function advanceControl(){
 if(s.ended||s.epilogue)return '';
 const reason=E.decisionStop(s);
 return `<div class="advance-tools">${button('Advance to next decision →','advanceDecision',`${reason?'aria-disabled="true"':''}`,'outline')}<small>${h(reason??'Stops for decisions and commitments · up to 12 weeks')}</small></div>`;
}

function briefEstimate(weeks,client=null,deal=null){
 const eligible=s.movies.filter(m=>client?CL.eligible(s,m)&&CL.matches(m,client):E.commissionEligible(m)&&COL.has(m,'setting','Frontier'));
 const movie=deal?.movie?E.movie(s,deal.movie):eligible.find(m=>m.id===view.estimateFilm);
 if(movie&&!['development','packaging'].includes(movie.stage))return '';
 const scale=view.estimateScale??'Small',duration=view.estimateDuration??(movie?getProductionPlan(movie).duration:E.recommendedWeeks({scale}));
 const e=commissionEstimate(s.week,{movie,duration,due:deal?.due??s.week+weeks});
 return `<section class="brief-estimate"><div class="estimate-strip"><span>Est. ${e.total}w</span><strong class="${e.buffer<0?'negative':e.buffer<3?'peach':'mint'}">${e.buffer<0?`${-e.buffer}w late`:`${e.buffer}w buffer`}</strong></div><details ${view.estimateExpanded?'open':''}><summary>Plan details</summary>${!deal?.movie?`<label>Plan<select id="brief-film"><option value="">New screenplay</option>${eligible.map(m=>`<option value="${m.id}" ${movie?.id===m.id?'selected':''}>${h(m.title)}</option>`).join('')}</select></label>`:''}${!movie?`<label>Scope<select id="brief-scale">${E.SCALES.map(x=>`<option ${x===scale?'selected':''}>${x}</option>`).join('')}</select></label>`:''}<label>Shoot<select id="brief-duration">${Array.from({length:17},(_,i)=>i+4).map(w=>`<option value="${w}" ${w===duration?'selected':''}>${w} weeks</option>`).join('')}</select></label><p class="small">${e.development} development + ${e.shoot} filming + 4 setback allowance + 1 release.</p><small>Includes a 4w setback allowance. Hiring/bookings may add time. Forecast only; does not attach or change a film. Deadline starts on acceptance and stays fixed.</small></details></section>`;
}
dialog.addEventListener('change',e=>{
 if(e.target.id==='brief-film'){view.estimateExpanded=true;view.estimateFilm=e.target.value;delete view.estimateDuration;drawDialog();}
 if(e.target.id==='brief-scale'){view.estimateExpanded=true;view.estimateScale=e.target.value;delete view.estimateDuration;drawDialog();}
 if(e.target.id==='brief-duration'){view.estimateExpanded=true;view.estimateDuration=Number(e.target.value);drawDialog();}
});

function packShelf(){
 const n=COL.credits(s),all=Object.keys(COL.FAMILIES).every(f=>!COL.preview(s,f).length);
 return `<section class="pack-shelf"><div class="section-title"><h3>${all?'Collection complete':n?`${n} pack choices ready`:`Next pack: ${COL.nextPrestige(s)} prestige`}</h3><span class="small">✦ ${Math.floor(s.prestige)} prestige</span></div><div class="pack-grid">${Object.entries(COL.FAMILIES).map(([id,f])=>{const cards=COL.preview(s,id);return `<article class="pack-card"><span class="pack-mark" aria-hidden="true">${COL.ICONS[f.decks[0]]}</span><h4>${f.name}</h4><p>${cards.map(c=>h(c.card)).join(' · ')||'Complete ✓'}</p>${button(cards.length?'Choose pack':'Collected','claimPack',`data-family="${id}" ${!n||!cards.length?'disabled':''}`,'outline full')}</article>`;}).join('')}</div><p class="small muted">Cards stay yours. Prestige unlocks choices, not better scores.</p></section>`;
}
function collectionGallery(){return `<details><summary>Browse all 140 cards</summary>${Object.entries(COL.DECKS).map(([deck,cards])=>`<h3>${COL.LABELS[deck]}</h3><div class="collection-tags">${cards.map(c=>`<span class="${COL.owns(s,deck,c)?'owned':'locked'}">${COL.owns(s,deck,c)?'✓':'◇'} ${h(c)}</span>`).join('')}</div>`).join('')}</details>`;}
function cardRoom(){
 const d=view.cards,i=view.character??null,deck=view.slot??'genre',parent=view.id?s.movies.find(m=>m.id===E.movie(s,view.id).parent):null,issues=COL.continuity(parent?.movieCards,d,view.mode),valid=COL.valid(d,s);
 if(view.panel==='roles')return modal('Add a character',`<div class="role-picker">${COL.ROLES.filter(r=>!d.characters.some(c=>c.role===r)).map(r=>button(h(r)+' →','addCharacter',`data-role="${h(r)}"`,'outline full')).join('')}</div>`,'CHOOSE A ROLE');
 if(view.panel==='picker'){
  const c=i!=null?d.characters[i]:null,selected=c?c[deck]:d[deck];
  return modal(c?c.role:({genre:'Genre',setting:'Setting',problem:'Problem',ending:'Ending'})[deck],`${c?`<div class="character-preview"><div><strong>${h([c.trait,c.persona].filter(Boolean).join(' ')||'Choose a persona')}</strong><small>${h(c.outcome||'Outcome optional')}</small>${c.name?`<small>${h(c.name)}</small>`:''}</div>${button('✎','characterName',`aria-label="Name ${h(c.role)}"`,'icon-button')}</div>${view.naming?`<input aria-label="${h(c.role)} name" data-character-name="${i}" maxlength="30" value="${h(c.name)}" placeholder="Character name">`:''}<nav class="character-tabs" aria-label="Character cards">${['persona','trait','outcome'].map(k=>button({persona:'Persona',trait:'Trait',outcome:'Outcome'}[k],'characterTab',`data-deck="${k}" aria-pressed="${deck===k}"`,'outline')).join('')}</nav>`:''}<div class="shared-card-grid">${(['trait','outcome'].includes(deck)?['',...s.collection.owned[deck]]:s.collection.owned[deck]).map(name=>button(`<span class="shared-art" aria-hidden="true">${name?COL.ICONS[deck]:'−'}</span><strong>${h(name||'None')}</strong>${selected===name?'<span class="album-check">✓</span>':''}`,'cardPick',`data-card="${h(name)}" aria-pressed="${selected===name}"`,'shared-card')).join('')}</div>${!s.collection.owned[deck].length?'<p class="small muted">Unlock outcomes in Collection.</p>':''}${c?`<div class="sheet-actions">${i>0?button('Remove character','removeCharacter','','text-button'):''}${button('Done','cardDone',`${!c.persona?'disabled':''}`,'primary')}</div>`:''}`,'YOUR CARDS');
 }
 if(view.panel==='checkout')return modal(view.id?'Save screenplay':'Make this movie',`<form id="card-form"><label>Movie title<input name="title" maxlength="60" required value="${h(view.title)}" ${view.id?'readonly':''} placeholder="Name your movie"></label>${!view.id?`<label>Production scope<select name="cardScale">${E.SCALES.map(x=>`<option ${view.scale===x?'selected':''}>${x}</option>`).join('')}</select></label>`:''}${parent?`<label>Story order<select name="sequelMode"><option value="continuation" ${view.mode!=='prequel'?'selected':''}>Sequel</option><option value="prequel" ${view.mode==='prequel'?'selected':''}>Prequel</option></select></label>`:''}${issues.map(t=>`<p class="small peach">${h(t)}</p>`).join('')}<p class="small">Screenplay · ${E.accountMoney(view.id?50:100*(E.SCALES.indexOf(view.scale)+1)*LIFE.scriptMultiplier(s,d.genre))}</p><button type="submit" class="primary full" ${valid&&!issues.length?'':'disabled'}>${view.id?'Save changes':'Start development →'}</button></form>`,'SCREENPLAY');
 const slot=k=>button(`<small>${COL.ICONS[k]} ${{genre:'Genre',setting:'Setting',problem:'Problem',ending:'Ending'}[k]}</small><strong>${h(d[k]||'Choose '+k)}</strong>`,'cardSlot',`data-deck="${k}"`,'collection-slot');
 return modal('Your movie',`<div class="simple-movie-board"><div class="genre-target">${slot('genre')}</div><div class="story-strip">${['setting','problem','ending'].map(slot).join('')}</div><div class="character-tiles">${d.characters.map((c,j)=>button(`<small>${h(c.role)}</small><strong>${h([c.trait,c.persona].filter(Boolean).join(' ')||'Choose persona')}</strong>${c.outcome?`<span>${h(c.outcome)}</span>`:''}${c.name?`<span>${h(c.name)}</span>`:''}`,'characterEdit',`data-character="${j}"`,'character-tile')).join('')}${d.characters.length<6?button('+ Character','chooseRole','','character-tile add-character'):''}</div><button class="primary full" data-action="cardCheckout" ${!valid?'disabled':''}>${view.id?'Review changes →':'Make Movie →'}</button></div>`,'CINEMA COLLECTION');
}
function movieCardSummary(m){const d=m.movieCards;return `<details class="movie-card-summary"><summary>Your movie cards · ${COL.selected(d).length}</summary><div class="collection-tags">${['genre','setting','problem','ending'].map(k=>`<span>${COL.ICONS[k]} ${h(d[k])}</span>`).join('')}</div>${d.characters.map(c=>`<p><strong>${h(c.name||c.role)}</strong> · ${h([c.trait,c.persona,c.outcome].filter(Boolean).join(' · '))}</p>`).join('')}${m.parent?`<small>${m.sequelMode==='prequel'?'Prequel':'Sequel'} · character outcomes carried in franchise history</small>`:''}</details>`;}
function cardReleaseReport(m){return `<section class="panel card-release-report"><div class="scores">${stat('FANS',E.score(m.fans))}${stat('CRITICS',E.score(m.critics))}${stat('BOX OFFICE',E.accountMoney(m.gross))}</div>${filmResult(m)}${m.music?`<p>♫ <strong>Film score ${E.score(m.music.quality)}/100</strong> · ${h(m.music.composer)}<br><small>${h(m.music.style)}${m.music.discovery?" · Inspired pairing":""} · Fans ${m.music.fans>=0?"+":""}${m.music.fans} · Critics ${m.music.critics>=0?"+":""}${m.music.critics}</small></p>`:""}${castAppealPanel(m)}${movieCardSummary(m)}<p class="small">Creative focus: ${(m.cardReception?.focus??[]).map(x=>({story:'Story',acting:'Performances',direction:'Direction',craft:'Craft'})[x]).join(' · ')}</p><details><summary>How your cards mattered</summary><p>Your card combination sets the balance of story, performance, direction and craft. Production delivers those qualities. Extra or unlocked cards add no score bonus.</p><p>Character outcomes shape the next chapter.</p></details>${button('Build another movie','cardNew','','outline full')}</section>`;}
dialog.addEventListener('input',e=>{if(view?.kind!=='cards')return;if(e.target.name==='title')view.title=e.target.value;if(e.target.dataset.characterName!=null)view.cards.characters[Number(e.target.dataset.characterName)].name=e.target.value;});
dialog.addEventListener('change',e=>{if(view?.kind!=='cards')return;if(e.target.name==='cardScale'){view.scale=e.target.value;drawDialog();}if(e.target.name==='sequelMode'){view.mode=e.target.value;drawDialog();}});




function standingsPage(){const rows=standings(s,standingsSort);return `<div class="standings-controls">${button('Box office','standingsSort',`data-sort="gross" aria-pressed="${standingsSort==='gross'}"`,'outline')}${button('Awards','standingsSort',`data-sort="awards" aria-pressed="${standingsSort==='awards'}"`,'outline')}</div><table class="standings-table"><thead><tr><th scope="col">#</th><th scope="col">Studio</th><th scope="col">Box office</th><th scope="col">Awards</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.player?'your-studio':''}"><td>${r.rank}</td><th scope="row">${h(r.name)}${r.player?'<span class="you-label">YOU</span>':''}<small>${r.films} films</small></th><td>${E.accountMoney(r.gross)}</td><td>♜ ${r.awards}</td></tr>`).join('')}</tbody></table><p class="small muted">Run-to-date ticket sales, before studio shares. Rival box office is simulated. Awards count after their winners are revealed.</p>`;}

function castAppealPanel(m){
 const a=E.castAppeal(s,m),done=!!m.castCommercial;
 return `<section class="cast-appeal"><div><span>★ Cast fame</span><strong>${Math.round(a.fame)}/100</strong></div>${done&&a.effective<a.fame-.5?`<p class="small peach">Performance reduced audience pull to ${Math.round(a.effective)}/100.</p>`:''}<details><summary>${done?'Star power delivered':'How fame sells tickets'}</summary><p class="small">Fame adds ticket demand with diminishing returns. Performances below 50 weaken that person’s pull; 20 or below removes it. Fees still affect profit.</p>${a.entries.map(c=>`<p class="small">${h(E.person(s,c.id)?.name??'Cast member')} · fame ${Math.round(c.fame)}${done?' · '+Math.round(c.retained*100)+'% pull retained':''}</p>`).join('')}${!done?'<p class="small">Casting estimates compare this hire with your current lineup, assuming solid performances and unchanged marketing.</p>':''}</details></section>`;
}
