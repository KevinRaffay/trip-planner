// Export for Google My Maps (mymaps.google.com > Import). One CSV row per
// unique hotel or sight; My Maps geocodes the Address column, so no
// coordinates are needed. Built in the browser from trip.json, so the file
// always matches the plan on screen.
import { formatShort } from './dates.js';

export const MYMAPS_COLUMNS = ['Name', 'Address', 'Type', 'City', 'Days', 'Date', 'Description'];

const unique = (list) => [...new Set(list)];

/** One row per unique map query, earliest first, hotels before sights on the same date. */
export function myMapsRows(data) {
  const cityName = (id) => data.cities.find((c) => c.id === id)?.name ?? '';
  const byQuery = new Map();
  const add = (query, row) => {
    const hit = byQuery.get(query);
    if (!hit) { byQuery.set(query, { ...row, dates: [row.date], notes: [row.note] }); return; }
    hit.dates.push(row.date);
    hit.notes.push(row.note);
  };

  for (const s of data.stays) {
    add(s.query, {
      name: s.hotel, type: 'Hotel', city: cityName(s.city), date: s.checkIn,
      note: `${s.area}, ${formatShort(s.checkIn)} to ${formatShort(s.checkOut)}`,
    });
  }
  for (const d of data.days) {
    for (const p of d.places ?? []) {
      add(p.query, { name: p.name, type: 'Sight', city: cityName(d.city), date: d.date, note: `${formatShort(d.date)}: ${d.title}` });
    }
  }

  return [...byQuery.entries()]
    .map(([query, r]) => ({
      Name: r.name,
      Address: query,
      Type: r.type,
      City: r.city,
      Days: unique(r.dates).map(formatShort).join('; '),
      Date: r.date,
      Description: unique(r.notes).join(' | '),
    }))
    .sort((a, b) => a.Date.localeCompare(b.Date) || (a.Type === b.Type ? 0 : a.Type === 'Hotel' ? -1 : 1));
}

const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;

export function myMapsCsv(data) {
  const rows = myMapsRows(data);
  return [MYMAPS_COLUMNS.map(cell).join(','), ...rows.map((r) => MYMAPS_COLUMNS.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n';
}

export const MYMAPS_FILENAME = 'iberian-grand-tour-my-maps.csv';
