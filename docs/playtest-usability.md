# First-time mobile usability playtest — Cinema Collection 0.37.0

## Method and boundary

Agent usability inspection, 390×844 portrait Chromium, September 13 2026. Attempted public demo URL first; browser returned ERR_EMPTY_RESPONSE. Completed journey against local repository served at localhost:4173, displaying Cinema Collection 0.37.0. This is not an iOS Safari compatibility test. Fresh browser/save: $6,000,000 starting cash, week 1. No injected money, time, scores, talent, or movie state; all progress used visible UI controls. Selector inspection helped browser automation identify buttons, so this is expert inspection rather than an unassisted human usability study. Two automation selector timeouts were corrected; those are not counted as game defects.

## Completed journey

1. Find your first script → Comedy card lab.
2. Named movie The Last Office Party; Small scope; As written campaign promise.
3. Selected Workplace, Rivals, Competition, Win, Deadline, Warm, Goal Lost, New Beginning. Navigated categories using Next buttons. Commissioned screenplay for $100,000.
4. Advanced three weeks to casting. Hired Finn Sato and Finn Mercer after free auditions and default negotiated offers; hired Miles West, whose strengths included Comedy. Total talent $160,000.
5. Greenlit standard 8-week production plan: $655,000 production, $915,000 total including screenplay and talent. No slider optimization or internal formula access.
6. Week 6 director said ending was not landing; chose two-week rewrite pause ($16,375). Later Nora reported exhausted crew; chose two-week rest ($16,375).
7. Wrapped week 16; paid $45,000 for test screening (85/100). Chose week 17 release, $65,000 social campaign, Meridian distribution.
8. Revealed opening and inspected report and Why these scores. Actual opening $1,389,847 against $900,000–$1,500,000 forecast. Fans 68, critics 67. Total spending $1,137,750, receipts $335,939, loss to date $801,811. Reached opening report successfully, without blockers. Did not play full theatrical run or sequel.

## Assessment

Heuristic ease of use: 7/10. First movie can be completed; buttons usually make the next step explicit. Heuristic engagement potential: 6/10. Card authorship and premiere build anticipation, but identity mismatches and generic feedback weaken ownership. These numbers are subjective expert estimates, not human enjoyment measurements or statistical results.

## Findings in priority order

### High — cards do not reliably describe the produced movie

The deliberately selected Workplace/Rivals/Competition/Win/Deadline/Warm combination became Comedy / Romantic, with a lead role described as 'a wedding planner' and a supporting ally 'whose own ambition complicates the mission.' Neither romance nor wedding planning was selected. The premise reads 'Rivals pursue win in a workplace. Competition meets deadline.' This is awkward and makes cards feel cosmetic. Derive casting briefs and subgenre from selected ingredients, or show neutral roles when the game has insufficient information. This is the most important ownership/fun repair.

### High — test-screening feedback and final reception are hard to reconcile

Paid screening reported 85/100; final fans 68. Distribution audience estimate was 75–95. The game explicitly warns estimates are uncertain, so this is not proof of a numerical bug. However the 17-point change receives no explanation and the final score is below the earlier band. Add a short explanation of screening sample vs actual audience composition, or calibrate previews to the final reception model. Otherwise paid research feels misleading.

### Medium — visually different cards are mostly identical graphics

All five Comedy settings displayed the same building glyph; character cards likewise share a category glyph. Cards have attractive dark colors and large tap targets, but illustrations do not distinguish Workplace from Vacation or Family Gathering. The result feels like labeled buttons more than a collectible album. Give every ingredient a recognizable silhouette/illustration. Screenshot usability-cards.png captures this directly.

### Medium — first screen spends too much mobile space on setup

Title, scope, campaign promise, and tabs occupy roughly the first 340 pixels. Only the first two cards are fully visible; a fixed footer covers the bottom while further cards scroll. Horizontal tabs show Setting, Characters, Comic engine and a clipped fragment of the next tab; Ending is out of view. Next buttons rescue the journey. Use a compact title header, expandable production preferences, and a visible step counter such as 1/7. Keep the sticky Next button.

### Medium — empty category's button says Next: the current category

Initial Setting page says 'Next: Setting →'; entering Characters before selecting says 'Next: Characters →'. Selecting a card then changes it to the actual following category. The validation logic may be sensible, but labeling suggests advancement when it means choose here first. Use 'Choose 1 setting' before selection, then 'Next: Characters'.

### Medium — card information and campaign promise lack explanation at choice time

Ending cards have visible i buttons; other cards do not show comparable information. Campaign promise selector offers As written/Hopeful/Dark/Exciting/Thoughtful without an explanation of the consequence. Players can choose a label but cannot judge the tradeoff. Add one-line accessible help for promise and ingredient demands. Ending info buttons were visible but not opened in this run; screen-reader labels and touch target sizes were not audited.

### Medium — movie desk loses ending choices

After commissioning and during production, YOUR MOVIE CARDS lists six concept categories and omits Goal Lost/New Beginning. The ending returns in the release report. Keep the ending cards visible through development/production so the creative decision does not disappear.

### Medium — report is mathematically transparent but not instructive

Why these scores displays execution +66, coherence 0, affinity +2, promise 0, continuity 0, repetition 0, uncertainty +2, repeated for five groups. This is good auditability but weak player coaching. 'What worked. What held it back.' contained only its introductory sentence, no concrete observations for this film. Add two actual observations such as performance limitations or an ending/audience interaction; keep raw terms under a deeper details disclosure. All groups were 65–70, so disagreement was barely perceptible in this example; one movie cannot establish general balance.

### Medium — strong personality moments, weak first-film tradeoffs

Director rewrite and crew rest both gave clear consequences and believable presenters. With about $5m left, roughly $16k and two weeks each bought preserved quality; no release deadline had been set. Rest/rewrite were obvious choices. This is a good tutorial-safe experience but not yet tense. Later films should introduce opportunity costs or deadlines naturally; do not simply raise penalties on a beginner.

### Low — financial precision varies across adjacent screens

Plan showed $81,875 weekly production; movie desk rounded to $80,000 and $660,000 remaining versus $655,000 in plan. The rounding is not necessarily an accounting defect but can look inconsistent. Use consistent rounding and mark estimates. Distribution review usefully explains advance, fee, recovery and ticket share, though it is text-heavy.

## What worked well

- Visible next-action buttons successfully led through writing, casting, greenlight, calendar, marketing, distribution and premiere.
- Large cards and tap-again deselection are understandable; selected checkmarks reinforce the mint border.
- Budget/working/star casting shortlist and explicit fee ranges made a low-cost cast straightforward.
- Standard production costs showed script, talent, production and remaining commitments before commitment.
- Production pauses had clear time/cost/quality choices and character presence.
- Premiere reveal, forecast comparison, and red loss-to-date distinction gave the journey a payoff.
- No application exception or blocking UI failure observed through opening report.

## Screenshots

- test-results/usability-cards.png — initial 390×844 collection; repeated art, clipped tabs, footer.
- test-results/usability-ending.png — ending selection after choosing two outcomes.
- test-results/usability-report.png — opening report before numeric disclosure.

## Recommended next test

Repair movie identity consistency first. Then ask humans to create one movie without coaching and explain what two chosen cards will change. Measure completion, backtracking, help requests, and whether they voluntarily begin a second movie. This run demonstrates first-film completion; it does not measure retention or prove the game is fun.
