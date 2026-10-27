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
- `src/lib/route.js` — hash routing; routes `#/`, `#/itinerary`, `#/calendar`, `#/travel`, `#/hotels`, `#/plan`, `#/report`, `#/day/YYYY-MM-DD`
- `src/views/` — one file per page (`Report.jsx` is the printable full-trip document); `common.jsx` holds FilterBar, LegCard, badges
- `public/sw.js` — network-first for `trip.json` + navigations, cache-first for `/assets/*`; registers in production only

## Data model (trip.json)
`trip` (dates, travelers with a `from` date — Jennie joins 2027-06-09), `cities`, `tags`, `stays[]`, `legs[]` (`mode`: `air` | `train`; `status`: `booked` | `bookable` | `opens-later` | `optional`), `days[]` (one per date, contiguous start..end; each lists its `legs` ids), `transitNotes`, `bookings`, `bookingSequence`, `costs`.

## Google Maps
Deep links only (Maps URLs API): `src/lib/maps.js` builds `https://www.google.com/maps/search|dir/?api=1...` links from data. **No API key, no Maps JS/Embed SDK** — nothing billable or secret ships in this public bundle. Data: `stays[].query` (hotel search text) and `days[].places[]` (`{name, query}`, in visit order, max 8). Legs need no extra fields: trains link transit directions `from`→`to`, flights link the arrival airport. Day routes walk from that night's hotel; `daytrip` days start at the first stop (the hotel is in another town). `check-data` builds every link and asserts it is a well-formed Maps URL. An interactive map would need per-place lat/lng and a referrer-restricted key (or Leaflet/OSM) — not built.

### Hotel alternatives
`alternatives[]` in trip.json (`{city, group: marriott|ihg|eurostars, brand, name, area, query}`) feeds a collapsible per-city list under the stays on the Hotels page, each with a Maps link. It is a curated shortlist (about 3 per chain group per city), **not every property**, built from web searches in Oct 2026 that returned partial lists, so some entries are flagged only by that evidence (e.g. recent openings). Manchester is deliberately absent (booked stay). Two gaps show as "None found in the central area": no IHG in Seville and no Eurostars in London. Chain portfolios change: re-check before relying on it.

