# Movie Studio Game — Five-Year Demo Design

Status: playable demo, revised through the 0.4 talent feedback update. Concrete implementation choices are documented in IMPLEMENTATION.md.

This is a new game, separate from all previous game projects. This document records the agreed design. MovieSim now has a playable GitHub Pages demo; numerical balance remains iterative.

## Vision

Build a movie studio whose history matters. Discover an unknown actor, cast their breakthrough role, make a sequel, pursue awards, and invest the proceeds in a more capable studio. The player manages the people, finances, production commitments, and releases rather than directing creative details such as endings or cuts.

The inspiration combines Hollywood Mogul’s studio business with the approachable presentation and pixel-art workplace character of CD Market – Music Label Sim. This is not a genre-and-theme matching puzzle. Genre describes the project; investment decisions, talent, uncertainty, and the studio’s developing history create the game.

Visual reference: https://store.steampowered.com/app/4622330/CD_Market__Music_Label_Sim/

## Product and presentation

- Eventual platform: iOS. Use a web prototype to test the game.
- Free game, with no pay-to-win purchases or purchased improvement. Learning across attempts is central; restarting is allowed and expected.
- Visual direction: original pixel-art people and detailed studio spaces inspired by the reference, adapted for phone interaction rather than copying its dense desktop layout.
- Home screen: current movies and their status. The studio is a separate place to visit and improve.
- Movie presentation should emphasize cast, poster/title, stage, financial commitments, and decisions requiring attention.
- Advance by pressing Next Week, with navigation to the next action item. No real-time waiting.

Portrait orientation and the exact screen layout are proposed implementation choices, not finalized requirements.

## Demo boundaries

The demo runs for five in-game years, starting in the present day. Everyone begins with the same small studio and funding. The industry ages: actors grow older, new talent arrives, and careers develop toward eventual retirement. Each new game generates a fresh talent pool; within a run, people persist and accumulate history.

The market’s underlying tastes remain mostly stable for the demo. August and December are deliberately strong blockbuster windows, with larger audiences and heavier competing releases. These are game rules, not a claim about real-world seasonal economics.

Rival studios remain in the background, supplying competing releases and awards contenders. There is no detailed rival-studio management simulation required for the demo.

## Core loop

1. Review cash, debt, active movies, talent availability, and upcoming releases.
2. Buy a script or commission an original project; commission sequels from movies the studio owns.
3. Review casting requirements and role difficulty. Audition a shortlist, negotiate actors, and hire a director.
4. Allocate production spending and select a filming schedule. Check commitments across overlapping projects.
5. Advance weeks, respond to consequential production problems, and complete filming.
6. Optionally purchase a test screening before committing most marketing spending.
7. After filming, compare distribution deals or fund the release yourself. Plan specific marketing campaigns.
8. Experience the opening-weekend reveal, then weekly theatrical results and possible marketing adjustments.
9. Receive automatic streaming and licensing income after the theatrical run, pursue annual awards, and reinvest.

Players can run multiple movies. There is no fixed simultaneous-project cap; budget and talent scheduling govern what is feasible. The player chooses a release date after filming wraps. Once confirmed, it cannot be moved in the demo.

## Scripts and original projects

Buying scripts is expected to be the main route. Scripts have a title, asking price, estimated quality range, casting requirements, and role difficulty. Different scripts require different-sized casts. Development department upgrades improve script assessments.

Purchased scripts can be renamed and include sequel rights automatically. The player can commission a sequel through the development department, paying a development cost and waiting for completion. Named screenwriters are outside demo scope.

For an original project, the player enters a title and chooses genre, subgenre, and scale: small, mid-budget, or blockbuster. The development department produces the script. No premise-writing step is required. Scale establishes ambition and complexity; the player still chooses actual spending.

Use named spending tiers with visible costs and descriptions of what each buys. Sliders provide context for the investment while preserving player choice and uncertain outcomes. This supersedes the first-pass bare budget fields. Costs and contractual obligations should remain visible; uncertainty concerns outcomes, not hidden charges.

## Actors, auditions, and directors

Actors have identities, portraits, salary expectations, estimated overall talent, genre strengths and weaknesses, screen presence, fame, and visible career histories. A Fresh face badge identifies actors without major credits. A fresh pool is generated each run. Casting should encourage attachment to an unknown who becomes a star through the player’s films.

