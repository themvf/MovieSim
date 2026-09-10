# Playable demo 0.6.0

MovieSim is a dependency-free static web game. `engine.js` owns simulation state and decisions; `app.js` renders the interface and persists saves; `art.js` draws original SVG pixel portraits, posters, and the studio lot. No third-party artwork or game assets are used.

## Run locally

Requires Node.js 22 or newer. No package installation is required.

```sh
npm start
```

Open http://127.0.0.1:4173. Run simulation tests with `npm test`. Browser checks in `tests/browser-*.cjs` require Playwright and Microsoft Edge; set `PLAYWRIGHT_PATH` to a local Playwright module path if needed. Test screenshots are intentionally ignored by Git.

## Implemented loop

- Five-year, 260-week runs starting in January 2026, $6M starting cash, generated actors/directors, script refreshes, and annual new talent.
- Script purchases and renaming; original title/genre/subgenre/scale selection; department-developed sequels with inherited rights.
- Free auditions with uncertain estimates, genre strengths and weaknesses, screen presence, fame, overall rating, fresh-face labels, fee ranges, negotiated offers, sequel options, named directors, and in-place booking-conflict replacement.
- Named, costed sliders for sets, crew/post, and effects; adjustable 4–20-week schedules with clear tradeoffs; release dates selected and locked after filming wraps.
- Weekly production cash flow, scope-dependent interruptions with three cost/quality responses, and cancellation closeout.
- Optional paid test screening, four individual marketing campaigns, three distribution structures, and visible competing releases.
- Opening-weekend reveal, weekly theatrical holds, separate critic/fan scores, filmography and fee growth, automatic catalog income, and detailed financial reports.
- Department/facility upgrades, voluntary and emergency bank loans, repayment, finite credit, and optional closure on a deficit.
- January nominations, March ceremony invitations, manual category reveals, awards archives, paid campaigns, prestige milestone announcements, and a five-year financial/prestige retrospective after a final awards-only epilogue.
- Responsive phone/desktop layouts, local autosave, JSON save export/import, guide, and restart.

## Concrete balancing choices

Money is stored in thousands of dollars. The base weekly overhead is $5K. Department upgrades add $2K per week per level; facility upgrades add $3K. Loans charge 12% annual interest on the outstanding balance, with principal amortized over 104 weeks. Credit starts at $8M and grows $60K per prestige point.

Talent fees and 20% sequel-option premiums are paid at greenlight. Filming costs are paid in weekly installments. A cancellation pays a 15% closeout on remaining filming commitments and releases bookings; sunk costs and bank debt remain.

Release dates are selected only after filming wraps, at least one week in the future, and cannot move after confirmation. Production incidents force spending/quality tradeoffs without extending the committed schedule. Distribution must be selected before time can advance into the release week. Greenlighting is blocked if the film cannot finish and release within the five-year run.

Distributor advances are non-recoupable guarantees in this simplified demo. Harbor offers 40% of costs as an advance and 13% of gross ticket sales; Meridian offers 15% and 31%, with an $80K booking fee. Prestige improves these terms. Self-distribution charges a scale-dependent booking fee and returns 50% of gross after theaters. All marketing is studio-funded. Reports distinguish gross box office, studio receipts, costs, and profit.

Audience size varies by scale. Casting draw and campaigns influence opening awareness; genre-similar competitors reduce audience share. August and December receive seasonal multipliers. Audience response determines theatrical holds, with a 4–12-week run. Test screenings contain substantial noise even with upgrades; commercial forecasts remain uncertain.

At the endpoint, estimated studio value includes cash less debt and unfinished-production closeout, 50% of upgrade investments, and catalog value of 2.5% of historical gross. Unreleased movies receive no speculative value. The overall rating is the geometric mean of financial health and prestige, requiring progress in both.

## Publishing

