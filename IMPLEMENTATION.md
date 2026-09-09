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
