// Google Maps deep links (the Maps URLs API). No API key, no SDK: these are
// plain https://www.google.com/maps links that open the Maps app on a phone.
// Everything is built from trip.json data; nothing is hard-coded.

const BASE = 'https://www.google.com/maps';

// Google caps `waypoints` at 9; the validator keeps days well under that.
export const MAX_PLACES_PER_DAY = 8;

export function placeUrl(query) {
  const p = new URLSearchParams({ api: '1', query });
  return `${BASE}/search/?${p}`;
}

export function directionsUrl({ origin, destination, waypoints = [], mode }) {
  const p = new URLSearchParams({ api: '1', destination });
  if (origin) p.set('origin', origin);
  if (waypoints.length) p.set('waypoints', waypoints.join('|'));
  if (mode) p.set('travelmode', mode);
  return `${BASE}/dir/?${p}`;
}

/**
 * The day's stops in order, on foot. City days start at the hotel; day trips
 * (Toledo, Cordoba, Liverpool...) start at the first stop, since the hotel is
 * in another town and the train there is its own leg. One stop is a place link.
 */
export function dayRouteUrl(day, stay) {
  if (stay?.status === 'tbd') stay = undefined; // no hotel chosen yet: start at the first stop
  // Tour days whose stops are towns apart (Sintra, Toledo/Segovia...) opt out: a walking route would be nonsense.
  if (day.route === false) return null;
  const stops = (day.places ?? []).map((p) => p.query);
  if (stops.length === 0) return null;
  const daytrip = day.tags.includes('daytrip');
  if (stops.length === 1 && (daytrip || !stay)) return placeUrl(stops[0]);
  const origin = !daytrip && stay ? stay.query : stops[0];
  const rest = origin === stops[0] ? stops.slice(1) : stops;
  if (rest.length === 0) return placeUrl(stops[0]);
  return directionsUrl({
    origin,
    destination: rest[rest.length - 1],
    waypoints: rest.slice(0, -1),
    mode: 'walking',
  });
}

/** Trains get transit directions; flights have no routing mode, so link the arrival airport. */
export function legUrl(leg) {
  if (leg.mode === 'train') return directionsUrl({ origin: leg.from, destination: leg.to, mode: 'transit' });
  return placeUrl(`${leg.to} airport`);
}

export const legLinkLabel = (leg) => (leg.mode === 'train' ? 'Directions' : 'Airport map');
