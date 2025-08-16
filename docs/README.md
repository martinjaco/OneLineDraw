# One Line Draw

Minimal offline puzzle game: connect all edges of a small graph without reusing any.

## Run
Open `index.html` in a modern browser. No server is required.

## Structure
- `index.html` – shell, preloader and game container.
- `styles.css` – basic theming.
- `game.js` – boot code; loads modules from `src/`.
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
This repository contains a small subset of the full specification. Audio, advanced game modes, the level editor and many polish items are not yet implemented.
