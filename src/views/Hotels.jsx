import React from 'react';
import { formatDay } from '../lib/dates.js';
import { placeUrl } from '../lib/maps.js';
import { CityDot, MapLink, cityOf } from './common.jsx';

export default function Hotels({ data }) {
  return (
    <section>
      <h1>Hotels</h1>
      <p className="dim">Central stays; the Marriott/Autograph picks are all under $700/night.{' '}{data.stays.reduce((n, s) => n + s.nights, 0)} nights across {data.stays.length} stays.</p>
      <div className="grid">
        {data.stays.map((s) => (
          <article key={s.id} className="card" style={{ '--city': cityOf(data, s.city).color }}>
            <div className="leg__head">
              <h3 className="leg__route"><CityDot data={data} id={s.city} /> {s.hotel}</h3>
              <span className={`badge badge--${s.status === 'booked' ? 'ok' : 'go'}`}>{s.status === 'booked' ? 'Booked' : 'Bookable'}</span>
            </div>
            <dl className="facts">
              <dt>City</dt><dd>{cityOf(data, s.city).name} · {s.area}</dd>
              <dt>Stay</dt><dd>{formatDay(s.checkIn)} → {formatDay(s.checkOut)} ({s.nights} night{s.nights === 1 ? '' : 's'})</dd>
              <dt>Rate</dt><dd>{s.rate}</dd>
              <dt>Class</dt><dd>{'★'.repeat(s.stars)}</dd>
            </dl>
            <p className="leg__note">{s.blurb}</p>
            <p className="leg__map"><MapLink href={placeUrl(s.query)}>Open in Maps</MapLink></p>
          </article>
        ))}
      </div>
      <Alternatives data={data} />
    </section>
  );
}

const GROUPS = [
  ['marriott', 'Marriott Bonvoy'],
  ['ihg', 'IHG One Rewards'],
  ['eurostars', 'Eurostars'],
];

/** Per-city Marriott / IHG / Eurostars options, one collapsible block per city. */
function Alternatives({ data }) {
  const cities = data.cities.filter((c) => (data.alternatives ?? []).some((a) => a.city === c.id));
  return (
    <div className="block alts">
      <h2>Alternatives by city</h2>
      <p className="dim">
        A short list of well-located Marriott, IHG and Eurostars options per city, not every property.
        Brand portfolios and openings change, so confirm availability and rates on the chain's site before booking.
        Manchester is left out because that stay is booked.
      </p>
      {cities.map((c) => {
        const list = (data.alternatives ?? []).filter((a) => a.city === c.id);
        return (
          <details key={c.id} className="alt" style={{ '--city': c.color }}>
            <summary><CityDot data={data} id={c.id} /> {c.name} <span className="dim">· {list.length} options</span></summary>
            {GROUPS.map(([group, label]) => {
              const items = list.filter((a) => a.group === group);
              return (
                <div key={group} className="alt__group">
                  <h3>{label}</h3>
                  {items.length === 0 ? (
                    <p className="dim">None found in the central area.</p>
                  ) : (
                    <ul className="alt__list">
                      {items.map((a) => (
                        <li key={a.query}>
                          <strong>{a.name}</strong> <span className="dim">· {a.brand} · {a.area}</span>
                          {' '}<MapLink href={placeUrl(a.query)}>Map</MapLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </details>
        );
      })}
    </div>
  );
}