- Show expected salary ranges before auditions, so the player can build an affordable shortlist without repeated negotiation clicks.
- Auditions are free and immediate in the demo.
- Auditions show an estimated performance range for the specific role, not a guaranteed outcome.
- Talent is also an estimate. Better casting resources and film history improve knowledge.
- Role difficulty is supplied by the script. Challenging roles create awards opportunities but do not guarantee awards.
- A demanding role can persuade an established actor to accept less money for its career potential.
- An unknown with a strong audition can excel in a demanding role and achieve a breakthrough.
- Fees respond to releases, fame, and awards. Existing contracts and sequel options preserve agreed terms.
- Actors and directors have availability calendars. Bookings prevent incompatible overlapping shoots.

Sequel options can be negotiated upfront at an additional cost. Alternatively, players can negotiate fresh deals later, accepting higher fees or unavailability. In the demo, shared history does not guarantee loyalty; a discovered star can leave for a better opportunity.

Directors are individually named hires with fees, abilities, film histories, and awards. Exact director-rating visibility is not settled. Actor personalities, loyalty mechanics, and actor/director chemistry are deferred.

## Production

Players split spending across production areas rather than choosing one total budget. The initial proposed categories are sets and locations, crew, and effects, with actor and director fees separately visible. Exact categories can be refined during implementation.

Players also choose the filming schedule. Shorter schedules save money but raise production risk; more time costs more and gives the team additional room to deliver. Production decisions vary with project type and scope. A small drama and a large action movie should not generate an identical number or kind of interruptions.

Problems force consequential choices. To protect the filming schedule, the player can fund overtime, cut planned work and accept a quality compromise, or combine those responses. Ordinary production incidents may affect completion time, spending, or quality. The release date is chosen after filming, so production decisions do not require recasting a locked release calendar.

A movie can be canceled. Money already spent is lost; the decision should clearly disclose remaining contractual obligations and future spending avoided. Cancellation must not silently erase debt or committed payments.

## Test screenings and reception

There are three distinct signals:

| Signal | Purpose |
| --- | --- |
| Paid test-screening score | Optional early audience evidence before most marketing spending; can be misleading. |
| Critics’ score | Critical reception, with implications for prestige and awards. |
| Fan score | Audience reception, word of mouth, and sustained ticket demand. |

Better research makes screening evidence more representative without making it reliably predictive of commercial success. A screening score is not a box-office forecast. Critics and fans can disagree. Quality, awareness, audience size, and competition must remain distinct contributors to outcomes.

## Marketing, distribution, and release timing

Players choose specific campaigns, such as trailers, social media, premieres, and TV advertising. Campaigns expose cost, timing, and expected reach. Marketing can be increased or restrained after an optional test screening and revisited as theatrical results arrive. Excessive marketing can turn a commercially promising movie into a studio-threatening investment.

Distribution is chosen after filming, so distributor advances cannot fund the shoot. Compare offers trading guaranteed upfront money against the studio’s share of box-office proceeds, or finance the release independently for greater risk and upside. Prestige improves distribution opportunities and terms. Theater shares, distributor deductions, marketing responsibilities, and payment timing require explicit formulas before development.

The release calendar shows announced competing movies before the player commits. August and December combine audience opportunity with crowding. The proposed model makes similar releases compete more directly for attention and theater access; a crowded month need not be worse than a quiet one. The strength of those effects remains a balancing task.

Release dates cannot be changed after commitment in the demo. Present rough forecasts and competition indicators rather than a guaranteed best date. Better departments and resources improve forecasts.

## Box office and catalog

Opening weekend receives a dramatic results reveal. Weekly results then show theatrical revenue, audience response, and staying power while other projects continue. Strong performers remain in theaters longer; weaker performers transition to subsequent income sooner.

Streaming and licensing income is automatic in the demo. Individual deal negotiations are planned for the fuller game. The catalog remains a valuable asset that helps finance new projects.

Release reports provide a strong explanation of costs, income, performances, production quality, marketing, and competition. Even entry-level reporting must be useful. Department upgrades add precision and insight rather than withholding all reasons for failure. Reports should distinguish observed results from uncertain causal estimates.

