// Story hooks describe the selected subgenre; they do not add matching bonuses.
const hooks = {
  "Character study": [
    "a reclusive painter",
    "must decide whether to reveal the secret behind their most famous work",
  ],
  Courtroom: [
    "a public defender",
    "takes a final appeal that could expose a wrongful conviction",
  ],
  "Coming of age": [
    "a graduating teenager",
    "must choose between leaving home and keeping a promise to a friend",
  ],
  "Family saga": [
    "an estranged heir",
    "returns to settle an inheritance that divides three generations",
  ],
  Historical: [
    "a village teacher",
    "protects a forbidden archive as an old regime falls",
  ],
  Biographical: [
    "a pioneering musician",
    "rebuilds a career after the concert that changed their life",
  ],
  "Sports drama": [
    "an injured runner",
    "coaches a rival toward the championship they can no longer enter",
  ],
  "Romantic drama": [
    "a widowed architect",
    "reconnects with a former love while rebuilding their hometown",
  ],
  "Social drama": [
    "a factory organizer",
    "risks their livelihood to keep a community together",
  ],
  "War drama": [
    "a field medic",
    "tries to bring a divided unit home from its final mission",
  ],
  Psychological: [
    "an unreliable witness",
    "questions their own memories while investigating a disappearance",
  ],
  Crime: [
    "a disgraced detective",
    "follows stolen money into the family that once protected them",
  ],
  Conspiracy: [
    "a local journalist",
    "uncovers a cover-up hidden inside an ordinary municipal contract",
  ],
  "Legal thriller": [
    "a corporate lawyer",
    "becomes the target after finding evidence against their own client",
  ],
  "Political thriller": [
    "a campaign aide",
    "discovers that an election-night victory depends on a dangerous secret",
  ],
  Mystery: [
    "an amateur investigator",
    "gathers the last guests of a vanished hotel owner",
  ],
  "Domestic suspense": [
    "a new neighbor",
    "realizes the perfect household next door is hiding a missing person",
  ],
  "Techno-thriller": [
    "a security engineer",
    "races to stop a stolen system from shutting down a city",
  ],
  "Survival thriller": [
    "a stranded guide",
    "must lead a hostile group out of a collapsing mountain pass",
  ],
  Romantic: [
    "a wedding planner",
    "falls for the one guest determined to stop the ceremony",
  ],
  Workplace: [
    "an accidental manager",
    "tries to save a failing office without revealing they were hired by mistake",
  ],
  Satire: [
    "a publicity consultant",
    "turns an obvious fraud into the town’s most trusted celebrity",
  ],
  Slapstick: [
    "an unlucky delivery driver",
    "must transport a priceless sculpture through a citywide celebration",
  ],
  "Dark comedy": [
    "a polite funeral director",
    "tries to conceal a disastrous mix-up from two feuding families",
  ],
  "Buddy comedy": [
    "a meticulous accountant",
    "shares a cross-country trip with their least reliable friend",
  ],
  "Coming-of-age comedy": [
    "a shy student",
    "organizes a graduation party that grows wildly beyond their control",
  ],
  Mockumentary: [
    "a small-town director",
    "lets a documentary crew follow an increasingly disastrous local pageant",
  ],
  "Family comedy": [
    "an overwhelmed parent",
    "agrees to let the children run the household for a weekend",
  ],
  "Fish out of water": [
    "a city chef",
    "inherits a rural diner whose regulars refuse every new idea",
  ],
  Supernatural: [
    "a night nurse",
    "hears warnings from patients who died before the hospital opened",
  ],
  Survival: [
    "a wilderness instructor",
    "discovers something is hunting the group after sunset",
  ],
  Folk: [
    "a visiting scholar",
    "finds that a village festival requires a participant who cannot leave",
  ],
  Slasher: [
    "a summer caretaker",
    "recognizes a pattern in the disappearances around a reopened camp",
  ],
  "Creature feature": [
    "a marine biologist",
    "tries to evacuate a harbor after an unknown creature surfaces",
  ],
  "Haunted house": [
    "a restoration worker",
    "opens a sealed room that begins changing the rest of the house",
  ],
  "Found footage": [
    "a student filmmaker",
    "records a search party whose footage shows someone no one remembers",
  ],
  "Body horror": [
    "an experimental patient",
    "discovers their treatment is transforming more than their illness",
  ],
  "Psychological horror": [
    "an isolated caregiver",
    "cannot tell whether the house or their own mind is imprisoning them",
  ],
  Vampire: [
    "a blood-bank technician",
    "uncovers an ancient bargain protecting the city after dark",
  ],
  Espionage: [
    "a retired operative",
    "must recover a stolen identity before it starts an international crisis",
  ],
  Adventure: [
    "a reluctant explorer",
    "follows a lost expedition’s map into a region erased from modern charts",
  ],
  Heist: [
    "a former getaway driver",
    "assembles a crew for a robbery that must happen during a blackout",
  ],
  "Martial arts": [
    "a dismissed apprentice",
    "returns to defend a school against the champion who expelled them",
  ],
  Disaster: [
    "a rescue pilot",
    "races to evacuate a coastal city before a second catastrophic wave",
  ],
  "Military action": [
    "a unit commander",
    "leads a rescue behind enemy lines with no promised extraction",
  ],
  "Chase thriller": [
    "a courier",
    "crosses a locked-down city carrying evidence that every faction wants",
  ],
  Swashbuckler: [
    "an outlaw captain",
    "challenges a governor for control of a stolen fleet",
  ],
  Superhero: [
    "an untested protector",
    "must defend a city after its celebrated heroes disappear",
  ],
  Space: [
    "a station captain",
    "receives a distress signal spoken in their own voice",
  ],
  "Near future": [
    "a transit worker",
    "discovers an experimental city is quietly removing its residents",
  ],
  "Time travel": [
    "a failed inventor",
    "gets one chance to revisit the day that broke their family",
  ],
  "First contact": [
    "a field linguist",
    "must communicate with visitors before a frightened world attacks",
  ],
  Cyberpunk: [
    "a memory smuggler",
    "steals an identity that belongs to the corporation running the city",
  ],
  Dystopian: [
    "a records clerk",
    "finds proof that a supposedly perfect society is built on disappearances",
  ],
  "Artificial intelligence": [
    "a machine trainer",
    "must decide whether to protect the intelligence they were hired to erase",
  ],
  "Post-apocalyptic": [
    "a wandering mechanic",
    "escorts the last working radio toward a rumored settlement",
  ],
  "Space opera": [
    "an exiled heir",
    "unites rival worlds against the fleet that destroyed their home",
  ],
  "Science fantasy": [
    "a young navigator",
    "learns that an ancient machine controls the legends of their world",
  ],
};
const turns = [
  "An unexpected ally changes the stakes.",
  "A personal promise makes walking away impossible.",
  "Their closest rival knows a crucial secret.",
  "A former mistake threatens their last chance.",
  "The person they trust most has a competing plan.",
  "Success could cost them the home they hoped to save.",
  "An old friendship becomes the deciding factor.",
  "The truth could destroy the victory they are seeking.",
];
export function storyFor(subgenre, variant = 0) {
  const [lead, goal] = hooks[subgenre] ?? [
    "an unlikely outsider",
    "must choose what they are willing to sacrifice",
  ];
  return {
    premise: `${lead[0].toUpperCase() + lead.slice(1)} ${goal}. ${turns[variant % turns.length]}`,
    roleDescriptions: [
      lead,
      "The ally whose own ambition complicates the mission",
      "The rival with a personal stake in the outcome",
    ],
  };
}
