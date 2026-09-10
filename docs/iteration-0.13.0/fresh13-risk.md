# Fresh13 risk playtest

Independent first-time UI-only playtest of http://127.0.0.1:4173, demo 0.10.0. Playwright/Edge, isolated contexts; no game source, engine, saved-state inspection/manipulation, or prior reports. No game edits.

## Actual strategy and outcome
- Borrowed $2M from First Picture Bank at 8% / 104 weeks, aiming at a premium space film while the initial market banner advertised space adventures.
- First browser attempt acquired Between Worlds for $410K, auditioned Oscar Silva (80–100) and star Lena Cole (50–60), hired Oscar/Remy West/Remy Laurent and greenlit a $6.704M plan. A tool timeout reset the nonpersistent browser during advance; this is a tooling failure, not a game bug. Screenshot fresh13-risk-plan.png belongs to that abandoned attempt.
- Restarted in a new durable isolated browser profile. Fresh randomized Between Worlds cost $60K. Hired lead Jude Moss $55K (70–90 audition), supporting June Bennett $390K (55–75), director Noor Brooks $140K (65–75). Star Felix Shaw auditioned only 35–50, so I rejected celebrity spending in favor of craft.
- Mixed locations, digital spectacle, premium sets $500K, premium crew $1.5M, flagship effects $1.9M, recommended 12-week shoot. Production including duration/approach adjustments $5,579,982; initial complete plan $6,224,982. Cash after filming commitments $1,775,018 before overhead/debt/release.
- Week 6: Jude backlash; paid $50K studio response, audience reaction improved. Week 9: identical Jude backlash again; let actor respond, audience reaction weakened.
- Wrapped week 13. $45K test screening scored 85. Waited for June week 24, selecting summer sci-fi demand and one nearby release. Bought $580K premiere/press. Chose Meridian partner distribution: $520K advance less $80K fee; 40% ticket share, $1.1M recoupment displayed.
- Week 24 opening $5M (forecast $4.9–8.2M), critics 90, fans 80. Performance reports: Jude 65, June 70, Noor 80. Movie had $5.581M still unrecovered at opening. Felix offered half-price next role.
- Week 33 theatrical finish: $21M gross. Signed PictureHouse royalties ($200K now, $1,680,606 displayed 52-week total). Movie total costs $6,979,982, receipts $8,160,723, profit to date $1,180,741. Cash $8,321,569 with debt $1,384,615 displayed. Repaid debt through UI; final cash $6,936,954, debt $0, prestige 3. Completed financed production, release, theatrical run, streaming sale, and bank repayment.

## Clarity and fun
Enjoyable 7/10. Audition surprises made casting feel like discovery; strong expensive craft plus summer timing felt rewarded. Partner recoupment example, forecast-vs-result breakdown, and explicit gross versus receipts were especially useful. Loan terms were understandable. The result gave a credible sequel hook and star discount.

Middle stretch was mostly repeated Next week presses, especially eleven empty weeks waiting for summer. A jump to next meaningful date would improve pacing. Production events had readable costs and possible consequences, but exact duplicate backlash three weeks apart felt mechanically repeated rather than a developing story. Outcome text lived in the studio wire rather than being prominently acknowledged in the project decision.

The opening report and retrospective gave broad reasons but left premium-vs-standard return uncertain. I could tell spending was above need, but could not judge whether doubling effects was worth the extra cost. Initial trend disappeared by week 3, long before any 12-week film could ship; season choice was a much more actionable market signal.

## Observed bugs / friction
- Confirmed minor financial precision issue: Finance displayed outstanding debt $1,384,615. Entering that exact number left $0.38 debt and $0.39 weekly payment. A second $0.38 repayment settled it. Provide Pay in full or precise remaining amount. Evidence fresh13-risk-repaid.png and fresh13-risk-repaid-final.png.
- Repeated identical Jude social-post event at weeks 6 and 9, even after successful studio response. Could be intended randomness, but felt repetitive and disconnected rather than two distinct incidents.
- No crash, softlock, or inability to complete the movie observed. Browser locator timeouts from changing Next week to Next decision and modal overlays were automation issues, not gameplay defects.

## Top three priorities
1. Make spending decisions more comparable: preserve budget tradeoffs in post-release learning, and give a qualitative expected gain for premium/flagship spending and digital approach before commitment. No need for guaranteed exact outcomes.
2. Improve waiting and incident pacing: advance to next decision/release with safe interruption, and avoid near-identical incidents on the same actor within one shoot or acknowledge the recurrence narratively.
3. Add Pay in full and consistent debt precision, so copying the displayed outstanding balance actually settles the loan.

## Screenshots
- fresh13-risk-plan.png: initial attempt premium plan (abandoned due tool reset).
- fresh13-risk-opening.png: completed-run opening results.
- fresh13-risk-finances.png: completed-run receipts/costs/debt before repayment.
- fresh13-risk-repaid.png: residual $0.38 debt after paying displayed balance.
- fresh13-risk-repaid-final.png: fully repaid debt.

## Follow-up correction: market banner provenance
On rechecking my recorded UI observations, I cannot verify that the space trend changed within the completed run. Space adventures was explicitly observed in the abandoned first browser run at week 1. In the completed second run, the captured main Slate body at week 3 explicitly showed "Moviegoers are craving low-budget horror"; my week-1 second-run outputs were truncated to casting/production details and do not verify its initial banner. Therefore the statement above that the initial trend disappeared by week 3 is not established and should not be treated as a same-run finding. No source or save data was consulted. Reopened the still-live completed session at week 33 and verified the main Slate banner remains "Moviegoers are craving low-budget horror". This is separate from the release calendar's "Summer · Action & sci-fi" labels and the Studio Wire's summer resurgence messages, both also observed. The general strategic inference about a trend disappearing before filming finishes is withdrawn for this run.