## Studio, departments, and prestige

Studio investments are practical, with visible facility improvements. Decoration and customization are deferred.

Owned facilities allow ambitious projects to be handled in-house. Equivalent facilities can be rented from the beginning, so access is not hard-locked behind prestige. Ownership can improve the economics of repeated use. This does not impose a fixed number of concurrent project slots.

Staff management uses department upgrades, not individually hired employees. Development, casting, production, marketing, and research are the working department structure; exact upgrade trees, costs, and benefits remain to be specified.

Prestige makes actors and directors more receptive and improves distribution offers. Players can approach top talent from the start, using money, role difficulty, and awards potential to make an attractive offer. Prestige creates advantages rather than absolute access gates.

## Awards and success

Announce nominations in January for the previous year’s releases, then invite players to watch a March ceremony. Winners reveal manually, category by category, with an intentional Show results alternative. Use an awards-only epilogue for year-five releases before the retrospective. Optional campaigns remain available. Use multiple categories. The initial proposed set is Picture, Director, Lead Acting, and Supporting Acting; final category naming is not settled.

Awards contribute to studio prestige and individual careers. Challenging roles offer opportunity, while the delivered performance and movie still matter. Awards spending must compete with other uses of cash.

Five-year success combines financial health and prestige. A profitable blockbuster studio can earn a top rating with some critical recognition; a smaller awards-focused studio can also reach the top with sustainable finances. Neither trophies alone nor money alone tells the whole story.

The proposed final retrospective includes financial results, hits and flops, awards, franchises, studio growth, and talent the studio helped establish. Exact scoring weights and thresholds remain open.

## Loans, failure, and learning

Use one bank and a simple loan offer showing amount, interest, repayment schedule, and borrowing limit. Voluntary loans are available from the start and throughout the run, subject to credit limits.

When cash goes negative, pause and offer a choice: review and accept emergency financing, if eligible, or end the studio’s run. Do not automatically accept debt for the player. Borrowing is finite; exhausted credit can lead to bankruptcy. Recovery is possible, but serious mistakes can require restarting a new studio.

Initial funding, loan limits, repayment timing, emergency terms, and eligibility are balancing decisions. Restarting provides a new talent pool and a chance to apply learned economics, with no purchased advantage.

## Deferred beyond the demo

- Selectable starting circumstances and funding levels.
- Shifting industry tastes and a more active rival-studio simulation.
- Actor personalities, loyalty advantages, and working chemistry.
- Named screenwriters and individual department employees.
- Studio decoration and personalization.
- Negotiated streaming and licensing deals per movie.

Moving release dates is excluded from the demo; whether to add it later is not yet decided.

## Decisions required before implementation

1. Define starting finances, minimum viable project economics, weekly payment timing, and loan rules.
2. Continue tuning post-wrap release timing and production scheduling. Talent must be reserved only for feasible schedules.
3. Specify distribution cash flows and separate gross box office from studio receipts and profit.
4. Design bounded uncertainty for scripts, auditions, screenings, and forecasts; upgrades improve information without guaranteeing hits.
5. Set department and facility costs and effects without introducing unwanted project caps or talent gates.
6. Specify award eligibility, campaign effects, and the combined financial/prestige rating.
7. Decide how unfinished films, debt, and future catalog value are treated at the five-year endpoint.
8. Choose initial content counts, genre/subgenre lists, event variety, technical stack, saving behavior, and project/repository name.

## What the prototype must demonstrate

- A player can understand their commitments, produce and release a movie, and learn why it performed as it did.
- Several concurrent movies create meaningful financial choices without excessive clicking.
- An unknown actor can become memorable through auditions, a breakthrough, rising fees, and a sequel decision.
- A smaller acclaimed studio and a commercially successful studio both have viable paths to strong overall results.
- Marketing, financing, and production choices can cause genuine losses and bankruptcy; loans offer a limited recovery route.
- Department improvements, owned facilities, and catalog income make the studio feel like it is accumulating lasting value.
- The central movie-management flow works comfortably on a phone-sized screen.

These are validation goals for the prototype, not claims that implementation or testing has already occurred.
