# MovieSim alpha boundary test report

Two independent agents tested version 0.5 and rechecked the resulting fixes in 0.5.1. They used isolated game states and browser contexts; user saves were not used.

## Confirmed findings, now fixed

| Finding | Severity | Resolution |
|---|---|---|
| Invalid monetary input reports internal thousands instead of dollars | Medium | Monetary validation prints dollar bounds; week and duration errors retain numeric units. |
| A damaged save missing debt or rivals can overwrite the current studio before rendering fails | Medium | Essential save collections and records validate before migration. Import renders before persisting and restores the previous state on failure. |
| Debt under $1,000 cannot be repaid and defaults to $0 | Medium | Repayments accept cents, display the actual remaining amount, and settle a cents-rounded full payoff against the exact outstanding balance. |
| Week 259 offers an impossible release in an empty calendar | Medium | The release dialog explains no future weeks remain and omits confirmation. |

## Economy tester coverage

Seven independent tests: invalid transactions leave state unchanged; $1,000/full-credit loans; independently calculated 104-week amortization; 36 combinations of genre, scale and min/max budgets with repeated reloads; shared/disjoint cast concurrency; last legal production through final awards; broken migration rejection; partial and complete sub-$1,000 payoff. All pass.

## Experience tester coverage

Edge at 320px: full-dollar loans and repayments; malformed, negative and excessive monetary input; maximum-length unbroken names and large balances; queued notices with Escape and X; talent nominations and hidden ceremony winners; the final release boundary; damaged import preservation; and $750 repayment. Consolidated browser test passes after fixes.

## Verification and limits

All 43 simulation tests pass, including seven new alpha scenarios. Existing browser lifecycle, usability, finance and endgame checks complement the independent browser alpha test. This is a bounded automated alpha pass, not an exhaustive balance study or native iOS test.
