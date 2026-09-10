# Fresh mobile player two

Independent first-time UI playtest at http://127.0.0.1:4173, 390 × 844 touch/mobile viewport in isolated Edge contexts. No source, prior tests, design documents, or other reviews read. All game actions used visible controls. Stopped at a meaningful endpoint: a released film completed its theatrical run and signed a streaming license. No game code changed.

## Actual journey

First studio: chose Beyond the Pines because its low-budget scope, 70–100 estimated script quality, 35/100 role difficulty, and two roles looked like a sensible first investment. Acquisition cost $130,000. Auditioned and hired Lena Price as lead (55–75 expected performance, $50,000 offered), Jude Hart supporting (75–85), and Alma Lane directing (75–90). I deliberately spent more on direction while using affordable newcomers. Used the default standard departments and recommended eight-week shoot. At week 3, gave the final rehearsal to the lead because her audition was weaker. Chose week 12 because it showed one nearby release rather than two; bought the $65,000 social campaign and signed Meridian's 40% partnership after reading the recovery example. Opening: $1.2m, critics 75, fans 95. Read the reviews, which made the cast choices feel rewarded.

A browser automation execution timeout lost the first session handle during further navigation. This was a tooling interruption, not evidence of a game bug. I started a fresh isolated studio and followed the same broad low-cost strategy; its randomized people/script details differed. The second film starred Remy Shaw and Elias Ali with Lena Laurent directing, used the recommended ten-week shoot, lead rehearsal, social campaign, week 12 release and Meridian partnership. Opening $1.8m, critics 75, fans 85. Explored the cast tab: fame changed +1, -1 and +3 respectively. Inspected sequel terms but did not commission one. Continued to week 21: theatrical gross $7.2m. Compared streaming offers ($430k guaranteed versus $70k plus declining royalties starting at $15k/week), selected BingeBox's guaranteed license. Final report showed roughly $3.1m studio receipts, $1.4m movie costs and $1.7m profit. This made a satisfying stopping point.

## What worked / fun and replayability

The path from empty slate to opening was discoverable, including the changing primary action for a required decision. Free auditions were understandable and made newcomers appealing. Department targets and the recommended schedule gave me a starting point without needing a guide. The rehearsal event felt like a real choice linked to my earlier casting. Distribution explained the difference between gross and my receipts unusually well, and the dollar example helped me choose. Opening expectations versus results, critic voices, and actor fame changes created an appealing payoff. A sequel with returning people is a credible replay hook. I would play another film to try a larger scope or improve the weak supporting performance.

The many quiet Next week clicks between rehearsal, release and the end of the theatrical run were less engaging. Once I had one film earning, I mostly advanced time to see the next economic stage. I did not discover how to run the test screening mentioned at wrap; the automatic release path went straight through date, marketing and distribution. The final report confirmed Test screening: Not held.

## Confusion and observed issues

- Money appears strongly rounded, yet uses exact dollar formatting. $6m became $5.9m after a $130k purchase. A plan showed departments $330k + $290k + $35k, production $660k, $80k/week × 8, and planned total $1.1m. These numbers cannot be reconciled as displayed. I cannot determine whether any underlying calculation is wrong from UI alone; the clear issue is precision/transparency.
- After the theatrical run ended, the Active slate said "Your opening credits are unwritten" despite my completed hit and the wire announcing streaming offers. That is misleading empty-state copy for an experienced studio.
- "Terms agreed. Payment is due at greenlight." remained in extracted visible-page text all the way into streaming. This looks like stale toast/status copy, though I did not confirm its actual on-screen visibility throughout; do not treat this as a high-confidence visual bug.
- Marketing selection updates an opening forecast usefully, but I could not evaluate the lifetime value of declining streaming royalties. "More time earning can make this the better deal" lacks a total-range comparison against the guarantee.
- The next-stage streaming flow and sequel return terms were clear once opened. Main document width matched 390px (no horizontal page overflow). The mobile opening modal looked clean with a prominent persistent exit action, although much of the report requires scrolling within the modal.

## Three prioritized improvements

1. **Make the money reconcilable.** Show exact figures in purchase/plan/deal/report views, or mark rounded figures with approximation and offer exact detail. A finance strategy game depends on trust in the totals; this was my biggest recurring doubt.
2. **Improve the post-release next step.** Replace the first-film empty copy when a studio has released titles, and make the finished movie/streaming decision visible in the slate. Consider a safe advance-to-next-event option for uneventful weeks so the reward loop does not become repeated taps.
3. **Put optional research and contract value where the choice happens.** Offer the test screening clearly at wrap before committing the campaign/deal. Give a 52-week expected royalty range or break-even explanation for streaming, rather than only first-week income.

## Evidence

- fresh-player-two-plan.png — first studio production plan.
- fresh-player-two-release.png — first studio opening results on mobile.
- fresh-player-two-sequel.png — second studio return-cast offer.
- fresh-player-two-streaming.png — second studio royalty comparison.
- fresh-player-two-finish.png — second studio final streaming slate.

Limitations: one complete first release plus a second complete release-to-streaming journey; no five-year campaign, awards cycle, multi-film overlap, bankruptcy, or reload/save validation. Tool interruptions were kept separate from game findings.