Publish the root of `main` with GitHub Pages. All asset paths are relative, so `/MovieSim/` hosting works without a build step. `.nojekyll` prevents Jekyll processing. A Pages-compatible account/repository visibility is required. No credentials are stored in the game or repository.

## Scope and limitations

This is an early balance prototype, not a finished iOS application. It uses a deliberately small event and campaign library, abstract distribution/awards formulas, stylized generated art, and local browser saves. Personalities, chemistry, loyalty advantages, individual employees, negotiated catalog deals, and changing tastes remain deferred as agreed. Native iOS packaging, device-specific Safari certification, audio, and deeper content variety are future work.

## Demo 0.2 behavior and compatibility

Production sliders use Shoestring, Lean, Standard, Premium, and Flagship tiers. Their prices depend on project scale and category; effects allocation also reflects genre. Each slider describes the facilities or staffing purchased and updates costs immediately. The selected plan survives actor/director replacement within the production dialog.

Compared with 8 weeks, 10 weeks costs approximately 14% more for the same allocations, adds 2.2 execution points before other influences, and reduces weekly incident probability. The interface describes rehearsal, coverage, cost, and risk without promising better reviews.

Acting ability for a role combines overall talent (62%), screen presence (15%), and genre ability (23%). Fame influences audience draw rather than acting ability. Fresh-face status means no major credits; a major studio release, breakout opening, or individual award can end that status.

Prestige milestones occur at 15, 35, 60, and 85 points. Announcements explain the existing gradual improvements to fee expectations, distributor advances/ticket shares, and credit limits. Milestones do not create hard talent or facility gates.

The persistent browser storage key stays unchanged. Version 1 saves migrate in place without rerolling talent identities, changing cash, or consuming RNG state. New attributes are deterministic. Existing signed release/distribution agreements stay fixed; unfinished or undistributed films get the new post-wrap date selection. Old completed awards are preserved and not awarded twice.

See [awards timeline research](AWARDS-RESEARCH.md) for official sources and the simplified game cadence.

## Demo 0.3 release experience

- Currency displays use rounded thousands and at most one decimal for millions; accounting retains its precision. New budget tiers and salary quote ranges use rounded amounts. Estimated rating ranges use five-point boundaries; dates, ages, durations and counts remain exact.
- The release calendar shows a month at a time with selectable opening weeks, August/December demand labels and nearby competition. It follows the existing 52-week game calendar. Navigation does not commit a date; confirmation locks it.
- Distribution cards show the studio percentage of ticket payments. New contracts use whole percentages; existing signed contracts are preserved.
- Movie cards keep weekly theatrical bars, updated on every simulated week and retained in the catalog. Gold bars mark resurgences.
- After the first two theatrical weeks, eligible months have a 25% weekly resurgence chance: Horror in October; Action/Sci-fi in July/August; Comedy/Action/Sci-fi in December; Drama in January/February. These are game balancing rules. At most one resurgence per month and two per film; the 12-week theatrical cap remains. Boosted ticket payments flow through the signed studio share. Saved RNG prevents reload rerolls.
- Distribution confirmation saves the displayed opening forecast. Further pre-release campaigns refresh it; theater campaigns never rewrite it. The opening popup compares actual gross with that range. Older releases without a saved forecast say so.
- Save version 3 accepts versions 1 and 2, including imported backups, without resetting progress.
- Validation: 30 simulation tests plus browser lifecycle, usability, boundaries and movie-card chart tests, including mobile widths 320–768px.

## Demo 0.4 talent feedback and finishing changes

