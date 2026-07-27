function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BADGE_CLASS = {
  Core: 'badge-core',
  Importante: 'badge-importante',
  Flex: 'badge-flex',
  Tech: 'badge-tech',
  Frecuente: 'badge-core',
  Común: 'badge-importante',
  Situacional: 'badge-flex',
};

function renderDeckCard(id) {
  const card = document.createElement('div');
  card.className = 'deck-card';
  card.dataset.deckId = id;
  card.innerHTML = `
    <div class="deck-card-header">
      <span class="deck-label">Mazo #${id}</span>
      <div class="deck-card-actions">
        <span class="deck-status"></span>
        <button class="btn-icon btn-remove" data-id="${id}" title="Eliminar mazo">&times;</button>
      </div>
    </div>
    <textarea class="deck-textarea" placeholder="Pega aquí el mazo en formato Tourney de riftbound.gg..." rows="16"></textarea>
    <div class="deck-errors hidden"></div>
  `;
  return card;
}

function updateDeckStatus(id, deck) {
  const card = document.querySelector(`.deck-card[data-deck-id="${id}"]`);
  if (!card) return;

  const statusEl = card.querySelector('.deck-status');
  const errorsEl = card.querySelector('.deck-errors');
  const textarea = card.querySelector('.deck-textarea');

  if (!deck || !deck.rawText.trim()) {
    statusEl.textContent = '';
    statusEl.className = 'deck-status';
    errorsEl.classList.add('hidden');
    errorsEl.innerHTML = '';
    textarea.classList.remove('textarea-valid', 'textarea-error');
    return;
  }

  if (deck.isValid) {
    statusEl.textContent = 'Válido';
    statusEl.className = 'deck-status badge-valid';
    errorsEl.classList.add('hidden');
    errorsEl.innerHTML = '';
    textarea.classList.add('textarea-valid');
    textarea.classList.remove('textarea-error');
  } else {
    const count = deck.errors.length;
    statusEl.textContent = `${count} error${count > 1 ? 'es' : ''}`;
    statusEl.className = 'deck-status badge-error';

    errorsEl.innerHTML = '';
    for (const e of deck.errors) {
      const div = document.createElement('div');
      div.className = 'error-item';
      div.textContent = e.message;
      errorsEl.appendChild(div);
    }
    errorsEl.classList.remove('hidden');
    textarea.classList.add('textarea-error');
    textarea.classList.remove('textarea-valid');
  }
}

function renderResults(cardStats, bfStats, validDecks) {
  const cardBody = document.getElementById('card-table-body');
  const bfBody = document.getElementById('bf-table-body');
  cardBody.innerHTML = '';
  bfBody.innerHTML = '';

  for (const stat of cardStats) {
    cardBody.appendChild(buildCardRow(stat, validDecks));
  }

  for (const stat of bfStats) {
    bfBody.appendChild(buildBFRow(stat, validDecks));
  }

  const resultsEl = document.getElementById('results');
  resultsEl.classList.remove('hidden');
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildCardRow(stat, validDecks) {
  const tr = document.createElement('tr');
  tr.className = 'table-row-clickable';

  const totalCopies = [...stat.copiesByDeckId.values()].reduce((a, b) => a + b, 0);
  const avg = (totalCopies / validDecks.length).toFixed(1);

  tr.innerHTML = `
    <td>${escapeHtml(stat.name)}</td>
    <td><span class="badge ${BADGE_CLASS[stat.category]}">${escapeHtml(stat.category)}</span></td>
    <td>${Math.round(stat.frequency * 100)}%</td>
    <td>${avg}</td>
    <td>${stat.score.toFixed(1)}</td>
  `;
  tr.addEventListener('click', () => openModal(stat, validDecks, false));
  return tr;
}

function buildBFRow(stat, validDecks) {
  const tr = document.createElement('tr');
  tr.className = 'table-row-clickable';
  tr.innerHTML = `
    <td>${escapeHtml(stat.name)}</td>
    <td><span class="badge ${BADGE_CLASS[stat.category]}">${escapeHtml(stat.category)}</span></td>
    <td>${stat.frequencyPct.toFixed(0)}%</td>
  `;
  tr.addEventListener('click', () => openModal(stat, validDecks, true));
  return tr;
}

function openModal(stat, validDecks, isBattlefield) {
  document.getElementById('modal-title').textContent = stat.name;
  document.getElementById('modal-body').innerHTML = isBattlefield
    ? buildBFModalContent(stat, validDecks)
    : buildCardModalContent(stat, validDecks);
  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function buildCardModalContent(stat, validDecks) {
  const hasSide = stat.sideboardCopiesByDeckId.size > 0;

  const rows = stat.appearsInDeckIds
    .map(id => {
      const copies = stat.copiesByDeckId.get(id);
      const side = hasSide ? (stat.sideboardCopiesByDeckId.get(id) ?? null) : null;
      return `<tr>
        <td>Mazo #${id}</td>
        <td>${copies} ${copies === 1 ? 'copia' : 'copias'}</td>
        ${hasSide ? `<td>${side !== null ? side : '-'}</td>` : ''}
      </tr>`;
    })
    .join('');

  const missing = validDecks
    .filter(d => !stat.appearsInDeckIds.includes(d.id))
    .map(d => `Mazo #${d.id}`)
    .join(', ');

  return `
    <table class="modal-table">
      <thead>
        <tr>
          <th>Mazo</th>
          <th>Main + Champion</th>
          ${hasSide ? '<th>Sideboard</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${missing ? `<p class="modal-not-in">No aparece en: ${missing}</p>` : ''}
  `;
}

function buildBFModalContent(stat, validDecks) {
  const rows = stat.appearsInDeckIds
    .map(id => `<tr><td>Mazo #${id}</td></tr>`)
    .join('');

  const missing = validDecks
    .filter(d => !stat.appearsInDeckIds.includes(d.id))
    .map(d => `Mazo #${d.id}`)
    .join(', ');

  return `
    <table class="modal-table">
      <thead><tr><th>Mazo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${missing ? `<p class="modal-not-in">No aparece en: ${missing}</p>` : ''}
  `;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}
