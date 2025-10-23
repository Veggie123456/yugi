## Yu-Gi-Oh! GOAT Duel (Prototype)

Vite + React + TypeScript prototype inspired by Dueling Nexus, limited to the GOAT format with a configurable cutoff date. Includes routing, deck builder, card database, simple duel skeleton, animations, and sound scaffolding.

### Quick Start

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

If you see a Node version error (Vite requires 20.19+ or 22.12+), install an LTS version and select it:

```bash
# Windows (nvm-windows)
nvm install 22.12.0
nvm use 22.12.0
```

3. Open the app and navigate:

- Home: overview
- Play: draw, simple summon to board (prototype)
- Decks: build a deck with GOAT legality constraints
- Database: browse GOAT-legal cards
- Settings: set GOAT cutoff date and toggle sounds/animations

### Project Structure

- `src/pages/*`: `Home`, `Play`, `Decks`, `Database`, `Settings`
- `src/components/*`: `Card`, `Hand`, `Board`, `Layout`
- `src/types/*`: card and rules types
- `src/config/goat.ts`: default GOAT rules and banlist
- `src/lib/*`: sounds, animations, card loading, GOAT filtering
- `src/data/cards.sample.json`: demo sample cards

### Assets

Place sound effects in `public/sfx/` named `draw.mp3`, `summon.mp3`, `set.mp3`, `attack.mp3`, `direct.mp3`, `shuffle.mp3`, `click.mp3`.

### Notes

- This is a UI/logic prototype. Full rule enforcement, comprehensive databases, multiplayer, and server logic are out of scope for this initial scaffold.