- Talent estimates have total widths of 5, 10, 15 or 20 points, with five-point endpoints and bounds of 0–100. A stable performer seed chooses the base width. Each Casting upgrade reduces width by five points, to a minimum of five. Auditions do not reroll on reload. All talent estimates use this presentation; script forecasts retain their separate model.
- Hiring saves the actor audition or director genre-specific estimate on the contract. Staff upgrades and later fame changes cannot rewrite the hiring benchmark. Release popups and permanent movie reports compare each person’s delivered score against it. Existing actor performances are used; directors now receive a saved performance score (genre-adjusted ability plus up to ten points of variation), which supplies the directing contribution to movie quality and their career record. Rounded delivered scores are used for the displayed comparison. Older contracts without recorded estimates are explicitly marked unavailable.
- Scope labels are Intimate production, Studio feature and Event spectacle, with descriptions and approximate standard-production budgets excluding cast and marketing. Internal scope keys remain unchanged for compatibility.
- Six genres now offer 58 subgenres. Existing scripts retain their subgenre; expanded choices apply to new scripts and original commissions.
- Player-facing package terminology is replaced with cast/director or casting/planning. Facility descriptions use dollar savings examples. Prestige benefits explain better offers in plain language.
- Closing a notice now rerenders the header; Escape and normal dismissal both clear the stale New announcement action. Regression checks cover all three closing methods.
- Save version 4 accepts versions 1–3. Existing cash, projects and signed contracts remain intact. Validation includes 33 simulation tests and mobile browser lifecycle, usability, boundaries, and chart checks.

## Demo 0.5 money, production tradeoffs and talent honors

- Full dollar displays replace compact K/M notation, retaining rounded summaries. Offer, loan and repayment inputs show comma-separated dollars and convert to the existing internal unit only on submission. $120,000 is stored as 120 internally, not 120,000. Existing saved finances remain unchanged. Commas are optional; malformed grouped numbers are rejected.
- Labels are Low-budget film, Mid-budget film and Big-budget film following the dedicated terminology research in FILM-TERMINOLOGY.md. The same internal scale keys and budgets remain.
- Production previews show approximate production quality. All Shoestring spends about 30% of Standard and produces craft of about 20 versus 65. Craft contributes one-quarter of overall quality, so the difference is about 11 points with other factors held equal. Talent, script, marketing and release choices still matter. Budget tier does not directly change production-event probability. The craft calculation was factored into a shared preview/simulation function without changing its mathematical behavior.
- Talent and casting cards show nominations and awards won. Profiles list nomination films, categories, years and revealed wins. Totals derive from stored award seasons and existing win counts; hidden ceremony results never appear early and reloading cannot duplicate nominations. Best Picture nominations are not counted as individual talent nominations.
- Save version 5 accepts versions 1–4. Validation: 36 simulation tests and browser lifecycle, usability, financing, mobile layout, talent honors and announcement checks.

## Alpha fixes (0.5.1)

Two independent testers found four boundary defects, documented in ALPHA-TEST-REPORT.md. Currency errors now use dollar amounts; cent-level repayment can clear small remaining loans; invalid imports preserve the current studio; the last operating week cannot offer a future release. Save format remains version 5.

## QA-lead follow-up (0.5.2)

Required movie finance values now validate before import, including costs, receipts, gross, catalog earnings, campaign spending, production budgets, contract fees, weekly filming cost, distribution advances/shares and opening gross where applicable. Missing, nonfinite, negative or mistyped values are rejected before replacing a working studio. Browser regressions exercise missing movie accounting fields and preserve playability.

Loan cleanup now discards only floating-point residue far below a cent. Partial repayment and weekly amortization preserve real remaining balances, including $9 and $0.01. Targeted tests reconcile both principal and cash instead of accepting a zero residual by default. All 46 simulation tests pass.

## Player flow update (0.6.0)

Casting starts with three available candidates, a free batch audition, and an expandable full roster. Filters and secondary attributes remain available. Movie and production dialogs keep the next action and total costs visible in a fixed footer.

Opening night now leads with studio receipts, unrecovered costs, and an individual performer’s career change. Detailed forecasts remain expandable. A sequel preview explains returning talent, audience carryover, and development cost before confirmation.

