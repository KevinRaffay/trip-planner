// Day filters live in the hash query (#/itinerary?city=lisbon,porto&tag=concert)
// so a filtered view survives reload and can be shared, and so the Itinerary
// and Calendar views stay in step.

export const EMPTY_FILTERS = { cities: [], tags: [], who: '', q: '' };

export function filtersFromQuery(params) {
  const list = (k) => (params.get(k) || '').split(',').filter(Boolean);
  return { cities: list('city'), tags: list('tag'), who: params.get('who') || '', q: params.get('q') || '' };
}

export function filtersToQuery(f, params = new URLSearchParams()) {
  const set = (k, v) => { if (v) params.set(k, v); else params.delete(k); };
  set('city', f.cities.join(','));
  set('tag', f.tags.join(','));
  set('who', f.who);
  set('q', f.q.trim());
  return params;
}

export const isFiltering = (f) => f.cities.length > 0 || f.tags.length > 0 || !!f.who || !!f.q.trim();

/** Which people are on the trip on a given date. */
export const travelersOn = (trip, date) => trip.travelers.filter((p) => p.from <= date).map((p) => p.name);

export function dayMatches(day, f, data) {
  if (f.cities.length && !f.cities.includes(day.city)) return false;
  if (f.tags.length && !day.tags.some((t) => f.tags.includes(t))) return false;
  if (f.who && !travelersOn(data.trip, day.date).includes(f.who)) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const city = data.cities.find((c) => c.id === day.city)?.name ?? '';
    const stay = data.stays.find((s) => s.id === day.stay)?.hotel ?? '';
    if (!`${day.title} ${day.plan} ${city} ${stay}`.toLowerCase().includes(q)) return false;
  }
  return true;
}
