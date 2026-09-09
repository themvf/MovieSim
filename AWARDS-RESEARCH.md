# Awards-season timeline research

Researched by the delegated awards-timeline agent for the demo 0.2 update. Dates below are official announced schedules; the game's weeks are a simplification rather than a literal reproduction.

| Season                 | Nominations      | Ceremony          | Gap     |
| ---------------------- | ---------------- | ----------------- | ------- |
| 98th Oscars            | January 22, 2026 | March 15, 2026    | 52 days |
| 99th Oscars            | January 21, 2027 | March 14, 2027    | 52 days |
| 2027 BAFTA Film Awards | January 19, 2027 | February 21, 2027 | 33 days |
| 84th Golden Globes     | December 7, 2026 | January 10, 2027  | 34 days |

Sources: [98th Academy key dates](https://www.oscars.org/oscars/98th-oscars-and-academy-key-dates), [99th Academy key dates](https://press.oscars.org/news/academy-and-abc-announce-show-dates-99th-and-100th-oscarsr), [BAFTA's 2027 announcement](https://www.bafta.org/media-centre/press-releases/2027-film-awards-opens-for-entries/), and [Golden Globes timetable](https://goldenglobes.com/articles/the-84th-annual-golden-globes-timetable-eligibility-rules-and-campaign-guidelines-announced/).

For the 99th Oscars, eligibility covers January 1–December 31, 2026. Nomination voting runs January 11–15, 2027; final voting runs February 25–March 4. December releases therefore belong to the following spring's awards. [Academy schedule](https://press.oscars.org/news/academy-and-abc-announce-show-dates-99th-and-100th-oscarsr).

Real campaigns have phase-specific rules, not one simple purchase window. The game abstracts this into a single optional campaign before final voting. [Academy campaign rules](https://press.oscars.org/news/awards-rules-and-campaign-promotional-regulations-approved-99th-oscarsr).

## Implemented game cadence

- November: awards-season heads-up, explaining the December eligibility cutoff.
- January: a dedicated nominations announcement for the previous calendar year's releases (simulation year offset 3).
- January–February: eligible films can still purchase their campaign before the ceremony.
- March: an explicit invitation to watch winners or intentionally show all results (simulation year offset 10).
- Ceremony: Supporting Acting, Lead Acting, Director, then Picture. Each category has separate nominee, reveal, and next-category steps. There are no automatic timers. Closing with Escape cannot dismiss the invitation or ceremony.
- Archives: nominations and completed results remain available under Awards. Reveals, payments, prestige, and career awards are saved and applied once.
- After the fifth operating year: an explicitly labeled awards-only epilogue covers the final year's releases before the retrospective. No operating time, production costs, interest, or catalog income advances during this epilogue.

The 52-week simulation uses approximate calendar months. January and March labels describe the seasonal cadence; these fixed simulation weeks are not claims about future real ceremony dates.
