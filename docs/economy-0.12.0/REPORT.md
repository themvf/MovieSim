# MovieSim 0.12.0 — balance and fresh-player review

## Delivered
Active → Streaming → Catalog → All. Active covers development, production, scheduled and theatrical releases. Streaming includes unsigned offers and live streaming contracts; expired licenses move to Catalog. Movie simulation stages remain compatible with existing saves.

Release comparisons now use labeled expected/result pairs, a forecast-band marker, and compact outcome labels. Marketing spending is in the financial summary rather than scored as an achievement. The mobile modal header/footer is smaller. Existing studios retain their progress.

New acquisitions, commissions and sequels use economy version 2. Existing projects retain prior campaign prices, advance calculations and release economics. No signed agreement is rewritten.

## Economic changes
- Severe production shortfalls reduce the audience the movie can convert, even when its selected scope promises blockbuster scale. Delivery factor = (0.2 + 0.8 × min(1, craft / 65)^1.5) × (0.45 + 0.55 × min(1, shoot weeks / recommended weeks)). It multiplies opening demand and its forecast; normal fan-score retention continues to govern subsequent weeks. Premium funding meets the needs of big-budget films; smaller films can meet needs with Standard spending.
- New-film marketing prices multiply the previous campaign costs by 1 / 2 / 4 for small / medium / big scopes. Combined campaigns therefore cost $1,185,000 / $2,370,000 / $4,740,000. These remain game-scale budgets, not Hollywood-scale realism.
- Marketing reach becomes 95 × (1 − exp(−raw reach / 70)), so additional advertising still helps but diminishing returns apply.
- Distributor advances value new films using the square root of delivery factor, closing the guaranteed-advance shortcut. Contract recovery uses the same revised advance; existing contracts are unchanged.
- Exact production-impact formulas stay out of the preproduction UI. Under-delivery receives a qualitative explanation after release. Player learning remains part of the game.

## Evidence and method
Baseline: commit 9441a8d. Scripts: [film matrix](../../scripts/stress-economy.mjs) and [five-year studios](../../scripts/stress-studios.mjs).

311,040 film runs: six genres × three scopes × three spending tiers × three schedules × three advertising plans, before/after. Self-distribution uses 100 development seeds and 100 separate validation seeds; the other two distributors use 30 of each. These are repeated controlled scenarios, not 311,040 independent human plays. Script quality, role difficulty, cast fees/ability and release date are held constant. Test-only instrumentation separates final performance and opening random draws from shoot duration. Weekly random draws are phase-seeded. Production incidents remain a schedule consequence. Gross, opening, production/marketing/release costs, profit, ROI, theatrical loss frequency and 52-week streaming receipts are recorded. The self-release matrix was completed before the final advance-only adjustment, which cannot affect a self-release contract.

Illustrative held-out self-release result (600 runs per row, dollars):

| Big-budget strategy | Old average profit | Revised average profit | Revised theatrical loss rate |
|---|---:|---:|---:|
| Minimum spending, 4 weeks, all marketing | $10,864,157 | −$8,969,536 | 100% |
| Minimum spending, recommended weeks, all marketing | $15,712,161 | −$7,792,938 | 100% |
| Premium spending, recommended weeks, all marketing | $15,858,053 | $7,301,048 | 48.5% |

Profit includes a full royalty contract after theaters; movie overhead/interest are excluded in this isolated comparison. The same maximum-marketing/minimum-spending strategy lost on average with both other distributors. Properly funded films retain upside and downside; spending more is not a guarantee.

1,200 studio runs: 50 seeds × four strategies × three distributors × before/after. Each starts with the real $6 million and uses generated scripts, available affordable talent, bank debt and operating costs. Strategies repeatedly make minimum-budget big films with either all or no advertising, or adequately funded small/big films. No grants or save-state cash edits. Bots cut production incidents, take bank loans when needed, and fall back to a guaranteed release without advertising when they cannot finance their intended release. They do not use loan sharks, upgrades, awards campaigns, simultaneous productions or adaptive learning. A run stops at bankruptcy or week 260.

The old minimum-budget/max-advertising bots survived all 50 seeds for every distributor. Revised versions exhausted financing in all 50; the no-advertising variant no longer survives on inflated guaranteed advances. Funded small-film bots survived all 50 seeds for all distributors; partner distribution ended with average cash minus debt of about $22.2 million. Immediately attempting fully funded big films from a new $6 million studio remained extremely risky (92–100% failure), including before this update. That is a financing/progression finding, not evidence that well-capitalized big films cannot profit.

Limits: fixed talent/script film fixtures and simple studio bots do not establish global optimal balance. No exhaustive search of upgrades, release competition, star packages or parallel slates was performed. Results establish that the reported shortcut is no longer dominant in these scenarios; continued player testing is necessary.

## Three fresh agents
Three newly spawned agents received no conversation history and were explicitly barred from source, saved-state manipulation, old tests or reviews. They played independently through the UI in isolated browser contexts. These are AI-agent playtests, not a human usability study. Browser-tool timeouts caused some fresh-session restarts; reports distinguish tooling failures from game defects.

- [Player one](../playtests-0.12.0/fresh-player-one.md): completed Borrowed Time through streaming; approximately $4.5m theatrical gross and $45k movie profit after a license. Explored finance, awards and sequel pricing.
- [Player two](../playtests-0.12.0/fresh-player-two.md): completed a mobile debut and streaming; approximately $7.2m theatrical gross and $1.7m movie profit. Found distribution and individual career feedback rewarding.
- [Player three](../playtests-0.12.0/fresh-player-three.md): released a profitable debut, bought Research, and greenlit a returning-team sequel after replacing an unavailable director. Valued casting and continuity.

None confirmed a blocking game bug. Common strengths: clear first-film actions, discovering affordable performers, release payoff, and meaningful sequel relationships. Common weaknesses: quiet weeks, overly easy default production choices, and unclear numeric precision. All independently discovered or noted the optional test screening poorly in the automatic release path.

### Fixed after their reports
- Cash, account details and production commitments show whole-dollar accounting amounts rather than coarse rounded balances. Rounded box-office summaries remain summaries; forecast ranges remain intentionally uncertain.
- Critics/fan scores and script difficulty use consistent five-point display rounding across the affected screens.
- Active's empty state acknowledges completed work and directs players to Streaming/new projects.
- Optional paid test screening is visible before locking the release date; it keeps the player in the calendar, charges once and does not advance time.
- Expired toast text is cleared from its status region instead of lingering in accessibility/DOM text.

Remaining recommendations: more interesting quiet weeks without removing the player's ability to start films; clearer longer-term streaming offer comparison; stronger motivation to explore beyond the first inexpensive audition; richer film-specific story/production decisions. No unsolicited time-skipping change was made.

Validation: 92 automated tests; browser gameplay, streaming-tab separation/expiry, mobile result rows, optional screening, same-build save preservation and release/awards flows. Screenshots and original agent reports are archived alongside this report.

## Reproduce
From the repository root: `npm test`, then `node scripts/stress-economy.mjs` (default 100 seeds per cohort, self release). Set SEEDS=30 and DEAL=secure or partner for the other matrices. Run `node scripts/stress-studios.mjs` for five-year strategies. Scripts read baseline commit 9441a8d using git and write scratch data under test-results.
