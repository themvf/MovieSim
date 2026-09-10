# Fresh13 general playtest

Tested MovieSim demo 0.10.0 at http://127.0.0.1:4173 using isolated Edge browser contexts, UI/DOM only. No source, old reports, engine or saved-state edits. Main completed save is in fresh13-general-profile. Screenshots: fresh13-general-release.png, fresh13-general-career.png, fresh13-general-streaming.png, fresh13-general-awards.png.

## Session qualification
An initial nonpersistent context was lost after a tool timeout while advancing filming; this was automation failure, not a demonstrated game crash. That initial run acquired Neon Sunday (horror/creature feature), favoring low cost and high estimated writing quality, and hired Leon Okafor, Elias Rivera and June Cruz. I restarted with a durable isolated profile. The randomized market changed, and replaying the same UI positions acquired The Quiet Room: Reckoning instead. This second run is therefore a pragmatic low-budget recovery run, not a clean reproduction of the first strategy. All results below concern the completed second run unless specified.

## Actual completed decisions and outcome
- Produced The Quiet Room: Reckoning, a low-budget Sci-fi/First contact film, script estimate 25–65. Kept the eight-week standard $650,000 production plan.
- Hired working actor Elias Park as lead, fresh face Wren Cole as supporting and emerging director Iris Kim. Chose the audience-friendly edit when offered two endings at filming week six.
- Paid $45,000 for a test screening: audience 65/100. Chose week 12 in March because it displayed one nearby release versus two on surrounding dates. Paid $65,000 for social marketing.
- Chose Meridian partner distribution: 40% ticket share; $210,000 advance less $80,000 release fee, with $430,000 recovered before additional ticket receipts.
- Opening gross $1.9m, within the $1.2m–$2m forecast; critics 65, fans 70. Lead performance 75, supporting 90, director 80. All three gained fame (+2/+4/+3).
- Final theatrical gross displayed $6m. Funded the $150,000 awards campaign after the Awards page identified supporting acting as the best prospect.
- Signed PictureHouse streaming for $55,000 upfront plus declining weekly royalties, quoted $459,159 total over 52 weeks, rather than the $350,000 flat license.
- At signing: movie costs $2,180,000; studio receipts $2,249,331; profit $69,331. This made clear that a ticket-sales hit can still barely recoup costs.
- Continued to January 2027: three nominations (supporting, lead and director). Watched the four-category March ceremony. Wren Cole won supporting acting, giving +8 prestige; the other three categories went to rivals. Cash before award reveal was $6,119,733.
- Inspected Wren's career file and sequel availability. Sequel commission was available for $140,000. I did not commission another movie or negotiate new post-award talent terms.

## Findings
1. Numeric precision is inconsistent enough to undermine trust. In the initial run Neon Sunday was advertised/acquired through a $65,000 button but cash fell from $6m to $5,936,000 and the project immediately showed $64,000 spent. On the completed run the streaming offer promised a first royalty of $11,908, while the signed project immediately said 'Next week: $10,000'. These appear to be display rounding differences, not proven incorrect underlying payments. Financial decisions should display consistent exact values or mark approximations.
2. Career copy contradicts the visible filmography. Immediately after release Wren's career file said 'Fresh face · no major credits yet' while listing The Quiet Room: Reckoning and an 89/100 performance. The release report rounded that same performance to 90/100. 'Fresh face' is fine; 'no major credits yet' reads as stale progression. Screenshot fresh13-general-career.png.
3. Awards were discoverable through navigation and the best-prospect hint was useful. But after a March release there are many empty weekly advances to reach nominations and the ceremony. This is tolerable while managing more movies; as a first-film follow-through it becomes mechanical clicking. A calendar action to advance to the next meaningful event would help.
4. The directory is a long undifferentiated list. It made me want a shortlist/favorites and sorting/filtering by price, relevant genre and recent studio collaborators directly in that directory. The casting shortlist itself was much easier to use.
5. Strong opening, unrecovered costs and eventual profit are helpfully distinguished. The distribution dollar example and release forecast comparisons are the clearest teaching moments. The cast-performance/fame comparison creates a reason to care about inexpensive discoveries.
6. Production is mostly an eight-click wait, but the two-ending decision was specific and understandable. It let me express a commercial preference without a fake obvious best answer.

## Clarity and fun
The first-film path is straightforward and the task-aware top button reliably brought me to releases, decisions and announcements. I could complete production, release, streaming and awards entirely through the interface. Most enjoyment came from finding a cheap supporting actor who performed best and later won. The main weak point is the long period of empty weekly advances and repeated static lot content. No blocking game bug was demonstrated; selector timeouts and the initial lost browser were test-harness issues.

## Top three recommendations
1. Use one consistent money and score precision policy across purchase buttons, contracts, dashboards and career files; exact amounts at commitment points, approximate notation where rounded.
2. Update career prose after credits and surface returning collaborators/new opportunities near the release outcome, so a breakthrough feels persistent.
3. Add a safe 'advance to next event' calendar flow that pauses for decisions, release, streaming and awards, reducing idle week clicking while preserving player control.
