# Fresh player three — MovieSim

Played the browser UI at http://127.0.0.1:4173 on September 10, 2026. Fresh isolated Chromium/Edge context, 1440×1000 viewport. No source, save state, implementation documentation, or other playtest reports read. UI DOM text used to operate controls. Approximately 12 minutes of active interaction; meaningful stopping point: debut released and profitable, sequel greenlit after resolving a director conflict.

## Actual play

A tooling interruption required a fresh restart early in filming. The abandoned initial run selected Beyond the Pines for $100,000, Finn Reyes, Kai Reyes, and Ada Kim at a roughly $1 million standard budget. Browser automation lost its handles after a timeout; this was not a game crash. The fresh restart generated different script/talent numbers, so the completed run below stands separately.

1. Bought low-budget mystery Beyond the Pines for $290,000, quality estimate 55–95, difficulty 81 in acquisition (80 elsewhere), two roles. Chose a small thriller to protect the $6 million starting cash.
2. Auditioned and hired newcomer Hugo Sato for lead (70–80 audition, $30,000 displayed offer). Compared Vera Reed (50–70) with working actor Tessa Rivera (60–80) for support and paid more for Tessa. Hired emerging director Miles West (85–100 expected direction, ~$60,000), clearly better value than the other choices.
3. Used standard sets, crew, effects and recommended ten-week schedule. At week six gave supporting role the extra rehearsal (+5), because it had the weaker audition.
4. Wrapped week 11. Locked week 12 against a sci-fi competitor marked DIFFERENT AUDIENCE. Bought $180,000 theatrical trailer; opening estimate rose from $560k–$940k to $870k–$1.5m before distribution.
5. Signed Meridian partner deal: $170k advance, $80k release fee, 40% share, $390k recovered first. Dollar example helped make the contract understandable.
6. Opened week 12 at $1.8m, above $1.0m–$1.7m forecast. Critics 75, fans 80. Results: Hugo 75, Tessa 60, Miles 100. Studio receipts $510k; $1.1m unrecovered movie costs. Read reviews and career feedback.
7. Bought Audience research team for $300k plus $2k/week, because I wanted more explanation of results. Expanded report showed average performance 67 and craft 65, with all departments meeting needs.
8. Commissioned Beyond the Pines 2 for $140k using returning cast/director. Script estimate 40–80. Three-week development. Week 14 wire said Miles accepted outside production. At week 16 greenlight planning explicitly exposed his conflict and offered Replace, preserving the budget plan.
9. Replaced Miles with Luca Hart, expected direction 80–100, $180k upper offer. Greenlit standard ten-week sequel. Stopped week 17, sequel filming 1/10. Original at $6.2m box office and $660k movie profit; studio cash ~$5.6m, prestige 2.

## Experience

The central loop is understandable without opening How to play. The noir studio presentation, readable cards and restrained color make it feel cohesive. Choosing an affordable script and discovering strong cheap talent feels rewarding. Casting is the strongest early activity, especially comparing audition uncertainty against fee. Partner distribution also creates a real tradeoff. The sequel scheduling conflict was the most interesting surprise: success changed the team available for the next movie.

Production itself was mostly repeated week advancement with one free-benefit rehearsal decision. Standard spending and the recommended schedule felt like the obvious safe choices; I had little reason to deviate. At the first cast selection in the abandoned run, cheap newcomers already had excellent auditions, making the expensive options hard to justify. The completed run at least provided a weaker newcomer that encouraged spending up.

I wanted a second project to see whether the successful director and audience carried over. That is a good replay hook. I would continue this save for a few more films, but I cannot judge five-year replayability from this session. Repeated default production budgets and similarly worded script premises may make the middle game repetitive unless later constraints force changes.

## Confusion and issues observed

- A persistent “Terms agreed. Payment is due at greenlight.” message remained visible in DOM text well beyond greenlight, including release and week 17. It became stale information. It was not obvious in the final screenshot viewport, so this is a stale UI/accessibility text observation rather than proof of a visible toast covering the page.
- Acquisition difficulty used exact 81, while the script listing/project overview rounded to 80. The abandoned run similarly showed 53 versus 55. Small but makes identical metrics appear inconsistent.
- After a movie is already earning, the project desk still shows “Rough opening estimate” and purchasable campaign buttons. I wondered whether buying more advertising improves current weeks or only the already-past opening. The timing effect is not explained there.
- The wrap message promised a test screening; the automatic flow went through date, marketing and distribution, and my final report said TEST SCREENING Not held. I did not discover the screening action on this route. This is a discoverability concern, not proof it is missing.
- Research upgrade gave useful craft/performance information, but “serviceable” craft 65 despite all standard departments meeting needs left me uncertain what concrete change would improve the next film efficiently.
- Rounding makes some totals look inconsistent: costs $1.6m, receipts $1.1m, loss $530k. Recognizable as rounding, but exact figures on demand would help economic planning.
- No blocking game bug observed. Locator timeouts came from automation assuming Next week would retain its name when it correctly changed to Next decision; do not count those as game failures.

## Three priorities

1. **Explain consequences at the moment of the next decision.** For a released film, label marketing by its effect on remaining theatrical weeks; replace obsolete opening forecasts. Make test screening discoverable in the wrap flow. Tie research findings to actionable budget or casting adjustments.
2. **Make production choices less automatic.** Preserve clear safe defaults but introduce bounded creative/risk alternatives with distinct upside: e.g. a demanding scene with cost/quality tradeoffs or a rehearsal choice where the lead/support importance matters. My only event offered free numerical improvement.
3. **Strengthen continuity while cleaning feedback precision.** The returning-team conflict is excellent material: foreground it earlier during sequel development and explain options such as replacing or waiting. Clear stale agreement messages and use consistent difficulty/optional exact money figures so players trust the simulation.

## Screenshot evidence

- [Rehearsal choice](fresh-player-three-rehearsal.png)
- [Opening result and forecast comparison](fresh-player-three-opening.png)
- [Sequel director conflict in budget plan](fresh-player-three-sequel-conflict.png)
- [Final slate: profitable original and filming sequel](fresh-player-three-final.png)
