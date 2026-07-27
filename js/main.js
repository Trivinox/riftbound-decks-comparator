let deckCounter = 0;
const parsedDecks = new Map();

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function addDeck() {
  const existing = document.querySelectorAll('.deck-card');
  if (existing.length >= 30) return;

  deckCounter++;
  const id = deckCounter;
  const card = renderDeckCard(id);
  document.getElementById('deck-inputs').appendChild(card);

  const textarea = card.querySelector('.deck-textarea');

  const onInput = debounce(() => {
    const deck = parseDeck(textarea.value, id);
    validateDeck(deck);
    parsedDecks.set(id, deck);
    updateDeckStatus(id, deck);
  }, 300);

  textarea.addEventListener('input', onInput);

  card.querySelector('.btn-remove').addEventListener('click', () => {
    const current = document.querySelectorAll('.deck-card').length;
    if (current <= 1) return;
    card.remove();
    parsedDecks.delete(id);
    document.getElementById('btn-add-deck').disabled = (current - 1) >= 30;
  });

  document.getElementById('btn-add-deck').disabled = document.querySelectorAll('.deck-card').length >= 30;
}

function compare() {
  for (const card of document.querySelectorAll('.deck-card')) {
    const id = parseInt(card.dataset.deckId, 10);
    const raw = card.querySelector('.deck-textarea').value;
    const cached = parsedDecks.get(id);
    if (!cached || cached.rawText !== raw) {
      const deck = parseDeck(raw, id);
      validateDeck(deck);
      parsedDecks.set(id, deck);
      updateDeckStatus(id, deck);
    }
  }

  const allDecks = [];
  for (const card of document.querySelectorAll('.deck-card')) {
    const id = parseInt(card.dataset.deckId, 10);
    const deck = parsedDecks.get(id);
    if (deck && deck.rawText.trim()) allDecks.push(deck);
  }

  const validDecks = allDecks.filter(d => d.isValid);
  const excluded = allDecks.length - validDecks.length;

  const summaryEl = document.getElementById('analysis-summary');
  const plural = n => n !== 1;
  summaryEl.textContent = `Se compararán ${validDecks.length} de ${allDecks.length} mazo${plural(allDecks.length) ? 's' : ''} ingresado${plural(allDecks.length) ? 's' : ''}${excluded > 0 ? ` (${excluded} excluido${plural(excluded) ? 's' : ''} por errores)` : ''}.`;
  summaryEl.classList.remove('hidden');

  const errorBanner = document.getElementById('legend-error-banner');

  if (validDecks.length < 2) {
    errorBanner.textContent = 'Se necesitan al menos 2 mazos válidos para comparar.';
    errorBanner.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    return;
  }

  const legendConflict = checkLegendConsistency(validDecks);
  if (legendConflict) {
    const detail = Object.entries(legendConflict)
      .map(([leg, ids]) => `"${leg}" (mazos ${ids.map(n => '#' + n).join(', ')})`)
      .join(' y ');
    errorBanner.textContent = `Los mazos no comparten la misma Legend: ${detail}. Todos deben usar la misma Legend para compararse.`;
    errorBanner.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    return;
  }

  errorBanner.classList.add('hidden');

  const cardStats = computeCardStats(validDecks);
  const bfStats = computeBattlefieldStats(validDecks);

  renderResults(cardStats, bfStats, validDecks);

  const legend = validDecks[0].legend;
  document.getElementById('btn-export').onclick = () => exportAsText(cardStats, bfStats, validDecks, legend);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-add-deck').addEventListener('click', addDeck);
  document.getElementById('btn-compare').addEventListener('click', compare);
  document.getElementById('modal-close').addEventListener('click', closeModal);

  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  addDeck();
  addDeck();
  addDeck();
});
