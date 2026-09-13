# Mobile usability follow-up — Cinema Collection 0.39.0

## Method

September 13, 2026. Expert agent inspection in portrait Chromium at390×844, local repository on127.0.0.1:4173. Fresh ordinary $6 million studio; two consecutive Comedy movies completed entirely through visible UI. No engine calls, cash/time injection, save editing, or state-based bypasses. Selectors assisted automation, so this is not an unassisted human study or iOS Safari test. The final successful journey had zero page errors. Preliminary automation runs were restarted after correcting distribution-review and streaming-defer handling; those script limitations are not counted as game failures.

## Completed movies

| | Home Before Sunday | The Promotion Nobody Won |
|---|---|---|
| Cards | Vacation; Family; Bad Luck; Get Home; Miscommunication; Warm | Workplace; Rivals; Competition; Win; Deadline; Satirical |
| Ending | Reunion + Goal Achieved | Goal Lost + New Beginning |
| Creation guidance | Needs writing; appeals to closure seekers | Needs direction; appeals to character fans, closure seekers, surprise seekers |
| Talent agreements | $60k lead; $70k supporting; $620k director | $70k lead; $90k supporting; $610k director |
| Production | Default small film plan,8weeks; rewrite pause and crew rest | Default small film plan,8weeks; weather pause and crew rest; balanced edit |
| Release | Week17 | Week33 |
| Screening | 80 | 65 |
| Fans / critics | 78 /73 | 73 /67 |
| Opening gross | $1,569,930 | $2,715,272 |
| Studio receipts at opening | $407,972 | $866,109 |
| Film spending | $1,727,750 | $1,747,750 |
| Loss at opening | $1,319,778 | $881,641 |

Both used free auditions followed by the displayed standard offer, Next role, the default production plan, a $45k screening, $65k social marketing, and Meridian distribution. Both films retained positive studio cash; after the second opening the studio had $5,096,140. Opening losses are not final film profitability. During film2, deferred film1 streaming using the explicit Decide later control. Advancing to the next decision stopped at casting, production interruptions, announcements, and release preparation. Regular Next week remained useful after interruptions.

## What improved

- The live guidance communicated a different creative priority and audience tendency for the two films. It correctly avoided exact review promises. First movie's closure seekers scored81 versus its other groups75–78; second movie's character fans scored77 versus69–74 for the others. This supports understanding in these examples, not a general balance conclusion.
- Movie identity carried into coherent family-vacation and workplace-rivalry premises. The report retained both ending cards and contained actual explanations. The second report compared fans−5 and critics−6 with film1, explicitly warning that cast/production also differ.
- Standard offer made cost visible before signing. Next role moved straight into supporting casting, then director, then the production plan. This removed repeated project navigation while preserving audition discovery and optional negotiation.
- Setting illustrations are visibly different from the previous repeated building glyph. The initial rendered view showed a recognizable office and small-town street. A follow-up DOM inspection confirmed five distinct SVGs; the Vacation illustration visibly uses a beach umbrella, sun and waves. All seven category labels fit; no clipped Ending tab or split words appeared in the inspected screenshots.
- Advance to next decision reduced empty-week clicks while preserving interruptions. It is useful even though some single-week actions remain between stops.
- After film1, the slate surfaced an explicitly optional Starlight Cinemas brief: $450k,32weeks from acceptance, Earth + Adventurous. The offer did not force acceptance or block creating another Comedy.

## Remaining friction and design judgment

1. **Mobile density remains the main tradeoff.** At390×844, title, preferences, seven tabs, and guidance consume enough space that only the first two cards fit above the footer. The new guidance is useful; it has not made the album browseable at a glance. Try collapsing the title/preferences area after the first category, or showing the current category plus a compact step picker. Do not add another explanation panel.
2. **Ending recognition is still mostly textual.** Selected Goal Lost/New Beginning sit far down a16-card ending list; after selection the rendered view returned near the top in this scripted route. Consider a compact always-visible row of selected ending names. The interpretation still reads as two sentences rather than a memorable combined ending, although it accurately describes the choices.
3. **Guidance is understandable but incomplete coaching.** “Needs direction” helps prioritize the director; it does not explain what to change when direction finishes at51. Report observations now establish the problem, but one short available-next-action hint would make them teach better. Avoid exposing a solved recipe.
4. **Announcement dismissal is ambiguous.** Closing a streaming offer with X left the announcement pending; it returned when advancing. Explicit “Decide later” successfully cleared it. This was navigable and did not block the completed journey, but a player may interpret X as equivalent to defer.
5. **The optional challenge is genre-disconnected.** After two Comedy concepts, the surfaced brief requests Sci-fi ingredients. Optional labeling is clear; ideally surface a relevant genre brief when available or explicitly label the genre before opening it.
6. **Minor copy issue identified:** “Writing were the strongest delivered element.” Reported during testing; lead agent says it is corrected to “Writing was.” The completed-run screenshots predate that correction.

## Assessment

The requested experiments produce a materially clearer two-film flow. Card feedback now gives a prediction to test; the comparison report closes that loop. Hiring shortcuts are immediately worthwhile. The distinct setting illustrations are a convincing direction for collectible identity. Remaining work should focus on less scrolling and clearer selected-card visibility, not more prose or systems.

This demonstrates two-film playability and stronger expert-perceived usability. It does not establish retention or human fun. Next human test: create two contrasting movies, explain the expected audience before release, then choose whether to start a third without prompting.

## Evidence

- test-results/u39-settings.png —390px album, distinct office/town illustrations and full category labels.
- test-results/u39-ending1.png; u39-ending2.png — contrasting guidance and mobile density.
- test-results/u39-offer1-6.png and other u39-offer/signed captures — standard-offer and next-role flow (filenames vary with step count).
- test-results/u39-report1.png; u39-report2.png — opening reports (viewport capture; complete report text inspected separately).
- test-results/u39-slate-after1.png — optional client prompt after first release.
- Automation script: /tmp/usability39-finished.cjs. Temporary, not a game artifact.

## Corrections after the completed playthrough

The lead implementation added scroll/focus retention when selecting an ending, an explicit Sci-fi genre label on the suggested brief, and the more precise “Ending appeal” label. Starting a new film from an opening report now acknowledges that exact opening announcement. `tests/browser-experience39.cjs` verifies these paths; this was a targeted regression, not a repeated two-film playthrough. Singular report grammar was also corrected. The broader density, streaming-X/defer distinction and next-action coaching observations remain design considerations.
