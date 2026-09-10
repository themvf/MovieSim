import * as E from "./engine.js?v=0.13.1";
import { portrait, poster, studioArt, escapeHtml as h } from "./art.js?v=0.13.1";
const BUILD = "0.10.0";
const KEY = "moviesim-save-v1",
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
};
const titles = {
  slate: "Your slate",
  scripts: "The script room",
  talent: "The talent directory",
  studio: "Build something lasting",
  calendar: "The release calendar",
  finance: "Keep the cameras rolling",
  awards: "For your consideration",
};
const subs = {
  slate: "Every great studio starts with a story.",
  scripts: "Find the story you can’t leave on the shelf.",
  talent: "An unfamiliar name today. A household name tomorrow.",
  studio: "The movies come and go. This place is yours.",
  calendar: "A good movie still needs the right moment.",
  finance: "Big ambitions. Real commitments.",
  awards: "Make a little room on the shelf.",
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
  `<button class="${cls}" data-action="${action}" ${data}>${text}</button>`;
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
  dialog.innerHTML = `<div class="modal-head"><div><span class="eyebrow">${eyebrow}</span><h2 tabindex="-1" autofocus>${title}</h2></div>${view?.back ? button("←", "back", "", "icon-button back-button") : ""}${["awardsInvite", "nominations", "ceremony"].includes(view?.kind) ? "" : button("×", "close", "", "icon-button close-button")}</div><div class="modal-body">${body}</div>`;
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
  const d = E.date(s.week),
    active = s.movies.filter(
      isActiveMovie,
    );
  const decisions = active.filter(
    (m) => m.event || ["packaging", "ready"].includes(m.stage),
  );
  app.innerHTML = `<aside class="sidebar"><a href="#" class="brand" data-action="nav" data-tab="slate"><span class="brand-mark">M<span>▰</span></span><span>MOVIE<span class="brand-light">SIM</span><small>THE STUDIO YEARS</small></span></a><div class="studio-label"><span class="status-dot"></span>${h(s.name)}<small>INDEPENDENT • EST. 2026</small></div><nav>${[
    ["slate", "Your slate"],
    ["scripts", "Scripts"],
    ["talent", "Talent"],
    ["studio", "Studio"],
    ["calendar", "Calendar"],
    ["finance", "Finances"],
    ["awards", "Awards"],
  ]
    .map(
      ([key, name]) =>
        `<button data-action="nav" data-tab="${key}" class="nav-item ${tab === key ? "selected" : ""}"><span>${icons[key]}</span>${name}${key === "slate" && decisions.length ? `<b>${decisions.length}</b>` : ""}</button>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><div class="year-progress"><span>YOUR FIVE-YEAR STORY</span><strong>Year ${Math.min(5, Math.floor(s.week / 52) + 1)} <i>/ 5</i></strong><div class="bar"><i style="width:${(s.week / 260) * 100}%"></i></div></div>${button("How to play ↗", "help", "", "quiet")}<small>DEMO 0.10.0 · SAVED ${saveError ? "UNAVAILABLE" : "ON THIS DEVICE"}</small></div></aside>
  <div class="workspace"><header class="topbar"><span class="mobile-brand">▰ MOVIESIM</span><div class="date"><span class="status-dot"></span><strong>${d.label}</strong><span>Week ${d.week}</span></div><div class="top-stats"><div><small>AVAILABLE CASH</small><strong class="${s.cash < 0 ? "negative" : ""}">${E.accountMoney(s.cash)}</strong></div><div><small>STUDIO PRESTIGE</small><strong><span class="gold">✦</span> ${Math.round(s.prestige)}<em> / 100</em></strong></div></div>${button(s.ended ? "Studio recap" : s.cash < 0 && !s.epilogue ? "Review financing" : s.epilogue ? "Final awards →" : s.notices.length ? "New announcement →" : decisions.some((m) => m.event) ? "Next decision →" : s.movies.some((m) => m.stage === "ready" && m.release == null) ? "Choose release date →" : "Next week →", s.ended ? "recap" : s.cash < 0 && !s.epilogue ? "bank" : s.epilogue || s.notices.length ? "announcements" : decisions.some((m) => m.event) ? "nextDecision" : "next", "", "primary advance")}</header>
  <main><div class="page-heading"><div><span class="eyebrow">${tab === "slate" ? "THE PRODUCTION OFFICE" : tab === "scripts" ? "ACQUISITIONS & DEVELOPMENT" : tab === "talent" ? "CASTING & DIRECTION" : tab === "awards" ? "THE SILVER SCREEN AWARDS" : "SILVERLINE / STUDIO OPERATIONS"}</span><h1>${titles[tab]}</h1><p>${subs[tab]}</p></div>${tab === "slate" ? button("+ New movie", "nav", 'data-tab="scripts"', "primary") : tab === "scripts" ? button("+ Create original", "original", "", "primary") : ""}</div>
  ${s.ended ? `<div class="notice-banner">${h(s.endReason || "Your studio run is complete.")} Explore your studio or ${button("see your retrospective →", "recap", "", "text-button")}.</div>` : ""}
  ${tab === "slate" ? slate() : tab === "scripts" ? scripts() : tab === "talent" ? talents() : tab === "studio" ? studio() : tab === "calendar" ? calendar() : tab === "finance" ? finance() : awards()}
  <footer><span>MOVIESIM <i> / </i> FIVE YEARS. YOUR STORY.</span>${button("Guide & save", "help", "", "text-button")}</footer></main></div>
  <nav class="mobile-nav">${[
    ["slate", "Movies"],
    ["scripts", "Scripts"],
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
 ${opportunityBoard()}<div class="slate-layout"><section><div class="section-title"><h2>Your productions <span>${s.movies.length}</span></h2><div class="segmented">${[
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
  return `<article class="movie-card" data-action="${m.stage === "ready" && m.release != null ? "distribution" : "movie"}" data-id="${m.id}" tabindex="0" role="button" aria-label="Manage ${h(m.title)}">${poster(m)}<div class="movie-info"><div class="movie-meta">${pill(movieStageLabel(m), m.stage === "theaters" ? "mint-pill" : "")}${m.parent ? pill("SEQUEL", "gold-pill") : ""}</div><h3>${h(m.title)}</h3><p>${h(m.genre)} / ${h(m.subgenre)} <span>·</span> ${E.scopeName(m.scale)}</p><div class="cast-mini">${cast.map((p) => portrait(p, 28)).join("")}<span>${cast.length ? cast.map((p) => h(p.name.split(" ")[0])).join(", ") : "Your cast is waiting to be discovered"}</span></div>${m.stage === "filming" ? `<div class="production-progress"><span>Filming</span><span>${m.progress} / ${m.duration} weeks</span><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div></div>` : ""}${m.boxWeeks.length ? `<p><strong>${E.boxOfficeStatus(m).label}</strong> · ${m.receipts >= m.spent ? "Profit" : "Unrecovered costs"} ${E.money(Math.abs(m.receipts - m.spent))}</p>${isStreaming(m) ? `<p class="streaming-card-info"><strong>${h(m.streamingDeal.name)}</strong> · ${Math.max(0,m.streamingDeal.endWeek-s.week)} weeks left<br>Streaming earned: <strong>${E.accountMoney(m.catalog)}</strong><br>${m.streamingDeal.id === "exclusive" ? "Upfront license paid · no weekly royalties" : `Next week: <strong>${E.accountMoney(E.catalogIncome({...s,week:s.week+1},m))}</strong>`}</p>` : weeklyChart(m)}` : ""}<div class="movie-bottom"><span>${["theaters", "catalog"].includes(m.stage) ? `Box office <strong>${E.accountMoney(m.gross)}</strong>` : `Spent <strong>${E.accountMoney(m.spent)}</strong>`}</span><span class="${needs ? "peach" : "muted"}">${needs ? `${needs} →` : m.release ? `${E.date(m.release).label} →` : "View project →"}</span></div></div></article>`;
}
function scripts() {
  return `<details class="poster-preview"><summary>See the four new movie posters</summary><div class="poster-preview-grid">${E.POSTER_FILMS.map(m=>`<figure>${poster(m,true)}<figcaption>${h(m.title)}</figcaption></figure>`).join("")}</div></details><div class="section-title"><h2>Available screenplays <span>${s.market.length}</span></h2><span class="muted small">New scripts every 13 weeks</span></div><div class="script-grid">${s.market.map((m) => `<article class="script-card"><div class="script-top">${poster(m)}<div>${pill(E.scopeName(m.scale))}<span class="eyebrow">${h(m.genre)} / ${h(m.subgenre)}</span><h3>${h(m.title)}</h3>${m.difficulty>=80 && m.quality>=75 ? '<span class="fresh-note">Prestige project · some superstars may lower their fee</span>' : ""}<p>${h(m.premise)}</p></div></div><div class="script-stats">${stat("QUALITY ESTIMATE", ratingRange(E.range(m.quality, s.departments.Development)))}${stat("ROLE DIFFICULTY", `${E.score(m.difficulty)}/100`)}${stat("CAST", `${m.roles.length} roles`)}</div><div class="card-bottom"><strong>${E.accountMoney(m.price)} <small>incl. sequel rights</small></strong>${button("Read & acquire →", "script", `data-script="${m.id}"`, "outline")}</div></article>`).join("")}</div><p class="muted small">Quality is an estimate. There is no prescribed production budget—your choices and your results will teach you the economics.</p>`;
}
function talentAccolades(p) {
  const honors = E.talentHonors(s, p);
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
  return `<div class="genre-strengths"><span><b>Strong in</b> ${sorted
    .slice(0, 2)
    .map(([g]) => g)
    .join(
      " · ",
    )}</span><span><b>Less comfortable</b> ${sorted.at(-1)[0]}</span></div>`;
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
  return `<section class="studio-panorama">${studioArt(s)}<div><span class="eyebrow">YOUR PERMANENT HOME</span><h2>${h(s.name)}</h2><p>Build your studio with money and reputation. Early improvements need cash; later milestones require prestige too.</p></div></section><div class="section-title"><h2>Department unlocks</h2><span class="muted small">People, insight and better execution</span></div><div class="upgrade-grid">${Object.entries(
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
  return `<article class="panel upgrade-card"><span class="eyebrow">${dept ? "DEPARTMENT" : "FACILITY"} · ${h(name)}</span><small class="muted">Current: ${h(owned)}</small><h3>${u.complete ? "Fully established" : h(u.title)}</h3><p>${u.complete ? desc : h(u.benefit)}</p>${!dept ? `<small class="muted">${desc}</small>` : ""}${u.complete ? pill("All improvements owned","mint-pill") : `<div class="unlock-requirements"><span class="${s.prestige>=u.prestige ? "mint" : "muted"}">${s.prestige>=u.prestige ? "✓" : "○"} ${u.prestige ? `${u.prestige} prestige required · you have ${Math.round(s.prestige)}` : "Available to a new studio"}</span><span>${E.money(u.cost)} investment · +${E.money(dept?2:3)}/week</span></div>${button(s.prestige<u.prestige ? "View unlock requirements" : s.cash<u.cost ? "Review funding needed" : "Review investment →","upgrade",`data-name="${name}"`,"outline full")}`}<details class="unlock-roadmap"><summary>Your path in ${h(name)}</summary>${E.UPGRADE_MILESTONES[name].map((title,i)=>`<p>${i<level ? "✓ " : ""}${h(title)}<small class="block">${dept ? ["Starting team","Money only","15 prestige + investment","35 prestige + investment"][i] : ["Money only","15 prestige + investment","35 prestige + investment","60 prestige + investment"][i]}</small></p>`).join("")}</details></article>`;
}
function calendar() {
  return `<div class="notice-banner">August & December: larger blockbuster audiences, heavier competition. Choose a release date after filming wraps. It locks when you confirm it.</div><section class="panel rival-roster"><h3>The other studios in town</h3>${E.RIVAL_STUDIOS.map(r=>`<p><strong>${h(r.name)}</strong><small class="block">${h(r.focus)}</small></p>`).join("")}</section><div class="calendar-grid">${Array.from(
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
  return `${sharkWarning()}<div class="mobile-more">${button("Release calendar", "nav", 'data-tab="calendar"', "outline")}${button("Annual awards", "nav", 'data-tab="awards"', "outline")}${button("Guide & save", "help", "", "outline")}</div><div class="metrics">${stat("AVAILABLE CASH", E.accountMoney(s.cash))}${stat("OUTSTANDING DEBT", E.accountMoney(E.debtTotal(s)))}${stat("WEEKLY OUTFLOW", E.accountMoney(E.burn(s)))}${stat("REMAINING CREDIT", E.accountMoney(E.creditAvailable(s)))}</div><div class="two-columns"><section class="panel"><span class="eyebrow">THREE BANKS · THREE OFFERS</span><h2>Room to take a chance.</h2><p>Borrow from day one. Banks offer 8%, 12%, or 18% annual interest, with separate lending limits and 104 weekly principal payments. Interest declines as the balance falls.</p><div class="finance-lines"><div><span>Total bank lending capacity</span><strong>${E.accountMoney(E.creditLimit(s))}</strong></div><div><span>Current weekly debt payment</span><strong>${E.accountMoney(E.loanPayment(s))}</strong></div><div><span>Operating overhead / week</span><strong>${E.accountMoney(E.overhead(s))}</strong></div><div><span>Committed filming costs remaining</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + E.remaining(m), 0))}</strong></div></div><div class="button-row">${button("Review a loan →", "bank", "", "primary")}${E.debtTotal(s) > 0 ? button("Repay debt", "repay", "", "outline") : ""}</div></section><section class="panel"><span class="eyebrow">THE FINANCIAL PICTURE</span><h2>Know what comes home.</h2><p>Gross box office is what audiences pay. Your studio receives its distribution share, plus any advance and later catalog earnings.</p><div class="finance-lines"><div><span>Total movie spending</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.spent, 0))}</strong></div><div><span>Studio movie receipts</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.receipts, 0))}</strong></div><div><span>Streaming & licensing receipts</span><strong>${E.accountMoney(s.movies.reduce((v, m) => v + m.catalog, 0))}</strong></div><div><span>Facility & department investments</span><strong>${E.accountMoney(s.invested)}</strong></div></div></section></div><div class="section-title"><h2>Project accounts</h2></div><div class="table-wrap"><table><thead><tr><th>Movie</th><th>Spent</th><th>Studio receipts</th><th>Net to date</th></tr></thead><tbody>${s.movies.map((m) => `<tr><td><button class="text-button" data-action="movie" data-id="${m.id}">${h(m.title)}</button></td><td>${E.accountMoney(m.spent)}</td><td>${E.accountMoney(m.receipts)}</td><td class="${m.receipts - m.spent >= 0 ? "mint" : "negative"}">${E.accountMoney(m.receipts - m.spent)}</td></tr>`).join("") || '<tr><td colspan="4">No projects yet. Your first ledger entry is waiting.</td></tr>'}</tbody></table></div>`;
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
    `${season.epilogue ? '<div class="notice-banner">Final awards-season epilogue. Your five operating years are complete; no cash or production time advances here.</div>' : ""}<div class="ceremony-mark">♜</div><h3>${total ? `${total} nomination${total === 1 ? "" : "s"} for ${h(s.name)}` : "No nominations for your studio this season"}</h3><p>These are the nominees. Winners are announced in March.</p>${season.categories.map((c) => `<section class="nomination-category"><span class="eyebrow gold">${c.category}</span>${nomineeRows(c.nominees)}</section>`).join("")}${season.acknowledged ? button("Back to awards", "nominationBack", "", "outline full") : button(season.epilogue ? "Continue to the March ceremony →" : "Back to the lot · ceremony in March", "ackNominations", `data-year="${year}"`, "primary full")}`,
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
    `<div class="ceremony-mark">♜</div><div class="ceremony-progress">CATEGORY ${index + 1} OF ${a.results.length}</div>${revealed ? `<section class="winner-card"><span class="eyebrow gold">AND THE WINNER IS</span>${r.winnerName ? `<h2>${h(r.winnerName)}</h2>` : ""}<h3>${h(r.winner)}</h3><p>${r.ours ? "Your studio wins · +8 prestige" : h(E.rivalStudio(r).name)}</p></section>${button(index === a.results.length - 1 ? "See the ceremony recap →" : "Next category →", "nextAward", `data-year="${year}" data-category="${index}"`, "primary full")}` : `<h3>The nominees</h3>${nomineeRows(r.entries || r.nominees.map((title) => ({ title })))}${button("Open the envelope · reveal winner", "revealAward", `data-year="${year}" data-category="${index}"`, "primary full")}`}`,
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
    `<div class="action-footer"><span>${h(a.text)}</span>${button(a.label, a.action, `data-id="${m.id}" ${a.extra ?? ""}`, "primary")}</div>`,
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
        ? "Below your forecast"
        : m.opening > f.high
          ? "Exceeded your forecast"
          : "Met your forecast";
  const changes = m.careerChanges ?? [],
    gained = changes.filter(
      (c) => Math.round(c.after) > Math.round(c.before),
    ).length,
    lost = changes.filter(
      (c) => Math.round(c.after) < Math.round(c.before),
    ).length;
  return `<div class="opening-context"><p><strong>${forecast}</strong><br>${E.boxOfficeStatus(m).label} compared with other ${E.scopeName(m.scale).toLowerCase()}s.</p><p>Studio receipts: <strong>${E.accountMoney(m.receipts)}</strong><br>${m.receipts >= m.spent ? "Movie profit so far" : "Costs still to recover"}: <strong>${E.accountMoney(Math.abs(m.receipts-m.spent))}</strong></p>${button(`Cast careers: ${gained} gained · ${lost} lost · ${changes.length - gained - lost} unchanged →`, "viewCareers", `data-id="${m.id}"`, "text-button full")}</div>`;
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
  return `<div class="detail-hero">${poster(m, true)}<div>${pill(movieStageLabel(m))}<h2>${h(m.title)}</h2><p>${h(m.genre)} / ${h(m.subgenre)} · ${E.scopeName(m.scale)}</p><p class="muted">${h(m.premise)}</p><p class="scope-description">${E.SCOPES[m.scale].description}</p>${m.release ? `<p class="small peach">Release locked: ${E.date(m.release).label}, week ${E.date(m.release).week}</p>` : ""}</div></div><div class="detail-stats">${stat("SPENT", E.accountMoney(m.spent))}${stat("STUDIO RECEIPTS", E.accountMoney(m.receipts))}${stat("SCRIPT ESTIMATE", ratingRange(E.range(m.scriptQuality, s.departments.Development)))}</div>
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
 ${m.stage === "ready" ? `<section class="panel"><span class="eyebrow">THE FIRST AUDIENCE</span><h3>${m.screen === null ? "What will they think?" : `Test-screening score: ${E.score(m.screen)}/100`}</h3><p>${m.screen === null ? "Pay for a small audience screening before committing your marketing budget. It is a signal, not a prediction." : "One room of people, one imperfect signal. Critics and the wider audience may disagree."}</p>${m.screen === null ? button("Hold test screening · $45,000", "screen", `data-id="${m.id}"`, "outline") : ""}</section>` : ""}
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
    const position=forecast && Number.isFinite(value) ? Math.max(0,Math.min(100,15+70*(value-forecast.low)/Math.max(1,forecast.high-forecast.low))) : null;
    rows.push(`<article class="comparison-row"><div class="comparison-name">${name}</div><div class="comparison-values"><span><small>Expected</small>${expected}</span><strong><small>Result</small>${actual}</strong></div>${position == null ? "" : `<div class="result-track" role="img" aria-label="${h(verdict)} within comparison range"><span class="expected-zone"></span><i style="left:${position}%"></i></div>`}${verdict ? `<span class="expectation-status status-${tone}">${h(verdict)}</span>` : ""}</article>`);
  };
  const verdict = (f,actual) => E.rangePosition(f,actual) ?? "";
  add(
    `Opening ticket sales${m.marketingBudget != null ? `<small>With the ${E.money(m.marketingBudget)} marketing plan</small>` : ""}`,
    m.expectations
      ? `${E.money(m.expectations.low)}–${E.money(m.expectations.high)}`
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
function openingDialog(m) {
  const section=view.openingTab ?? "results";
  modal(h(m.title),`<div class="opening-report">
    <section data-opening-panel="results" ${section !== "results" ? "hidden" : ""}><div class="opening-hero"><span class="eyebrow">OPENING BOX OFFICE</span><strong class="opening-number">${E.accountMoney(m.opening)}</strong></div>${openingContext(m)}<p class="release-spending">Marketing spent: <strong>${E.accountMoney(m.marketingSpendAtRelease ?? m.campaignSpend)}</strong></p>${releaseSignals(m)}${expectationsReview(m)}<p class="muted small">This movie is still earning. Studio overhead is separate.</p></section>
    <section data-opening-panel="reviews" ${section !== "reviews" ? "hidden" : ""}>${criticsPanel(m)}</section>
    <section data-opening-panel="team" ${section !== "team" ? "hidden" : ""}><div class="personal-recap">${careerResults(m)}</div>${button("Consider a sequel", "openingSequel", `data-id="${m.id}"`, "outline full")}</section>
  </div>`,"OPENING NIGHT");
  dialog.querySelector(".modal-body").insertAdjacentHTML("beforebegin",`<nav class="opening-nav" aria-label="Opening night sections">${[["results","Results"],["reviews","Reviews"],["team","Cast & Director"]].map(([key,label])=>button(label,"openingSection",`data-section="${key}" aria-pressed="${section===key}"`,section===key?"selected":"")).join("")}</nav>`);
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
 const offers=E.streamingOffers(m),selected=offers.find(o=>o.id===view.streamingChoice);
 return modal("Your movie’s next chapter",`<p><strong>${h(m.title)}</strong> · 52-week streaming offers</p><div class="table-wrap"><table class="streaming-comparison"><thead><tr><th>Platform</th><th>💵 Now</th><th>📅 Total</th></tr></thead><tbody>${offers.map(o=>{const t=E.streamingTotals(s,m,o);return `<tr><td><strong>${h(o.name)}</strong><small class="block">${o.id==="exclusive"?"🔒 Upfront license":"📈 Weekly royalties"}</small>${button("Review offer","reviewStreaming",`data-deal="${o.id}"`,"text-button")}</td><td>${E.accountMoney(o.upfront)}</td><td><strong>${E.accountMoney(t.full)}</strong><small class="block">Over 52 weeks</small>${t.weeks<52?`<small class="block peach">Before demo ends: ${E.accountMoney(t.remaining)}</small>`:""}</td></tr>`;}).join("")}</tbody></table></div>${selected?`<section class="panel"><h3>${h(selected.name)}</h3><p>${selected.id==="exclusive"?"🔒 Entire payment now · no royalties during the license.":`📈 First royalty: ${E.accountMoney(selected.weekly)} · payments decline weekly.`}</p>${button("Sign with "+selected.name,"signStreaming",`data-id="${m.id}" data-deal="${selected.id}"`,"primary full")}</section>`:'<p class="muted small">Tap Review offer, then sign your choice.</p>'}<details><summary>Contract terms</summary><p>Licensing resumes after 52 weeks. You keep sequel rights. No recoupment or talent ticket shares apply. Future royalties are not paid early when the demo ends.</p></details>${button("Decide later · no streaming income yet","deferStreaming",`data-id="${m.id}"`,"outline full")}`,"STREAMING OFFERS");
}
function report(m) {
  const f = m.releaseFactors;
  return `${streamingSummary(m)}${releaseSignals(m)}${successSummary(m)}${expectationsReview(m)}${criticsPanel(m)}${careerResults(m)}<section><div class="section-title"><h3>The release report</h3>${m.awards.length ? pill(`♜ ${m.awards.length} awards`, "gold-pill") : ""}</div><div class="scores">${stat("TEST SCREENING", m.screen == null ? "Not held" : E.score(m.screen))}${stat("CRITICS", E.score(m.critics))}${stat("FANS", E.score(m.fans))}</div><div class="box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div><i style="height:${Math.max(3, (v / Math.max(...m.boxWeeks)) * 110)}px"></i><small>W${i + 1}</small></div>`).join("")}</div><div class="finance-lines"><div><span>Gross box office</span><strong>${E.accountMoney(m.gross)}</strong></div><div><span>Your share of ticket sales</span><strong>${Math.round(m.share * 100)}%</strong></div><div><span>Release costs / advance recovered by distributor</span><strong>${E.money(m.recouped ?? 0)}</strong></div><div><span>Still to recover before ticket payments</span><strong>${E.money(m.recoupRemaining ?? 0)}</strong></div><div><span>Upfront payment received</span><strong>${E.money(m.advance)}</strong></div><div><span>Streaming & licensing</span><strong>${E.accountMoney(m.catalog)}</strong></div><div><span>Total studio receipts</span><strong>${E.accountMoney(m.receipts)}</strong></div><div><span>Talent revenue shares paid</span><strong>${E.money(m.participationPaid ?? 0)}</strong></div><div><span>Total movie costs (including talent shares)</span><strong>${E.accountMoney(m.spent)}</strong></div><div><span>Movie profit / loss to date</span><strong class="${m.receipts >= m.spent ? "mint" : "negative"}">${E.accountMoney(m.receipts - m.spent)}</strong></div></div><div class="analysis-note"><span class="eyebrow">WHAT WE LEARNED / RESEARCH LEVEL ${s.departments.Research}</span><p>${m.craft < 45 ? "Production values fell short of the project’s ambition." : m.craft > 75 ? "Production spending translated into strong craft." : "Production values were serviceable, with room to improve."} ${m.fans > 75 ? "Audiences are giving the movie strong word of mouth." : m.fans < 50 ? "Weak audience response is limiting repeat business." : "Audience response is mixed to positive."} ${f.reach < 20 ? "Limited marketing held back opening awareness." : "Your campaign put the film in front of an audience."} ${f.rival > 0.3 ? "A crowded release window divided attention." : "Competition was manageable."} ${f.season > 1 ? "The seasonal audience boost helped." : ""}</p>${s.departments.Research >= 2 ? `<p>Average performance ${Math.round(m.performances.reduce((a, v) => a + v, 0) / m.performances.length)}/100 · Craft ${Math.round(m.craft)}/100. ${m.penalty ? `Production compromises reduced quality by approximately ${Math.round(m.penalty)} points.` : "No unresolved production compromises."}</p>` : ""}${s.departments.Research >= 3 ? `<p>Estimated competition reduction: ${Math.round((1 - 1 / (1 + f.rival)) * 100)}%. Seasonal audience boost: ${Math.round((f.season - 1) * 100)}%. Awareness index: ${Math.round(f.reach)}. The opening also includes unpredictable audience demand.</p>` : ""}</div></section>`;
}
function drawDialog() {
  if (!view) return;
  const v = view,
    m = v.id && E.movie(s, v.id);
  if (v.kind === "movie") {
    modal("Project desk", movieDetail(m), "YOUR SLATE");
    projectFooter(m);
    return;
  }
  if (v.kind === "careers")
    return modal("Cast & director careers", careerResults(m), h(m.title));
  if(v.kind==="personalOffer"){
    const actor=E.person(s,v.person),offer=(s.talentOffers??[]).find(o=>o.person===actor.id&&!o.usedBy&&s.week<o.end);
    return modal(h(actor.name),offer?`<p>🌟 Half their usual fee for one role. Audition before agreeing terms.</p>${s.movies.filter(x=>x.stage==="packaging").map(x=>`<section><h3>${h(x.title)}</h3>${x.roles.map((r,i)=>button(`Audition for ${r}`,"auditionInterest",`data-id="${x.id}" data-person="${actor.id}" data-role="${i}"`,"outline")).join("")}</section>`).join("")||`<p>Acquire or develop a screenplay to give them a role.</p>${button('Find a screenplay','nav','data-tab="scripts"','primary full')}`}`:'<p>This opportunity is no longer available.</p>',"TALENT OPPORTUNITY");
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
  if (v.kind === "original")
    return modal(
      "A story of your own",
      `<form id="original-form"><label>Movie title<input name="title" required maxlength="60" placeholder="The title on your first poster"></label><div class="form-grid"><label>Genre<select name="genre" id="genre">${Object.keys(
        E.GENRES,
      )
        .map((g) => `<option>${g}</option>`)
        .join(
          "",
        )}</select></label><label>Subgenre<select name="subgenre" id="subgenre">${E.GENRES.Drama.map((g) => `<option>${g}</option>`).join("")}</select></label></div><label>Production scope<select name="scale">${E.SCALES.map((scale) => `<option value="${scale}">${E.scopeName(scale)}</option>`).join("")}</select></label><div class="scope-guide">${E.SCALES.map((scale) => `<p><strong>${E.scopeName(scale)}</strong> · ${E.SCOPES[scale].description}</p>`).join("")}</div><p class="muted">Development takes 3 weeks. Commissioning costs $100,000 / $200,000 / $300,000 by scale. You set the production budget later.</p><button class="primary full" type="submit">Commission screenplay →</button></form>`,
      "ORIGINAL DEVELOPMENT",
    );
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
    return modal(
      `An offer for ${h(p.name)}`,
      `<div class="person-heading">${portrait(p, 80)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? m.roles[v.role] : "Director"} · ${h(m.title)}</p><p>Expected fee: ${E.money(q.low)}–${E.money(q.high)} ${q.option ? "(existing sequel option)" : ""}</p></div></div>${q.personal ? `<p class="fresh-note">🌟 Loved ${h(q.personal)} · half-rate offer for this role</p>` : q.passion ? `<div class="notice-banner"><strong>“This is a role I want to be part of.”</strong><p>Passion project: their fee is 40% below their ordinary quote, before rounding. Usual range: ${E.money(q.normalLow)}–${E.money(q.normalHigh)}. Revenue-share terms are separate.</p></div>` : ""}<section class="panel"><strong>${q.grossShare ? `Required revenue share: ${Math.round(q.grossShare * 100)}%` : "No revenue share required"}</strong><p>${q.grossShare ? `Paid from your studio’s ticket receipts before recovering costs. Every $1,000,000 your studio receives pays this person ${E.money(1000 * q.grossShare)}. This is in addition to the upfront fee.` : m.scale === "Small" && m.difficulty >= 75 && p.star >= 60 && !E.freshFace(p) ? "They waive participation for this low-budget, challenging awards prospect." : "Your agreement is an upfront fee only."}</p><small>Total cast and director share after hiring: ${Math.round((E.participationRate(m) - (p.kind === "director" ? (m.director?.grossShare ?? 0) : (m.contracts.find((c) => c.role === v.role)?.grossShare ?? 0)) + q.grossShare) * 100)}%. Advances and licensing income are excluded.</small></section><form id="offer-form"><label>Offer ($)<input name="offer" type="text" inputmode="decimal" value="${E.dollarInput(q.option ? q.low : Math.ceil((q.low + q.high) / 2 / 10) * 10)}" required></label>${p.kind === "actor" ? '<label class="checkbox"><input type="checkbox" name="option"> Secure a sequel option (+20% upfront)</label>' : ""}<p class="muted small">Terms are agreed now; the fee is paid at greenlight. Check availability before filming. A sequel option fixes the return fee and revenue share, but does not reserve future dates.</p><button class="primary full">Make offer →</button></form>`,
      "TALENT NEGOTIATION",
    );
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
    return modal("Choose distribution", `${m.responseExpectations ? `<p class="forecast">Expected audience: ${ratingRange(m.responseExpectations.audience)} · Critics: ${ratingRange(m.responseExpectations.critics)}<small>Estimates from your script, hiring reports and any test screening. Actual results may fall outside these ranges.</small></p>` : ""}${distributionOffers(m)}`, h(m.title));
  if (v.kind === "dealReview") {
    const d = E.distribution(s, m)[v.deal],
      example = Math.max(0, 10000 * d.share - d.recoup);
    return modal(
      "Your deal, in dollars",
      `<h3>${h(d.name)}</h3><div class="finance-lines"><div><span>Cash paid to your studio now</span><strong>${E.money(d.advance)}</strong></div><div><span>Release fee paid by you now</span><strong>${E.money(d.cost)}</strong></div><div><span>If audiences buy $10,000,000 in tickets</span><strong>You receive ${E.money(example)}</strong></div></div><p>${h(d.desc)} Release support funded by the distributor: ${E.money(d.support)}. Amount recovered from your ticket share before further payments: ${E.money(d.recoup)}. The example is additional ticket income after recovery and before talent participation. Optional marketing campaigns remain separate.</p>${button("Accept this distribution deal", "distribute", `data-id="${m.id}" data-deal="${v.deal}"`, "primary full")}`,
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
      `<div class="person-heading">${portrait(p, 100)}<div>${pill(p.kind.toUpperCase())}<h3>${h(p.name)}</h3><p>${h(p.gender)} · Age ${p.age} · ${Math.round(p.star)}/100 box-office draw</p><p>Talent estimate ${ratingRange(E.talentEstimate(s, p, p.talent))} · ${p.awards} awards</p></div></div>${talentBadge(p)}${talentAccolades(p)}${talentAwardsHistory(p)}${E.freshFace(p) ? `<p class="fresh-note">${p.kind === "director" ? "Emerging director" : "Fresh face"} · no major credits yet.</p>` : ""}${talentRatings(p)}${genreStrengths(p)}<div class="genre-scores">${Object.entries(
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
      `<div class="ceremony-mark">♜</div><h3>Your ${v.year} releases are in the running.</h3><p>Nominations arrive in January. Winners are announced in March. Release by the end of December to qualify.</p><p class="muted">You can fund a campaign from the Awards screen. A nomination is never guaranteed.</p>${button("Got it · back to the lot", "dismissNotice", "", "primary full")}`,
      "SAVE THE DATES",
    );
  if (v.kind === "prestige") {
    const level = E.PRESTIGE_LEVELS[v.level],
      at = level.at;
    return modal(
      "Your studio just moved up",
      `<div class="prestige-reveal"><span class="laurel">✦</span><span class="eyebrow gold">PRESTIGE LEVEL ${v.level + 1}</span><h2>${h(level.name)}</h2><p>${level.description}</p><div class="benefit-list"><div><strong>Talent negotiations</strong><span>Your reputation helps you negotiate lower talent fees.</span></div><div><strong>Release reach</strong><span>Your reputation helps self-distributed films reach more audiences.</span></div><div><strong>More borrowing room</strong><span>Bank credit limit at least ${E.money(8000 + at * 60)}.</span></div></div><p class="muted small">${at===15 ? "New prestige requirements cleared: specialist departments and expanded facilities." : at===35 ? "New prestige requirements cleared: top-tier departments and advanced facilities." : at===60 ? "New prestige requirements cleared: a full backlot and studio-scale post-production and effects facilities." : "Your reputation keeps improving negotiation and borrowing power."} Each investment still needs cash and the preceding improvements.</p>${button("Explore studio unlocks →", "viewUnlocks", "", "primary full")}${button("Back to the lot", "dismissNotice", "", "outline full")}</div>`,
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
      `<div class="guide"><p><strong>Your aim:</strong> build a profitable, respected movie studio over five years. Different mixes of commercial hits and acclaimed films can succeed.</p><ol><li><strong>Acquire a script.</strong> Buy one in Scripts, or commission an original.</li><li><strong>Choose your cast and director.</strong> Audition actors, compare ranges and fees, then hire your cast and director.</li><li><strong>Greenlight.</strong> Split production spending and choose your schedule. Talent is paid immediately; filming is paid weekly.</li><li><strong>Advance weeks.</strong> Resolve production decisions. You can run several movies if your finances and talent schedules allow.</li><li><strong>Release.</strong> Optionally pay for a test screening, select marketing campaigns, and choose a release date after filming, and compare simple distribution offers.</li><li><strong>Build your history.</strong> Follow weekly receipts, make sequels, invest in departments, and campaign for annual awards.</li></ol><p><strong>Money matters.</strong> Ticket sales are not your revenue. Watch studio receipts, weekly commitments, and debt. If cash falls below zero, choose an emergency loan or close your studio.</p><p><strong>Your save:</strong> stored automatically in this browser. Export it before clearing browser data or switching devices. No account or purchase required.</p><div class="button-row">${button("Export save", "export", "", "outline")}<label class="import-label">Import save<input type="file" id="import-save" accept="application/json,.json"></label></div>${button("Start a new studio", "restart", "", "danger-link")}</div>`,
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
function casting(m, director) {
  const role = view.role ?? 0,
    plan = getProductionPlan(m),
    genre = castingGenre === "all" ? m.genre : castingGenre;
  const people = s.people.filter(
    (p) => p.kind === (director ? "director" : "actor") && !p.retired,
  );
  modal(
    director ? "Find your director" : `Casting: ${m.roles[role]}`,
    `<div class="casting-context"><strong>${h(m.title)}</strong><small>${h(m.roleDescriptions?.[role] ?? m.roles[role] ?? "Lead the creative team")}</small><span>${director ? "" : roleGuidance(m,role)+"<br>"}${m.genre} · ${plan.duration}-week shoot${view.returnTo === "production" ? " · Returning to your production plan" : ""}</span></div><div class="casting-mode">${button(view.showAll ? "Show shortlist" : "Browse all", "castingMode", "", "outline")}${!director ? button(view.showAll ? "Audition shown" : "Audition shortlist", "auditionShortlist", `data-id="${m.id}"`, "outline") : ""}</div><details class="casting-filter-details"><summary>Budget, genre & sorting</summary><div class="casting-filters"><label>Fee range<select id="casting-budget">${[
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
      )}</select></label></div></details><p class="muted small">${view.showAll ? "All matching talent. Check availability before hiring." : director ? "Three available directors to compare." : "A fresh face, a working actor, and a star. If a category is unavailable under your filters, another available actor fills the spot. Auditions are free."}</p>${ratingLegend}<div class="casting-list ${view.showAll ? "" : "shortlist"}">${people
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
          aud = m.auditions[`${role}:${p.id}`],
          booked = !E.available(p, s.week, s.week + plan.duration),
          cast = m.contracts.some((c) => c.id === p.id);
        return `<article class="casting-card"><div class="person-heading">${portrait(p, 52)}<div><h3>${h(p.name)}</h3>${talentBadge(p)}<p class="muted small">${h(p.gender)} · Age ${p.age}${p.kind === "actor" ? ` · Playing age ${Math.max(18,p.age-5)}–${p.age+5}` : ""}</p></div>${button("Career ↗", "person", `data-person="${p.id}"`, "text-button")}</div>${talentAccolades(p)}${q.personal ? `<p class="fresh-note">🌟 Loved ${h(q.personal)} · half-rate offer for this role</p>` : q.passion ? '<p class="fresh-note">Passion project · special reduced fee</p>' : ""}<details class="talent-secondary"><summary>Strengths & ratings</summary>${genreStrengths(p)}${talentRatings(p, genre)}</details><div class="casting-metrics"><span>Expected fee<b>${E.money(q.low)}–${E.money(q.high)}</b>${q.grossShare ? `<small>Plus ${Math.round(q.grossShare * 100)}% of studio ticket receipts</small>` : ""}</span><span>${director ? "Expected direction" : "Audition for this role"}<b>${director ? ratingRange(E.talentEstimate(s, p, E.directorAbility(p, m.genre))) : aud === undefined ? "Not yet held" : ratingRange(E.talentEstimate(s, p, aud))}</b></span></div>${E.freshFace(p) ? '<p class="fresh-note">Still building recognition beyond independent films.</p>' : ""}<div class="card-bottom"><small class="${booked ? "peach" : "muted"}">${q.refusal ? h(q.refusal) : cast ? "Already in this cast" : booked ? `Unavailable during your ${plan.duration}-week shoot` : q.option ? "Sequel option available" : "Available for your shoot"}</small>${q.refusal ? pill("Not interested") : cast ? "" : booked ? pill("Schedule conflict") : !director && aud === undefined ? button("Hold audition", "audition", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline") : button("Negotiate →", "offer", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline")}</div></article>`;
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
      `<p>No available candidates match. Adjust the budget or browse all to inspect schedules.</p>`;
}
function getProductionPlan(m) {
  if (!productionPlans.has(m.id))
    productionPlans.set(m.id, {
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
    `<p>${h(m.title)} · ${E.scopeName(m.scale)} · ${h(m.genre)}</p><form id="production-form"><div class="production-choices">${[["location","📍 Filming locations",E.LOCATION_PLANS],["effectsApproach","🎬 Effects approach",E.EFFECTS_PLANS]].map(([key,label,options])=>`<label>${label}<select name="${key}">${options.map((o,i)=>`<option value="${i}" ${plan[key]===i?"selected":""}>${o.name}</option>`).join("")}</select><small id="${key}-summary"></small></label>`).join("")}</div>${["sets", "crew", "effects"].map((key) => `<label class="budget-slider"><span class="slider-heading"><strong>${{ sets: "Sets & locations", crew: "Crew & post-production", effects: "Effects" }[key]}</strong><output id="${key}-cost"></output></span><input type="range" name="${key}" min="0" max="4" step="1" value="${plan[key]}" aria-label="${key} production tier"><span class="slider-ends"><span>Shoestring</span><span>Flagship</span></span><span class="tier-summary" id="${key}-description"></span></label>`).join("")}<label class="budget-slider"><span class="slider-heading"><strong>Filming schedule</strong><output id="duration-value"></output></span><input type="range" name="duration" min="4" max="20" step="2" value="${plan.duration}" aria-label="Filming weeks"><span class="slider-ends"><span>4 weeks · faster</span><span>20 weeks · more time</span></span></label><div id="production-preview"></div></form>`,
    "COSTS YOU CAN SEE",
  );
  dialog.insertAdjacentHTML(
    "beforeend",
    `<div class="action-footer production-footer"><div id="production-total"></div><button form="production-form" class="primary">Greenlight production →</button></div>`,
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
  m={...m,location:plan.location,effectsApproach:plan.effectsApproach};
  const b = Object.fromEntries(
    ["sets", "crew", "effects"].map((key) => [
      key,
      E.budgetCost(m, key, plan[key]),
    ]),
  );
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
  return `<section><p class="muted small">Compare all three options. Cash now includes the payment to you minus any release fee.</p><table class="distribution-options distribution-overview"><thead><tr><th>Deal</th><th>Cash now</th><th>Share</th><th>Reach</th></tr></thead><tbody>${Object.entries(
    E.distribution(s, m),
  )
    .map(
      ([key, d]) =>
        `<tr><th scope="row">${button(key === "secure" ? "Guaranteed →" : key === "partner" ? "Partner →" : "Self-release →", "dealReview", `data-id="${m.id}" data-deal="${key}"`, "text-button")}<small>${d.recoup ? `Recover ${E.money(d.recoup)} first` : "No recovery"}</small></th><td class="${d.advance - d.cost < 0 ? "negative" : "mint"}">${E.money(d.advance - d.cost)}</td><td>${Math.round(d.share * 100)}%</td><td>${d.reach >= 1.1 ? "Wide" : d.reach >= 1 ? "Established" : "Limited"}</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table><p class="muted small">Share = your share of ticket sales, before talent payouts. For a partner deal, the advance and release support are recovered from that share before more cash reaches your studio.</p><p>Tap a deal to review costs and a dollar example before signing.</p></section>`;
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
    `<section class="screening-option">${m.screen == null ? `<p class="muted small">Optional: hear from a test audience before choosing your release and marketing.</p>${button("Hold test screening · $45,000", "screen", `data-id="${m.id}"`, "outline full")}` : `<p><strong>Test audience: ${E.score(m.screen)}/100</strong><small class="block muted">One audience, not a guarantee of ticket sales.</small></p>`}</section><form id="release-form"><input type="hidden" name="release" id="release-select" value="${view.releaseWeek}"><div class="calendar-nav">${button("←", "releaseMonth", `data-step="-1" aria-label="Previous month" ${view.calendarMonth <= E.date(start).year * 12 + E.date(start).month ? "disabled" : ""}`, "outline")}<h3>${title}</h3>${button("→", "releaseMonth", `data-step="1" aria-label="Next month" ${view.calendarMonth >= E.date(E.END - 1).year * 12 + E.date(E.END - 1).month ? "disabled" : ""}`, "outline")}</div><p class="muted small">Choose an opening week to continue. Time is paused until you lock a date. Look for seasonal matches: February romance, summer action and sci-fi, October horror, and November–December family films. Crowded dates still split audiences.</p><div class="release-calendar">${weeks.map((w) => `<button type="button" class="release-week ${w === view.releaseWeek ? "selected" : ""}" data-action="releaseWeek" data-week="${w}" aria-pressed="${w === view.releaseWeek}"><strong>Week ${E.date(w).week}</strong><span>${E.seasonOpportunity(m,month).label}</span><small>${s.rivals.filter((r) => Math.abs(r.week - w) <= 2).length} nearby releases</small></button>`).join("")}</div><p><strong>Selected: ${E.date(view.releaseWeek).label} · Week ${E.date(view.releaseWeek).week}</strong></p><div id="release-preview"></div><p class="muted small">The date locks when you confirm. Finish marketing and distribution before opening week.</p><button class="primary full">Lock this release date</button></form>`,
    "THE FILM HAS WRAPPED",
  );
  releasePreview(m);
}
function releasePreview(m) {
  const week = Number($("release-select").value),
    rivals = s.rivals.filter((r) => Math.abs(r.week - week) <= 2),
    peak = [7, 11].includes(E.date(week).month);
  $("release-preview").innerHTML =
    `<div class="notice-banner"><strong>${peak ? "Larger blockbuster audience" : "Normal audience demand"} · ${rivals.length > 2 ? "Crowded" : rivals.length ? "Some competition" : "Quiet window"}</strong></div>${rivals.map((r) => `<div class="award-row"><span>${h(r.title)}<small class="block">${h(E.rivalStudio(r).name)} · ${r.genre} · Week ${E.date(r.week).week}</small></span>${pill(r.genre === m.genre ? "Similar audience" : "Different audience", r.genre === m.genre ? "gold-pill" : "")}</div>`).join("") || "<p>No competing releases announced nearby.</p>"}`;
}
function bank() {
  const emergency = s.cash < 0;
  const selected = E.BANKS.find(b => b.id === view.bankId);
  const credit = selected ? E.bankAvailable(s,selected.id) : 0;
  modal(emergency ? "Your studio needs a lifeline." : "Choose your lender.",
    `<p>Each bank has its own lending limit. Bank loans charge annual interest on the remaining balance, with principal repaid weekly over 104 weeks.</p>${sharkWarning()}<div class="campaign-grid">${E.BANKS.map(b => `<button class="campaign ${selected?.id === b.id ? "purchased" : ""}" data-action="selectBank" data-bank="${b.id}" aria-pressed="${selected?.id === b.id}"><strong>${b.name}</strong><b>${Math.round(b.apr*100)}% annual interest</b><span>${E.money(E.bankAvailable(s,b.id))} available</span></button>`).join("")}</div>${selected ? credit >= 1 ? `<form id="loan-form"><input type="hidden" name="bankId" value="${selected.id}"><label>Loan amount ($)<input type="text" inputmode="decimal" name="amount" value="${E.dollarInput(Math.min(Math.floor(credit),Math.max(1000,Math.ceil(-s.cash+E.burn(s)*2))))}" required></label><p>${Math.round(selected.apr*100)}% annual interest · 104 weekly principal payments · No early repayment penalty.</p><button class="primary full">Accept ${selected.name} loan</button></form>` : `<p>This bank has no further loan available.</p>` : `<p>Select a bank to review its loan.</p>`}${E.sharkAvailable(s) ? `<section class="panel"><h3>Last resort: the loan shark</h3><p>Receive <strong>$2,000,000</strong> now. A fixed $400,000 fee makes <strong>$2,400,000 due in 13 weeks</strong> (about three months). No weekly installments. Payment is automatic after that week’s income. If you cannot pay the full balance, the studio closes. Available once per studio, while at least 13 weeks remain in the demo.</p>${button("Accept loan shark terms · $2,000,000", "sharkLoan", "", "primary full")}</section>` : ""}${emergency ? button("End this studio’s run", "end", "", "danger-link") : ""}`, "STUDIO FINANCING");
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
    case "auditionShortlist": {
      const cards = [
        ...dialog.querySelectorAll('[data-action="audition"]'),
      ].map((b) => ({ ...b.dataset }));
      for (const c of cards)
        E.act(s, "audition", { id, person: c.person, role: Number(c.role) });
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
      open("original");
      break;
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
    case "audition": {
      const personId = b.dataset.person;
      const bodyScroll = dialog.querySelector(".modal-body").scrollTop;
      const dialogScroll = dialog.scrollTop;
      if (transact("audition", {
        id,
        person: personId,
        role: Number(b.dataset.role),
      }) && view?.kind === "casting") {
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
      transact("event", { id, choice: b.dataset.choice });
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
    case "bank":
    case "repayAll":
      transact("repay",{amount:E.debtTotal(s)},()=>close());break;
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
  if (f.id === "original-form")
    transact("original", d, (m) => {
      view = { kind: "movie", id: m.id };
      tab = "slate";
    });
  if (f.id === "offer-form")
    transact(
      "hire",
      {
        id: v.id,
        person: v.person,
        role: v.role,
        offer: E.fromDollars(d.offer),
        option: d.option === "on",
      },
      () => {
        view = {
          kind: v.returnTo === "production" ? "production" : "movie",
          id: v.id,
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
            ["duration","location","effectsApproach"].includes(k)
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
    transact("loan", { amount: E.fromDollars(d.amount), bankId: d.bankId }, () => {
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
  if (e.target.closest("#production-form"))
    productionPreview(E.movie(s, view.id));
});
dialog.addEventListener("change", async (e) => {
  if (e.target.id === "genre")
    $("subgenre").innerHTML = E.GENRES[e.target.value]
      .map((v) => `<option>${v}</option>`)
      .join("");
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
