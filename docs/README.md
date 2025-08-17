# One Line Draw

Minimal offline puzzle game: connect all edges of a small graph without reusing any.

## Run
Open `index.html` in a modern browser. No server is required.

## Structure
- `index.html` – shell, preloader and game container.
- `styles.css` – basic theming.
- `game.js` – boot code; loads modules from `src/`.
- `src/engine/Audio.js` – simple Web Audio manager with music/SFX toggles.
- `src/utils/Theme.js` – light/dark/high-contrast theme manager.
- `src/core/Solver.js` – Hierholzer-based solver used for hints.
- Basic modal UI for level completion and game over.
- Four modes: Classic, Timed (30s), Moves-limited, and Zen.
- Keyboard-accessible SVG board and simple in-browser level editor.
- Hint button shows next edge of Euler trail.
- Music, SFX, and theme toggles in the HUD with persistence.
- Dynamic difficulty rating adjusts hint availability delay.
- `levels/levels.json` – sample level definitions.
- `i18n/en.json` – strings.

## Level Schema
Each level entry:
```json
{
  "id": 1,
  "name": "Triangle",
  "nodes": [{"x":0.5,"y":0.1}, ...],
  "edges": [[0,1],[1,2],[2,0]],
  "hearts": 3
}
```
`x` and `y` are normalised 0–1 coordinates.

## Notes
This repository remains a minimal prototype and does not meet the full studio specification.
codex/develop-studio-quality-one-line-draw-game
This repository remains a minimal prototype and does not meet the full studio specification.
This repository contains a small subset of the full specification. Audio, advanced game modes, the level editor and many polish items are not yet implemented.
