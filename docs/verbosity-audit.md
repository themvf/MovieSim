# MovieSim UI verbosity audit

Scope: casting, chemistry, movie details, release reports, production delays, commissions, and fan sentiment. Reviewed `app.js` and `style.css` against the supplied mobile screenshots. Recommendations only; this audit does not change mechanics.

## First changes

1. Shrink the sticky audition notice to one compact row. It currently repeats the role already in the dialog title and includes tutorial copy that stays above every candidate.
2. Show candidate fee, availability, audition result, and action before secondary biography. Replace chemistry paragraphs with short labeled rows.
3. Make post-release scores and film finances the first content in a report. `scifiReport()` currently places commission, delay, chemistry, and people panels before the headline.
4. Move fan conversations into a popup, with a small persistent “Fans · New” button on the movie. Give players a way to reopen it; do not lose an unanswered choice on dismissal.
5. Remove the old Act I/II/III presentation as requested. Keep selected concept cards as the movie's creative summary. Avoid replacing the old grid with an equally long generated synopsis.

## Specific copy reductions

| Location | Current copy | Proposed visible copy | Details retained on request |
| --- | --- | --- | --- |
| Casting notice | “5 of 5 auditions left this week · Supporting · Jules Park” plus reset/prestige paragraph | “🎬 Auditions 5/5 · this week” | “Resets weekly. Prestige increases your allowance.” |
| Shortlist intro | “A fresh face, a working actor, and a star. If a category is unavailable under your filters, another available actor fills the spot. Auditions are free.” | “3 candidates · Free auditions” | Selection rules under casting help |
| Chemistry heading | “Instinctive performer” | Keep this short personality label | No extra description needed |
| Chemistry pairing | “With Celia Vaughn: Natural rapport · +2 chemistry · first pairing” | “Celia Vaughn · Rapport +2” | “First film together” in expanded chemistry |
| Neutral pairing | “With Freya Nash: Finding their rhythm · 0 chemistry · first pairing” | “Freya Nash · Neutral 0” | Same history disclosure |
| Chemistry formula | “Pair contributions are averaged per actor, up to ±4 performance points. Locks at filming.” | One “How chemistry works” disclosure per casting screen | Preserve full formula, ±4 cap, and lock timing |
| Movie chemistry | “The people between the scenes” plus pairing paragraphs and formula | “Cast chemistry” with two names and a signed effect per row | Expand for outcome, shared films, and trust rules |
| Actor genre strengths | “Strong in” then separate genre lines; “Less comfortable” then another line | “Strong: Comedy · Thriller” / “Weak: Horror” | Existing full genre ratings |
| Casting metadata | “Woman · Age 55 · Playing age 50–60” | “Playing age 50–60” | Gender and actual age in career profile; preserve role-fit information if required |
| Director buttons | “Back this approach” / “Keep a balanced approach” | “Back the style” / “Balanced” | Show numeric benefits and penalties immediately beside each choice |
| Sequel panel | Explanation of inherited cards, free retention, editing cost, and lock timing | “Change sequel cards · $50,000” / “Keep current cards free” | “Changes lock at filming” stays beside the action |
| Filming summary | “Your development department is writing. Ready in 4 weeks.” | “Writing · 4 weeks left” | No mechanics removed |
| Delay status | “Production paused · 2 week(s) remaining” and holding paragraph | “Paused · 2 weeks · $12,000/week” | Delay history and paid holding totals in disclosure |
| Delay choice | “2 extra week(s) · quality protected” plus cost and wrap sentences | “+2 weeks · Quality protected” / “Holding $24,000 · Wrap Oct, W2” | Booking-conflict explanation when applicable; never hide a deadline overrun |
| Fan action | “Spotlight the fan conversation · $25,000” | “Spotlight · $25,000” | Show “Demand +8% · 4 weeks” directly under the button |
| Fan action | “Thank fans and credit the cast · free” | “Thank fans · Free” | Show “Lead trust +2” directly under the button |
| Fan action | “Listen without making promises · free” | “Just listen · Free” | Show “No gameplay change” directly under the button |
| Report feedback | “Alien Life put emphasis on story. The finished production delivered well in this area.” | “Alien Life → Story: Strong” | Expand for how delivered execution drives the result |
| Report final explanation | Repeats recovered/unrecovered result already visible in financial tile | “Studio overhead excluded” | Full accounting definition via “Financial details” |
| Commission on movie | Repeated payment, deadline, required card, and separate validation sentence | “Mars Travel · $600,000 · 18 weeks left · Colony ✓” | Review button opens full commitment and extension |

