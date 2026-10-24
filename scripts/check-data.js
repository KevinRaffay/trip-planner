import fs from 'node:fs';
import { validateTrip } from '../src/lib/validate.js';
import { placeUrl, dayRouteUrl, legUrl } from '../src/lib/maps.js';

const trip = JSON.parse(fs.readFileSync(new URL('../public/trip.json', import.meta.url), 'utf8'));
const problems = validateTrip(trip);

// Every Google Maps link the app can build must be a well-formed Maps URL.
if (!problems.length) {
  const check = (what, url) => {
    try {
      const u = new URL(url);
      if (u.origin !== 'https://www.google.com' || !u.pathname.startsWith('/maps/') || u.searchParams.get('api') !== '1') {
        problems.push(`${what}: not a Maps URLs link (${url})`);
      }
    } catch {
      problems.push(`${what}: not a valid URL (${url})`);
    }
  };
  let links = 0;
  for (const s of trip.stays) { check(`stay ${s.id}`, placeUrl(s.query)); links += 1; }
  for (const l of trip.legs) { check(`leg ${l.id}`, legUrl(l)); links += 1; }
  for (const d of trip.days) {
    for (const p of d.places ?? []) { check(`${d.date} place "${p.name}"`, placeUrl(p.query)); links += 1; }
    const route = dayRouteUrl(d, trip.stays.find((s) => s.id === d.stay));
    if (route) { check(`${d.date} route`, route); links += 1; }
  }
  console.log(`maps links OK: ${links}`);
}

if (problems.length) {
  console.error(`trip.json is not valid:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`trip.json OK: ${trip.days.length} days, ${trip.stays.length} stays, ${trip.legs.length} legs (${trip.legs.filter((l) => l.mode === 'air').length} air, ${trip.legs.filter((l) => l.mode === 'train').length} train)`);