Next event uses the same weekly simulation and accounting as Next week. It stops for decisions, completed stages, new scripts, openings, notices, resurgences, financial trouble, and the demo end. It does not bypass pending decisions.

All 58 subgenres have story hooks and recognizable lead descriptions. Sequels retain their parent identity with a continuation premise. New creative and rehearsal decisions affect critics, audiences, or individual performances. Additive fields retain compatibility with existing version-5 saves.

## Weekly pacing (0.6.1)

The player-facing advance controls move one week at a time, leaving opportunities to start other films between production milestones. Each published build starts a fresh studio; reloads within that build preserve progress. Explicit new-studio starts also clear casting filters and draft production plans.

## Distribution action (0.6.2)

Locking the release date opens a dedicated distribution screen. Ready-film cards and the fixed project action also open it directly. Offer review returns to the distribution screen, while marketing remains on the project desk.

## Talent participation and box-office identity (0.7.0)

- Talent with fame at least 60 and an existing major credit demands 2% / 3% / 5% of studio ticket receipts on low / mid / big-budget films. Low-budget films with difficulty at least 75 waive the demand. Both actors and directors use the same rule. These are explicit demo balancing choices, not industry-standard percentages.
- Shares are required alongside the upfront fee, not a player-proposed bargaining slider. All shares use the same studio ticket receipts before participation. They exclude advances and licensing. Weekly payments increase movie spending and reduce cash; they do not reduce reported gross ticket sales or double-deduct receipts. Sequel options retain fee and participation terms. Legacy contracts default to zero participation.
- Fame drawing power weights the lead and director equally (1 each), supporting roles at 0.5 each. Presence affects performance, not direct pre-release awareness. Projection and opening both use the combined fame score.
- Directors have Emerging / Established labels based on major credits or three feature-history entries, with fame and awards separate.
- Opening assessments are provisional. Final theatrical popularity uses gross compared with a scope benchmark: $5,400,000 / $15,000,000 / $43,500,000. Below half the benchmark is Flop; half is Modest turnout; one is Hit; two is Blockbuster; three is Monster hit. These labels never depend on actual spending, salaries or distribution share. Financial results remain separate and include participation costs, excluding general studio overhead.
- This new build starts a fresh studio as requested; refreshes retain the current build's progress.

## Colored ranges and release comparison (0.7.1)

Numerical talent, audition and script estimates retain their existing intervals. Color uses the displayed midpoint: green 80+, yellow 60–79, orange 40–59, red below 40. The legend and numeric text preserve meaning without relying solely on color. Money ranges are unchanged.

Opening night and the saved release report use one Expected / Result comparison list for opening gross, each actor, director, audience test versus release response, and critics. Saved hiring forecasts are retained; absent forecasts are explicitly identified. The comparison appears directly on opening night rather than inside the detailed report.

## Mixed casting shortlist (0.7.2)

Actor shortlists select a fresh face, working actor and established star in that order, choosing within each category using the current sort. Availability and budget filters still apply; missing categories are filled from other available matches. Browse all and director selection remain unchanged.

## Required release scheduling (0.7.3)

Wrapping opens the release calendar. Weekly advancement is blocked in the engine while a finished movie has no date; closing the calendar allows planning without advancing time. Reloads restore the calendar and the header calls out the required date. The existing distribution deadline remains enforced. Earlier saves already at week 259 retain the end-of-demo path because no legal release week remains.

## Returning sequel team (0.7.4)

The first sequel action rehiring the original actors and director shows exact fees, participation terms, and availability for an eight-week shoot after development. Existing actor options preserve fee and share. The upfront fee is still due at greenlight; only development is charged on creation. Individual selection remains available. Unavailable teams cannot be bulk-hired, and greenlight rechecks schedules. New sequels reset prior participation payouts.

## Outcome indicators (0.7.5)

Comparable result cells show a colored symbol-and-text badge: Exceeded above the saved range, Met within its inclusive bounds, Below under it. No verdict is invented for critics without a forecast or a test screening treated as a guaranteed audience forecast.

