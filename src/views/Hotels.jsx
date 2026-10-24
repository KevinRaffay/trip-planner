import React from 'react';
import { formatDay } from '../lib/dates.js';
import { placeUrl } from '../lib/maps.js';
import { CityDot, MapLink, cityOf } from './common.jsx';

export default function Hotels({ data }) {
  return (
    <section>
      <h1>Hotels</h1>
      <p className="dim">Central stays, all under $700/night. {data.stays.reduce((n, s) => n + s.nights, 0)} nights across {data.stays.length} stays.</p>
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
    </section>
  );
}
