function exportAsText(cardStats, bfStats, validDecks, legend) {
  const date = new Date().toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  const lines = [
    'Riftbound Deck Comparator',
    `Legend: ${legend}`,
    `Mazos comparados: ${validDecks.length}`,
    `Fecha: ${date}`,
    '',
    'CARTAS',
    ['Carta', 'Categoría', '% mazos', 'Copias prom.', 'Score'].join('\t'),
  ];

  for (const s of cardStats) {
    const total = [...s.copiesByDeckId.values()].reduce((a, b) => a + b, 0);
    lines.push([
      s.name,
      s.category,
      `${Math.round(s.frequency * 100)}%`,
      (total / validDecks.length).toFixed(1),
      s.score.toFixed(1),
    ].join('\t'));
  }

  lines.push('', 'BATTLEFIELDS', ['Battlefield', '% mazos'].join('\t'));
  for (const s of bfStats) {
    lines.push([s.name, `${s.frequencyPct.toFixed(0)}%`].join('\t'));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `riftbound-comparador-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
