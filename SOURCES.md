## Data and Assets Sources

- Card data and images metadata fetched from the public YGOPRODeck API (`https://db.ygoprodeck.com/api-guide/`).
- Images are not bundled in the repo. We reference image URLs provided by YGOPRODeck.
- This project is non-commercial and for educational/prototyping purposes.

How to update the dataset:

```bash
npm run fetch:cards
```

This writes `public/cards.goat.json` used by the app when available.

### EDOPro Integration (optional)

- Place EDOPro scripts in `public/edopro/script/` as `c<CARDID>.lua` (e.g., `c55144522.lua`).
- The app includes a Lua VM (fengari) and a loader stub in `src/effects/edopro.ts`. Full fidelity requires implementing the EDOPro environment API in the browser, which is non-trivial.

