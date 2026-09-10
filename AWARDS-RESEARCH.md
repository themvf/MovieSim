# Awards research and approachable simulation recommendation

Researched September 10, 2026. Evidence below describes the Oscars; other institutions have different electorates, categories, and rules. Numerical recommendations are game-design judgments, not measured predictors of real awards.

## What the evidence establishes

- Academy members vote, rather than a critics-score formula. Best Picture nominations involve the full eligible membership; most other nominations involve the relevant professional branch. Final voting spans eligible members. This makes nomination and victory different competitions. [Academy voting overview](https://www.oscars.org/oscars/voting)
- The 99th rules define picture as the year's best motion picture, directing as an achievement in directing, and acting as a performance. Actors nominate acting and directors nominate directing. Picture has ten nominations; these other categories have five. Final voters must view every nominee in the category. Eligibility includes release/submission requirements; Picture has additional requirements. The rules do not award numerical points for budget, difficulty, genre, box office, or critics' ratings. [99th rules, Rules 1–6, 12, 20](https://www.oscars.org/sites/oscars/files/2026-05/99th_oscars_complete_rules.pdf)
- Campaigning is a regulated activity, with rules concerning screenings, communications, events, and member conduct. These regulations establish permissible promotion, not a published conversion of money into votes. [99th campaign regulations](https://www.oscars.org/sites/oscars/files/2026-05/99th_oscars_campaign_regulations.pdf?VersionId=GuHgPCKpxN9s8EwhhQ6yBKAZCZpwh3gn)
- Genre cannot be an absolute exclusion: *The Silence of the Lambs* won Picture, Directing, and both lead acting awards; *The Return of the King* won Picture and Directing; *Everything Everywhere All at Once* won Picture, Directing, and three acting awards. The 1992 ceremony also nominated *Beauty and the Beast* for Picture. These support room for horror/thriller, fantasy, animation, and genre mixtures; they do not establish genre-specific probabilities. [1992 results](https://www.oscars.org/oscars/ceremonies/1992), [2004 results](https://www.oscars.org/oscars/ceremonies/2004), [2023 results](https://www.oscars.org/oscars/ceremonies/2023)

Winner lists reveal outcomes, not why individual voters voted. Establishing genre advantages would require consistent genre labels, all eligible films (the denominator), category/year controls, and careful treatment of mixed genres. A list of winners alone cannot justify a universal drama bonus or horror penalty. Awards are comparative within an annual field, and subjective; neither these sources nor this memo promise outcomes.

## Problems with the current model

The supplied model uses critics for Picture and Director, acting = 80% performance + 20% role difficulty, campaign bonuses of 3 for nominations / 5 for victory, and random variation of ±8.

1. Picture and Director share one main input, so distinction between an excellent film and exceptional direction disappears. Critics can inform a film's reception but are not the Academy electorate.
2. A direct difficulty bonus rewards selecting a hard role even when it is poorly executed. Difficulty should challenge execution; successful subtle comedy should remain capable of beating unsuccessful transformation or spectacle.
3. A larger guaranteed campaign bonus for winning suggests buying artistic merit. Visibility can help an achievement get considered, but the sources do not quantify its causal effect or establish that money matters more at the final stage.
4. Independent ±8 draws can overwhelm close creative decisions and give incoherent movement between rounds. A little shared film momentum plus category-specific voter taste is easier to explain.
5. Absolute score thresholds omit the strength of that year's competition. Eligibility and nomination must precede a win.

## Recommended small model — design inference

Use three understandable qualities already grounded in production decisions, each on a 0–100 scale:

| Category | Main input | Secondary input | Explanation shown to player |
| --- | --- | --- | --- |
| Picture | 75% overall film quality | 25% storytelling/cohesion | A complete film that connects across crafts. |
| Director | 80% realized direction | 20% overall film quality | How effectively the director realizes the material. |
| Acting | 90% realized performance | 10% role opportunity | How convincingly the performer uses the material. |

These weights are initial tuning choices. If a separate cohesion or direction metric does not exist, derive it transparently from script execution, director fit, and production execution; do not silently duplicate critics under a new label. Role opportunity means quality of playable material, not raw difficulty, screen time, or genre prestige. A simpler safe first step is 100% realized performance for acting.

Let difficulty affect production outcomes through the match between demands and talent/preparation: a hard role performed well can be great, while overreaching increases the risk of weaker execution. Avoid awarding difficulty twice if it already affects performance. Budget provides resources subject to production needs and diminishing returns; it never directly adds award merit.

Create a yearly rival field, then rank eligible achievements for nominations and select a winner only among nominees. Nomination score = category merit + modest campaign visibility + shared film momentum + small category taste variation. Keep campaign visibility capped around 0–3 points with diminishing returns; use a smaller carryover (e.g. 0–1) in finals, not an automatic extra five. Both values are balance decisions. Finals emphasize category merit and fresh modest voter preference. Picture may put a little extra weight on broad appeal as an abstraction of consensus; do not claim this is a full preferential-ballot simulation.

Use seeded, persisted award results so reloads do not reroll. A shared momentum term around ±2 and category/round variation around ±3 are reasonable starting values, requiring playtesting. Close races should remain uncertain; weak films should rarely leapfrog outstanding achievements solely through spending or noise. Rival strength should vary across years.

Avoid permanent genre handicaps. Let genre influence creative demands, talent fit, audience expectations, and rival variety; any seasonal voter preference should be small, legible, and unable to make a genre ineligible. No new genre slider is necessary.

Keep the player-facing flow small: an eligibility status, optional campaign choice, and category outlooks such as “Long shot,” “In contention,” and “Strong contender.” Explain the top factors rather than presenting a guaranteed percentage. A fictional awards body can simplify eligibility to release in the awards year plus submission/qualifying distribution; label this a game abstraction rather than reproducing changing real Academy rules. Run the same eligibility and scoring rules for player and rivals.

## Useful verification cases

- A superb low-difficulty performance can beat a poorly executed demanding role.
- Low-budget films and every genre can contend when the relevant work excels.
- A director can contend without automatically matching the film's Picture outcome.
- Campaigning helps marginal visibility with diminishing returns; it cannot guarantee a nomination or win.
- Only eligible releases enter; only nominees win; the same saved season yields the same result.
- The same film can have different prospects against weak and strong annual fields.
