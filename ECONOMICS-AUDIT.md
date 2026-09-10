# MovieSim economics audit — September 10, 2026

## Production spending and box office
Money is stored internally in thousands and displayed in dollars.
Production cost = (sets + crew + effects − facility savings) × (weeks / 8)^0.6. Talent, script, marketing, distribution, overhead and interest are separate.

A big-budget film normally recommends 12 weeks; difficulty 75 or higher recommends 14. Every missing week subtracts 2 quality points, capped at a 16-point penalty. Extra weeks add 0.75 points, capped at 3. Cutting 12 weeks to 4 reduces production cost by 48.3% at identical allocations and applies −16 quality. It also raises the incident roll from approximately 16% to 60% per eligible week; event limits and fewer filming weeks mean these are not whole-film probabilities.

Final quality combines script (25%), actor performance (30%), director performance (20%), craft (25%), schedule, department and incident adjustments. Craft compares genre-specific spending with needs; overspending has diminishing returns. Quality feeds fan and critic scores, with random variation.

Opening ticket sales multiply scope market size by talent draw, advertising reach, season, competition, audience response, release support, sequel interest and randomness. Spending is therefore not a fixed return multiplier. Holding everything else constant, fans falling from 70 to 54 reduces the opening audience multiplier by approximately 10.7%. Weekly retention falls from 0.70 to 0.62 before campaign adjustments. A big-budget project retains its larger potential market even with a short shoot. The substantial cost saving and capped penalty deserve further balance testing; passing accounting tests does not establish an optimal strategy balance.

## Advertising versus Hollywood
The four demo campaigns cost $65,000, $180,000, $290,000 and $650,000: $1,185,000 combined, currently the same across film scopes. Distribution spending and partner support are separate. These are deliberately much smaller economics than major Hollywood releases, not realistic blockbuster advertising budgets.

Reported industry estimates: Five Nights at Freddy’s had $20 million production and $60 million prints-and-advertising; The Super Mario Bros. Movie had $100 million production and $150 million P&A. These are estimates and P&A definitions differ from the demo’s campaign list. Source: [Robert Marich, summarizing Deadline’s profitability reporting](https://marketingmovies.net/2024/marketing-exceeds-film-costs/).

No advertising prices were changed in this iteration. A realistic scale change needs corresponding starting capital, production and revenue rebalancing.

## Streaming contracts
Base weekly value = max($2,000, theatrical gross × 0.0017) × (0.7 + fans / 200).
BingeBox pays 32 × base upfront, rounded, with no royalties for 52 weeks.
PictureHouse pays 5 × base upfront, rounded, plus 1.1 × base × (1 + elapsed royalty weeks / 52)^−1.2 each week for 52 weeks.

Example: $10,000,000 gross, fans 80. BingeBox pays $600,000. PictureHouse pays $95,000 upfront, approximately $20,570 in its first royalty week, and approximately $793,161 total across the contract. Crossover occurs in week 33. Near the five-year demo ending, only weeks actually advanced pay royalties, making upfront cash more attractive.

Test sweep: five gross levels ($0, $1m, $10m, $50m, $200m), three fan scores (5, 60, 99), two contracts: 30 full-year scenarios. Every weekly receipt and cumulative streaming receipt reconciled with an independently summed schedule; expiry restores library income. Separate tests cover duplicate signing, invalid offers, save persistence, cash rescue, deferred decisions and ten-week endgame horizons.

Limitations: royalties contain no demand uncertainty; unsigned offer amounts do not decay with age; talent ticket-receipt participation does not apply to streaming; there is a minimum value even for zero-gross films. Neither accounting correctness nor these simplified deals reproduces actual negotiated streaming contracts.

## Awards campaign
A campaign costs $150,000 once. It adds 3 scoring points in nomination selection and 5 scoring points in winner selection, each against competing films with random variation of −8 to +8. These are points, not percentage chances. Winner selection starts again from its base score: the bonuses do not sum to 8. Funding after nominations cannot change nominations already announced.
Picture/director base is critic score. Acting base is 80% performance + 20% role difficulty. Campaigning improves an eligible contender’s position but does not guarantee a nomination or win.

## Implemented presentation and casting changes
- Original supplied photos appear on four scripts and a mobile preview under Scripts. Existing studios receive the scripts once; existing films are preserved.
- Expected ranges classify outcomes as Below, Low end, Mid-range, High end or Exceeded. Exact spending remains an exact target. Audience and critics now receive forecasts based on known script/talent information, with narrower estimates from Research upgrades. Old films without stored forecasts say Not recorded.
- Passion-project offers: actors with fame at least 75, a major credit, genre fit at least 65, on scripts with difficulty at least 80 and quality at least 75 receive a fee quote 40% below their ordinary quote before rounding. This replaces rather than stacks with the existing challenging-role discount. Contract options remain binding, and revenue-share terms remain separate. Directors are not included in this new actor-role offer.
