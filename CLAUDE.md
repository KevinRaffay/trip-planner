# trip-planner

Static GitHub Pages app for the Iberian Grand Tour (May 21 – Jun 16, 2027): itinerary, calendar, day filters, and travel (air/train) sections. Built on the architecture of the betsheet static app (Vite + React, hash routing, one bundled JSON payload, light/dark toggle, hand-written service worker, Pages workflow) without any of its racing code.

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
- `src/lib/filters.js` — filter model; filters live in the hash query (`#/itinerary?city=..&tag=..&who=..&q=..`) and are shared by Itinerary and Calendar
- `src/lib/route.js` — hash routing; routes `#/`, `#/itinerary`, `#/calendar`, `#/travel`, `#/hotels`, `#/plan`, `#/day/YYYY-MM-DD`
- `src/views/` — one file per page; `common.jsx` holds FilterBar, LegCard, badges
- `public/sw.js` — network-first for `trip.json` + navigations, cache-first for `/assets/*`; registers in production only

## Data model (trip.json)
`trip` (dates, travelers with a `from` date — Jennie joins 2027-06-09), `cities`, `tags`, `stays[]`, `legs[]` (`mode`: `air` | `train`; `status`: `booked` | `bookable` | `opens-later` | `optional`), `days[]` (one per date, contiguous start..end; each lists its `legs` ids), `transitNotes`, `bookings`, `bookingSequence`, `costs`.

## Invariants
1. **The site is public. No booking references, confirmation numbers or seat numbers in `trip.json`, source or docs.** Status ("Confirmed") and non-identifying detail only. `validate.js` pattern-checks for this; the patterns deliberately do not contain the real values.
2. Every leg must be dated inside the trip, listed on its own day, and use known travelers; stays' `nights` must span check-in to check-out (enforced by `check-data`).
3. Date math goes through `src/lib/dates.js` (UTC); never `new Date('YYYY-MM-DD')` local math, so a viewer's timezone cannot shift a day.
4. No server, no API: everything the app shows is in `trip.json` served beside `index.html`.
5. Work on a feature branch; the user reviews and merges to `main`. Merging to `main` deploys.

## Status
- v0.1: all views built and verified in the dev preview (desktop + 375px, light + dark, no horizontal overflow, filters drive Itinerary and Calendar). Service worker file is syntax-checked and served but its registration was not exercised in the Claude browser pane (the pane refused to fetch it); confirm on the deployed site.
- Source: `iberian_grand_tour_lisbon_loop_2027.pdf` (as of 2026-10-24). Fares/rates are estimates.
- Pages: repo Settings → Pages → Source must be "GitHub Actions".
