import React, { useMemo } from 'react';
import { formatDay, dayOfMonth, dowName } from '../lib/dates.js';
import { filtersFromQuery, dayMatches, isFiltering } from '../lib/filters.js';
import { hrefTo } from '../lib/route.js';
import { FilterBar, CityDot, cityOf, tagName } from './common.jsx';

export function DayCard({ data, day, route }) {
  const city = cityOf(data, day.city);
  const legs = day.legs.map((id) => data.legs.find((l) => l.id === id));
  return (
    <article className={`day${day.highlight ? ' day--hl' : ''}`} style={{ '--city': city.color }}>
      <a className="day__date" href={hrefTo(`/day/${day.date}`, route)} aria-label={`Open ${formatDay(day.date)}`}>
        <span className="day__dow">{dowName(day.date)}</span>
        <span className="day__num">{dayOfMonth(day.date)}</span>
      </a>
      <div className="day__body">
        <h3 className="day__title"><a href={hrefTo(`/day/${day.date}`, route)}>{day.title}</a></h3>
        <p className="day__plan">{day.plan}</p>
        <div className="day__meta">
          <span className="tag"><CityDot data={data} id={day.city} /> {city.name}</span>
          {day.tags.map((t) => <span key={t} className={`tag tag--${t}`}>{tagName(data, t)}</span>)}
          {legs.map((l) => (
            <span key={l.id} className="tag tag--leg">{l.mode === 'air' ? '✈' : '🚆'} {l.from.split(' (')[0]} → {l.to.split(' (')[0]}</span>
          ))}
          {data.trip.travelers.filter((p) => p.from === day.date && p.from > data.trip.start).map((p) => (
            <span key={p.name} className="tag tag--who">{p.name} joins</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Itinerary({ data, route }) {
  const filters = useMemo(() => filtersFromQuery(route.query), [route.query]);
  const shown = data.days.filter((d) => dayMatches(d, filters, data));

  // Group consecutive days by stay so each hotel segment gets a header.
  const groups = [];
  for (const d of shown) {
    const key = d.stay ?? 'transit';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.days.push(d); else groups.push({ key, stay: data.stays.find((s) => s.id === d.stay), city: d.city, days: [d] });
  }

  return (
    <section>
      <h1>Itinerary</h1>
      <FilterBar data={data} route={route} filters={filters} shown={shown.length} total={data.days.length} />
      {shown.length === 0 && <p className="notice">No days match these filters.</p>}
      {groups.map((g, i) => (
        <div key={`${g.key}-${i}`} className="segment">
          <h2 className="segment__head" style={{ '--city': cityOf(data, g.city).color }}>
            <CityDot data={data} id={g.city} /> {cityOf(data, g.city).name}
            {g.stay && <span className="segment__sub"> · {g.stay.hotel} · {formatDay(g.stay.checkIn)} – {formatDay(g.stay.checkOut)}</span>}
            {!g.stay && !isFiltering(filters) && <span className="segment__sub"> · overnight flight</span>}
          </h2>
          {g.days.map((d) => <DayCard key={d.date} data={data} day={d} route={route} />)}
        </div>
      ))}
    </section>
  );
}
