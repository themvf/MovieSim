# Playable demo 0.1

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
- Free auditions with uncertain estimates, fee ranges, negotiated offers, sequel options, named directors, and booking conflict checks.
- Separate sets, crew/post, and effects allocations; adjustable 4–20-week schedules; player-selected release dates locked at greenlight.
- Weekly production cash flow, scope-dependent interruptions with three cost/quality responses, and cancellation closeout.
- Optional paid test screening, four individual marketing campaigns, three distribution structures, and visible competing releases.
- Opening-weekend reveal, weekly theatrical holds, separate critic/fan scores, filmography and fee growth, automatic catalog income, and detailed financial reports.
- Department/facility upgrades, voluntary and emergency bank loans, repayment, finite credit, and optional closure on a deficit.
- Annual Picture/Director/Lead/Supporting awards, paid campaigns, prestige effects, and a five-year financial/prestige retrospective.
- Responsive phone/desktop layouts, local autosave, JSON save export/import, guide, and restart.

## Concrete balancing choices

Money is stored in thousands of dollars. The base weekly overhead is $5K. Department upgrades add $2K per week per level; facility upgrades add $3K. Loans charge 12% annual interest on the outstanding balance, with principal amortized over 104 weeks. Credit starts at $8M and grows $60K per prestige point.

Talent fees and 20% sequel-option premiums are paid at greenlight. Filming costs are paid in weekly installments. A cancellation pays a 15% closeout on remaining filming commitments and releases bookings; sunk costs and bank debt remain.

Release dates are selected at greenlight, at least three weeks after the planned wrap, and cannot move. Production incidents force spending/quality tradeoffs without extending the committed schedule. Distribution must be selected before time can advance into the release week. Greenlighting is blocked if the film cannot finish and release within the five-year run.

Distributor advances are non-recoupable guarantees in this simplified demo. Harbor offers 40% of costs as an advance and 13% of gross ticket sales; Meridian offers 15% and 31%, with an $80K booking fee. Prestige improves these terms. Self-distribution charges a scale-dependent booking fee and returns 50% of gross after theaters. All marketing is studio-funded. Reports distinguish gross box office, studio receipts, costs, and profit.

Audience size varies by scale. Casting draw and campaigns influence opening awareness; genre-similar competitors reduce audience share. August and December receive seasonal multipliers. Audience response determines theatrical holds, with a 4–12-week run. Test screenings contain substantial noise even with upgrades; commercial forecasts remain uncertain.

At the endpoint, estimated studio value includes cash less debt and unfinished-production closeout, 50% of upgrade investments, and catalog value of 2.5% of historical gross. Unreleased movies receive no speculative value. The overall rating is the geometric mean of financial health and prestige, requiring progress in both.

## Publishing

Publish the root of `main` with GitHub Pages. All asset paths are relative, so `/MovieSim/` hosting works without a build step. `.nojekyll` prevents Jekyll processing. A Pages-compatible account/repository visibility is required. No credentials are stored in the game or repository.

## Scope and limitations

This is the first balance prototype, not a finished iOS application. It uses a deliberately small event and campaign library, abstract distribution/awards formulas, stylized generated art, and local browser saves. Personalities, chemistry, loyalty advantages, individual employees, negotiated catalog deals, and changing tastes remain deferred as agreed. Native iOS packaging, device-specific Safari certification, audio, and deeper content variety are future work.
