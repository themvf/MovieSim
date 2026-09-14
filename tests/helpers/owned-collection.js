// Contract/economy regression fixtures start with the full collection so ownership
// gates do not mask the payment and deadline behavior under test.
import * as E from '../../engine.js';import {DECKS} from '../../collection.js';
export function ownedGame(...args){const s=E.newGame(...args);s.collection.owned=structuredClone(DECKS);return s;}
