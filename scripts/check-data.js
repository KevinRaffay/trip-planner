import fs from 'node:fs';
import { validateTrip } from '../src/lib/validate.js';

const trip = JSON.parse(fs.readFileSync(new URL('../public/trip.json', import.meta.url), 'utf8'));
const problems = validateTrip(trip);
if (problems.length) {
  console.error(`trip.json is not valid:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`trip.json OK: ${trip.days.length} days, ${trip.stays.length} stays, ${trip.legs.length} legs (${trip.legs.filter((l) => l.mode === 'air').length} air, ${trip.legs.filter((l) => l.mode === 'train').length} train)`);
