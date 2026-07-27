const SECTION_MAP = {
  'legend:': 'legend',
  'champion:': 'champion',
  'maindeck:': 'mainDeck',
  'battlefields:': 'battlefields',
  'runes:': 'runes',
  'sideboard:': 'sideboard',
};

function parseDeck(rawText, id) {
  const deck = {
    id,
    rawText,
    legend: null,
    champion: [],
    mainDeck: [],
    battlefields: [],
    sideboard: [],
    errors: [],
    isValid: false,
  };

  let section = null;

  for (const raw of rawText.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const mapped = SECTION_MAP[line.toLowerCase()];
    if (mapped !== undefined) {
      section = mapped;
      continue;
    }

    if (section === null) {
      deck.errors.push({
        type: 'UNKNOWN_SECTION',
        message: `Línea fuera de sección reconocida: "${line}"`,
        line,
      });
      continue;
    }

    if (section === 'runes') continue;

    const m = line.match(/^(\d+)\s+(.+)$/);
    if (!m) {
      deck.errors.push({
        type: 'PARSE_ERROR',
        message: `Formato de línea inválido: "${line}"`,
        line,
      });
      continue;
    }

    const copies = parseInt(m[1], 10);
    const name = m[2].trim();

    if (section === 'legend') {
      deck.legend = name;
    } else if (section === 'champion') {
      deck.champion.push({ name, copies });
    } else if (section === 'mainDeck') {
      deck.mainDeck.push({ name, copies });
    } else if (section === 'battlefields') {
      deck.battlefields.push(name);
    } else {
      deck.sideboard.push({ name, copies });
    }
  }

  return deck;
}
