# trip-planner

Static GitHub Pages app for the Iberian Grand Tour (May 21 – Jun 16, 2027): itinerary, calendar, day filters, and travel (air/train) sections. Built on the architecture of the betsheet static app (Vite + React, hash routing, one bundled JSON payload, hand-written service worker, Pages workflow) without any of its racing code.

**Keep this file current:** update it in the same commit as any rule, invariant or status change.

## Commands
- `npm run dev` — dev server on :5190
- `npm run build` — production build to `dist/` (`TRIP_BASE=/trip-planner/` is what CI sets; default base is relative)
- `npm run preview` — serve the build on :5191
- `npm run check-data` — validate `public/trip.json` (CI runs this before building)

On Windows Git Bash, set `MSYS_NO_PATHCONV=1` when passing `TRIP_BASE=/trip-planner/`, or MSYS rewrites it to a `C:/Program Files/Git/...` path.

## Where things live
- `public/trip.json` — **all** trip content. Editing the trip means editing this file only.
- `src/lib/validate.js` — shared validator (browser `loadTrip` + `scripts/check-data.js`)
- `src/lib/filters.js` — filter model; filters live in the hash query (`#/itinerary?city=..&tag=..&q=..`; there is no per-person filter, everyone is shown) and are shared by Itinerary and Calendar
- `src/lib/route.js` — hash routing; routes `#/`, `#/itinerary`, `#/calendar`, `#/travel`, `#/hotels`, `#/plan`, `#/day/YYYY-MM-DD`
- `src/views/` — one file per page; `common.jsx` holds FilterBar, LegCard, badges
- `public/sw.js` — network-first for `trip.json` + navigations, cache-first for `/assets/*`; registers in production only

## Data model (trip.json)
`trip` (dates, travelers with a `from` date — Jennie joins 2027-06-09), `cities`, `tags`, `stays[]`, `legs[]` (`mode`: `air` | `train`; `status`: `booked` | `bookable` | `opens-later` | `optional`), `days[]` (one per date, contiguous start..end; each lists its `legs` ids), `transitNotes`, `bookings`, `bookingSequence`, `costs`.

## Google Maps
Deep links only (Maps URLs API): `src/lib/maps.js` builds `https://www.google.com/maps/search|dir/?api=1...` links from data. **No API key, no Maps JS/Embed SDK** — nothing billable or secret ships in this public bundle. Data: `stays[].query` (hotel search text) and `days[].places[]` (`{name, query}`, in visit order, max 8). Legs need no extra fields: trains link transit directions `from`→`to`, flights link the arrival airport. Day routes walk from that night's hotel; `daytrip` days start at the first stop (the hotel is in another town). `check-data` builds every link and asserts it is a well-formed Maps URL. An interactive map would need per-place lat/lng and a referrer-restricted key (or Leaflet/OSM) — not built.

### Google My Maps export
`src/lib/mymaps.js` builds a CSV in the browser (Plan page button): one row per unique hotel/sight (`Name, Address, Type, City, Days, Date, Description`), deduped by map query (a place visited on two days is one row listing both). My Maps geocodes the `Address` column, so no lat/lng is stored. Import is manual and one-way (My Maps does not sync); flights/trains are not drawn. `check-data` asserts no place is lost and the CSV has one line per row.

### Hotel alternatives
`alternatives[]` in trip.json (`{city, group: marriott|ihg|eurostars, brand, name, area, query}`) feeds a collapsible per-city list under the stays on the Hotels page, each with a Maps link. It is a curated shortlist (about 3 per chain group per city), **not every property**, built from web searches in Oct 2026 that returned partial lists, so some entries are flagged only by that evidence (e.g. recent openings). Manchester is deliberately absent (booked stay). Two gaps show as "None found in the central area": no IHG in Seville and no Eurostars in London. Chain portfolios change: re-check before relying on it.

### Guided tours
`tours[]` in trip.json (`{id, date, time, name, short, party, travelers, price, status: in-cart|booked, cancelBy}`) mirrors the user's thetourguy.com shopping cart (6 tours, $1,594.98). **In cart is not booked**; the UI says so. Each tour is listed on its day via `days[].tours`, shown on day cards and day pages, and in a table on the Plan page; the cost summary's "Guided day tours" row must equal the tours' sum (`check-data` enforces it). Days whose stops are towns apart set `route: false` so no nonsense walking route is offered. The cart was never accessed: tour details came from a screenshot the user shared.

## Invariants
1. **The site is public. No booking references, confirmation numbers or seat numbers in `trip.json`, source or docs.** Status ("Confirmed") and non-identifying detail only. `validate.js` pattern-checks for this; the patterns deliberately do not contain the real values.
2. Every leg must be dated inside the trip, listed on its own day, and use known travelers; stays' `nights` must span check-in to check-out (enforced by `check-data`).
3. Date math goes through `src/lib/dates.js` (UTC); never `new Date('YYYY-MM-DD')` local math, so a viewer's timezone cannot shift a day.
4. No server, no API: everything the app shows is in `trip.json` served beside `index.html`.
5. Work on a feature branch; the user reviews and merges to `main`. Merging to `main` deploys.

## Status
- v0.1: all views built and verified in the dev preview (desktop + 375px, light + dark, no horizontal overflow, filters drive Itinerary and Calendar). Service worker file is syntax-checked and served but its registration was not exercised in the Claude browser pane (the pane refused to fetch it); confirm on the deployed site.
- v0.2: Google Maps deep links on Day detail (places, day route, hotel), Itinerary cards (day route), Hotels, and Travel legs. Verified in the dev preview (hrefs decoded, 375px, dark); not yet clicked through on the deployed site.
- v0.3: header is just the section nav. The brand label and the Light/Dark button were removed on request; there is no theme toggle (`src/theme.js` only follows the OS setting, so a phone set to dark still shows the dark palette).
- v0.4: header nav is a hamburger at <=640px (shows the current section, lists every item, closes on navigate / Escape / outside tap); wider screens keep the inline links, which wrap rather than scroll. Add new sections to `NAV` in `src/app.jsx` and they appear in both.
- v0.5: Plan page "Download CSV for My Maps" (65 places). Output checked in the preview; the actual My Maps import was not run (needs a Google account), so confirm the pins land correctly on first use.
- v0.6: Hotels page "Alternatives by city" (41 options across Lisbon, Porto, Madrid, Barcelona, Seville, London). Not verified against each chain's own site.
- v0.7: synced to the revised PDF: Jennie on AA 136 and the return on AA 135, both Premium Economy booked on miles (costs and booking tables updated). Booking refs and seat numbers in the PDF were deliberately not copied. Flight durations (10h 30m, 11h 10m) are computed from the PDF times, not stated in it.
- v0.8: the per-person (traveler) day filter was removed on request; everyone is always shown. Old shared links containing `who=` are ignored. Day pages still say who is on the trip that day.
- v0.9: six cart tours added; day plans rewritten around them (Sintra May 24, Madrid in a Day May 28, Toledo/Segovia May 29, Girona Jun 1, London in a Day Jun 15, Lisbon walking tour May 23). Displaced items: Alfama/Sao Jorge Castle, the Toledo AVE leg and day, the separate Royal Palace day, Montserrat/Montjuic option (Sagrada Familia + Park Guell moved to Jun 3). The cart dates Toledo/Segovia as Jun 29; the planner uses May 29 and the user must fix the cart.
- Source: `iberian_grand_tour_lisbon_loop_2027.pdf` (as of 2026-10-24). Fares/rates are estimates.
- Pages: repo Settings → Pages → Source must be "GitHub Actions".