## More casting candidates (0.7.6)

A More button below the initial three candidates appends three more available matches while retaining the original shortlist and current scroll position. It disappears when all matching candidates are shown. Browse all remains available.

## Production, distribution and careers (0.8.0)

Big-budget plans default to Premium with a 12-week shoot, or 14 for difficulty 75+. Mid-budget starts at 10/12 weeks; low-budget at 8/10. Department requirements depend on genre and subgenre. Creature/body/supernatural horror gives effects more weight than psychological/found-footage horror; other genre baselines remain distinct. Each department's adequacy is capped separately and severe shortages carry an extra penalty. Sliders show required spending and underfunded/lean/meets/above needs. Short schedules lose two execution points per missing week (capped at 16); extra time adds at most three. These are game balance rules.

Distribution offers use scope and drawing power rather than money spent. Guaranteed rights payments are nonrecoupable with a small ticket share; partners fund release support and recover that plus their advance from the studio's ticket entitlement before additional payments. Self-distribution costs $400,000 / $1,500,000 / $4,500,000 and starts with limited reach; Marketing and prestige improve it. Contract reach is saved when signed. Optional marketing remains separate. Recovery never reduces gross ticket sales; movie receipts reflect actual cash received. Participation uses those actual ticket receipts after recovery, excluding advances/catalog as before. Old signed deals retain their stored shares and default to no recovery. Recovery is theatrical only.

All actors and directors now get whole-number fame changes driven by individual performance and exposure. Weak performances can reduce fame even in successful films; studio losses do not automatically damage fame. Career results list everyone with before/after values and signed change. Stars decline genres below 45 aptitude; a stable subset (look modulo 3) also declines roles below difficulty 50. Newcomers remain open. Existing sequel options are honored; free choice hires enforce refusal before money changes. Returning-team availability also respects interest and the recommended schedule.

Validation includes department substitution, schedule penalties, fame gains/losses, refusal reasons, accounting after save/reload, and scenarios where each distribution option wins. This is a transparent game model, not a claim of standard Hollywood contract rates.

## Player feedback and comparison (0.8.1)

Preserve spending discovery: remove exact pre-release craft and schedule-quality point previews. Keep actual costs, recommended schedule and qualitative department guidance; outcome feedback remains available after release. No new warnings about zero marginal spending benefit and no simulation balance changes.

Production confirmation shows cash after the current talent fees, current proposed production, and remaining already-filming commitments across the studio. Overhead, debt payments and release costs are explicitly excluded.

Distribution is a compact three-row overview of immediate net cash, share, reach and recoupment, with detailed terms one tap away. Opening night separates the player's forecast from scope-relative popularity and provides a one-tap whole-team career summary. Developing sequels visibly list the attached cast and director, agreed fees and participation, including after reload.

## Required marketing choice and comparison (0.8.2)

After locking a release date, the player must explicitly confirm purchased marketing campaigns or choose No marketing ($0). Distribution is gated in both the UI and engine until this choice is made. Confirmation adds no charge; campaigns retain their existing immediate purchase behavior.

The release comparison includes selected marketing budget versus spending through opening, and identifies the opening forecast as using that plan. Forecasts refresh for subsequent pre-release campaign purchases and signed distribution terms. The actual opening is compared with the whole-film forecast, not mislabeled as an isolated causal effect of advertising. Later campaign spending does not rewrite opening-period actual spending.

Talent age remains present and advances annually. Gender and role age requirements remain unimplemented.


