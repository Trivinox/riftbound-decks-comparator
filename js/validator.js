function validateDeck(deck) {
  if (!deck.legend) {
    deck.errors.push({
      type: 'MISSING_LEGEND',
      message: 'No se detectó ninguna Legend.',
      line: null,
    });
  }

  if (deck.champion.length === 0 && deck.mainDeck.length === 0) {
    deck.errors.push({
      type: 'EMPTY_DECK',
      message: 'El mazo no contiene cartas en Champion ni MainDeck.',
      line: null,
    });
  }

  const counts = new Map();
  for (const entry of [...deck.champion, ...deck.mainDeck]) {
    counts.set(entry.name, (counts.get(entry.name) || 0) + entry.copies);
  }
  for (const [name, total] of counts) {
    if (total > 3) {
      deck.errors.push({
        type: 'MAX_COPIES_EXCEEDED',
        message: `"${name}" suma ${total} copias entre Champion y MainDeck (máximo 3).`,
        line: null,
      });
    }
  }

  deck.isValid = deck.errors.length === 0;
  return deck;
}

function checkLegendConsistency(validDecks) {
  const unique = [...new Set(validDecks.map(d => d.legend))];
  if (unique.length <= 1) return null;

  const grouped = {};
  for (const deck of validDecks) {
    if (!grouped[deck.legend]) grouped[deck.legend] = [];
    grouped[deck.legend].push(deck.id);
  }
  return grouped;
}
