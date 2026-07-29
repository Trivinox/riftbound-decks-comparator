# Riftbound Deck Comparator

A static web app that compares multiple Riftbound decklists and ranks cards by how essential they are across all submitted decks, helping you prioritize which cards to buy first.

No backend, no build step. Paste decklists, click Compare, get a ranked table.

---

## Features

- Paste up to 30 decklists in the **Tourney format**
- Compares cards by frequency (how many decks include them) and intensity (average copies across all decks)
- Categorizes each card as **Core**, **Important**, **Flex**, or **Tech**
- Separate table for **Battlefields** ranked by presence percentage
- Click any card or battlefield to see a per-deck breakdown (copies in Main/Champion + Sideboard)
- Export results as **plain text** (`.txt`)
- Validates each deck independently (invalid decks are excluded from analysis without blocking the rest)
- Blocks comparison if decks don't share the same Legend

## How to Use

1. Open the app in your browser
2. Paste a decklist (Tourney format) into each textarea
3. Add more decks with the **+ Add deck** button (up to 30)
4. Click **Compare decks**
5. Browse the ranked card table and click any row for per-deck detail
6. Export the results with the **Export as text** button

### Supported input format

The app only supports the **Tourney format**:

```
Legend:
1 Poppy, Keeper of the Hammer

Champion:
3 Poppy, Paragon

MainDeck:
3 Challenge
3 Grim Resolve
...

Battlefields:
1 Sunken Temple
...

Runes:
6 Body Rune

Sideboard:
2 Sabotage
...
```

## Scoring

Cards are scored based on two factors (frequency dominates and intensity breaks ties):

```
frequency = decks where card appears / total valid decks
intensity = total copies across all valid decks / (total valid decks x 3)

score = (frequency × 100) + (intensity × 10)

range: 0–110
```

| Category | Criteria |
|---|---|
| **Core** | Appears in ≥ 90% of decks and avg copies ≥ 2.5 |
| **Important** | Appears in ≥ 60% of decks and avg copies ≥ 1.5 |
| **Tech** | Appears in only 1 or 2 decks (evaluated before Flex, using absolute count) |
| **Flex** | Everything else: appears in < 60% of decks or avg copies < 1.5, and in more than 2 decks |

Battlefields use simpler categorization: **Frequent** (≥ 90%), **Common** (≥ 60%), **Situational** (< 60%).

## Tech Stack

- Vanilla HTML + CSS + JavaScript, no framework, no build step
- No external libraries or dependencies
- Deployable directly to GitHub Pages

## Project Structure

```
riftbound-deck-comparator/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── parser.js      # Parses raw deck text into Deck objects
    ├── validator.js   # Validates Legend consistency, max copies, format
    ├── scoring.js     # Computes frequency, intensity, score, and category
    ├── render.js      # Builds tables and detail modal in the DOM
    ├── export.js      # Handles plain text export
    └── main.js        # UI event orchestration and main flow
```

## Running Locally

No build step needed. Just serve the project root with any static file server:

```bash
npx serve .
```

Or open `index.html` directly in your browser, no server required.

## Known Limitations (MVP)

- Input is manual only, no API integration
- Card names are matched by exact text; a typo creates a separate entry
- No persistence between sessions (all state is in memory)
- Category thresholds are fixed and not configurable from the UI

## License

MIT