## Marketing, casting direction, calendar and financing (0.9.0)
- Marketing step offers $0 and selectable paid campaigns. Selection is reversible and uncharged until confirmation; confirmation validates the complete selection before charging. Existing launched campaigns remain committed. Direct post-confirmation campaigns retain their existing behavior.
- Opening ranges now use +/-25%, 20%, 15%, 10% at Research levels 1–4, rather than +/-83% at level 1. These are rough estimates, not guaranteed bounds on actual performance.
- Talent has persistent fictional gender alongside aging. Actors display playing-age ranges; roles provide suggested gender/playing age as creative direction only. These attributes do not filter hiring, change fees, or apply performance penalties.
- Shared opening/forecast seasonal multiplier: October horror 1.30, February romantic subgenres 1.20, June–August action/sci-fi 1.30, November–December family subgenres 1.25. Matches use a single bonus, never stack. Existing August/December general windows remain as fallback. Calendar cards explain opportunities; rivalry still reduces demand.
- Banks: First Picture 8% APR / 25% of total capacity, Meridian 12% / 37.5%, Premiere 18% / 37.5%. Initial limits $2m/$3m/$3m, total grows with prestige. Each has separate outstanding balance capacity. Loans amortize principal over 104 weeks, with weekly interest on remaining principal. Legacy unassigned debt is allocated proportionally for capacity and preserves 12% APR.
- Loan shark: once bank offers are exhausted (each below the $1,000 minimum), receive $2m and owe $2.4m including fixed fee. Entire unpaid balance due 13 weeks later, after weekly receipts and expenses. Automatic payoff if affordable; otherwise immediate studio closure, no refinancing after the deadline. Early repayments prioritize the shark. No second shark loan; requires 13 weeks remaining in the demo to avoid an endgame escape. Balance and deadline survive saves and appear on slate/finances.
- Build marker 0.9.0 intentionally starts a fresh studio; same-build reloads preserve progress.
- Verification: 73 engine tests, mobile/desktop lifecycle smoke, usability regression, and focused marketing/bank browser checks.

