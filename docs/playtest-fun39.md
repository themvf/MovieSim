# Two-movie fun and replay assessment — 0.39 working build

September 13, 2026. Independent agent assessment; this does not measure human enjoyment or retention.

## Method

Played a fresh normal $6m studio through the visible UI at 1280×900 using local server and Chromium. No injected money, state, engine actions, scores, talent, or time. Selector inspection assisted automation. Used standard offers, Next role, Advance to next decision, existing client briefs, screenings, distribution and opening reports. Completed two original Sci-fi movies to their openings. The first film naturally completed its theatrical run while making the second; accepted its streaming deal, but did not wait out streaming or the second theatrical run. Final report also spot-checked at390×844; not an iOS device test. Selector timeouts from attempted actions behind a dialog/disabled controls were recovered and are not counted as game crashes.

## Choices and outcomes

| | Homeward Orbit | The Empty Signal |
|---|---|---|
| Created/opened | Weeks1/17 | Weeks17/33 |
| Cards | Earth; Civilians; Alien Life; Return Home; Isolation; Adventurous | Space Station; Scientists; Artificial Intelligence; Survive; Isolation; Dark |
| Ending | Reunion + Goal Achieved | Threat Escapes + Unfinished Business |
| Guidance | Needs performances; appeal to closure seekers | Needs direction; thrill/world/surprise appeal; less closure |
| Client | Starlight: Earth+Adventurous,32weeks,$450k,no score target | Midnight: Isolation+Dark,36weeks,$550k,fans≥65 |
| Cast | Rafael Stone $40k; Ayla Reed $240k | Same actors, $70k/$290k |
| Director | Sasha Das $100k; audition50–60 | Wren Laurent $100k; audition50–60 |
| Production | Standard8weeks,$650k | Standard8weeks,$650k |
| Setbacks | Effects pass +2weeks; crew rest +2weeks | Weather wait +2weeks; crew rest +2weeks |
| Edit choice | Balanced | Crowd-pleasing, to pursue client fan target |
| Marketing/distribution | $65k social; Meridian | $65k social; Meridian |
| Screening displayed | 70; distribution audience band63–81 | 60; distribution audience band49–67 |
| Final fans / critics | 65 / 64 | 60 / 59 |
| Opening gross | $1,151,351 | $997,700 |
| Opening receipts / spending | $690,540 / $1,352,500 | $180,000 / $1,432,500 |
| Client outcome | $450k payment explicitly displayed | Fan score below65; no commission payment in opening receipts |

Screening labels use the game's displayed rounding. No claim that these are raw internal scores.

### Predictions recorded before release

Homeward Orbit: expected closure seekers strongest, with relationship-oriented response stronger than dark/open-ended interests. Result: character fans70, closure67, thrill65, surprise62, world61. Strong performances90 versus weak writing46 explained why character fans outranked closure seekers. Guidance supported an expectation without guaranteeing the audience ranking.

The Empty Signal: expected lower closure response than the first film, and thrill/world/surprise stronger than closure; direction quality remained an acknowledged risk. Result: world61, thrill61, surprise61, character59, closure55. Group direction matched the prediction. Comparison showed fans−5/critics−5 and explicitly warned that casts and production choices also matter. These two runs do not isolate the causal effect of cards: scripts, director, performances, edit and release window differed.

## What improved the experience

1. **A reason to try a different movie.** Building the second film directly from the report worked as an invitation. Its dark/open ending produced a different audience ordering, with a named-card explanation. This was more instructive than the previous empty report.
2. **Casting moved faster without losing discoveries.** Audition→standard offer→Next role removed repeated negotiation screens. First-film Rafael's90–95 audition at$40k was still a satisfying discovery. Returning actors cost more and auditioned differently; their pairing improved from−2 to−1, giving the studio a small history.
3. **Advance skipped quiet stretches safely.** Writing advanced three weeks in one action; a later production stretch advanced four. Required delays, editing, release and announcements stopped progression. It also stopped for new scripts/pitches/available commissions, so it did not eliminate all calendar friction.
4. **A client target changed a decision.** Chose crowd-pleasing edit for the second film because Midnight required fans65, accepting less critical appeal. It still achieved only60. This is a meaningful goal with a possible failure, rather than a guaranteed bonus for selecting required cards.
5. **Money developed across films.** The first film turned profitable while the second was in production. It finished theaters at$3,301,556; after signing PictureHouse, displayed receipts were$1,580,622 against$1,352,500 spending. Seeing that recovery alongside the next production made the slate more alive.

## Remaining design questions

- **Deadlines remain generous for these small films.** The first effects pause retained18weeks slack and crew rest16; the second weather pause retained22 and crew rest20. Waiting was still easy with ample cash. The display is useful, but these runs do not demonstrate deadline tension. Keep the introductory brief forgiving; later experiment with optional tighter briefs or overlapping commitments, rather than simply raising delay penalties.
- **The strong-director choice could matter more visibly.** Second-film guidance said direction mattered, but I accepted an affordable50–60 director rather than a star asking around$2m. That preserved cash while putting the brief at risk. A concise director-demand reminder inside casting could connect that choice without another tutorial paragraph.
- **Optional opportunity stops need a direct route.** Advance disabled at 'A filmmaker pitch expires soon.' I found Studio life→Passion projects→Pass to clear it. Ordinary Next week was still available. A clickable stop reason would improve navigation; new pitches and new scripts may be better optional stop preferences later.
- **Repeated interruption wording is noticeable.** Both films received the same two-endings editing event and crew-exhaustion event. The second occurrence was familiar rather than surprising. Test frequency/context before adding many more written events.
- **The report still says 'Your ending landed' regardless of quality**, followed mainly by the selected ending description. Consider a neutral label such as 'Your ending' unless the game is actually asserting successful execution.

## Issues reported during this run

- New-film CTA from the opening report initially left the old opening announcement pending. After commissioning film two, Advance required reopening film one's report and explicitly choosing Back to the lot. Root reported a targeted fix to clear that exact opening notice when beginning another film. This run discovered the issue; it did not rerun the corrected transition.
- Root changed 'Appeals to' to 'Ending appeal:' following the first prediction/result discussion. This makes the source of the guidance clearer without promising a ranking. This active page still used the earlier loaded wording.
- Second report grammar: 'Production craft were the strongest delivered element.' Reported to root as a small copy correction.

## Recommendation

Proceed to a human two-film test before expanding the card collection. Ask for a prediction, observe whether the report makes sense, then see whether the player chooses a third film without encouragement. This agent run establishes that the improved loop supports two contrasting projects, quicker routine steps, and an intelligible audience difference. It does not establish retention, balance across genres, or long-run franchise depth.

## Evidence

Screenshots: test-results/fun39-first-cards.png, fun39-deadline.png, fun39-first-report.png, fun39-second-cards.png, fun39-second-report.png, fun39-second-mobile.png. Interactive driver: /tmp/fun-play.cjs; UI journey commands were executed through its persistent browser session.
