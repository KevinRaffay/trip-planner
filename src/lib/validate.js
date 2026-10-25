import { addDays } from './dates.js';
import { MAX_PLACES_PER_DAY } from './maps.js';

// Shared by the browser (loadTrip) and scripts/check-data.js, so a bad
// trip.json fails the same way locally, in CI and on the page.
export function validateTrip(t) {
  const problems = [];
  const need = (cond, msg) => { if (!cond) problems.push(msg); };

  need(t && t.trip && t.trip.start && t.trip.end, 'trip.start / trip.end missing');
  for (const k of ['cities', 'tags', 'stays', 'legs', 'days', 'bookings', 'costs']) {
    need(Array.isArray(t?.[k]), `${k} must be an array`);
  }
  if (problems.length) return problems;

  const cityIds = new Set(t.cities.map((c) => c.id));
  const tagIds = new Set(t.tags.map((c) => c.id));
  const stayIds = new Set(t.stays.map((s) => s.id));
  const legIds = new Set(t.legs.map((l) => l.id));
  const travelers = new Set(t.trip.travelers.map((p) => p.name));

  // Days: contiguous, one per date, start..end.
  let expect = t.trip.start;
  for (const d of t.days) {
    need(d.date === expect, `days: expected ${expect} but found ${d.date}`);
    expect = addDays(d.date, 1);
    need(cityIds.has(d.city), `${d.date}: unknown city "${d.city}"`);
    need(!d.stay || stayIds.has(d.stay), `${d.date}: unknown stay "${d.stay}"`);
    for (const g of d.tags) need(tagIds.has(g), `${d.date}: unknown tag "${g}"`);
    for (const id of d.legs) need(legIds.has(id), `${d.date}: unknown leg "${id}"`);
    need(d.title && d.plan, `${d.date}: title and plan are required`);
    const places = d.places ?? [];
    need(places.length <= MAX_PLACES_PER_DAY, `${d.date}: ${places.length} places, max ${MAX_PLACES_PER_DAY} (Google caps route waypoints)`);
    for (const p of places) need(p.name && p.query, `${d.date}: every place needs a name and a query`);
  }
  need(addDays(expect, -1) === t.trip.end, `days end at ${addDays(expect, -1)}, trip.end is ${t.trip.end}`);

  // Legs: dated inside the trip, listed on their own day, known travelers.
  const byDate = new Map(t.days.map((d) => [d.date, d]));
  for (const l of t.legs) {
    need(['air', 'train'].includes(l.mode), `${l.id}: mode must be air or train`);
    const day = byDate.get(l.date);
    need(day, `${l.id}: date ${l.date} is outside the trip`);
    need(!day || day.legs.includes(l.id), `${l.id}: not listed on day ${l.date}`);
    for (const p of l.travelers) need(travelers.has(p), `${l.id}: unknown traveler "${p}"`);
  }

  // Hotel alternatives: known city and chain group, with a map query.
  const groups = new Set(['marriott', 'ihg', 'eurostars']);
  for (const a of t.alternatives ?? []) {
    need(cityIds.has(a.city), `alternative "${a.name}": unknown city "${a.city}"`);
    need(groups.has(a.group), `alternative "${a.name}": group must be marriott, ihg or eurostars`);
    need(a.name && a.brand && a.area && a.query, `alternative "${a.name ?? '?'}": name, brand, area and query are required`);
  }

  // Stays: nights add up and cover the dates.
  for (const s of t.stays) {
    need(cityIds.has(s.city), `${s.id}: unknown city "${s.city}"`);
    need(s.query, `${s.id}: stay needs a map query`);
    need(addDays(s.checkIn, s.nights) === s.checkOut, `${s.id}: ${s.nights} nights does not span ${s.checkIn} to ${s.checkOut}`);
  }

  // Privacy floor: this site is public. No booking refs or confirmation numbers.
  // Pattern-based on purpose: the actual refs must never appear in this
  // (public, bundled) source. Catches long '#<digits>' numbers, 6-character
  // mixed letter+digit PNR codes, and "ref/confirmation ... <code>" phrases.
  const blob = JSON.stringify(t);
  need(!/#\d{7,}/.test(blob), 'a confirmation-number-like "#<digits>" is in trip.json - this site is public');
  need(!/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{6}\b/.test(blob), 'a 6-character booking-reference-like code is in trip.json - this site is public');
  need(!/\b(booking|confirmation|conf)\b[^"]{0,12}\b(ref|number|no)\b/i.test(blob), 'booking/confirmation reference wording is in trip.json - this site is public');
  return problems;
}
