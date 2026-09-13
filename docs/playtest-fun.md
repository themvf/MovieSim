# Independent playtest: fun and meaningful choices

Date: 2026-09-13. Agent assessment, not a human enjoyment study.

## Method and scope

Played a fresh normal $6 million save entirely through UI on local MovieSim 0.37.0. The live GitHub Pages URL returned ERR_EMPTY_RESPONSE in this browser environment; this is not evidence that the public site is down. Desktop 1280×900 first, mobile 390×844 report spot check. No cash injection, state injection, engine actions, or generated fixture. Used Playwright to click actual controls and inspect rendered text. Reached first theatrical release, opening reveal, post-release report, and score explanations. Did not play a second film, complete a theatrical run, or test actual sequel continuity.

## Exact journey

Created small Comedy, **Family Detour**, following initial feel-good comedy demand hint. Selected Vacation, Family, Bad Luck, Get Home, Miscommunication, Warm; ending Reunion + Goal Achieved; campaign promise As written. Paid $100,000 screenplay commission; advanced three weeks. Hired newcomer Lena Okafor (audition80–100, $80k), Finn Mercer, and emerging director Theo Lane (audition80–85). Total talent fees $250k. Standard eight-week production $655k, initial film plan $1.005m including script. Chose to give director two weeks for an ending rewrite ($16,375 holding costs), then rest crew for two weeks ($16,375, +6 loyalty). Wrapped week16; test screening $45k scored90. Chose week17 release, $65k social campaign, Meridian partner distribution. Reached opening report: fans80, critics75, gross$1,495,754, studio receipts$378,301, total spending$1,227,750, loss$849,449. These are opening figures, not final profitability.

## Assessment

Heuristic scores: creative agency 3/5; feedback 3/5; first-film pacing 3/5; production business choices 4/5; visual collectible appeal 2/5; replay promise 3/5 (untested beyond visible hooks). Overall: a playable business loop with several good reward moments, but custom-movie identity and the collectible-card fantasy are not yet convincing enough.

### Strongest observed moments

- Audition discovery works: an inexpensive newcomer produced an80–100 estimate. Fee/star alternatives created a real budget decision, rather than a mandatory expensive star.
- Financial choices are readable: planned costs, commitments, distribution recoupment, and gross versus receipts were available before committing.
- Director/crew interruptions personalize time tradeoffs. The director's name and named production manager add a human face.
- Premiere hides results until a deliberate reveal; the opening report recalls the chosen ending, divides audience groups, and separates critical approval from losses. This is the clearest emotional reward opportunity.
- Cards can be selected/deselected without rebuilding the movie; ending combination produces immediate short text.
- Hooks for commissions, talent ambitions, studio identity, magazine and sequels are visible. Their sustained fun was not tested.

## Prioritized improvements

### P1: Carry the chosen movie into the writing and casting

Observed: this family-vacation movie became **Comedy / Romantic**, with lead role **a wedding planner** and support **The ally whose own ambition complicates the mission**. Premise: **Family pursue get home in a vacation. Bad Luck meets miscommunication.** These are creative continuity/wording issues, not an observed financial or scoring bug. They weaken ownership: the player composed one movie, but the project desk describes a mismatched generic one.

Recommendation: build role suggestions and grammar-aware premises from selected cards; make subtype consistent or omit it when uncertain. Include ending cards in the project summary: currently Your movie cards lists the six ingredients but omits Reunion/Goal Achieved.

### P1: Deliver distinct card art and fix card typography

Observed desktop screenshot: Workplace, Small Town, Big City, Vacation all use the identical building-grid graphic. Workplace breaks to "Workplac" / "e". The available collection looks like repeated labeled controls, not distinct collectible ingredients. Card tab row clips the Ending tab at desktop modal width; horizontal scrolling is needed.

Recommendation: give each ingredient a recognizable illustration, permit 2-line titles without breaking individual words, and make category progression visible. Avoid filling the collection with interchangeable category glyphs.

### P1: Remove the dominated crew option

Observed crew choices:
- Rest: +2weeks, protected quality, +6loyalty, $16,375.
- Simplify: 0weeks, −2quality, +1loyalty, no holding costs.
- Push: 0weeks, −4quality, −6loyalty, no holding costs.

Push is worse on every displayed dimension. A player is being asked to select an obviously bad answer, not make a tradeoff. Give pushing a clear benefit, or remove it. Also, with nearly $5m remaining and no external deadline, the rest decision was easy. Deadline-linked opportunities could make that cost matter.

### P1: Explain one or two consequences, not a matrix of arithmetic

Observed report: **What worked. What held it back.** has no findings underneath, only generic explanatory copy. **Why these scores?** expands into execution/coherence/affinity/promise/continuity/repetition/uncertainty for five groups and critics, many zero values. One valuable explanation appears at the end: **Relationships support the reunion**. Audience groups span76–83, giving relatively mild disagreement in this single run.

Recommendation: lead with two named-card causes (e.g. Family supported Reunion; Warm delivered the expected tone), and one production cause. Hide detailed arithmetic beneath a secondary disclosure. Omit empty sections. Do not conclude the model is universally too flat from this one film.

### P2: Improve the setup-to-payoff connection

Observed pre-production creative guidance is only **Story logic & payoff and Production craft**, with no clear explanation of how Reunion or Goal Achieved changes talent requirements. Ending preview is two concatenated descriptions, not a distinctive combination interpretation. Paid test screening reveals90 but no actionable finding; final fan score80. No explanation connects that gap to different audiences.

Recommendation: one specific pre-production demand plus one actionable screening insight. Explain that test audience and opening audience can differ. Keep outcome uncertainty; do not expose a winning recipe.

### P2: Shorten repeated hiring while preserving discovery

Observed: each of the three hires used browse → audition → negotiate → offer; all initial offers succeeded, and the flow returns to project desk between hires. This is manageable for a first film but likely repetitive across many films (inference). An audition-shortlist button exists but was not used.

Recommendation: after signing, offer a direct Next role button and a one-tap standard offer after audition, retaining negotiation as optional. Keep newcomer reveals and chemistry, which supply personality.

### P2: Give the first production more changing visual feedback

Observed: three screenplay weeks and twelve production/calendar weeks largely meant Next week clicks; two popups were the main changes. Advancing from the movie modal closes it back to the slate. The film poster is essentially title/tone with a generic star, rather than a visible evolving result of cards.

Recommendation: a compact progress montage or changing movie card, and clearer advance-to-next-decision affordance. No need more paragraphs or more random interruptions.

## Evidence

- test-results/fun-album-desktop.png: repeated glyph art, awkward Workplace wrap, category clipping.
- test-results/fun-crew-choice.png: crew tradeoffs.
- test-results/fun-opening-report.png: actual first-film report.
- test-results/fun-opening-mobile.png: readable mobile financial/ending panel; no document-width overflow at390px. This is a limited report spot check, not a complete iOS Safari/device test.

## Suggested next user test

Ask a human to build two deliberately different small movies and predict who will like each before release. Observe whether they remember card choices, understand the eventual response, and want to make another. The present agent test establishes playability and identifies likely friction; it cannot establish human fun or retention.