### Food guides
`guides[]` in trip.json (`{id, city, title, intro, tip, spots: [{rank, pick?, name, address, query, note}]}`) holds ranked "where to eat" lists. Today: Porto francesinha (5 places, supplied by the user; the notes are their wording and were not independently verified) and Madrid free-tapas bars (11 places summarized in our own words from a Madrid Secreto article, April 2025; the optional `source` field is shown as an attribution link; prices and tapa details are the article's, not checked). Shown on every day page in that city (Porto May 25-26) and in the Report, each spot with a Maps link. `check-data` builds every spot's link.

### Guided tours
`tours[]` in trip.json (`{id, date, time, name, short, party, travelers, price, status: in-cart|booked, cancelBy}`) holds guided tours from two sources: the thetourguy.com shopping cart (6 tours) and a Viator reservation (`vendor` says which). `status` is `in-cart` (not booked), `reserved` (held, pay later; `chargeOn` is the charge date) or `booked`; the UI labels each plainly. Each tour is listed on its day via `days[].tours`, shown on day cards and day pages, and in a table on the Plan page; the cost summary's "Guided day tours" row must equal the tours' sum (`check-data` enforces it). Days whose stops are towns apart set `route: false` so no nonsense walking route is offered. Neither site was ever accessed: tour details came from screenshots the user shared. Viator's booking reference was deliberately not stored (public site; `validate.js` rejects `BR-<digits>`).

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
- v0.6: Hotels page "Alternatives by city" (41 options across Lisbon, Porto, Madrid, Barcelona, Seville, London). Not verified against each chain's own site.
- v0.7: synced to the revised PDF: Jennie on AA 136 and the return on AA 135, both Premium Economy booked on miles (costs and booking tables updated). Booking refs and seat numbers in the PDF were deliberately not copied. Flight durations (10h 30m, 11h 10m) are computed from the PDF times, not stated in it.
- v0.8: the per-person (traveler) day filter was removed on request; everyone is always shown. Old shared links containing `who=` are ignored. Day pages still say who is on the trip that day.
- v0.9: six cart tours added; day plans rewritten around them (Sintra May 24, Madrid in a Day May 28, Toledo/Segovia May 29, Girona Jun 1, London in a Day Jun 15, Lisbon walking tour May 23). Displaced items: Alfama/Sao Jorge Castle, the Toledo AVE leg and day, the separate Royal Palace day, Montserrat/Montjuic option (Sagrada Familia + Park Guell moved to Jun 3). The cart date mismatch for Toledo/Segovia (Jun 29 vs May 29) was later corrected by the user, so no cart-date notes remain.
- v0.10: a Viator Cordoba/Ronda tour (Jun 5) and a Viator Seville walking tour (Jun 4) were added and then removed on request (still planning); Jun 5/6 and the Cordoba train leg are back to the original plan. `vendor`, the `reserved` status and the `BR-<digits>` privacy check stay for later Viator tours.
- v0.11: the Google My Maps CSV export was removed (Plan page block, `src/lib/mymaps.js`, its checks). New `#/report` page (nav: Report) renders the whole trip as one document; its Print / Save as PDF button calls `window.print()`, and print CSS in `styles.css` forces light colors, hides the nav and keeps table rows and headings together. Checked by printing the page to PDF with headless Edge; the in-app print dialog itself was not exercised.
- v0.12: route change: Seville is now 4 nights (Jun 4-8) and the Seville-Lisbon flight and final Lisbon night (The Ivens) were removed; Jun 7 is an open Seville day and Jun 8 flies Seville to London. The Seville-London leg (carrier, fare and airport) is NOT verified: a web search showed only a handful of weekly nonstops (Vueling to Heathrow in one listing, BA/easyJet possibly to Gatwick). Fare is the old Lisbon-London estimate. Hotel nights stay at 25.
- v0.13: Lisbon hotel is now Eurostars Lisboa Baixa (chosen, not booked), replacing The Ivens, which moved to the Lisbon alternatives. Its rate and details are NOT checked (rate says "Not checked yet"; the cost estimate still uses the old Ivens rate). Day text that said Chiado now says Baixa.
- v0.14: Renaissance Porto Lapa Hotel was deleted. The Porto nights (May 25-27) stay as a `status: "tbd"` placeholder stay ("Porto hotel (to be decided)") so the nights, validation and day pages still work; a `tbd` stay hides its map links and day routes start at the first stop. The Porto alternatives list is the shortlist. The cost estimate still uses the old Porto rate.
- v0.15: Madrid hotel is now Hotel Indigo Madrid - Gran Via (IHG, Calle de Silva 6), chosen and not booked, rate not checked; The Palace moved to the Madrid alternatives. May 27 dinner is at La Barquette - Meat Bar (Corredera Baja de San Pablo 10; the user's first link was the hotel by mistake). May 27/28 text and two Madrid transit notes that assumed The Palace were updated.
- v0.16: schedule shift: Porto is 3 nights (May 25-28, new open day May 27) and Seville is 3 nights (Jun 5-8), so Madrid is May 28-Jun 1 and Barcelona Jun 1-5, with the Madrid, Toledo/Segovia and Girona tours, the Porto-Madrid, Madrid-Barcelona, Barcelona-Seville flights/trains and the Cordoba trip each one day later. The old open Seville day (Plaza de Espana, Maria Luisa Park) was dropped. The three shifted tours are in the thetourguy.com cart under their OLD dates until the user changes them there. Hotel nights stay at 25; cost estimates were not recalculated for the new per-city split.
- v0.17: both London stays (Jun 8-10, Jun 13-16) are now Cheval Three Quays at The Tower of London, booked on Booking.com (Superior One Bedroom Apartment with Sofa Bed, free cancellation to Jun 6 / Jun 11). Replaces London Marriott County Hall; the day text that assumed its South Bank location was updated. Prices, confirmation numbers and the guest name are not in the data. Each is one apartment with 1 king bed + 1 sofa bed: $1,096 (Jun 8-10) and $1,634 (Jun 13-16), $2,730 total, which replaced the old London estimate in the cost summary (new total $23,815 - $31,795).
- v0.18: the Jun 8 Seville flight now lands at London GATWICK, not Heathrow, and is not chosen yet (leg status `tbd`, carrier "To be decided"); the Jun 8 day text and booking timeline say so. Jennie's flight and the Jun 16 departure still use Heathrow.
- v0.19: Jun 14 (Windsor or Greenwich) gets an evening Devour historic pubs food tour in the City of London (about 3.5 h, from about $97 pp per the tour page, meeting at St Andrew Holborn gardens). It is a plan note and map stop only, not a `tours[]` entry: not booked, no date or time chosen, not in the cost summary.
- Source: `iberian_grand_tour_lisbon_loop_2027.pdf` (as of 2026-10-24). Fares/rates are estimates.
- Pages: repo Settings → Pages → Source must be "GitHub Actions".
