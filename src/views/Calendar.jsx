import React, { useMemo, useState } from 'react';
import { addDays, dayOfWeek, dayOfMonth, monthIndex, monthName, parseDate, toIso } from '../lib/dates.js';
import { filtersFromQuery, dayMatches } from '../lib/filters.js';
import { hrefTo } from '../lib/route.js';
import { FilterBar, cityOf } from './common.jsx';

// Weeks (Sun-first) covering one month: leading/trailing cells outside the
// month are null so the grid stays rectangular.
// Clamped to the trip so May starts at the first trip day, not May 1.
function monthWeeks(year, month, trip) {
  const monthFirst = toIso(new Date(Date.UTC(year, month, 1)));
  const monthLast = toIso(new Date(Date.UTC(year, month + 1, 0)));
  const first = monthFirst > trip.start ? monthFirst : trip.start;
  const last = monthLast < trip.end ? monthLast : trip.end;
  const cells = [];
  for (let i = 0; i < dayOfWeek(first); i += 1) cells.push(null);
  for (let d = first; d <= last; d = addDays(d, 1)) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function Calendar({ data, route }) {
  const filters = useMemo(() => filtersFromQuery(route.query), [route.query]);
  const byDate = useMemo(() => new Map(data.days.map((d) => [d.date, d])), [data]);
  const months = useMemo(() => {
    const out = [];
    const start = parseDate(data.trip.start);
    const end = parseDate(data.trip.end);
    for (let y = start.getUTCFullYear(), m = start.getUTCMonth(); y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth());) {
      out.push({ year: y, month: m });
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }
    return out;
  }, [data]);
  const [active, setActive] = useState(0);
  const { year, month } = months[active];
  const shown = data.days.filter((d) => dayMatches(d, filters, data)).length;
  const matching = new Set(data.days.filter((d) => dayMatches(d, filters, data)).map((d) => d.date));

  return (
    <section>
      <h1>Calendar</h1>
      <FilterBar data={data} route={route} filters={filters} shown={shown} total={data.days.length} />
      <div className="segmented" role="tablist" aria-label="Month">
        {months.map((m, i) => (
          <button key={`${m.year}-${m.month}`} type="button" role="tab" aria-selected={i === active}
            className={`segmented__btn${i === active ? ' segmented__btn--on' : ''}`} onClick={() => setActive(i)}>
            {monthName(m.month)} {m.year}
          </button>
        ))}
      </div>
      <div className="cal" role="grid" aria-label={`${monthName(month)} ${year}`}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((n) => <div key={n} className="cal__dow" role="columnheader">{n}</div>)}
        {monthWeeks(year, month, data.trip).flat().map((date, i) => {
          const day = date && byDate.get(date);
          if (!day) return <div key={i} className="cal__cell cal__cell--empty" role="gridcell" aria-hidden="true" />;
          const dim = !matching.has(date);
          const legs = day.legs.map((id) => data.legs.find((l) => l.id === id));
          return (
            <a key={date} role="gridcell" href={hrefTo(`/day/${date}`, route)}
              className={`cal__cell${dim ? ' cal__cell--dim' : ''}${day.highlight ? ' cal__cell--hl' : ''}`}
              style={{ '--city': cityOf(data, day.city).color }}
              aria-label={`${monthName(monthIndex(date))} ${dayOfMonth(date)}: ${day.title}`}>
              <span className="cal__num">{dayOfMonth(date)}</span>
              <span className="cal__title">{day.title}</span>
              <span className="cal__badges">
                {legs.some((l) => l.mode === 'air') && <span title="Flight">✈</span>}
                {legs.some((l) => l.mode === 'train') && <span title="Train">🚆</span>}
                {day.tags.includes('concert') && <span title="Oasis">★</span>}
              </span>
            </a>
          );
        })}
      </div>
      <ul className="legend" aria-label="Legend">
        {data.cities.map((c) => <li key={c.id}><span className="dot" style={{ background: c.color }} /> {c.name}</li>)}
        <li>✈ Flight</li><li>🚆 Train</li><li>★ Oasis</li>
      </ul>
    </section>
  );
}
