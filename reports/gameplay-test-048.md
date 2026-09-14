# MovieSim v0.48.0 — independent gameplay and engine assessment

## Result
No blocking engine failure reproduced. All 239 automated tests passed. Independently exercised 108 complete movie lifecycles: every 12 music styles × 9 composer options (8 composers plus library).

Each lifecycle created a two-character card movie, cast actors/director, rewrote the setting, greenlit production, resolved delays, released, generated all 10 awards, checked standings, and created a sequel. All produced finite performances, quality, audience/critic scores and gross. Commissioned music qualified for Original Score; library music did not. Unrevealed awards stayed out of standings; completing the ceremony counted exactly 10 winners. Music choices reset for sequels.

Evidence: `npm test` (239/239); independent matrix `/tmp/gameplay048.mjs` (108/108, 124 player award wins across the runs). Matrix uses identical seed 42 and ample cash to isolate combinations, so it establishes functional coverage rather than economic balance. Existing tests also cover fee inclusion, invalid-choice rejection, deleted-character audition remapping, damaged audition recovery, cast fame diminishing returns, terrible performances and frozen release fame.

## Confirmed functional bugs
None found in this scope. This is an engine assessment, not an iOS browser certification; the separate UI tester owns that check. It does not establish the reason for the user's particular blocked film.

## Gameplay findings

1. **Medium — unconventional music has a one-sided incentive.** `music.js: resolve` gives an unusual style/genre pairing +2 critics at quality 80+, with identical quality and audience effects to a familiar pairing. At equal composer/style execution the familiar genre never has an advantage. Example: Nico Reyes + Jazz, variation +12 gives quality 85 in both Drama and Sci-fi, but Sci-fi receives two additional critic points. Suggest giving familiar matches a small audience benefit, or tying discovery to story-card coherence rather than genre mismatch alone.

2. **Medium — commissioned music cannot fail under normal rolls.** Lowest composer skill is 65 and variation is only ±12; even an off-specialty result bottoms out at 53. Therefore every paid composer is neutral or positive versus library music, and some expensive specialists cannot produce a poor score. This is a balance choice, not a broken calculation. Cost supplies the main downside. Consider a small bad-session risk only if players need a meaningful artistic gamble; avoid adding another menu.

3. **Low — composer reputation is static.** Composers have preset labels and fees; award wins do not visibly develop their careers through this module, and composers have no booking conflicts. This makes repeat hiring predictable. A later improvement could be persistent reputation and changing fees after awards, while keeping the two-control workflow.

4. **Low — technical award scores heavily reward spending.** Production Design and Visual Effects each derive 70% of their score from budget-tier spending, with only 30% from craft. Distinct categories function, but the result is more spending-driven than the music and acting awards. Consider occasional execution variation or director/craft specialization before adding more award categories.

## Recommended next step
Prioritize any reproduced UI greenlight issue over new systems. For gameplay, address the unconditional unusual-pairing bonus first; retain the compact music UI and avoid expanding the choice count further until a player can understand why their result changed.
