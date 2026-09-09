# Playable demo 0.4

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
