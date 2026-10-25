import React from 'react';
import { addDays, formatDay, diffDays } from '../lib/dates.js';
import { travelersOn } from '../lib/filters.js';
import { hrefTo } from '../lib/route.js';
import { placeUrl, dayRouteUrl } from '../lib/maps.js';
import { CityDot, GuideBlock, LegCard, MapLink, TourCard, cityOf, tagName } from './common.jsx';

export default function DayDetail({ data, date, route }) {
  const day = data.days.find((d) => d.date === date);
  if (!day) {
    return <p className="notice notice--error">No such day in this trip. <a href="#/itinerary">Back to the itinerary</a></p>;
  }
  const city = cityOf(data, day.city);
  const stay = data.stays.find((s) => s.id === day.stay);
  const legs = day.legs.map((id) => data.legs.find((l) => l.id === id));
  const tours = (day.tours ?? []).map((id) => data.tours.find((x) => x.id === id));
  const dayRoute = dayRouteUrl(day, stay);
  const guides = (data.guides ?? []).filter((g) => g.city === day.city);
  const prev = data.days.find((d) => d.date === addDays(date, -1));
  const next = data.days.find((d) => d.date === addDays(date, 1));
  const n = diffDays(data.trip.start, date) + 1;

  return (
    <section style={{ '--city': city.color }}>
      <p className="crumbs"><a href={hrefTo('/itinerary', route)}>← Itinerary</a></p>
      <p className="eyebrow"><CityDot data={data} id={day.city} /> {city.name} · Day {n} of {data.days.length}</p>
      <h1>{formatDay(date)}: {day.title}</h1>
      <div className="day__meta">{day.tags.map((t) => <span key={t} className={`tag tag--${t}`}>{tagName(data, t)}</span>)}</div>
      <p className="lead">{day.plan}</p>
      <p className="dim">With: {travelersOn(data.trip, date).join(', ')}</p>

      {day.places?.length > 0 && (
        <div className="block">
          <h2>Places</h2>
          <ul className="places">
            {day.places.map((p) => <li key={p.query}><MapLink href={placeUrl(p.query)}>{p.name}</MapLink></li>)}
          </ul>
          {dayRoute && <p><MapLink href={dayRoute} className="btn">Route for the day</MapLink></p>}
        </div>
      )}

      {tours.length > 0 && (
        <div className="block"><h2>Guided tours</h2><div className="grid">{tours.map((x) => <TourCard key={x.id} tour={x} />)}</div></div>
      )}

      {guides.map((g) => <GuideBlock key={g.id} guide={g} />)}

      {legs.length > 0 && (
        <div className="block"><h2>Getting around</h2><div className="grid">{legs.map((l) => <LegCard key={l.id} leg={l} showDate={false} />)}</div></div>
      )}

      {stay && (
        <div className="block">
          <h2>Where you're staying</h2>
          <article className="card">
            <h3 className="leg__route">{stay.hotel}</h3>
            <p className="dim">{stay.area} · {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)} · {stay.rate}</p>
            <p className="leg__note">{stay.blurb}</p>
            {stay.status !== 'tbd' && <p className="leg__map"><MapLink href={placeUrl(stay.query)}>Hotel on map</MapLink></p>}
          </article>
        </div>
      )}

      <nav className="pager" aria-label="Neighbouring days">
        {prev ? <a href={hrefTo(`/day/${prev.date}`, route)}>← {formatDay(prev.date)}</a> : <span />}
        {next ? <a href={hrefTo(`/day/${next.date}`, route)}>{formatDay(next.date)} →</a> : <span />}
      </nav>
    </section>
  );
}
