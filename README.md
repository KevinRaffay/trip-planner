# trip-planner

Itinerary, calendar and travel planner for **The Iberian Grand Tour** (May 21 – Jun 16, 2027): Lisbon, Porto, Madrid, Barcelona, Seville, London, Manchester (Oasis at the Etihad) and back.

A static React app hosted on GitHub Pages: <https://kevinraffay.github.io/trip-planner/>

- **Itinerary** — every day grouped by city/hotel, with filters for city, day type and text search
- **Calendar** — May and June grid; filters dim non-matching days
- **Travel** — air and train legs, with status (booked / bookable / opens later) and public-transport notes
- **Guided tours** from the shopping cart on each day and on the Plan page
- **Hotels**, **Plan** (what to book and when, cost estimates), light/dark theme, offline after one visit
- **Report** — the whole trip as one document; Print / Save as PDF from the browser

Filters live in the URL, so a filtered view can be bookmarked or shared.

## Develop

```bash
npm install
npm run dev
```

All trip content is in `public/trip.json`; `npm run check-data` validates it. See `CLAUDE.md` for the data model and rules (notably: no booking references in this public repo).
