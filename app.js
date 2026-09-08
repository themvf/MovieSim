import * as E from "./engine.js";
import { portrait, poster, studioArt, escapeHtml as h } from "./art.js";
const KEY = "moviesim-save-v1",
  app = document.querySelector("#app"),
  dialog = document.querySelector("#dialog");
let s,
  saveError = false;
try {
  const raw = localStorage.getItem(KEY);
  s = raw ? JSON.parse(raw) : E.newGame();
  if (s.version !== E.VERSION || !Array.isArray(s.movies) || !s.departments)
    throw Error("Old save");
} catch {
  s = E.newGame();
}
let tab = "slate",
  filter = "active",
  view = null,
  castingRole = 0,
  talentFilter = "all",
  budgetFilter = "all";
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
  packaging: "Assembling package",
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
    const result = E.act(s, type, args);
    save();
    if (after) after(result);
    render();
    if (view) drawDialog();
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
}
function open(kind, args = {}) {
  view = { ...args, kind };
  drawDialog();
  if (!dialog.open) dialog.showModal();
}
function modal(title, body, eyebrow = "STUDIO DESK") {
  dialog.innerHTML = `<div class="modal-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${button("×", "close", "", "icon-button close-button")}</div><div class="modal-body">${body}</div>`;
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
    )}</nav><div class="sidebar-bottom"><div class="year-progress"><span>YOUR FIVE-YEAR STORY</span><strong>Year ${Math.min(5, Math.floor(s.week / 52) + 1)} <i>/ 5</i></strong><div class="bar"><i style="width:${(s.week / 260) * 100}%"></i></div></div>${button("How to play ↗", "help", "", "quiet")}<small>DEMO 0.1 · SAVED ${saveError ? "UNAVAILABLE" : "ON THIS DEVICE"}</small></div></aside>
  <div class="workspace"><header class="topbar"><span class="mobile-brand">▰ MOVIESIM</span><div class="date"><span class="status-dot"></span><strong>${d.label}</strong><span>Week ${d.week}</span></div><div class="top-stats"><div><small>AVAILABLE CASH</small><strong class="${s.cash < 0 ? "negative" : ""}">${E.money(s.cash)}</strong></div><div><small>STUDIO PRESTIGE</small><strong><span class="gold">✦</span> ${Math.round(s.prestige)}<em> / 100</em></strong></div></div>${button(s.ended ? "Studio recap" : s.cash < 0 ? "Review financing" : decisions.some((m) => m.event) ? "Next decision →" : "Next week →", s.ended ? "recap" : s.cash < 0 ? "bank" : decisions.some((m) => m.event) ? "nextDecision" : "next", "", "primary advance")}</header>
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
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow mint">${s.started ? "ON THE LOT THIS WEEK" : "WELCOME TO THE LOT"}</span><h2>${s.started ? "The next great picture<br>has your name on it." : "Small studio.<br>Big picture."}</h2><p>${s.started ? `${active.length} active project${active.length === 1 ? "" : "s"}. ${released.length} released. Keep an eye on the story—and the bottom line.` : "You have $6 million, an empty slate, and five years. Find a script. Discover a star. Make something that lasts."}</p>${button(s.started ? "Visit your studio ↗" : "Find your first script →", "nav", `data-tab="${s.started ? "studio" : "scripts"}"`, "light-button")}</div><div class="hero-art">${studioArt(s)}<span class="art-caption">${h(s.name)} · LOS ANGELES, ${E.date(s.week).year}</span></div></section>
 <div class="metrics">${stat("ACTIVE PRODUCTIONS", active.filter((m) => m.stage === "filming").length)}${stat("WEEKLY COMMITMENTS", E.money(E.burn(s)))}${stat("TOTAL BOX OFFICE", E.money(released.reduce((v, m) => v + m.gross, 0)))}${stat(
   "AWARDS WON",
   s.awards.reduce((v, a) => v + a.results.filter((r) => r.ours).length, 0),
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
        ? "Build your package"
        : null;
  return `<article class="movie-card" data-action="movie" data-id="${m.id}" tabindex="0" role="button" aria-label="Manage ${h(m.title)}">${poster(m)}<div class="movie-info"><div class="movie-meta">${pill(labels[m.stage], m.stage === "theaters" ? "mint-pill" : "")}${m.parent ? pill("SEQUEL", "gold-pill") : ""}</div><h3>${h(m.title)}</h3><p>${h(m.genre)} / ${h(m.subgenre)} <span>·</span> ${m.scale}</p><div class="cast-mini">${cast.map((p) => portrait(p, 28)).join("")}<span>${cast.length ? cast.map((p) => h(p.name.split(" ")[0])).join(", ") : "Your cast is waiting to be discovered"}</span></div>${m.stage === "filming" ? `<div class="production-progress"><span>Filming</span><span>${m.progress} / ${m.duration} weeks</span><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div></div>` : ""}<div class="movie-bottom"><span>${["theaters", "catalog"].includes(m.stage) ? `Box office <strong>${E.money(m.gross)}</strong>` : `Spent <strong>${E.money(m.spent)}</strong>`}</span><span class="${needs ? "peach" : "muted"}">${needs ? `${needs} →` : m.release ? `${E.date(m.release).label} →` : "View project →"}</span></div></div></article>`;
}
function scripts() {
  return `<div class="section-title"><h2>Available screenplays <span>${s.market.length}</span></h2><span class="muted small">New scripts every 13 weeks</span></div><div class="script-grid">${s.market.map((m) => `<article class="script-card"><div class="script-top">${poster(m)}<div>${pill(m.scale)}<span class="eyebrow">${h(m.genre)} / ${h(m.subgenre)}</span><h3>${h(m.title)}</h3><p>${h(m.premise)}</p></div></div><div class="script-stats">${stat("QUALITY ESTIMATE", E.range(m.quality, s.departments.Development))}${stat("ROLE DIFFICULTY", `${m.difficulty}/100`)}${stat("CAST", `${m.roles.length} roles`)}</div><div class="card-bottom"><strong>${E.money(m.price)} <small>incl. sequel rights</small></strong>${button("Read & acquire →", "script", `data-script="${m.id}"`, "outline")}</div></article>`).join("")}</div><p class="muted small">Quality is an estimate. There is no prescribed production budget—your choices and your results will teach you the economics.</p>`;
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
    )}</div></div><div class="talent-grid">${list.map((p) => `<button class="talent-card" data-action="person" data-person="${p.id}">${portrait(p, 64)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? "Actor" : "Director"} · Age ${p.age}</p><div class="talent-tags">${pill(p.retired ? "Retired" : p.star >= 60 ? "Established star" : p.star >= 25 ? "On the rise" : "Undiscovered", p.star >= 60 ? "gold-pill" : "")}${p.awards ? pill(`♜ ${p.awards}`) : ""}</div><div class="talent-details"><span>Talent <b>${E.range(p.talent, s.departments.Casting, p.history.length)}</b></span><span>Fee <b>${E.money(p.fee * 0.85)}–${E.money(p.fee * 1.12)}</b></span></div></div></button>`).join("")}</div>`;
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
    Soundstage: "Own your sets. Save 9% of set and location costs per level.",
    "Editing suite":
      "Bring post-production home. Save 4% of crew costs per level.",
    "Effects workshop":
      "Make ambitious images in-house. Save 9% of effects spending per level.",
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
  return `<div class="notice-banner">August & December: larger blockbuster audiences, heavier competition. Release dates lock when you greenlight a movie.</div><div class="calendar-grid">${Array.from(
    { length: 12 },
    (_, i) => {
      const start = Math.floor(s.week / 52) * 52 + Math.ceil((i * 52) / 12),
        end = Math.floor(s.week / 52) * 52 + Math.ceil(((i + 1) * 52) / 12);
      const rivals = s.rivals.filter((r) => r.week >= start && r.week < end),
        ours = s.movies.filter(
          (m) => m.release >= start && m.release < end && !m.cancelled,
        );
      return `<section class="calendar-month ${[7, 11].includes(i) ? "peak" : ""} ${E.date(s.week).month === i ? "current" : ""}"><div><h3>${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]}</h3>${[7, 11].includes(i) ? pill("PEAK WINDOW", "gold-pill") : ""}</div>${ours.map((m) => `<button data-action="movie" data-id="${m.id}" class="calendar-release ours"><small>YOUR STUDIO · WEEK ${E.date(m.release).week}</small><strong>${h(m.title)}</strong><span>${h(m.genre)}</span></button>`).join("")}${rivals.map((r) => `<div class="calendar-release"><small>WEEK ${E.date(r.week).week} · COMPETITOR</small><strong>${h(r.title)}</strong><span>${r.genre} · ${r.strength >= 75 ? "Major release" : "Independent release"}</span></div>`).join("")}</section>`;
    },
  ).join("")}</div>`;
}
function finance() {
  return `<div class="mobile-more">${button("Release calendar", "nav", 'data-tab="calendar"', "outline")}${button("Annual awards", "nav", 'data-tab="awards"', "outline")}${button("Guide & save", "help", "", "outline")}</div><div class="metrics">${stat("AVAILABLE CASH", E.money(s.cash))}${stat("OUTSTANDING DEBT", E.money(E.debtTotal(s)))}${stat("WEEKLY OUTFLOW", E.money(E.burn(s)))}${stat("REMAINING CREDIT", E.money(E.creditAvailable(s)))}</div><div class="two-columns"><section class="panel"><span class="eyebrow">FIRST PICTURE BANK</span><h2>Room to take a chance.</h2><p>Borrow from day one. Every loan has a 12% annual interest rate and 104 weekly principal payments. Interest declines as the balance falls.</p><div class="finance-lines"><div><span>Bank credit limit</span><strong>${E.money(E.creditLimit(s))}</strong></div><div><span>Current weekly debt payment</span><strong>${E.money(E.loanPayment(s))}</strong></div><div><span>Operating overhead / week</span><strong>${E.money(E.overhead(s))}</strong></div><div><span>Committed filming costs remaining</span><strong>${E.money(s.movies.reduce((v, m) => v + E.remaining(m), 0))}</strong></div></div><div class="button-row">${button("Review a loan →", "bank", "", "primary")}${E.debtTotal(s) > 0 ? button("Repay debt", "repay", "", "outline") : ""}</div></section><section class="panel"><span class="eyebrow">THE FINANCIAL PICTURE</span><h2>Know what comes home.</h2><p>Gross box office is what audiences pay. Your studio receives its distribution share, plus any advance and later catalog earnings.</p><div class="finance-lines"><div><span>Total movie spending</span><strong>${E.money(s.movies.reduce((v, m) => v + m.spent, 0))}</strong></div><div><span>Studio movie receipts</span><strong>${E.money(s.movies.reduce((v, m) => v + m.receipts, 0))}</strong></div><div><span>Streaming & licensing receipts</span><strong>${E.money(s.movies.reduce((v, m) => v + m.catalog, 0))}</strong></div><div><span>Facility & department investments</span><strong>${E.money(s.invested)}</strong></div></div></section></div><div class="section-title"><h2>Project accounts</h2></div><div class="table-wrap"><table><thead><tr><th>Movie</th><th>Spent</th><th>Studio receipts</th><th>Net to date</th></tr></thead><tbody>${s.movies.map((m) => `<tr><td><button class="text-button" data-action="movie" data-id="${m.id}">${h(m.title)}</button></td><td>${E.money(m.spent)}</td><td>${E.money(m.receipts)}</td><td class="${m.receipts - m.spent >= 0 ? "mint" : "negative"}">${E.money(m.receipts - m.spent)}</td></tr>`).join("") || '<tr><td colspan="4">No projects yet. Your first ledger entry is waiting.</td></tr>'}</tbody></table></div>`;
}
function awards() {
  const eligible = s.movies.filter(
    (m) =>
      ["theaters", "catalog"].includes(m.stage) &&
      E.date(m.release).year === E.date(s.week).year,
  );
  return `<section class="awards-hero"><span class="laurel">❧ ♜ ❧</span><span class="eyebrow gold">THE ${E.date(s.week).year} SILVER SCREEN AWARDS</span><h2>A little recognition.<br>A lasting reputation.</h2><p>Picture. Director. Lead Acting. Supporting Acting.<br>Campaigns help your contenders get noticed. The work still has to deliver.</p><span class="muted">Ceremony at the end of week 52</span></section><div class="section-title"><h2>This year’s contenders</h2></div>${eligible.length ? eligible.map((m) => `<div class="contender"><div><h3>${h(m.title)}</h3><p>Critics ${m.critics} · Fans ${m.fans} · Role difficulty ${m.difficulty}</p></div>${m.awardSpend ? pill("Campaign funded", "gold-pill") : button("Fund campaign · $150K", "awardCampaign", `data-id="${m.id}"`, "outline")}</div>`).join("") : '<div class="empty-state compact"><h3>Your first nomination starts with a film.</h3><p>Release a movie this year to enter the annual awards.</p></div>'}<div class="section-title"><h2>The trophy shelf</h2></div>${s.awards.map((a) => `<section class="panel awards-history"><h3>${a.year} Silver Screen Awards</h3>${a.results.map((r) => `<div class="award-row"><span class="${r.ours ? "gold" : ""}">♜ ${r.category}</span><strong>${h(r.winner)} ${r.ours ? "✦" : ""}</strong></div>`).join("")}</section>`).join("") || '<p class="muted">The first ceremony is still ahead of you.</p>'}`;
}
function movieDetail(m) {
  const cast = [...m.contracts].sort((a, b) => a.role - b.role);
  return `<div class="detail-hero">${poster(m, true)}<div>${pill(labels[m.stage])}<h2>${h(m.title)}</h2><p>${h(m.genre)} / ${h(m.subgenre)} · ${m.scale}</p><p class="muted">${h(m.premise)}</p>${m.release ? `<p class="small peach">Release locked: ${E.date(m.release).label}, week ${E.date(m.release).week}</p>` : ""}</div></div><div class="detail-stats">${stat("SPENT", E.money(m.spent))}${stat("STUDIO RECEIPTS", E.money(m.receipts))}${stat("SCRIPT ESTIMATE", E.range(m.scriptQuality, s.departments.Development))}</div>
 ${m.event ? `<section class="decision-box"><span class="eyebrow peach">PRODUCTION NEEDS YOU</span><h3>${h(m.event.title)}</h3><p>${h(m.event.text)}</p><div class="choice-stack">${button(`Fund the fix · ${E.money(m.event.cost)}<small>Protect quality and stay on schedule</small>`, "event", `data-id="${m.id}" data-choice="pay"`, "choice")}${button("Split the difference<small>Half the cost, some compromise</small>", "event", `data-id="${m.id}" data-choice="split"`, "choice")}${button("Cut the work<small>No extra cost. Quality takes a hit.</small>", "event", `data-id="${m.id}" data-choice="cut"`, "choice")}</div></section>` : ""}
 ${m.stage === "development" ? `<div class="notice-banner">Your development department is writing. Ready in ${Math.max(0, m.ready - s.week)} weeks.</div>` : ""}
 ${
   m.stage === "packaging"
     ? `<section><div class="section-title"><h3>The package</h3>${button("Rename movie", "rename", `data-id="${m.id}"`, "text-button")}</div><p class="muted small">Role difficulty ${m.difficulty}/100. Auditions are free and immediate. Agreements are paid when cameras roll.</p><div class="role-list">${m.roles
         .map((r, i) => {
           const c = cast.find((c) => c.role === i),
             p = c && E.person(s, c.id);
           return `<div class="role-row">${p ? portrait(p, 44) : '<span class="vacant">♙</span>'}<div><small>${r.toUpperCase()}</small><strong>${p ? h(p.name) : "Find your actor"}</strong>${c ? `<span>${E.money(c.fee)} ${c.option ? "· sequel option +20%" : ""}</span>` : ""}</div>${button(p ? "Recast" : "Audition →", "casting", `data-id="${m.id}" data-role="${i}"`, "outline")}</div>`;
         })
         .join(
           "",
         )}<div class="role-row">${m.director ? portrait(E.person(s, m.director.id), 44) : '<span class="vacant">▰</span>'}<div><small>DIRECTOR</small><strong>${m.director ? h(E.person(s, m.director.id).name) : "Find your director"}</strong>${m.director ? `<span>${E.money(m.director.fee)}</span>` : ""}</div>${button(m.director ? "Replace" : "Browse →", "director", `data-id="${m.id}"`, "outline")}</div></div>${button("Plan production →", "production", `data-id="${m.id}"`, "primary full")}</section>`
     : ""
 }
 ${m.stage === "filming" ? `<section class="panel"><span class="eyebrow">CAMERAS ROLLING</span><h3>Week ${m.progress} of ${m.duration}</h3><div class="bar"><i style="width:${(m.progress / m.duration) * 100}%"></i></div><p>${E.money(m.weekly)} per week · ${E.money(E.remaining(m))} left in planned filming costs.</p><p class="muted small">Advance time from your slate. Production problems may require your attention.</p></section>` : ""}
 ${m.stage === "ready" ? `<section class="panel"><span class="eyebrow">THE FIRST AUDIENCE</span><h3>${m.screen === null ? "What will they think?" : `Test-screening score: ${m.screen}/100`}</h3><p>${m.screen === null ? "Pay for a small audience screening before committing your marketing budget. It is a signal, not a prediction." : "One room of people, one imperfect signal. Critics and the wider audience may disagree."}</p>${m.screen === null ? button("Hold test screening · $45K", "screen", `data-id="${m.id}"`, "outline") : ""}</section>` : ""}
 ${["ready", "scheduled", "theaters"].includes(m.stage) ? campaigns(m) : ""}
 ${
   m.stage === "ready"
     ? `<section><div class="section-title"><h3>Choose distribution</h3></div><p class="muted small">Advances are guaranteed and non-recoupable in this demo. Shares below are of gross ticket sales after all theater and distributor deductions. You fund marketing separately.</p><div class="choice-stack">${Object.entries(
         E.distribution(s, m),
       )
         .map(([key, d]) =>
           button(
             `<strong>${d.name}</strong><small>${d.desc}</small><span>${E.money(d.advance)} upfront · ${Math.round(d.share * 100)}% of gross · ${E.money(d.cost)} release fee</span>`,
             "distribute",
             `data-id="${m.id}" data-deal="${key}"`,
             "choice",
           ),
         )
         .join("")}</div></section>`
     : ""
 }
 ${m.stage === "scheduled" ? `<div class="notice-banner">Distribution is signed. Your movie opens in ${m.release - s.week} weeks. ${button("View competition →", "calendarFromMovie", "", "text-button")}</div>` : ""}
 ${["theaters", "catalog"].includes(m.stage) ? report(m) : ""}
 ${["theaters", "catalog"].includes(m.stage) ? button("Commission a sequel · $140K", "sequel", `data-id="${m.id}"`, "primary full") : ""}
 ${["development", "packaging", "filming", "ready"].includes(m.stage) ? button("Shelve this movie", "cancel", `data-id="${m.id}"`, "danger-link") : ""}`;
}
function campaigns(m) {
  const proj = E.projection(s, m);
  return `<section><div class="section-title"><h3>Make some noise</h3><span class="muted small">${E.money(m.campaignSpend)} committed</span></div><div class="campaign-grid">${E.CAMPAIGNS.map((c, i) => `<button class="campaign ${m.campaigns.includes(i) ? "purchased" : ""}" data-action="campaign" data-id="${m.id}" data-campaign="${i}" ${m.campaigns.includes(i) ? "disabled" : ""}><strong>${c.name}</strong><span>${c.desc}</span><b>${m.campaigns.includes(i) ? "✓ Campaign launched" : E.money(c.cost)}</b></button>`).join("")}</div><p class="forecast"><span>RESEARCH / LEVEL ${s.departments.Research}</span>Rough opening estimate: <strong>${E.money(proj[0])}–${E.money(proj[1])}</strong><small>Uncertain gross box office. Actual results can fall outside this range.</small></p></section>`;
}
function report(m) {
  const f = m.releaseFactors;
  return `<section><div class="section-title"><h3>The release report</h3>${m.awards.length ? pill(`♜ ${m.awards.length} awards`, "gold-pill") : ""}</div><div class="scores">${stat("TEST SCREENING", m.screen ?? "Not held")}${stat("CRITICS", m.critics)}${stat("FANS", m.fans)}</div><div class="box-chart" role="img" aria-label="Weekly box office: ${m.boxWeeks.map((v, i) => `week ${i + 1} ${E.money(v)}`).join(", ")}">${m.boxWeeks.map((v, i) => `<div><i style="height:${Math.max(3, (v / Math.max(...m.boxWeeks)) * 110)}px"></i><small>W${i + 1}</small></div>`).join("")}</div><div class="finance-lines"><div><span>Gross box office</span><strong>${E.money(m.gross)}</strong></div><div><span>Your share of ticket sales</span><strong>${Math.round(m.share * 100)}%</strong></div><div><span>Advance received</span><strong>${E.money(m.advance)}</strong></div><div><span>Streaming & licensing</span><strong>${E.money(m.catalog)}</strong></div><div><span>Total studio receipts</span><strong>${E.money(m.receipts)}</strong></div><div><span>Total movie costs</span><strong>${E.money(m.spent)}</strong></div><div><span>Movie profit / loss to date</span><strong class="${m.receipts >= m.spent ? "mint" : "negative"}">${E.money(m.receipts - m.spent)}</strong></div></div><div class="analysis-note"><span class="eyebrow">WHAT WE LEARNED / RESEARCH LEVEL ${s.departments.Research}</span><p>${m.craft < 45 ? "Production values fell short of the project’s ambition." : m.craft > 75 ? "Production spending translated into strong craft." : "Production values were serviceable, with room to improve."} ${m.fans > 75 ? "Audiences are giving the movie strong word of mouth." : m.fans < 50 ? "Weak audience response is limiting repeat business." : "Audience response is mixed to positive."} ${f.reach < 20 ? "Limited marketing held back opening awareness." : "Your campaign put the film in front of an audience."} ${f.rival > 0.3 ? "A crowded release window divided attention." : "Competition was manageable."} ${f.season > 1 ? "The seasonal audience boost helped." : ""}</p>${s.departments.Research >= 2 ? `<p>Average performance ${Math.round(m.performances.reduce((a, v) => a + v, 0) / m.performances.length)}/100 · Craft ${Math.round(m.craft)}/100. ${m.penalty ? `Production compromises reduced quality by approximately ${Math.round(m.penalty)} points.` : "No unresolved production compromises."}</p>` : ""}${s.departments.Research >= 3 ? `<p>Estimated competition reduction: ${Math.round((1 - 1 / (1 + f.rival)) * 100)}%. Seasonal multiplier: ${f.season.toFixed(2)}×. Awareness index: ${Math.round(f.reach)}. The opening also includes unpredictable audience demand.</p>` : ""}</div></section>`;
}
function drawDialog() {
  if (!view) return;
  const v = view,
    m = v.id && E.movie(s, v.id);
  if (v.kind === "movie")
    return modal("Project desk", movieDetail(m), "YOUR SLATE");
  if (v.kind === "script") {
    const sc = s.market.find((x) => x.id === v.script);
    if (!sc) {
      close();
      return;
    }
    return modal(
      h(sc.title),
      `<div class="detail-hero">${poster(sc, true)}<div>${pill(sc.scale)}<h3>${h(sc.genre)} / ${h(sc.subgenre)}</h3><p>${h(sc.premise)}</p><p>Script quality estimate: <strong>${E.range(sc.quality, s.departments.Development)}</strong></p><p>Role difficulty: <strong>${sc.difficulty}/100</strong></p><p>Cast: ${sc.roles.join(", ")}</p></div></div><p>Includes the screenplay and sequel rights. You can rename the movie after acquisition. Production, talent, and marketing are separate expenses.</p>${button(`Acquire screenplay · ${E.money(sc.price)}`, "buy", `data-script="${sc.id}"`, "primary full")}`,
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
        )}</select></label><label>Subgenre<select name="subgenre" id="subgenre">${E.GENRES.Drama.map((g) => `<option>${g}</option>`).join("")}</select></label></div><label>Scale<select name="scale"><option>Small</option><option>Mid-budget</option><option>Blockbuster</option></select></label><p class="muted">Development takes 3 weeks. Commissioning costs $100K / $200K / $300K by scale. You set the production budget later.</p><button class="primary full" type="submit">Commission screenplay →</button></form>`,
      "ORIGINAL DEVELOPMENT",
    );
  if (v.kind === "casting" || v.kind === "director")
    return casting(m, v.kind === "director");
  if (v.kind === "offer") {
    const p = E.person(s, v.person),
      q = E.quote(s, p, m, v.role);
    return modal(
      `An offer for ${h(p.name)}`,
      `<div class="person-heading">${portrait(p, 80)}<div><h3>${h(p.name)}</h3><p>${p.kind === "actor" ? m.roles[v.role] : "Director"} · ${h(m.title)}</p><p>Expected fee: ${E.money(q.low)}–${E.money(q.high)} ${q.option ? "(existing sequel option)" : ""}</p></div></div><form id="offer-form"><label>Offer ($ thousands)<input name="offer" type="number" min="0" max="100000" step="1" value="${Math.round((q.low + q.high) / 2)}" required></label>${p.kind === "actor" ? '<label class="checkbox"><input type="checkbox" name="option"> Secure a sequel option (+20% upfront)</label>' : ""}<p class="muted small">Terms are agreed now; the fee is paid at greenlight. Check availability before filming. A sequel option fixes the return fee, but does not reserve future dates.</p><button class="primary full">Make offer →</button></form>`,
      "TALENT NEGOTIATION",
    );
  }
  if (v.kind === "production") return production(m);
  if (v.kind === "bank") return bank();
  if (v.kind === "repay")
    return modal(
      "Reduce your debt",
      `<form id="repay-form"><label>Repayment ($ thousands)<input name="amount" type="number" min="1" max="${Math.floor(Math.min(s.cash, E.debtTotal(s)))}" value="${Math.min(1000, Math.floor(E.debtTotal(s)), Math.floor(s.cash))}" required></label><p>No early repayment penalty. Keep enough cash for upcoming weekly commitments.</p><button class="primary full">Repay principal</button></form>`,
      "FIRST PICTURE BANK",
    );
  if (v.kind === "person") {
    const p = E.person(s, v.person);
    return modal(
      h(p.name),
      `<div class="person-heading">${portrait(p, 100)}<div>${pill(p.kind.toUpperCase())}<h3>${h(p.name)}</h3><p>Age ${p.age} · ${Math.round(p.star)}/100 box-office draw</p><p>Talent estimate ${E.range(p.talent, s.departments.Casting, p.history.length)} · ${p.awards} awards</p></div></div><h3>Availability</h3>${
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
      }<h3>Filmography</h3>${p.history.map((f) => `<div class="award-row"><span>${h(f.title)} · ${f.year}</span><strong>${Math.round(f.score)}/100</strong></div>`).join("") || '<p class="muted">No released credits yet. You could change that.</p>'}`,
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
      `<div class="opening-reveal">${poster(m, true)}<span class="eyebrow gold">OPENING WEEKEND</span><h2>${h(m.title)}</h2><strong class="opening-number">${E.money(m.opening)}</strong><p>GROSS BOX OFFICE</p><div class="scores">${stat("CRITICS", m.critics)}${stat("FANS", m.fans)}${stat("YOUR FIRST RECEIPTS", E.money(m.opening * m.share))}</div><p class="muted">${m.fans > 75 ? "The audience is talking. Now let’s see how long the run lasts." : m.fans < 50 ? "A tough first audience. Keep a close eye on further marketing spending." : "The first weekend is only the beginning. Word of mouth takes over from here."}</p>${button("Back to the lot →", "dismissNotice", "", "primary full")}</div>`,
      "THE BOX OFFICE",
    );
  if (v.kind === "ceremony") {
    const a = s.awards.find((x) => x.year === v.year);
    return modal(
      `${v.year} Silver Screen Awards`,
      `<div class="ceremony-mark">❧ ♜ ❧</div>${a.results.map((r) => `<div class="ceremony-category ${r.ours ? "winner" : ""}"><span class="eyebrow">${r.category}</span><h3>${h(r.winner)}</h3><p>${r.ours ? "✦ Your studio takes home the award" : "Awarded to a competing studio"}</p><small>${r.nominees.length ? "Your nominees: " + r.nominees.map(h).join(", ") : "No studio nominees this category"}</small></div>`).join("")}${button("Back to the lot →", "dismissNotice", "", "primary full")}`,
      "THE ANNUAL CEREMONY",
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
      `<p>This replaces the studio saved on this device with a new cast and a fresh $6M start. You can export your current save first from Guide & save.</p><form id="restart-form"><label>Studio name<input name="name" value="Silverline Pictures" maxlength="40" required></label><button class="primary full">Start a new five-year run</button></form>`,
    );
  if (v.kind === "help")
    return modal(
      "Welcome to the studio",
      `<div class="guide"><p><strong>Your aim:</strong> build a profitable, respected movie studio over five years. Different mixes of commercial hits and acclaimed films can succeed.</p><ol><li><strong>Acquire a script.</strong> Buy one in Scripts, or commission an original.</li><li><strong>Build a package.</strong> Audition actors, compare ranges and fees, then hire your cast and director.</li><li><strong>Greenlight.</strong> Split production spending and choose your schedule. Talent is paid immediately; filming is paid weekly.</li><li><strong>Advance weeks.</strong> Resolve production decisions. You can run several movies if your finances and talent schedules allow.</li><li><strong>Release.</strong> Optionally pay for a test screening, select marketing campaigns, and sign distribution before the locked date.</li><li><strong>Build your history.</strong> Follow weekly receipts, make sequels, invest in departments, and campaign for annual awards.</li></ol><p><strong>Money matters.</strong> Ticket sales are not your revenue. Watch studio receipts, weekly commitments, and debt. If cash falls below zero, choose an emergency loan or close your studio.</p><p><strong>Your save:</strong> stored automatically in this browser. Export it before clearing browser data or switching devices. No account or purchase required.</p><div class="button-row">${button("Export save", "export", "", "outline")}<label class="import-label">Import save<input type="file" id="import-save" accept="application/json,.json"></label></div>${button("Start a new studio", "restart", "", "danger-link")}</div>`,
      "THE PRODUCER’S HANDBOOK",
    );
}
function casting(m, director) {
  const role = view.role ?? 0,
    people = s.people.filter(
      (p) => p.kind === (director ? "director" : "actor") && !p.retired,
    );
  modal(
    director ? "Find your director" : `Auditions: ${m.roles[role]}`,
    `<p class="muted">${director ? "Hire someone whose career you want to help build." : "Free, immediate auditions. Compare the performance range for this particular role."} Agreed fees are paid at greenlight.</p><label class="filter-label">Expected fee<select id="casting-budget"><option value="all" ${budgetFilter === "all" ? "selected" : ""}>All budgets</option><option value="250" ${budgetFilter === "250" ? "selected" : ""}>Under $250K</option><option value="750" ${budgetFilter === "750" ? "selected" : ""}>Under $750K</option><option value="2000" ${budgetFilter === "2000" ? "selected" : ""}>Under $2M</option></select></label><div class="casting-list">${people
      .filter(
        (p) =>
          budgetFilter === "all" ||
          E.quote(s, p, m, role).low <= Number(budgetFilter),
      )
      .sort((a, b) => a.fee - b.fee)
      .map((p) => {
        const q = E.quote(s, p, m, role),
          aud = m.auditions[`${role}:${p.id}`],
          booked = !E.available(p, s.week, s.week + 8),
          cast = m.contracts.some((c) => c.id === p.id);
        return `<article class="casting-card"><div class="person-heading">${portrait(p, 52)}<div><h3>${h(p.name)}</h3><p>${p.star >= 60 ? "Established star" : p.star >= 25 ? "On the rise" : "Undiscovered"} · Age ${p.age}</p></div>${button("Career ↗", "person", `data-person="${p.id}"`, "text-button")}</div><div class="casting-metrics"><span>Talent <b>${E.range(p.talent, s.departments.Casting, p.history.length)}</b></span><span>Fee <b>${E.money(q.low)}–${E.money(q.high)}</b></span><span>Role audition <b class="mint">${director ? "—" : aud === undefined ? "Not yet held" : E.range(aud, s.departments.Casting)}</b></span></div><div class="card-bottom"><small class="${booked ? "peach" : "muted"}">${cast ? "Already in this cast" : booked ? "Booked during next 8 weeks" : q.option ? "Sequel option available" : "Available for next 8 weeks"}</small>${cast ? "" : !director && aud === undefined ? button("Hold audition", "audition", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline") : button("Negotiate →", "offer", `data-id="${m.id}" data-person="${p.id}" data-role="${role}"`, "outline")}</div></article>`;
      })
      .join("")}</div>`,
    director ? "DIRECTOR SEARCH" : "THE CASTING ROOM",
  );
}
function production(m) {
  const fees = [...m.contracts, m.director]
    .filter(Boolean)
    .reduce((v, c) => v + c.fee + c.optionCost, 0);
  modal(
    "Give it the green light",
    `<p>${h(m.title)} · ${m.scale} · ${h(m.genre)}</p><form id="production-form"><div class="form-grid"><label>Sets & locations ($K)<input type="number" name="sets" min="25" max="15000" value="${m.budget.sets}" required></label><label>Crew & post-production ($K)<input type="number" name="crew" min="25" max="15000" value="${m.budget.crew}" required></label><label>Effects ($K)<input type="number" name="effects" min="0" max="20000" value="${m.budget.effects}" required></label><label>Filming schedule<select name="duration">${[4, 6, 8, 10, 12, 16, 20].map((w) => `<option value="${w}" ${w === 8 ? "selected" : ""}>${w} weeks</option>`).join("")}</select></label></div><label>Release week (locks at greenlight)<select name="release" id="release-select"></select></label><div id="production-preview"></div><p class="muted small">These are editable starting allocations, not budget recommendations. Longer shoots increase production costs. Facility ownership reduces rental costs. There is no fixed project limit; you must cover the cash flow.</p><button class="primary full">Greenlight production →</button></form>`,
    "PRODUCTION & FINANCE",
  );
  updateReleaseOptions();
  productionPreview(m, fees);
}
function updateReleaseOptions() {
  const f = $("production-form");
  if (!f) return;
  const start = s.week + Number(f.elements.duration.value) + 3,
    select = $("release-select"),
    prior = Number(select.value);
  select.innerHTML = Array.from(
    { length: Math.max(0, Math.min(52, 260 - start)) },
    (_, i) => {
      const w = start + i;
      return `<option value="${w}" ${w === prior ? "selected" : ""}>${E.date(w).label} · Week ${E.date(w).week}${[7, 11].includes(E.date(w).month) ? " · Peak window" : ""}</option>`;
    },
  ).join("");
}
function productionPreview(m, fees) {
  const f = $("production-form");
  if (!f) return;
  const data = new FormData(f),
    weeks = Number(data.get("duration")),
    sets = Number(data.get("sets")),
    crew = Number(data.get("crew")),
    effects = Number(data.get("effects"));
  const saving =
      s.facilities.Soundstage * 0.09 * sets +
      s.facilities["Effects workshop"] * 0.09 * effects +
      s.facilities["Editing suite"] * 0.04 * crew,
    total = (sets + crew + effects - saving) * (weeks / 8) ** 0.6,
    release = Number(data.get("release")) || s.week + weeks + 3;
  const booked = [...m.contracts, m.director]
    .filter(Boolean)
    .map((c) => E.person(s, c.id))
    .filter((p) => !E.available(p, s.week, s.week + weeks));
  const rivals = s.rivals.filter((r) => Math.abs(r.week - release) <= 2);
  $("production-preview").innerHTML =
    `<div class="finance-lines"><div><span>Talent fees + options paid now</span><strong>${E.money(fees)}</strong></div><div><span>Filming paid weekly</span><strong>${E.money(total / weeks)} × ${weeks}</strong></div><div><span>Planned filming total</span><strong>${E.money(total)}</strong></div><div><span>Cash after talent payments</span><strong class="${s.cash - fees < 0 ? "negative" : ""}">${E.money(s.cash - fees)}</strong></div><div><span>Locked release date</span><strong>${E.date(release).label} · W${E.date(release).week}</strong></div></div>${booked.length ? `<p class="negative">Schedule conflict: ${booked.map((p) => h(p.name)).join(", ")}. Recast or wait.</p>` : ""}<div class="notice-banner">${[7, 11].includes(E.date(release).month) ? "Peak audience window · " : ""}${rivals.length} competing release${rivals.length === 1 ? "" : "s"} nearby: ${rivals.map((r) => `${h(r.title)} (${r.genre})`).join(", ") || "none announced"}. Marketing and distribution are additional costs.</div>`;
}
function bank() {
  const emergency = s.cash < 0,
    credit = E.creditAvailable(s),
    minimum = Math.ceil(Math.max(1000, -s.cash + E.burn(s) * 2));
  modal(
    emergency ? "Your studio needs a lifeline." : "Finance your next chapter.",
    `<p>${emergency ? "Cash has fallen below zero. Review a loan to keep the studio alive, or choose to end this run." : "Take a voluntary loan at any point. All loans draw from the same credit limit."}</p><div class="detail-stats">${stat("CASH", E.money(s.cash))}${stat("AVAILABLE CREDIT", E.money(credit))}</div>${credit > 0 ? `<form id="loan-form"><label>Loan amount ($ thousands)<input type="number" name="amount" min="1" max="${Math.floor(credit)}" value="${Math.min(Math.floor(credit), minimum)}" required></label><p><strong>12% annual interest · 104 weekly principal payments</strong><br>Each $1M borrowed initially costs about $11,923 per week. No early repayment penalty.</p>${emergency && credit < -s.cash ? '<p class="negative">Remaining credit will not cover the deficit. You cannot recover with this offer.</p>' : ""}<button class="primary full">Accept loan terms</button></form>` : '<p class="negative">Your credit limit is exhausted.</p>'}${emergency ? button("End this studio’s run", "end", "", "danger-link") : ""}`,
    "FIRST PICTURE BANK",
  );
}
function checkEmergency() {
  if (s.cash < 0 && !s.ended && view?.kind !== "bank") open("bank");
}
function nextNotice() {
  if (s.cash < 0 && !s.ended) {
    open("bank");
    return;
  }
  const n = s.notices[0];
  if (n) open(n.kind === "opening" ? "opening" : "ceremony", n);
  else if (s.ended) open("recap");
}
app.addEventListener("click", handle);
dialog.addEventListener("click", handle);
app.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches('[role="button"]'))
    e.target.click();
});
dialog.addEventListener("cancel", (e) => {
  if (s.cash < 0 && !s.ended) e.preventDefault();
  else {
    if (["opening", "ceremony"].includes(view?.kind)) {
      s.notices.shift();
      save();
    }
    view = null;
  }
});
function handle(e) {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  e.preventDefault();
  const a = b.dataset.action,
    id = b.dataset.id;
  switch (a) {
    case "nav":
      close();
      tab = b.dataset.tab;
      render();
      window.scrollTo(0, 0);
      break;
    case "close":
      if (s.cash < 0 && !s.ended) {
        toast("Accept financing or choose to end the studio run.");
        return;
      }
      if (["opening", "ceremony"].includes(view?.kind)) {
        s.notices.shift();
        save();
      }
      close();
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
      open("casting", { id, role: Number(b.dataset.role) });
      break;
    case "director":
      budgetFilter = "all";
      open("director", { id });
      break;
    case "offer":
      open("offer", {
        id,
        person: b.dataset.person,
        role: Number(b.dataset.role),
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
      open("person", { person: b.dataset.person });
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
      transact("distribute", { id, deal: b.dataset.deal });
      break;
    case "event":
      transact("event", { id, choice: b.dataset.choice });
      break;
    case "confirmCancel":
      transact("cancel", { id }, () => close());
      break;
    case "sequel":
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
      close();
      const due = s.movies.find(
        (m) => m.stage === "ready" && m.release <= s.week + 1,
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
        offer: Number(d.offer),
        option: d.option === "on",
      },
      () => {
        view = { kind: "movie", id: v.id };
        toast("Terms agreed. Payment is due at greenlight.");
      },
    );
  if (f.id === "production-form")
    transact(
      "greenlight",
      {
        id: v.id,
        ...Object.fromEntries(
          Object.entries(d).map(([k, v]) => [k, Number(v)]),
        ),
      },
      () => {
        view = { kind: "movie", id: v.id };
      },
    );
  if (f.id === "loan-form")
    transact("loan", { amount: Number(d.amount) }, () => {
      if (s.cash >= 0) close();
    });
  if (f.id === "repay-form")
    transact("repay", { amount: Number(d.amount) }, () => close());
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
  if (e.target.closest("#production-form")) {
    if (e.target.name === "duration") updateReleaseOptions();
    const m = E.movie(s, view.id),
      fees = [...m.contracts, m.director]
        .filter(Boolean)
        .reduce((v, c) => v + c.fee + c.optionCost, 0);
    productionPreview(m, fees);
  }
});
dialog.addEventListener("change", async (e) => {
  if (e.target.id === "genre")
    $("subgenre").innerHTML = E.GENRES[e.target.value]
      .map((v) => `<option>${v}</option>`)
      .join("");
  if (e.target.id === "casting-budget") {
    budgetFilter = e.target.value;
    drawDialog();
  }
  if (e.target.id === "import-save") {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3000000) throw Error("File too large");
      const data = JSON.parse(await file.text());
      if (
        data.version !== E.VERSION ||
        !Array.isArray(data.movies) ||
        !Array.isArray(data.people) ||
        !data.departments ||
        !Number.isFinite(data.cash) ||
        !Number.isInteger(data.week) ||
        data.week < 0 ||
        data.week > 260
      )
        throw Error("Invalid save");
      s = data;
      save();
      close();
      render();
      checkEmergency();
      toast("Studio save restored.");
    } catch {
      toast("This file is not a supported MovieSim save.");
    }
  }
});
save();
render();
checkEmergency();
