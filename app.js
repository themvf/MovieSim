import * as E from "./engine.js?v=0.6";
import { portrait, poster, studioArt, escapeHtml as h } from "./art.js?v=0.6";
const KEY = "moviesim-save-v1",
  app = document.querySelector("#app"),
  dialog = document.querySelector("#dialog");
let s,
  saveError = false;
try {
  const raw = localStorage.getItem(KEY);
  s = raw ? E.migrateSave(JSON.parse(raw)) : E.newGame();
  if (s.version !== E.VERSION || !Array.isArray(s.movies) || !s.departments)
    throw Error("Old save");
} catch {
  s = E.newGame();
}
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
  toast.timer = setTimeout(() => t.classList.remove("show"), 4500);
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
function render() {
  const d = E.date(s.week),
    active = s.movies.filter(
      (m) => !["catalog", "cancelled"].includes(m.stage),
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
    )}</nav><div class="sidebar-bottom"><div class="year-progress"><span>YOUR FIVE-YEAR STORY</span><strong>Year ${Math.min(5, Math.floor(s.week / 52) + 1)} <i>/ 5</i></strong><div class="bar"><i style="width:${(s.week / 260) * 100}%"></i></div></div>${button("How to play ↗", "help", "", "quiet")}<small>DEMO 0.6 · SAVED ${saveError ? "UNAVAILABLE" : "ON THIS DEVICE"}</small></div></aside>
  <div class="workspace"><header class="topbar"><span class="mobile-brand">▰ MOVIESIM</span><div class="date"><span class="status-dot"></span><strong>${d.label}</strong><span>Week ${d.week}</span></div><div class="top-stats"><div><small>AVAILABLE CASH</small><strong class="${s.cash < 0 ? "negative" : ""}">${E.money(s.cash)}</strong></div><div><small>STUDIO PRESTIGE</small><strong><span class="gold">✦</span> ${Math.round(s.prestige)}<em> / 100</em></strong></div></div>${button(s.ended ? "Studio recap" : s.cash < 0 && !s.epilogue ? "Review financing" : s.epilogue ? "Final awards →" : s.notices.length ? "New announcement →" : decisions.some((m) => m.event) ? "Next decision →" : "Next week →", s.ended ? "recap" : s.cash < 0 && !s.epilogue ? "bank" : s.epilogue || s.notices.length ? "announcements" : decisions.some((m) => m.event) ? "nextDecision" : "next", "", "primary advance")}${!s.ended && !s.epilogue ? button("Next event »", "nextEvent", "", "outline advance-event") : ""}</header>
  <main><div class="page-heading"><div><span class="eyebrow">${tab === "slate" ? "THE PRODUCTION OFFICE" : tab === "scripts" ? "ACQUISITIONS & DEVELOPMENT" : tab === "talent" ? "CASTING & DIRECTION" : tab === "awards" ? "THE SILVER SCREEN AWARDS" : "SILVERLINE / STUDIO OPERATIONS"}</span><h1>${titles[tab]}</h1><p>${subs[tab]}</p></div>${tab === "slate" ? button("+ New movie", "nav", 'data-tab="scripts"', "primary") : tab === "scripts" ? button("+ Create original", "original", "", "primary") : ""}</div>
  ${s.ended ? `<div class="notice-banner">Your five-year story is complete. Explore your studio or ${button("see your retrospective →", "recap", "", "text-button")}.</div>` : ""}
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
function slate() {
  const active = s.movies.filter(
      (m) => !["catalog", "cancelled"].includes(m.stage),
    ),
    released = s.movies.filter((m) =>
      ["theaters", "catalog"].includes(m.stage),
    );
  let list =
    filter === "active"
      ? active
      : filter === "catalog"
        ? s.movies.filter((m) => ["catalog", "cancelled"].includes(m.stage))
        : s.movies;
  return `<section class="hero ${s.started ? "compact-hero" : ""}"><div class="hero-copy"><span class="eyebrow mint">${s.started ? "ON THE LOT THIS WEEK" : "WELCOME TO THE LOT"}</span><h2>${s.started ? `${active.length} picture${active.length === 1 ? "" : "s"} in motion.` : "Small studio.<br>Big picture."}</h2><p>${s.started ? `${active.filter((m) => m.stage === "filming").length} filming · ${released.length} released · Your next decision is below.` : "You have $6 million, an empty slate, and five years. Find a script. Discover a star. Make something that lasts."}</p>${button(s.started ? "Visit your studio ↗" : "Find your first script →", "nav", `data-tab="${s.started ? "studio" : "scripts"}"`, "light-button")}</div><div class="hero-art">${studioArt(s)}<span class="art-caption">${h(s.name)} · LOS ANGELES, ${E.date(s.week).year}</span></div></section>
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
 <div class="slate-layout"><section><div class="section-title"><h2>Your productions <span>${s.movies.length}</span></h2><div class="segmented">${[
   ["active", "Active"],
   ["catalog", "Catalog"],
   ["all", "All"],
 ]
   .map(([k, t]) =>
     button(t, "filter", `data-filter="${k}"`, filter === k ? "selected" : ""),
   )
   .join(
     "",
   )}</div></div>${list.length ? `<div class="movie-list">${list.map(movieCard).join("")}</div>` : `<div class="empty-state"><span class="empty-icon">▰</span><h3>${filter === "catalog" ? "Your legacy starts here." : "Your opening credits are unwritten."}</h3><p>${filter === "catalog" ? "Released movies will keep earning through streaming and licensing." : "The script room has eight stories looking for a studio. One could be your first hit."}</p>${button("Explore scripts →", "nav", 'data-tab="scripts"', "outline")}</div>`}</section><aside class="right-rail"><section class="panel"><span class="eyebrow">THE STUDIO WIRE</span><h3>From the lot</h3>${s.log
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
    : m.stage === "ready"
      ? "Choose distribution"
      : m.stage === "packaging"
        ? "Choose cast & director"
        : null;
  return `<article class="movie-card" data-action="movie" data-id="${m.id}" tabindex="0" role="button" aria-label="Manage ${h(m.title)}">${poster(m)}<div class="movie-info"><div class="movie-meta">${pill(labels[m.stage], m.stage === "theaters" ? "mint-pill" : "")}${m.parent ? pill("SEQUEL", "gold-pill") : ""}</div><h3>${h(m.title)}</h3><p>${h(m.genre)} / ${h(m.subgenre)} <span>·</span> ${E.scopeName(m.scale)}</p><div class="cast-mini">${cast.map((p) => portrait(p, 28)).join("")}<span>${cast.length ? cast.map((p) => h(p.name.split(" ")[0])).join(", ") : "Your cast is waiting to be discovered"}</span></div>${m.stage === "filming" ? `<div class="production-progress"><span>Filming</span><span>${m.progress} / ${m.duration} weeks</span><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div></div>` : ""}${m.boxWeeks.length ? weeklyChart(m) : ""}<div class="movie-bottom"><span>${["theaters", "catalog"].includes(m.stage) ? `Box office <strong>${E.money(m.gross)}</strong>` : `Spent <strong>${E.money(m.spent)}</strong>`}</span><span class="${needs ? "peach" : "muted"}">${needs ? `${needs} →` : m.release ? `${E.date(m.release).label} →` : "View project →"}</span></div></div></article>`;
}
function scripts() {
  return `<div class="section-title"><h2>Available screenplays <span>${s.market.length}</span></h2><span class="muted small">New scripts every 13 weeks</span></div><div class="script-grid">${s.market.map((m) => `<article class="script-card"><div class="script-top">${poster(m)}<div>${pill(E.scopeName(m.scale))}<span class="eyebrow">${h(m.genre)} / ${h(m.subgenre)}</span><h3>${h(m.title)}</h3><p>${h(m.premise)}</p></div></div><div class="script-stats">${stat("QUALITY ESTIMATE", E.range(m.quality, s.departments.Development))}${stat("ROLE DIFFICULTY", `${E.score(m.difficulty)}/100`)}${stat("CAST", `${m.roles.length} roles`)}</div><div class="card-bottom"><strong>${E.money(m.price)} <small>incl. sequel rights</small></strong>${button("Read & acquire →", "script", `data-script="${m.id}"`, "outline")}</div></article>`).join("")}</div><p class="muted small">Quality is an estimate. There is no prescribed production budget—your choices and your results will teach you the economics.</p>`;
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
  return E.freshFace(p)
    ? pill("Fresh face", "mint-pill")
    : pill(
        p.star >= 60 ? "Established star" : "Working talent",
        p.star >= 60 ? "gold-pill" : "",
      );
}
function talentRatings(p, genre) {
  const level = s.departments.Casting;
  return `<div class="actor-ratings">${stat("OVERALL RATING", E.estimateText(E.talentEstimate(s, p, p.talent)))}${p.kind === "actor" ? stat("SCREEN PRESENCE", E.estimateText(E.talentEstimate(s, p, p.presence))) : ""}${stat("FAME", `${E.score(p.star)}/100`)}${genre ? stat(`${genre.toUpperCase()} ABILITY`, E.estimateText(E.talentEstimate(s, p, p.genres[genre]))) : ""}</div>`;
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
    )}</div></div><div class="talent-grid">${list.map((p) => `<button class="talent-card" data-action="person" data-person="${p.id}">${portrait(p, 64)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? "Actor" : "Director"} · Age ${p.age}</p><div class="talent-tags">${p.retired ? pill("Retired") : talentBadge(p)}</div>${talentAccolades(p)}${E.freshFace(p) ? '<p class="fresh-note">No major credits yet. This could be their breakthrough.</p>' : ""}${genreStrengths(p)}${talentRatings(p)}<p class="fee-line">Expected fee <strong>${E.money(p.fee * 0.85)}–${E.money(p.fee * 1.12)}</strong></p></div></button>`).join("")}</div>`;
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
  return `<section class="studio-panorama">${studioArt(s)}<div><span class="eyebrow">YOUR PERMANENT HOME</span><h2>${h(s.name)}</h2><p>Rent what you need from day one. Own it when the investment makes sense.</p></div></section><div class="section-title"><h2>Departments</h2><span class="muted small">Better people. Better information.</span></div><div class="upgrade-grid">${Object.entries(
    s.departments,
  )
    .map(([name, level]) => upgradeCard(name, level, desc[name], true))
    .join(
      "",
    )}</div><div class="section-title"><h2>Facilities</h2><span class="muted small">Practical upgrades, visible progress</span></div><div class="upgrade-grid">${Object.entries(
    s.facilities,
  )
    .map(([name, level]) => upgradeCard(name, level, desc[name], false))
    .join("")}</div>`;
}
function upgradeCard(name, level, desc, dept) {
  return `<article class="panel upgrade-card"><div class="upgrade-icon">${dept ? "▤" : "▥"}</div><span class="eyebrow">${dept ? "DEPARTMENT" : "FACILITY"} / ${level ? "LEVEL " + level : "RENTED"}</span><h3>${name}</h3><p>${desc}</p><div class="level-blocks">${Array.from({ length: 4 }, (_, i) => `<i class="${i < level ? "filled" : ""}"></i>`).join("")}</div><div class="card-bottom"><small>+${E.money(dept ? 2 : 3)}/week overhead</small>${level < 4 ? button(`Upgrade · ${E.money(E.upgradeCost(s, name))}`, "upgrade", `data-name="${name}"`, "outline") : pill("Fully upgraded", "mint-pill")}</div></article>`;
}
function calendar() {
  return `<div class="notice-banner">August & December: larger blockbuster audiences, heavier competition. Choose a release date after filming wraps. It locks when you confirm it.</div><div class="calendar-grid">${Array.from(
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
      return `<section class="calendar-month ${[7, 11].includes(i) ? "peak" : ""} ${E.date(s.week).month === i ? "current" : ""}"><div><h3>${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]}</h3>${[7, 11].includes(i) ? pill("PEAK WINDOW", "gold-pill") : ""}</div>${ours.map((m) => `<button data-action="movie" data-id="${m.id}" class="calendar-release ours"><small>YOUR STUDIO · WEEK ${E.date(m.release).week}</small><strong>${h(m.title)}</strong><span>${h(m.genre)}</span></button>`).join("")}${rivals.map((r) => `<div class="calendar-release"><small>WEEK ${E.date(r.week).week} · COMPETITOR</small><strong>${h(r.title)}</strong><span>${r.genre} · ${r.strength >= 75 ? "Major release" : "Independent release"}</span></div>`).join("")}</section>`;
    },
  ).join("")}</div>`;
}
function finance() {
  return `<div class="mobile-more">${button("Release calendar", "nav", 'data-tab="calendar"', "outline")}${button("Annual awards", "nav", 'data-tab="awards"', "outline")}${button("Guide & save", "help", "", "outline")}</div><div class="metrics">${stat("AVAILABLE CASH", E.money(s.cash))}${stat("OUTSTANDING DEBT", E.money(E.debtTotal(s)))}${stat("WEEKLY OUTFLOW", E.money(E.burn(s)))}${stat("REMAINING CREDIT", E.money(E.creditAvailable(s)))}</div><div class="two-columns"><section class="panel"><span class="eyebrow">FIRST PICTURE BANK</span><h2>Room to take a chance.</h2><p>Borrow from day one. Every loan has a 12% annual interest rate and 104 weekly principal payments. Interest declines as the balance falls.</p><div class="finance-lines"><div><span>Bank credit limit</span><strong>${E.money(E.creditLimit(s))}</strong></div><div><span>Current weekly debt payment</span><strong>${E.money(E.loanPayment(s))}</strong></div><div><span>Operating overhead / week</span><strong>${E.money(E.overhead(s))}</strong></div><div><span>Committed filming costs remaining</span><strong>${E.money(s.movies.reduce((v, m) => v + E.remaining(m), 0))}</strong></div></div><div class="button-row">${button("Review a loan →", "bank", "", "primary")}${E.debtTotal(s) > 0 ? button("Repay debt", "repay", "", "outline") : ""}</div></section><section class="panel"><span class="eyebrow">THE FINANCIAL PICTURE</span><h2>Know what comes home.</h2><p>Gross box office is what audiences pay. Your studio receives its distribution share, plus any advance and later catalog earnings.</p><div class="finance-lines"><div><span>Total movie spending</span><strong>${E.money(s.movies.reduce((v, m) => v + m.spent, 0))}</strong></div><div><span>Studio movie receipts</span><strong>${E.money(s.movies.reduce((v, m) => v + m.receipts, 0))}</strong></div><div><span>Streaming & licensing receipts</span><strong>${E.money(s.movies.reduce((v, m) => v + m.catalog, 0))}</strong></div><div><span>Facility & department investments</span><strong>${E.money(s.invested)}</strong></div></div></section></div><div class="section-title"><h2>Project accounts</h2></div><div class="table-wrap"><table><thead><tr><th>Movie</th><th>Spent</th><th>Studio receipts</th><th>Net to date</th></tr></thead><tbody>${s.movies.map((m) => `<tr><td><button class="text-button" data-action="movie" data-id="${m.id}">${h(m.title)}</button></td><td>${E.money(m.spent)}</td><td>${E.money(m.receipts)}</td><td class="${m.receipts - m.spent >= 0 ? "mint" : "negative"}">${E.money(m.receipts - m.spent)}</td></tr>`).join("") || '<tr><td colspan="4">No projects yet. Your first ledger entry is waiting.</td></tr>'}</tbody></table></div>`;
}
function awards() {
  const eligible = s.movies.filter((m) => E.canCampaign(s, m)),
    latest = s.seasons.at(-1),
    pending = s.awards.find((a) => !a.completed);
  return `<section class="awards-hero"><span class="laurel">❧ ♜ ❧</span><span class="eyebrow gold">THE SILVER SCREEN AWARDS</span><h2>A season worth<br>looking forward to.</h2><div class="awards-timeline"><span>DECEMBER<small>Eligibility closes</small></span><span>JANUARY<small>Nominations announced</small></span><span>MARCH<small>Winners revealed</small></span></div><p>Each season celebrates the previous year’s films.</p>${pending ? button("Awards ceremony · watch the winners →", "awardsInvite", `data-year="${pending.year}"`, "primary") : latest ? button(`View ${latest.year} nominations`, "nominations", `data-year="${latest.year}"`, "outline") : ""}</section><div class="section-title"><h2>Your contenders</h2></div>${eligible.length ? eligible.map((m) => `<div class="contender"><div><h3>${h(m.title)}</h3><p>${E.date(m.release).year} releases · Critics ${m.critics} · Fans ${m.fans}</p></div>${m.awardSpend ? pill("Campaign funded", "gold-pill") : button("Fund campaign · $150,000", "awardCampaign", `data-id="${m.id}"`, "outline")}</div>`).join("") : '<div class="empty-state compact"><h3>Your next nomination starts with a film.</h3><p>Release by December to enter the following spring’s awards.</p></div>'}<div class="section-title"><h2>Awards history</h2></div>${s.seasons.map((a) => `<div class="contender"><div><h3>${a.year} film season</h3><p>${a.categories.reduce((v, c) => v + c.nominees.filter((n) => n.id).length, 0)} studio nominations</p></div>${button("Nominations", "nominations", `data-year="${a.year}"`, "outline")}</div>`).join("")}${
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
        `<div class="nominee-row ${n.id ? "studio-nominee" : ""}"><div>${n.name ? `<strong>${h(n.name)}</strong>` : ""}<span>${h(n.title)}</span></div>${n.id ? pill("Your studio", "gold-pill") : pill("Competitor")}</div>`,
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
    `<div class="ceremony-mark">♜</div><div class="ceremony-progress">CATEGORY ${index + 1} OF ${a.results.length}</div>${revealed ? `<section class="winner-card"><span class="eyebrow gold">AND THE WINNER IS</span>${r.winnerName ? `<h2>${h(r.winnerName)}</h2>` : ""}<h3>${h(r.winner)}</h3><p>${r.ours ? "Your studio wins · +8 prestige" : "Awarded to a competing studio"}</p></section>${button(index === a.results.length - 1 ? "See the ceremony recap →" : "Next category →", "nextAward", `data-year="${year}" data-category="${index}"`, "primary full")}` : `<h3>The nominees</h3>${nomineeRows(r.entries || r.nominees.map((title) => ({ title })))}${button("Open the envelope · reveal winner", "revealAward", `data-year="${year}" data-category="${index}"`, "primary full")}`}`,
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
          `<div class="ceremony-category ${r.ours ? "winner" : ""}"><span class="eyebrow gold">${r.category}</span>${r.winnerName ? `<h3>${h(r.winnerName)}</h3>` : ""}<strong>${h(r.winner)}</strong><p>${r.ours ? "Your studio · +8 prestige" : "Competing studio"}</p></div>`,
      )
      .join("")}${button("Continue →", "afterAwards", "", "primary full")}`,
    "THE AWARDS ARCHIVE",
  );
}
function productionDecision(m) {
  const kind = m.event.kind;
  const choices =
    kind === "creative"
      ? [
          ["pay", "Crowd-pleasing edit", "Fans +6; critics −3. No added cost."],
          [
            "split",
            "Challenging director’s edit",
            "Critics +6; fans −3. No added cost.",
          ],
          [
            "cut",
            "Keep the balanced edit",
            "No score adjustment or added cost.",
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
  return `<section class="decision-box"><span class="eyebrow peach">PRODUCTION NEEDS YOU</span><h3>${h(m.event.title)}</h3><p>${h(m.event.text)}</p><div class="choice-stack">${choices.map(([choice, label, detail]) => button(`${h(label)}<small>${h(detail)}</small>`, "event", `data-id="${m.id}" data-choice="${choice}"`, "choice")).join("")}</div></section>`;
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
      label: m.release == null ? "Choose release week" : "Choose distribution",
      action: m.release == null ? "release" : "jumpDistribution",
      text: "Filming wrapped",
    };
  return {
    label: "Advance to next event",
    action: "nextEvent",
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
function releaseRecap(m) {
  const unrecovered = Math.max(0, m.spent - m.receipts);
  const best = [...(m.careerChanges ?? [])].sort(
    (a, b) => b.performance - a.performance,
  )[0];
  const person = best && E.person(s, best.id);
  return `<section class="personal-recap"><div class="scores">${stat("STUDIO RECEIPTS SO FAR", E.money(m.receipts))}${stat(unrecovered ? "COSTS STILL TO RECOVER" : "MOVIE PROFIT SO FAR", E.money(unrecovered || m.receipts - m.spent))}</div><p class="muted small">Includes the advance and ticket share. This run is still earning; studio overhead is separate.</p>${person ? `<div class="career-headline">${portrait(person, 48)}<div><strong>${h(person.name)} delivered ${E.score(best.performance)}/100</strong><p>Fame ${E.score(best.before)} → ${E.score(best.after)} · Asking range ${E.money(best.fee * 0.85)}–${E.money(best.fee * 1.12)}</p>${button("View career", "openingCareer", `data-person="${person.id}" data-id="${m.id}"`, "text-button")}</div></div>` : ""}<p>${m.fans >= 75 ? "Strong audience response gives this run a better chance to hold." : m.fans < 50 ? "Weak audience response may shorten this run." : "Audience response is mixed; watch the next few weeks."} ${m.releaseFactors?.reach < 20 ? "Your campaign reached a relatively small audience." : "Your campaign increased opening awareness."}</p></section>`;
}
function sequelReview(m) {
  modal(
    "What carries into the sequel",
    `<h3>${h(m.title)}</h3><p>Fans ${E.score(m.fans)}/100 · Movie result so far ${E.money(m.receipts - m.spent)}</p><p>${m.fans > 45 ? "The original has audience interest to carry into a follow-up. A better fan response brings a larger opening boost." : "The original offers little built-in audience momentum. A sequel still needs to earn its audience."}</p>${m.contracts
      .map((c) => {
        const p = E.person(s, c.id);
        return `<div class="award-row"><span>${h(p.name)}<small class="block">${c.option ? "Return fee locked by option" : "New negotiation required"}</small></span><strong>${c.option ? E.money(c.fee) : `${E.money(p.fee * 0.85)}–${E.money(p.fee * 1.12)}`}</strong></div>`;
      })
      .join(
        "",
      )}<p>A new chapter takes three weeks to develop. Returning talent still needs to be available.</p>${button("Commission sequel · $140,000", "confirmSequel", `data-id="${m.id}"`, "primary full")}`,
    "CONTINUE THE STORY",
  );
}
function movieDetail(m) {
  const cast = [...m.contracts].sort((a, b) => a.role - b.role);
  return `<div class="detail-hero">${poster(m, true)}<div>${pill(labels[m.stage])}<h2>${h(m.title)}</h2><p>${h(m.genre)} / ${h(m.subgenre)} · ${E.scopeName(m.scale)}</p><p class="muted">${h(m.premise)}</p><p class="scope-description">${E.SCOPES[m.scale].description}</p>${m.release ? `<p class="small peach">Release locked: ${E.date(m.release).label}, week ${E.date(m.release).week}</p>` : ""}</div></div><div class="detail-stats">${stat("SPENT", E.money(m.spent))}${stat("STUDIO RECEIPTS", E.money(m.receipts))}${stat("SCRIPT ESTIMATE", E.range(m.scriptQuality, s.departments.Development))}</div>
 ${m.event ? productionDecision(m) : ""}
 ${m.stage === "development" ? `<div class="notice-banner">Your development department is writing. Ready in ${Math.max(0, m.ready - s.week)} weeks.</div>` : ""}
 ${
   m.stage === "packaging"
     ? `<section><div class="section-title"><h3>Cast & director</h3>${button("Rename movie", "rename", `data-id="${m.id}"`, "text-button")}</div><p class="muted small">Role difficulty ${E.score(m.difficulty)}/100. Auditions are free and immediate. Agreements are paid when cameras roll.</p><div class="role-list">${m.roles
         .map((r, i) => {
           const c = cast.find((c) => c.role === i),
             p = c && E.person(s, c.id);
           return `<div class="role-row">${p ? portrait(p, 44) : '<span class="vacant">♙</span>'}<div><small>${r.toUpperCase()}</small><span class="role-description">${h(m.roleDescriptions?.[i] ?? "")}</span><strong>${p ? h(p.name) : "Find your actor"}</strong>${c ? `<span>${E.money(c.fee)} ${c.option ? "· sequel option +20%" : ""}</span>` : ""}</div>${button(p ? "Recast" : "Audition →", "casting", `data-id="${m.id}" data-role="${i}"`, "outline")}</div>`;
         })
         .join(
           "",
         )}<div class="role-row">${m.director ? portrait(E.person(s, m.director.id), 44) : '<span class="vacant">▰</span>'}<div><small>DIRECTOR</small><strong>${m.director ? h(E.person(s, m.director.id).name) : "Find your director"}</strong>${m.director ? `<span>${E.money(m.director.fee)}</span>` : ""}</div>${button(m.director ? "Replace" : "Browse →", "director", `data-id="${m.id}"`, "outline")}</div></div>${button("Plan production →", "production", `data-id="${m.id}"`, "primary full")}</section>`
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
function campaigns(m) {
  const proj =
    m.stage === "scheduled" && m.expectations
      ? [m.expectations.low, m.expectations.high]
      : E.projection(s, m);
  return `<section><div class="section-title"><h3>Make some noise</h3><span class="muted small">${E.money(m.campaignSpend)} committed</span></div><div class="campaign-grid">${E.CAMPAIGNS.map((c, i) => `<button class="campaign ${m.campaigns.includes(i) ? "purchased" : ""}" data-action="campaign" data-id="${m.id}" data-campaign="${i}" ${m.campaigns.includes(i) ? "disabled" : ""}><strong>${c.name}</strong><span>${c.desc}</span><b>${m.campaigns.includes(i) ? "✓ Campaign launched" : E.money(c.cost)}</b></button>`).join("")}</div><p class="forecast"><span>RESEARCH / LEVEL ${s.departments.Research}</span>Rough opening estimate: <strong>${E.money(proj[0])}–${E.money(proj[1])}</strong><small>Uncertain gross box office. Actual results can fall outside this range.</small></p></section>`;
}
function weeklyChart(m) {
  const peak = Math.max(...m.boxWeeks, 1),
    last = (m.resurgences ?? []).find((r) => r.index === m.boxWeeks.length - 1);
  return `<div class="card-box-office"><div class="section-title"><span class="eyebrow">WEEKLY BOX OFFICE</span><strong>${E.money(m.boxWeeks.at(-1))} latest week</strong></div><div class="mini-box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div title="Week ${i + 1}: ${E.money(v)}"><i class="${(m.resurgences ?? []).some((r) => r.index === i) ? "resurgence" : ""}" style="height:${Math.max(3, (v / peak) * 48)}px"></i><small>${i + 1}</small></div>`).join("")}</div>${last ? `<p class="gold small">↗ ${h(last.reason)} · Audiences are returning</p>` : ""}</div>`;
}
function talentReview(m) {
  const entries = [
    ...m.contracts.map((c, i) => ({
      c,
      actual: m.performances?.[i],
      role: m.roles[c.role],
    })),
    ...(m.director
      ? [{ c: m.director, actual: m.directorPerformance, role: "Director" }]
      : []),
  ];
  return `<section class="talent-review"><span class="eyebrow">CAST & DIRECTOR · EXPECTATIONS VS REALITY</span><p class="muted small">The estimate you hired on, compared with the work delivered in this film. This measures performance, not fame or ticket sales.</p>${entries
    .map(({ c, actual, role }) => {
      const p = E.person(s, c.id),
        f = c.expectation,
        result = actual == null ? null : E.score(actual);
      const verdict =
        f && result != null
          ? result < f.low
            ? "Below expectations"
            : result > f.high
              ? "Above expectations"
              : "Within expectations"
          : "Earlier film · comparison unavailable";
      return `<article class="talent-result"><div class="person-heading">${portrait(p, 40)}<div><strong>${h(p.name)}</strong><small class="block">${h(role)}</small></div></div><div class="scores">${stat("EXPECTED", f ? E.estimateText(f) : "Not recorded")}${stat("DELIVERED", result == null ? "Not recorded" : `${result}/100`)}</div><p class="${verdict === "Above expectations" ? "mint" : "muted"}">${verdict}</p></article>`;
    })
    .join("")}</section>`;
}
function expectationsReview(m) {
  const f = m.expectations;
  if (!f)
    return `<p class="muted small">No saved pre-release forecast is available for this earlier release.</p>`;
  const result =
    m.opening < f.low
      ? "Below expectations"
      : m.opening > f.high
        ? "Above expectations"
        : "Within expectations";
  return `<section class="expectations-review"><span class="eyebrow">EXPECTATIONS VS REALITY</span><h3>${result}</h3><div class="scores">${stat("FORECAST", `${E.money(f.low)}–${E.money(f.high)}`)}${stat("ACTUAL OPENING", E.money(m.opening))}</div><p class="muted small">Saved before release · Research level ${f.research}. Gross ticket payments, before the distributor’s share and movie costs.</p>${m.screen != null ? `<p>Test audience: ${E.score(m.screen)}/100 · Opening fans: ${E.score(m.fans)}/100</p>` : ""}</section>`;
}
function report(m) {
  const f = m.releaseFactors;
  return `<section><div class="section-title"><h3>The release report</h3>${m.awards.length ? pill(`♜ ${m.awards.length} awards`, "gold-pill") : ""}</div><div class="scores">${stat("TEST SCREENING", m.screen == null ? "Not held" : E.score(m.screen))}${stat("CRITICS", E.score(m.critics))}${stat("FANS", E.score(m.fans))}</div><div class="box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div><i style="height:${Math.max(3, (v / Math.max(...m.boxWeeks)) * 110)}px"></i><small>W${i + 1}</small></div>`).join("")}</div><div class="finance-lines"><div><span>Gross box office</span><strong>${E.money(m.gross)}</strong></div><div><span>Your share of ticket sales</span><strong>${Math.round(m.share * 100)}%</strong></div><div><span>Advance received</span><strong>${E.money(m.advance)}</strong></div><div><span>Streaming & licensing</span><strong>${E.money(m.catalog)}</strong></div><div><span>Total studio receipts</span><strong>${E.money(m.receipts)}</strong></div><div><span>Total movie costs</span><strong>${E.money(m.spent)}</strong></div><div><span>Movie profit / loss to date</span><strong class="${m.receipts >= m.spent ? "mint" : "negative"}">${E.money(m.receipts - m.spent)}</strong></div></div>${talentReview(m)}<div class="analysis-note"><span class="eyebrow">WHAT WE LEARNED / RESEARCH LEVEL ${s.departments.Research}</span><p>${m.craft < 45 ? "Production values fell short of the project’s ambition." : m.craft > 75 ? "Production spending translated into strong craft." : "Production values were serviceable, with room to improve."} ${m.fans > 75 ? "Audiences are giving the movie strong word of mouth." : m.fans < 50 ? "Weak audience response is limiting repeat business." : "Audience response is mixed to positive."} ${f.reach < 20 ? "Limited marketing held back opening awareness." : "Your campaign put the film in front of an audience."} ${f.rival > 0.3 ? "A crowded release window divided attention." : "Competition was manageable."} ${f.season > 1 ? "The seasonal audience boost helped." : ""}</p>${s.departments.Research >= 2 ? `<p>Average performance ${Math.round(m.performances.reduce((a, v) => a + v, 0) / m.performances.length)}/100 · Craft ${Math.round(m.craft)}/100. ${m.penalty ? `Production compromises reduced quality by approximately ${Math.round(m.penalty)} points.` : "No unresolved production compromises."}</p>` : ""}${s.departments.Research >= 3 ? `<p>Estimated competition reduction: ${Math.round((1 - 1 / (1 + f.rival)) * 100)}%. Seasonal audience boost: ${Math.round((f.season - 1) * 100)}%. Awareness index: ${Math.round(f.reach)}. The opening also includes unpredictable audience demand.</p>` : ""}</div></section>`;
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
  if (v.kind === "sequelReview") return sequelReview(m);
  if (v.kind === "script") {
    const sc = s.market.find((x) => x.id === v.script);
    if (!sc) {
      close();
      return;
    }
    return modal(
      h(sc.title),
      `<div class="detail-hero">${poster(sc, true)}<div>${pill(E.scopeName(sc.scale))}<h3>${h(sc.genre)} / ${h(sc.subgenre)}</h3><p>${h(sc.premise)}</p><p>Script quality estimate: <strong>${E.range(sc.quality, s.departments.Development)}</strong></p><p>Role difficulty: <strong>${sc.difficulty}/100</strong></p><p>Cast: ${sc.roles.join(", ")}</p></div></div><p class="scope-description">${E.SCOPES[sc.scale].description}</p><p>Includes the screenplay and sequel rights. You can rename the movie after acquisition. Production, talent, and marketing are separate expenses.</p>${button(`Acquire screenplay · ${E.money(sc.price)}`, "buy", `data-script="${sc.id}"`, "primary full")}`,
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
    return modal(
      `An offer for ${h(p.name)}`,
      `<div class="person-heading">${portrait(p, 80)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? m.roles[v.role] : "Director"} · ${h(m.title)}</p><p>Expected fee: ${E.money(q.low)}–${E.money(q.high)} ${q.option ? "(existing sequel option)" : ""}</p></div></div><form id="offer-form"><label>Offer ($)<input name="offer" type="text" inputmode="decimal" value="${E.dollarInput(q.option ? q.low : Math.ceil((q.low + q.high) / 2 / 10) * 10)}" required></label>${p.kind === "actor" ? '<label class="checkbox"><input type="checkbox" name="option"> Secure a sequel option (+20% upfront)</label>' : ""}<p class="muted small">Terms are agreed now; the fee is paid at greenlight. Check availability before filming. A sequel option fixes the return fee, but does not reserve future dates.</p><button class="primary full">Make offer →</button></form>`,
      "TALENT NEGOTIATION",
    );
  }
  if (v.kind === "production") return production(m);
  if (v.kind === "release") return releasePlanner(m);
  if (v.kind === "dealReview") {
    const d = E.distribution(s, m)[v.deal],
      example = 10000 * d.share;
    return modal(
      "Your deal, in dollars",
      `<h3>${h(d.name)}</h3><div class="finance-lines"><div><span>Cash paid to your studio now</span><strong>${E.money(d.advance)}</strong></div><div><span>Release fee paid by you now</span><strong>${E.money(d.cost)}</strong></div><div><span>If audiences buy $10,000,000 in tickets</span><strong>You receive ${E.money(example)}</strong></div></div><p>The ticket income is in addition to your upfront payment. Your marketing spending stays separate.</p>${button("Accept this distribution deal", "distribute", `data-id="${m.id}" data-deal="${v.deal}"`, "primary full")}`,
      "DISTRIBUTION REVIEW",
    );
  }
  if (v.kind === "bank") return bank();
  if (v.kind === "repay")
    return modal(
      "Reduce your debt",
      `<form id="repay-form"><label>Repayment ($)<input name="amount" type="text" inputmode="decimal" value="${E.dollarInput(Math.min(1000, E.debtTotal(s), s.cash), 2)}" required></label><p>No early repayment penalty. Keep enough cash for upcoming weekly commitments.</p><button class="primary full">Repay principal</button></form>`,
      "FIRST PICTURE BANK",
    );
  if (v.kind === "person") {
    const p = E.person(s, v.person);
    return modal(
      h(p.name),
      `<div class="person-heading">${portrait(p, 100)}<div>${pill(p.kind.toUpperCase())}<h3>${h(p.name)}</h3><p>Age ${p.age} · ${E.score(p.star)}/100 box-office draw</p><p>Talent estimate ${E.estimateText(E.talentEstimate(s, p, p.talent))} · ${p.awards} awards</p></div></div>${talentBadge(p)}${talentAccolades(p)}${talentAwardsHistory(p)}${E.freshFace(p) ? '<p class="fresh-note">Fresh face · no major credits yet.</p>' : ""}${talentRatings(p)}${genreStrengths(p)}<div class="genre-scores">${Object.entries(
        p.genres,
      )
        .map(
          ([g, value]) =>
            `<span>${g}<b>${E.estimateText(E.talentEstimate(s, p, value))}</b></span>`,
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
      }<h3>Films with your studio</h3>${p.history.map((f) => `<div class="award-row"><span>${h(f.title)} · ${f.year}</span><strong>${Math.round(f.score)}/100</strong></div>`).join("") || '<p class="muted">No films with your studio yet.</p>'}`,
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
      `<h3>${h(m.title)}</h3><p>You have spent ${E.money(m.spent)}. That money is not returned.</p><p>Contract closeout: <strong>${E.money(E.remaining(m) * 0.15)}</strong><br>Future filming spending avoided: <strong>${E.money(E.remaining(m) * 0.85)}</strong></p><p class="muted">Talent fees already paid are nonrefundable. Outstanding bank debt remains.</p>${button("Shelve movie", "confirmCancel", `data-id="${m.id}"`, "danger full")}`,
      "CANCELLATION REVIEW",
    );
  if (v.kind === "upgrade")
    return modal(
      `Invest in ${h(v.name)}`,
      `<p>Upfront investment: <strong>${E.money(E.upgradeCost(s, v.name))}</strong></p><p>Weekly operating expenses increase by ${E.money(Object.hasOwn(s.departments, v.name) ? 2 : 3)}. This investment lasts for the rest of your studio’s run.</p>${button("Approve upgrade", "confirmUpgrade", `data-name="${h(v.name)}"`, "primary full")}`,
      "STUDIO INVESTMENT",
    );
  if (v.kind === "opening")
    return modal(
      "The numbers are in.",
      `<div class="opening-reveal"><span class="eyebrow gold">OPENING WEEKEND</span><h2>${h(m.title)}</h2><strong class="opening-number">${E.money(m.opening)}</strong><p>GROSS BOX OFFICE</p>${releaseRecap(m)}${button("Consider a sequel", "openingSequel", `data-id="${m.id}"`, "outline full")}<details><summary>Forecast & detailed performance report</summary>${poster(m, true)}${expectationsReview(m)}<div class="scores">${stat("CRITICS", E.score(m.critics))}${stat("FANS", E.score(m.fans))}${stat("YOUR FIRST RECEIPTS", E.money(m.opening * m.share))}</div><p class="muted">${m.fans > 75 ? "The audience is talking. Now let’s see how long the run lasts." : m.fans < 50 ? "A tough first audience. Keep a close eye on further marketing spending." : "The first weekend is only the beginning. Word of mouth takes over from here."}</p>${talentReview(m)}</details>${button("Back to the lot →", "dismissNotice", "", "primary full")}</div>`,
      "THE BOX OFFICE",
    );
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
      `<div class="prestige-reveal"><span class="laurel">✦</span><span class="eyebrow gold">PRESTIGE LEVEL ${v.level + 1}</span><h2>${h(level.name)}</h2><p>${level.description}</p><div class="benefit-list"><div><strong>Talent negotiations</strong><span>Your reputation helps you negotiate lower talent fees.</span></div><div><strong>Distribution offers</strong><span>Distributors offer more cash upfront and a larger share of ticket payments.</span></div><div><strong>More borrowing room</strong><span>Bank credit limit at least ${E.money(8000 + at * 60)}.</span></div></div><p class="muted small">Benefits improve gradually with prestige. Talent and facilities remain available from the start.</p>${button("Back to the lot →", "dismissNotice", "", "primary full")}</div>`,
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
function casting(m, director) {
  const role = view.role ?? 0,
    plan = getProductionPlan(m),
    genre = castingGenre === "all" ? m.genre : castingGenre;
  const people = s.people.filter(
    (p) => p.kind === (director ? "director" : "actor") && !p.retired,
  );
  modal(
    director ? "Find your director" : `Casting: ${m.roles[role]}`,
    `<div class="casting-context"><strong>${h(m.title)}</strong><small>${h(m.roleDescriptions?.[role] ?? m.roles[role] ?? "Lead the creative team")}</small><span>${m.genre} · ${plan.duration}-week shoot${view.returnTo === "production" ? " · Returning to your production plan" : ""}</span></div><div class="casting-mode">${button(view.showAll ? "Show shortlist" : "Browse all", "castingMode", "", "outline")}${!director ? button(view.showAll ? "Audition shown" : "Audition shortlist", "auditionShortlist", `data-id="${m.id}"`, "outline") : ""}</div><details class="casting-filter-details"><summary>Budget, genre & sorting</summary><div class="casting-filters"><label>Fee range<select id="casting-budget">${[
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
      ["fresh", "Fresh faces first"],
    ]
      .map(
        ([k, v]) =>
          `<option value="${k}" ${castingSort === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select></label></div></details><p class="muted small">${view.showAll ? "All matching talent. Check availability before hiring." : "Three available candidates to compare. Auditions are free; browse all whenever you like."}</p><div class="casting-list ${view.showAll ? "" : "shortlist"}">${people
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
            !m.contracts.some((c) => c.id === p.id)),
      )
      .slice(0, view.showAll ? undefined : 3)
      .map((p) => {
        const q = E.quote(s, p, m, role),
          aud = m.auditions[`${role}:${p.id}`],
          booked = !E.available(p, s.week, s.week + plan.duration),
          cast = m.contracts.some((c) => c.id === p.id);
        return `<article class="casting-card"><div class="person-heading">${portrait(p, 52)}<div><h3>${h(p.name)}</h3>${talentBadge(p)}</div>${button("Career ↗", "person", `data-person="${p.id}"`, "text-button")}</div>${talentAccolades(p)}<details class="talent-secondary"><summary>Strengths & ratings</summary>${genreStrengths(p)}${talentRatings(p, genre)}</details><div class="casting-metrics"><span>Expected fee<b>${E.money(q.low)}–${E.money(q.high)}</b></span><span>${director ? "Expected direction" : "Audition for this role"}<b class="mint">${director ? E.estimateText(E.talentEstimate(s, p, E.directorAbility(p, m.genre))) : aud === undefined ? "Not yet held" : E.estimateText(E.talentEstimate(s, p, aud))}</b></span></div>${E.freshFace(p) ? '<p class="fresh-note">No major credits yet.</p>' : ""}<div class="card-bottom"><small class="${booked ? "peach" : "muted"}">${cast ? "Already in this cast" : booked ? `Unavailable during your ${plan.duration}-week shoot` : q.option ? "Sequel option available" : "Available for your shoot"}</small>${cast ? "" : booked ? pill("Schedule conflict") : !director && aud === undefined ? button("Hold audition", "audition", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline") : button("Negotiate →", "offer", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline")}</div></article>`;
      })
      .join("")}</div>`,
    director ? "DIRECTOR SEARCH" : "CASTING ROOM",
  );
  if (!dialog.querySelector(".casting-card"))
    dialog.querySelector(".casting-list").innerHTML =
      `<p>No available candidates match. Adjust the budget or browse all to inspect schedules.</p>`;
}
function getProductionPlan(m) {
  if (!productionPlans.has(m.id))
    productionPlans.set(m.id, { duration: 8, sets: 2, crew: 2, effects: 2 });
  return productionPlans.get(m.id);
}
function production(m) {
  const plan = getProductionPlan(m);
  modal(
    "Plan the shoot",
    `<p>${h(m.title)} · ${E.scopeName(m.scale)} · ${h(m.genre)}</p><form id="production-form">${["sets", "crew", "effects"].map((key) => `<label class="budget-slider"><span class="slider-heading"><strong>${{ sets: "Sets & locations", crew: "Crew & post-production", effects: "Effects" }[key]}</strong><output id="${key}-cost"></output></span><input type="range" name="${key}" min="0" max="4" step="1" value="${plan[key]}" aria-label="${key} production tier"><span class="slider-ends"><span>Shoestring</span><span>Flagship</span></span><span class="tier-summary" id="${key}-description"></span></label>`).join("")}<label class="budget-slider"><span class="slider-heading"><strong>Filming schedule</strong><output id="duration-value"></output></span><input type="range" name="duration" min="4" max="20" step="2" value="${plan.duration}" aria-label="Filming weeks"><span class="slider-ends"><span>4 weeks · faster</span><span>20 weeks · more time</span></span></label><div id="production-preview"></div></form>`,
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
  const b = Object.fromEntries(
    ["sets", "crew", "effects"].map((key) => [
      key,
      E.budgetCost(m, key, plan[key]),
    ]),
  );
  for (const key of ["sets", "crew", "effects"]) {
    $(`${key}-cost`).textContent = E.money(b[key]);
    $(`${key}-description`).textContent =
      `${E.BUDGET_TIERS[plan[key]]} · ${E.BUDGET_DETAILS[key][plan[key]]}`;
  }
  $("duration-value").textContent = `${plan.duration} weeks`;
  const costs = E.productionCosts(s, m, b, plan.duration),
    base = E.productionCosts(s, m, b, 8),
    schedule = E.scheduleInfo(plan.duration),
    fee = [...m.contracts, m.director]
      .filter(Boolean)
      .reduce((v, c) => v + c.fee + c.optionCost, 0);
  if ($("production-total"))
    $("production-total").innerHTML =
      `<strong>Plan total ${E.money(m.spent + fee + costs.total)}</strong><small>Cash after fees ${E.money(s.cash - fee)}</small>`;
  const booked = [
    ...m.contracts.map((c) => ({ ...c, director: false })),
    ...(m.director ? [{ ...m.director, director: true }] : []),
  ].filter(
    (c) => !E.available(E.person(s, c.id), s.week, s.week + plan.duration),
  );
  $("production-preview").innerHTML =
    `<div class="budget-impact"><span class="eyebrow">WHAT THIS BUDGET BUYS</span><h3>Production quality: about ${E.score(E.productionCraft(m, b))}/100</h3><p>${["sets", "crew", "effects"].every((k) => plan[k] === 0) ? "All Shoestring: roughly one-third of Standard filming costs, with basic sets, equipment and effects. Production quality falls from about 65 to 20 out of 100. That lowers overall film quality by about 11 points if everything else stays equal. Strong writing and performances can still make the film work." : "More spending improves production quality, up to a ceiling. Your script, cast and director also shape the finished film."}</p><small>Talent fees and marketing are separate. Spending less does not automatically cause production delays.</small></div><div class="schedule-explainer"><span class="eyebrow">${schedule.label.toUpperCase()} SHOOT</span><h3>${plan.duration === 8 ? "8 weeks: the baseline shoot" : `${plan.duration} weeks: ${plan.duration < 8 ? "faster, with less rehearsal" : "more time for rehearsal and coverage"}`}</h3><p>${plan.duration === 8 ? "A standard amount of time for your team to deliver." : plan.duration < 8 ? "Lower filming costs, but less time to develop performances and a higher weekly risk of production problems." : "Higher filming costs, but more room for performances and a lower weekly risk of production problems."}</p><strong>${plan.duration === 8 ? "10 weeks would cost " + E.money(E.productionCosts(s, m, b, 10).total - base.total) + " more." : `${costs.total >= base.total ? "+" : "−"}${E.money(Math.abs(costs.total - base.total))} versus an 8-week shoot.`}</strong><small>Extra time helps execution; it does not guarantee better reviews.</small></div><div class="finance-lines"><div><span>Cast, director & options · paid now</span><strong>${E.money(fee)}</strong></div><div><span>Production · paid over ${plan.duration} weeks</span><strong>${E.money(costs.total)}</strong></div><div><span>Production cost each week</span><strong>${E.money(costs.weekly)}</strong></div><div><span>Planned total including script</span><strong>${E.money(m.spent + fee + costs.total)}</strong></div><div><span>Cash after immediate fees</span><strong class="${s.cash - fee < 0 ? "negative" : ""}">${E.money(s.cash - fee)}</strong></div></div>${
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
    }<p class="muted small">${costs.saving ? `Owned facilities save ${E.money(costs.saving * schedule.multiplier)}. ` : ""}Marketing and distribution are paid later. You’ll choose your release date once the film is finished.</p>`;
}
function releaseAndDistribution(m) {
  if (m.release === null)
    return `<section class="panel"><span class="eyebrow">THE FILM IS FINISHED</span><h3>Find its opening weekend.</h3><p>Compare audience demand and competing releases, then lock your date.</p>${button("Choose release date →", "release", `data-id="${m.id}"`, "primary full")}</section>`;
  return `<section><div class="section-title"><h3>How will you release it?</h3></div><p class="muted small">You pay for marketing. The distributor pays you upfront and shares ticket income.</p><div class="distribution-options">${Object.entries(
    E.distribution(s, m),
  )
    .map(
      ([key, d]) =>
        `<article class="distribution-card"><span class="eyebrow">${key === "secure" ? "MORE CASH NOW" : key === "partner" ? "SHARE THE UPSIDE" : "BACK IT YOURSELF"}</span><h3>${key === "secure" ? "Guaranteed payment" : key === "partner" ? "Distribution partner" : "Self-distribute"}</h3><div class="deal-numbers"><div><span>You get now</span><strong>${E.money(d.advance)}</strong></div><div><span>You pay now</span><strong>${E.money(d.cost)}</strong></div><div><span>Your share of ticket payments</span><strong>${Math.round(d.share * 100)}%</strong></div></div><p>${key === "secure" ? "Less risk. Less income from a hit." : key === "partner" ? "Some cash now. More income if it succeeds." : "No advance. Pay the release costs, keep more of each sale."}</p>${button("Review this offer →", "dealReview", `data-id="${m.id}" data-deal="${key}"`, "outline full")}</article>`,
    )
    .join("")}</div></section>`;
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
    `<form id="release-form"><input type="hidden" name="release" id="release-select" value="${view.releaseWeek}"><div class="calendar-nav">${button("←", "releaseMonth", `data-step="-1" aria-label="Previous month" ${view.calendarMonth <= E.date(start).year * 12 + E.date(start).month ? "disabled" : ""}`, "outline")}<h3>${title}</h3>${button("→", "releaseMonth", `data-step="1" aria-label="Next month" ${view.calendarMonth >= E.date(E.END - 1).year * 12 + E.date(E.END - 1).month ? "disabled" : ""}`, "outline")}</div><p class="muted small">Choose an opening week. August and December draw larger blockbuster audiences.</p><div class="release-calendar">${weeks.map((w) => `<button type="button" class="release-week ${w === view.releaseWeek ? "selected" : ""}" data-action="releaseWeek" data-week="${w}" aria-pressed="${w === view.releaseWeek}"><strong>Week ${E.date(w).week}</strong><span>${[7, 11].includes(month) ? "Peak audience" : "Normal demand"}</span><small>${s.rivals.filter((r) => Math.abs(r.week - w) <= 2).length} nearby releases</small></button>`).join("")}</div><p><strong>Selected: ${E.date(view.releaseWeek).label} · Week ${E.date(view.releaseWeek).week}</strong></p><div id="release-preview"></div><p class="muted small">The date locks when you confirm. Finish marketing and distribution before opening week.</p><button class="primary full">Lock this release date</button></form>`,
    "THE FILM HAS WRAPPED",
  );
  releasePreview(m);
}
function releasePreview(m) {
  const week = Number($("release-select").value),
    rivals = s.rivals.filter((r) => Math.abs(r.week - week) <= 2),
    peak = [7, 11].includes(E.date(week).month);
  $("release-preview").innerHTML =
    `<div class="notice-banner"><strong>${peak ? "Larger blockbuster audience" : "Normal audience demand"} · ${rivals.length > 2 ? "Crowded" : rivals.length ? "Some competition" : "Quiet window"}</strong></div>${rivals.map((r) => `<div class="award-row"><span>${h(r.title)}<small class="block">${r.genre} · Week ${E.date(r.week).week}</small></span>${pill(r.genre === m.genre ? "Similar audience" : "Different audience", r.genre === m.genre ? "gold-pill" : "")}</div>`).join("") || "<p>No competing releases announced nearby.</p>"}`;
}
function bank() {
  const emergency = s.cash < 0,
    credit = E.creditAvailable(s),
    minimum = Math.ceil(Math.max(1000, -s.cash + E.burn(s) * 2));
  modal(
    emergency ? "Your studio needs a lifeline." : "Finance your next chapter.",
    `<p>${emergency ? "Cash has fallen below zero. Review a loan to keep the studio alive, or choose to end this run." : "Take a voluntary loan at any point. All loans draw from the same credit limit."}</p><div class="detail-stats">${stat("CASH", E.money(s.cash))}${stat("AVAILABLE CREDIT", E.money(credit))}</div>${credit > 0 ? `<form id="loan-form"><label>Loan amount ($)<input type="text" inputmode="decimal" name="amount" value="${E.dollarInput(Math.min(Math.floor(credit), minimum))}" required></label><p><strong>12% annual interest · 104 weekly principal payments</strong><br>Each $1,000,000 borrowed initially costs about $12,000 per week. No early repayment penalty.</p>${emergency && credit < -s.cash ? '<p class="negative">Remaining credit will not cover the deficit. You cannot recover with this offer.</p>' : ""}<button class="primary full">Accept loan terms</button></form>` : '<p class="negative">Your credit limit is exhausted.</p>'}${emergency ? button("End this studio’s run", "end", "", "danger-link") : ""}`,
    "FIRST PICTURE BANK",
  );
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
    case "castingMode":
      view.showAll = !view.showAll;
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
    case "jumpDistribution":
      dialog
        .querySelector(".distribution-options")
        ?.scrollIntoView({ block: "start" });
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
    case "nextEvent": {
      if (s.cash < 0 && !s.ended) {
        open("bank");
        break;
      }
      if (s.notices.length || s.epilogue) {
        nextNotice();
        break;
      }
      const ready = s.movies.find((m) => m.stage === "ready" || m.event);
      if (ready) {
        open("movie", { id: ready.id });
        break;
      }
      close();
      transact("nextEvent", {}, (result) =>
        toast(
          `${result.weeks} week${result.weeks === 1 ? "" : "s"} passed · Cash change ${E.money(result.cashChange)}`,
        ),
      );
      nextNotice();
      if (!view) {
        const changed = s.movies.find((m) => m.event || m.stage === "ready");
        if (changed) open("movie", { id: changed.id });
      }
      break;
    }
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
        back: { kind: "movie", id },
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
    case "audition":
      transact("audition", {
        id,
        person: b.dataset.person,
        role: Number(b.dataset.role),
      });
      break;
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
      transact("sequel", { id }, (m) => {
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
        open("movie", { id: due.id });
        toast("Choose a distributor before the release date.");
        break;
      }
      if (transact("next")) nextNotice();
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
            k === "duration"
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
      view = { kind: "movie", id: v.id };
    });
  if (f.id === "loan-form")
    transact("loan", { amount: E.fromDollars(d.amount) }, () => {
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