Seasonal inspiration: [NBCUniversal on February romantic releases](https://www.nbcuniversal.com/article/february-show-your-love-two-sustainable-rom-coms) and [Disney’s Thanksgiving Moana 2 release](https://movies.disney.com/moana-2). Multipliers are game balancing choices, not empirical revenue promises.


## Recurring critics and streaming agreements (0.10.0)
- Anita Rewrite values writing and demanding performances; Rick O’Shea values craft, spectacle and crowd response; Paige Turner values characters, performances and emotional payoff. Each gets a score and a short conditional review grounded in actual film metrics. Snapshots are created after filming, revealed at release and kept in the report. Their average supplies the overall critics score, including prestige/awards systems that already use it. Reviews do not reroll on reload or department upgrades.
- New movies transition from theaters into the catalog with a streaming-offer announcement. A compact two-row comparison leads to individual terms and a separate signature action. Players can defer and return through the catalog film card; unsigned films earn no streaming income. Pending offers also appear in emergency financing so a payment can rescue negative cash.
- BingeBox: 52-week exclusive license, guaranteed upfront payment, no additional streaming royalties during the term. PictureHouse: smaller upfront payment plus weekly royalties starting the following week and declining over time. Both retain sequel rights and resume automatic catalog licensing after 52 weeks.
- Offers depend on box office and audience response, not costs sunk into a movie. For demo balancing, base weekly value is max($2,000, theatrical gross * 0.0017) * (0.7 + fans/200). Exclusive upfront = rounded 32 times base; royalty upfront = rounded 5 times base, first weekly payment = 1.1 times base. Royalty decay is (1 + weeks since first payment / 52)^-1.2. A short cash horizon favors the guarantee; a full year of royalties pays more. Terms are fictional game choices.
- All payments increase cash, movie receipts and the streaming/licensing subtotal exactly once; no distributor recoupment or talent theatrical participation is applied. Signing cannot be repeated. Saved contracts preserve terms/deadlines. Legacy movies without the new field retain their previous automatic income. New sequels reset deals and critic snapshots.
- Build 0.10.0 starts a fresh studio under the existing version-marker policy. Verification: 79 simulation tests, full lifecycle/sequel browser smoke, usability regression, focused mobile review/offer/defer/sign/reload/payment flow.


## Audition scroll hotfix (UI cache revision 0.10.1)
Holding an individual audition restores the casting dialog scroll offsets after its body is replaced, focuses that actor's new Negotiate button without scrolling, and brings it into view only if necessary. Verified at a 390px mobile viewport after expanding More: scroll remained 1428px, the correct actor's negotiation button was visible/focused, the audition was free, and negotiation opened successfully. Full browser lifecycle regression passed. Only the app cache URL changes; the simulation/save build remains 0.10.0 so current studios continue.


## Mobile release reports and active streaming (UI revision 0.10.2)
- Opening night now has fixed Results, Reviews, and Cast & Director navigation and a fixed Back to the lot action. Each section scrolls separately; switching does not acknowledge the opening notice. The film title stays in the header. Results retain the unified expectation/result comparison and cash/profit context; detailed explanation is a disclosure.
- Critic scores are larger and color-coded, review copy is left-aligned, and nested panel padding is removed. Career rows are sorted lead/support/director with portrait, performance, fame before/after, and a single change indicator; repeated explanation is consolidated.
- UI active classification includes pending streaming decisions and signed agreements through their final contract week. Streaming cards show the platform, streaming receipts, remaining term and royalties (or explicit no-weekly-royalty terms for an upfront license). Expired contracts move to Catalog, where automatic long-tail licensing continues. Underlying financial stage remains catalog, so saved cash flows/contracts and film history are unchanged. Legacy automatic catalog films remain in Catalog.
- Updated mobile browser regression checks separate views, the visible fixed footer, pending/signed active films, absence from Catalog during a contract, and transition to Catalog after expiry. Full lifecycle smoke passes. App/style cache revision changes while the saved-game build stays 0.10.0; existing studios continue.


## Practical creative choices, named rivals and studio unlocks (revision 0.10.3)
- Creative-edit choices describe audience/box-office versus critical/prestige tradeoffs instead of implying exact final score additions. Fan score enters opening gross as (0.55 + fans/145), the theatrical hold as (0.35 + fans/200), parent-film sequel interest, and streaming offer value. At 60 -> 66 fans, the opening factor rises about 4.3%, and the hold parameter rises from .65 to .68; later-week benefits compound. Critics influence opening prestige and picture/directing awards scoring, with acting awards also using performance/difficulty. Critic bias is blended through the three reviewers rather than added verbatim to their final average. No score formulas changed in this update.
- Atlas Pictures (action/sci-fi), Velvet Lantern Films (drama/comedy), Night Owl Studios (horror/thriller) label calendar releases, selected-date competition, nominations and winners. New releases save studio IDs. Legacy entries derive stable identities without advancing the RNG. These are named background competitors, not full independently managed studio economies.
- Department milestones are named and explain practical benefits; Research level 2's detailed performance/craft analysis and level 3's competition/seasonality/reach breakdown are existing genuine report unlocks, now clearly presented. Roadmaps show current ownership and future steps.
- First department improvement and first owned facility require cash only. Department levels 3/4 require 15/35 prestige. Facility levels 2/3/4 require 15/35/60 prestige. Both prestige and sufficient cash are enforced before mutation. Department investments: $300,000/$900,000/$1,800,000; facilities: $700,000/$2,000,000/$3,500,000/$5,500,000. Existing weekly overhead remains $2,000/$3,000 respectively. Prestige milestone announcements link to unlocks. Existing owned improvements remain owned.
- No saved-game reset: game build remains 0.10.0, with new app/engine/style cache revisions. 82 simulation tests plus focused mobile rival/unlock/edit-choice checks, usability and full lifecycle browser tests pass.

## September 10 — poster and economics iteration (UI 0.11.0)
Added four supplied photo posters and one-time featured script injection, mobile preview, expectation range thirds and pre-release audience/critic snapshots, and eligible superstar passion-project fee quotes. Preserved build marker 0.10.0 and existing studios. Audited production, advertising, streaming and awards; see ECONOMICS-AUDIT.md. Added range/casting/poster and 30-scenario streaming accounting tests plus endgame coverage. Mobile smoke, critics/streaming and poster-loading browser checks pass.

## September 10 — UI 0.12.0 and fresh playtests
Separated Streaming from Active, added compact result rows and forecast markers, revised new-film production/marketing/delivery economics, and closed scope-only distributor advance arbitrage. Preserved existing projects. Ran 311,040 controlled film scenarios and 1,200 five-year strategy runs; three new agents with no prior history completed independent UI playtests. Their findings drove accounting precision, empty-state, optional-screening and score consistency fixes. Evidence and limitations: docs/economy-0.12.0/REPORT.md.

## September 10 — UI 0.13.0: opportunities and production choices
Added hidden-duration audience trends, one-use half-rate talent offers, location/effects choices, social backlash and fan-driven demand events, compact release signals and clearer streaming totals without changing streaming payouts. Revised new-film delivery and category-specific awards scoring while retaining old saves and Next Week. Three fresh UI-only agent playtests drove exact monetary displays, empty-offer next actions, nonrepeating backlash and full loan repayment. 98 simulation tests pass. Research, 38,880 controlled film scenarios, 1,200 studio runs and independent agent evidence: docs/iteration-0.13.0/REPORT.md.

## September 10 — UI 0.13.1: priced production options
Every filming-location and effects option now displays its department budget for the selected spending tier and schedule, including facility savings. Selected slider totals use the same department breakdown as production charges. Removed pre-release need/target/recommended-schedule verdicts and the exact needs comparison in the final report; observed release feedback remains. Renamed effects to practical + visual effects, practical effects, visual effects (VFX), and minimal effects. Kept interior/exterior distinctions to preserve existing simulation meaning. Existing savings and production cost formulas are algebraically unchanged; saves preserved.

A new terminology research agent consulted ScreenSkills location responsibilities (https://www.screenskills.com/skills-checklists/unscripted-tv/location-department/location-manager-skills-unscripted/), VFX overview (https://www.screenskills.com/job-profiles/browse/visual-effects-vfx/), and practical effects occupational standards (https://www.ukstandards.org.uk/en/nos-finder/SKSPSFX05/create-practical-fire-effects). Prices are game budgets, not claimed real-world industry quotations.

Validation: 98 simulation tests; mobile regression verifies all eight option prices, dynamic schedule updates, selected location/slider agreement, absence of optimization verdicts, and production confirmation.

## September 10 — UI 0.14.0: weekly casting limits and clearer results
- Five new auditions per role, per movie, per game week. Directors have a separate five-audition allowance. Prestige thresholds 0/15/35/60/85 unlock 5/7/9/11/13 respectively. Cached auditions do not reroll or consume slots; limits persist through reload. Existing auditions/contracts are preserved, and the original-team sequel return remains available.
- Director role forecasts remain hidden until auditioned; hiring requires that audition. Remaining slots and the weekly reset are visible. Bulk auditions stop at the allowance. Prestige announcements describe the extra slots.
- Opening results explicitly distinguish forecast performance, ticket popularity, studio receipts, unrecovered spending and cast/director fame. Receipts include distributor advances; participation remains a cost, preserving the accounting model.
- Brighter secondary text and borders, colored rating backgrounds, blue within-forecast/green exceeded/red below badges, plus text and symbols for meaning beyond hue.
- Validation: 101 simulation tests including per-role/per-film limits, separate director limits, rejected sixth auditions without state mutation, cached results, reload, actual week advance, prestige thresholds and invalid roles. Mobile director flow, normal lifecycle, production/conflict/awards usability and critics/streaming regressions pass. No save reset.
