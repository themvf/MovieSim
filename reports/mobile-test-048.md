# Mobile tester — MovieSim 0.48.0

Assessment: no reproducible greenlight defect in the tested current build. Valid production starts, while booking and missing-cast blockers produce visible messages. The user's exact failure remains unconfirmed without their displayed message or game state.

## Executed checks

| Scenario | Result |
|---|---|
| 390×844 touch: booked actor, Electronic + library music | Blocked with actor's name; film remains in packaging; feedback visible and unobscured |
| Same setup after removing booking conflict | Greenlight succeeds |
| Card setting rewritten after casting; Jazz + Nico Reyes | Greenlight succeeds; composer/style persist |
| Full card creation: story slots, character naming, trait, added Ally, checkout | Pass |
| Standings: four studios, own-studio highlight, awards sorting, large box-office totals | Pass at mobile and desktop widths |
| 320×568: production form validity | Valid; no invalid controls |
| 320×568: scroll to filming-duration slider | Reachable; no horizontal overflow |
| 320×568: Percussion + Sofia Marin; close and reopen production | Both selections retained; greenlight succeeds |
| 320×568: missing cast | Correct visible “Cast every role and hire a director first” error |

No JavaScript page errors in the successful exercised flows. Existing browser suites run: browser-greenlight48.cjs, browser-music47.cjs, browser-board43.cjs. Supplemental browser checks used temporary scripts; production code unchanged.

## Ease of use and fun

Music is easy to understand: one style selector, one composer selector, concise descriptions, visible fee and specialty match. The flat card board is usable without stacked dialogs. The tested UI proves that choices can be made and retained; it does not establish long-run game balance or replayability.

Small-screen friction: at 320×568, the production form gets only 249 pixels of visible height, while its fixed footer consumes 182 pixels. The error increases footer height further. All controls remain reachable, but substantial scrolling is necessary. Recommend shortening the footer to total + cash remaining, with financing details expandable, and a one-tap route from a named booking error back to casting.

## Evidence and limits

Screenshots: test-results/greenlight48-blocked.png, test-results/music47-production.png, test-results/mobile048-small.png, test-results/mobile048-missing-cast.png, and board43 screenshots. Small-screen screenshots visually inspected.

Browser: headless Chromium with touch/mobile emulation; native iOS Safari was not tested. WebKit executable is not installed. Tests use deterministic saved fixtures for casting/production setup, then actual UI interaction. The missing-cast fixture was deliberately altered to exercise the validation error. No full natural career playthrough and no live deployment/cache verification by this tester.
