# MovieSim 0.13.0

## Shipped changes
- Hidden-duration audience trends reward matching genres and scopes; audience interest can fade. No expiration countdown is shown.
- Actors impressed by a strong release can offer a one-use half-rate opportunity for a new role. Offers use the normal casting and negotiation flow.
- Interior, exterior and exotic location plans plus practical, digital and implied effects change production costs and execution fit. Exact optimization remains part of learning the game.
- New-film delivery economics allow risky early wins while maintaining downside. Fresh actors have greater performance uncertainty than experienced talent.
- Social-media backlash asks for a response; the same backlash cannot repeat within one film. Fan theories or fan-created clips can lift later ticket sales.
- Icon-led release signals explain important outcomes. Streaming offers show cash now and the full 52-week contract total, with a separate amount when the demo ends earlier. Payout formulas are unchanged.
- Awards distinguish picture, directing and acting achievement. Hard roles do not automatically earn acting awards; actual performance matters. Campaigns help visibility more than final selection.
- Tester fixes: exact opening gross and acquisition prices, a screenplay action from an empty talent-offer screen, clearer fresh-face wording, and exact full loan repayment including remaining cents.

Existing studios are preserved. Next Week remains the time control. Studio-history storytelling remains deferred.

## Awards research
See ../../AWARDS-RESEARCH.md for official Academy sources and modeling recommendations. Branch-specific nomination voting and broader final voting support distinct category criteria, but the implemented simulation is not an Academy voting replica. No genre, spending level or role difficulty guarantees an award.

## Independent agent playtests
Three new agents received no previous reviews or game history and used the UI without source or save-state inspection. These are AI playtests, not human usability research. Their original reports and screenshots are included, including a correction withdrawing an unverified trend-disappearance claim.

- Mobile: completed Lights Off, its theatrical run and a streaming agreement. Found rounding and empty-state issues, now fixed.
- General: completed a film, signed streaming and reached the awards ceremony with three nominations and a supporting-acting win.
- Risk: borrowed $2 million, made Between Worlds with substantial production spending, earned roughly $21 million in ticket sales, signed streaming and repaid the loan. Found repetitive backlash and a fractional loan remainder, now fixed.

Remaining design questions include waiting between milestones and how much qualitative production guidance to provide without exposing the optimal spending formula. Next Week is intentionally retained at the user's request.

## Automated verification
98 simulation tests pass. Focused mobile checks cover opportunities, casting, resource selection, persistence and full repayment. Build-preservation and critics/streaming browser checks pass.

The partner-distribution matrix compares published 0.12.0 (28210cd) with this build across 38,880 controlled film runs. A separate comparison covers 1,200 five-year automated studio runs. Raw summaries are included.

For validation scenarios with minimum-budget, four-week big films and maximum marketing, the new model's average full-contract film profit was about -$766,000; roughly 21% earned a theatrical profit. This permits occasional risky successes without making that shortcut reliably profitable in the tested sample. Film-level profit excludes studio overhead and interest. Bots do not adapt their resource plans or negotiate like human players. These tests bound several strategies; they do not establish perfect balance or an exhaustive optimum.
