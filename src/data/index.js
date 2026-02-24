/**
 * Barrel export for all card data and deck definitions.
 * Single import point for consumers:
 *   import { DECKS, ALL_CARDS, getCardsByDeck, getCardById } from './data';
 */

import { DECKS, STAGES } from './decks.js';
import { generateAllCards, generateDeckCards, getAllCardsFlat } from './cardGenerator.js';

// Pre-generate all cards at module load (static data, no runtime cost concern)
const CARD_MAP = generateAllCards();
const ALL_CARDS = getAllCardsFlat();

// Build a lookup map for O(1) card-by-id access
const CARD_BY_ID = new Map(ALL_CARDS.map((card) => [card.id, card]));

/**
 * Get all cards for a specific deck.
 * @param {string} deckId
 * @returns {Array} cards for the deck
 */
function getCardsByDeck(deckId) {
  return CARD_MAP.get(deckId) || [];
}

/**
 * Get a single card by its unique ID.
 * @param {string} cardId
 * @returns {object|undefined} the card or undefined
 */
function getCardById(cardId) {
  return CARD_BY_ID.get(cardId);
}

export {
  DECKS,
  STAGES,
  CARD_MAP,
  ALL_CARDS,
  getCardsByDeck,
  getCardById,
  generateDeckCards,
  generateAllCards,
};
