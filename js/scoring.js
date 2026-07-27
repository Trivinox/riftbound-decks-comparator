function computeCardStats(validDecks) {
  const total = validDecks.length;
  const byCard = new Map();

  function getOrCreate(name) {
    if (!byCard.has(name)) {
      byCard.set(name, {
        name,
        appearsInDeckIds: [],
        copiesByDeckId: new Map(),
        sideboardCopiesByDeckId: new Map(),
      });
    }
    return byCard.get(name);
  }

  for (const deck of validDecks) {
    const combined = new Map();
    for (const entry of [...deck.champion, ...deck.mainDeck]) {
      combined.set(entry.name, (combined.get(entry.name) || 0) + entry.copies);
    }
    for (const [name, copies] of combined) {
      const s = getOrCreate(name);
      s.appearsInDeckIds.push(deck.id);
      s.copiesByDeckId.set(deck.id, copies);
    }
  }

  // Sideboard tracked only for cards already in main/champion
  for (const deck of validDecks) {
    for (const entry of deck.sideboard) {
      if (byCard.has(entry.name)) {
        byCard.get(entry.name).sideboardCopiesByDeckId.set(deck.id, entry.copies);
      }
    }
  }

  return [...byCard.values()]
    .map(s => {
      const appearances = s.appearsInDeckIds.length;
      const totalCopies = [...s.copiesByDeckId.values()].reduce((a, b) => a + b, 0);
      const frequency = appearances / total;
      const intensity = totalCopies / (total * 3);
      const avgWhenPresent = totalCopies / appearances;
      return {
        ...s,
        frequency,
        intensity,
        // Tech uses absolute count (not percentage) so 2/20 also is Tech
        score: frequency * 100 + intensity * 10,
        category: categorize(frequency, avgWhenPresent, appearances),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function categorize(frequency, avg, appearances) {
  if (frequency >= 0.9 && avg >= 2.5) return 'Core';
  if (frequency >= 0.6 && avg >= 1.5) return 'Importante';
  if (appearances <= 2) return 'Tech';
  return 'Flex';
}

function computeBattlefieldStats(validDecks) {
  const total = validDecks.length;
  const byBF = new Map();

  for (const deck of validDecks) {
    for (const name of deck.battlefields) {
      if (!byBF.has(name)) byBF.set(name, { name, appearsInDeckIds: [] });
      byBF.get(name).appearsInDeckIds.push(deck.id);
    }
  }

  return [...byBF.values()]
    .map(s => {
      const pct = (s.appearsInDeckIds.length / total) * 100;
      return {
        ...s,
        frequencyPct: pct,
        category: pct >= 90 ? 'Frecuente' : pct >= 60 ? 'Común' : 'Situacional',
      };
    })
    .sort((a, b) => b.frequencyPct - a.frequencyPct);
}
