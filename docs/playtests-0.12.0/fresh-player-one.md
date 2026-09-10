# Fresh player one — MovieSim UI playtest

Played on 2026-09-10 using isolated Edge browser contexts at 1440×1000, through visible UI and DOM controls only. No source, saves, prior reviews, or engine data read. Meaningful stopping point: completed one theatrical run, signed streaming, inspected finances/awards/studio, and reviewed sequel return terms (week 20). No game code edits.

## Session and decisions

An initial independent fresh run acquired Lights Off for $140,000 (70–100 quality), cast bargain newcomers Oscar Bennett (75–95 audition, $40,000 offer) and Tessa Kim (85–95), hired Luca Ali (80–95 direction), used the standard eight-week plan and $65,000 social campaign, and chose partner distribution. A browser-tool timeout lost that nonpersistent session during release setup. This was tooling trouble, not a game defect. I restarted in a persistent fresh profile; randomized scripts and people were different.

Completed run: chose Borrowed Time, a low-budget mockumentary ($100,000 screenplay; 65–100 quality), for its promising writing, manageable scope and lower role difficulty. Cast Lena Hart after an 80–100 audition and Nina Okafor after an 85–100 audition. Both were the first cheap newcomer offered. Hired Noor Rivera, whose 80–85 direction estimate was stronger than the cheapest director and cheaper than the star. Accepted default offers, standard department budgets and eight-week schedule. At week 5, funded a $100,000 performance/rehearsal request to protect quality. Wrapped at week 9. Picked week 12 rather than the default week 10 because the calendar showed less competition. Bought $65,000 social marketing and signed Meridian partner distribution for 40% ticket share with recovery before later receipts.

Week 12 opening: $1.3m gross, $290k studio receipts, $1.5m unrecovered costs. Forecast was $1.0–1.7m. Critics 80, fans 75 in opening report. Lena performed 85, Nina 95, Noor 90; fame rose 3, 5 and 4. Read all reviews and career results. Advanced weekly through the full theatrical run: gross reached $4.5m at week 20. Compared PictureHouse ($40k now, $9k first week declining) and BingeBox ($260k guaranteed); took BingeBox to recover remaining costs. Movie profit displayed $45k, studio cash approximately $6m, prestige 2. Inspected accounts, awards eligibility and department investments. Reviewed sequel: $140k development, original talent $970k paid at greenlight. Stopped before commissioning.

## First-time experience

The opening screen and task buttons gave me an obvious path without opening the guide. Casting shortlists are manageable. Discovering a cheap excellent performer feels satisfying. Department needs, separate marketing costs, distributor recovery examples, opening expectations and career changes are useful explanations. Visual design is restrained and readable; the lot gives the studio a physical identity.

The first bargain actor was excellent in all four auditions across both starts. This encouraged me to repeat the cheap-first pattern rather than explore the expensive cast. It felt rewarding, but risks becoming a solved routine. Most filming and theatrical weeks were simply Next week; the rehearsal event gave me one actual production decision, with obvious spend-to-protect-quality framing. Opening night was the best moment: estimates resolved, actors improved, and reviews acknowledged their work. Streaming saved a modest film from loss, a good economic lesson. Sequel fees rising made the returning cast feel persistent, and gave me a reason to consider another film. I would try one more release with more marketing to test the report's advice, but do not yet feel compelled to run all five years.

## Confusion and observed defects

- **Inconsistent numeric presentation:** acquisition card difficulty 65 versus modal 67 in the first run; awards lists Borrowed Time critics 78 / fans 76 while opening/project report says 80 / 75. Likely different rounding, but looks like changing data. Financial accounts show $1.8m spent and $1.8m received with $45k profit. Cash starts and ends at $6m despite overhead. Precise-looking comma formatting conceals coarse rounding; I cannot reconcile accounts from these displays. Not proof of an engine math bug.
- **Wrong post-release empty state:** Active tab at week 20 says 'Your opening credits are unwritten' after a $4.5m theatrical release. Header says 0 pictures in motion / 1 released. Streaming filter restores the film, but the initial message erases my achievement.
- **Persistent stale status:** 'Terms agreed. Payment is due at greenlight.' remained in DOM text on opening night, streaming, finances and awards long after greenlight. It may be a status/live-region issue; not confirmed as a continuously visible toast.
- I did not find a test-screening action along the guided wrap → calendar → marketing → distribution path, although the wrap announcement promises one and the final report says 'Not held.' Could be discoverability rather than missing functionality.
- Exact numbers and uncertain estimates sit together without consistently identifying precision. Forecast result labels like 85 within 80–100 being 'Low end' initially felt harsher than the excellent performance deserved.
- Script plots share generic supporting-role language. My mockumentary's supporting character is 'The ally whose own ambition complicates the mission'; that does little to help imagine the film.
- No confirmed blocking game crash or softlock encountered. Automation timeouts were selectors or modal interception, not user-facing defects.

## Three prioritized improvements

1. **Make financial and score displays consistent and reconcilable.** Use exact values on accounts/detail screens, or explicit abbreviated approximation on summaries; show the same critics/fans precision everywhere. The player needs to trust results before learning strategy.
2. **Strengthen the quiet middle and the next-film motivation.** Offer advance-to-next-event during uneventful weeks, and more specific tradeoffs linked to this film/talent. Keep career outcomes, but make repeated cheap-first auditions less routinely dominant; show why a working actor/star could materially change this movie.
3. **Finish the post-release guidance.** Replace first-film empty copy with a completed-film summary and clear streaming/next-project links. Surface optional screening on the guided path. Turn 'limited marketing held back awareness' into a concrete comparison the player can use for their next budget.

## Evidence

- fresh-player-one-opening.png — opening results and forecast
- fresh-player-one-streaming.png — completed run, streaming contract and report
- fresh-player-one-finances.png — equal rounded costs/receipts alongside profit
- fresh-player-one-awards.png — different critics/fans scores
- fresh-player-one-empty-active.png — opening-credits copy after release
- fresh-player-one-sequel.png — rising returning talent costs and sequel choices
