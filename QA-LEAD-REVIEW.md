# MovieSim QA lead assessment

Reviewed September 8, 2026. Tested commit: `72f9f6cf8b2a03fdc8a02ddfe236a8faad220308` (demo 0.5.1).

## Verdict

The two testers produced useful, reproducible boundary coverage. I independently reran all 43 simulation tests and the Edge browser alpha suite; both passed. The four reported reproductions have fixes and regression evidence. However, the damaged-save protection is incomplete, and a focused repayment check uncovered a small accounting defect. Treat this as a bounded alpha pass, not clean release sign-off. Fix the import issue before expanding the alpha audience; address repayment precision in the same follow-up.

This assessment changed no production code and used fresh game states and isolated browser contexts, never a user's save. Browser verification ran against the local checkout; I did not independently verify GitHub Pages deployment or native iOS.

## Assessment of the reported fixes

| Reported fix | Assessment |
|---|---|
| Monetary errors show full dollar bounds | Supported. Browser tests exercise malformed, negative and excessive loans, salaries and repayments. Code distinguishes duration/release weeks from monetary amounts. |
| Damaged imports preserve the current studio | Supported for missing `debt` and `rivals`, the original reproductions. The broader claim is not supported: a missing movie accounting field still overwrites the save, as reproduced below. |
| Repayment below $1,000 works | Supported for the tested one-cent partial payment, cents-rounded full payoff and $750 browser case. Remaining balances up to $10 can still disappear after a partial payment. |
| Final-week release picker no longer offers an impossible date | Supported. At week 259 the browser displays the explanatory state and no confirmation form. Engine coverage also reaches a week-259 release and finishes awards without adding operating weeks. |

## Confirmed outstanding defects

### 1. Damaged movie accounting can overwrite a valid save

**Priority: P1 for the next alpha update; severity: medium.** This requires a damaged imported file, but the consequence is losing the current saved studio and accepting invalid financial data.

Relevant code: `engine.js:286` movie validation and `app.js:1236` import assignment/render/persistence.

Reproduction in an isolated Edge context:

1. Keep a valid studio saved in the browser.
2. Create a separate valid save with one purchased movie, then delete that movie's `spent` field from the JSON.
3. Import the modified file through Guide & save.

Observed: **"Studio save restored."**, previous localStorage replaced, and **`$NaN`** visible on the movie card. Migration validates arrays and references but does not validate this numeric accounting field. Rendering `NaN` does not throw, so rendering before persistence cannot reject this case.

Next step: validate required accounting numbers and stage-dependent financial fields before accepting the candidate state. Add the exact missing-`spent` browser regression, asserting the prior saved state remains unchanged and playable. Expand directly related numeric cases rather than relying on render exceptions.

### 2. Partial repayment silently cancels the last $10 or less

**Priority: P2; severity: low.** The amount is small relative to game budgets, but this violates the stated principal repayment and financial reconciliation behavior.

Relevant code: `engine.js:1099`; the same cutoff appears in weekly processing at `engine.js:1473`.

Reproduction: start a new game, borrow $1,000, then repay $991. Cash decreases by $991, but outstanding debt becomes $0 instead of $9. The filter retains loans only when their balance exceeds `0.01` internal units, which is $10. The cents-aware amount validation does not fix that existing cutoff.

Next step: retain positive cent-scale balances, using a suitable floating-point tolerance for actual payoff. Add a reconciliation test for this exact partial repayment and the weekly cutoff. The current alpha assertion after paying $7,999,999 of an $8,000,000 loan permits zero remaining debt, so it misses this defect.

## Evidence strength and remaining limits

- The 36 genre/scope/budget combinations meaningfully cover finite values, completion and serialization, but use the same seed and very large cash. They do not establish economic balance or normal-budget survival rates; the report correctly disclaims an exhaustive balance study.
- The browser suite checks 320px layout, money entry, queued announcements, hidden award winners, import rejection and the final release boundary. These are useful automated checks, not an independent human usability study or an iPhone Safari test.
- The import regression covers a missing top-level collection. It does not establish validity of every movie's financial state, which explains confirmed defect 1.
- The full engine suite supplies lifecycle, distribution reconciliation, awards, forecast, casting and migration coverage beyond the alpha cases. Passing tests support those exercised behaviors; the test count alone does not establish release readiness.

## Recommended disposition

1. Repair and regression-test damaged financial imports before describing import preservation as complete.
2. Correct the repayment cutoff and test exact outstanding-principal reconciliation.
3. Rerun the 43 existing simulation tests, both new regressions and browser alpha checks. Verify the deployed build after publishing any fixes.
4. Retain the existing bounded-alpha wording. Schedule actual iPhone Safari testing before making iOS readiness claims.

## Follow-up implementation

The root agent addressed both confirmed defects in demo 0.5.2 after this assessment. Added numeric and stage-dependent movie finance validation, missing-accounting-field browser regressions, and exact small-balance repayment/weekly reconciliation tests. The original assessment above records the 0.5.1 findings; it is not a new independent sign-off on 0.5.2.