Amounts and dates above are illustrative; render actual game state. Chemistry values are **pair contributions**, not guaranteed total acting bonuses. A compact label must not misrepresent that distinction; explain it once in the disclosure and use “Pair chemistry” as the group label.

## Simple graphics that replace repeated prose

- **Chemistry:** compact rows with two existing portraits, relationship label, and signed number. Use a positive, neutral, or negative badge; keep text and sign so color is not the only cue. A connecting line is decoration, not another interaction.
- **Production:** reuse the existing progress bar with “Filming 4/12”. Add a pause badge and return date when delayed. Do not create a timeline unless it shows meaningful scheduling conflicts.
- **Audience:** existing audience meters already work. Keep a group name, score, and short verdict; move the methodology paragraph into report help.
- **Movie finances:** maintain three values—receipts, spending, and profit/loss—with signed red/green result. Never substitute box-office gross for studio receipts.
- **Selected cards:** retain recognizable card art with short labels; compact selected cards can open the full deck. Do not show both a full list of card names and a redundant synopsis by default.

## Popup and page responsibilities

**Main movie page:** current stage, money, cast, cards, and next action. Below these, compact buttons for Fans, Chemistry, Production history, and Report. During an unresolved production decision, the decision takes priority.

**Fan popup:** title, one distinctive fan quote, three choices with immediate cost/effect, and “Later”. Reopen from the movie after dismissal. Once answered, show the response in history, not a permanent full panel.

**Production popup:** director portrait, one explanation, and side-by-side comparison rows for added weeks, total holding cost, quality impact, and wrap date. On mobile stack the options. Keep commission deadline warnings visible. Collapse the general explanation of overhead, paused filming, and booking rules under “How delays work”.

**Industry magazine:** recommended fictional name **The Backlot**. Cover story with poster, one headline, one sentence, and one numeric highlight; smaller stories below. Examples: a studio's first release, a blockbuster crossing a gross threshold, a true perfect critic score, a film reaching profit, an awards win. Headlines should be generated from verified simulation state and recorded once per milestone. A rounded displayed 100 must not be mistaken for an exact perfect score. Use a “Latest issue” entry and unread badge, not a blocking popup for every article. Movie links should open the relevant movie. Historical stories should keep the figure at the time of publication.

## What must remain visible before a decision

- Cash price and any contingent gross-share commitment.
- Deadline and when payment is earned.
- Quality/performance changes and duration of temporary benefits.
- Whether an action is final, locks at filming, or can be changed for a fee.
- Actual schedule conflicts, delayed wrap dates, and commission/end-of-run overruns.
- Fan response effects, including a zero-effect choice.

General explanations and repeated formulas can move into accessible native `details` elements or real buttons. Hover-only tooltips are insufficient on phones.

## Verification targets

- At 390 px wide, the casting notice occupies at most two short lines and does not obscure a candidate action while scrolling.
- The first candidate exposes name, fee, availability, and audition action without scrolling through chemistry rules.
- Text remains readable; do not achieve density by reducing all text to 10–11 px.
- Keep approximately 44 px touch targets and keyboard-operable disclosures.
- Post-release scores and net film result precede retrospective relationship history.
- Dismiss/reopen fan popup preserves the unanswered choice; selecting an action applies it only once.
- Magazine milestones are factual and do not repeat every week.
