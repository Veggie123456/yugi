## Data and Assets Sources

- Card data and images metadata fetched from the public YGOPRODeck API (`https://db.ygoprodeck.com/api-guide/`).
- Images are not bundled in the repo. We reference image URLs provided by YGOPRODeck.
- This project is non-commercial and for educational/prototyping purposes.

How to update the dataset:

```bash
npm run fetch:cards
```

This writes `public/cards.goat.json` used by the app when available.

