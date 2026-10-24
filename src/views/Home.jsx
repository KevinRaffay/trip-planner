import React from 'react';
import { diffDays, formatDay, todayLocal } from '../lib/dates.js';
import { CityDot, cityOf } from './common.jsx';

function countdown(trip) {
  const today = todayLocal();
  const until = diffDays(today, trip.start);
  if (until > 0) return `${until} day${until === 1 ? '' : 's'} to go`;
  if (today <= trip.end) return `Day ${diffDays(trip.start, today) + 1} of the trip`;
  return 'Welcome home';
}

export default function Home({ data }) {
  const { trip } = data;
  const total = data.days.length;
  const airCount = data.legs.filter((l) => l.mode === 'air').length;
  const trainCount = data.legs.filter((l) => l.mode === 'train').length;
  const open = data.bookingSequence.filter((b) => b.bookable.startsWith('YES'));

  return (
    <section>
      <div className="hero">
        <p className="eyebrow">{countdown(trip)}</p>
        <h1 className="hero__title">{trip.title}</h1>
        <p className="hero__sub">{trip.subtitle}</p>
        <p className="hero__dates">{formatDay(trip.start)} – {formatDay(trip.end)}, 2027 · {total} days</p>
        <p className="dim">{trip.travelers.map((p) => (p.from > trip.start ? `${p.name} (joins ${formatDay(p.from)})` : p.name)).join(' · ')}</p>
      </div>

      <div className="stats">
        <a className="stat" href="#/itinerary"><strong>{total}</strong><span>days</span></a>
        <a className="stat" href="#/hotels"><strong>{data.stays.reduce((n, s) => n + s.nights, 0)}</strong><span>hotel nights</span></a>
        <a className="stat" href="#/travel"><strong>{airCount}</strong><span>flights</span></a>
        <a className="stat" href="#/travel"><strong>{trainCount}</strong><span>train rides</span></a>
      </div>

      <div className="block">
        <h2>The route</h2>
        <div className="route" role="list">
          {data.days.reduce((segs, d) => {
            const last = segs[segs.length - 1];
            if (last && last.city === d.city && last.stay === d.stay) last.n += 1; else segs.push({ city: d.city, stay: d.stay, n: 1, from: d.date });
            return segs;
          }, []).map((s) => (
            <a key={s.from} role="listitem" className="route__seg" href={`#/day/${s.from}`}
              style={{ flexGrow: s.n, background: cityOf(data, s.city).color }} title={`${cityOf(data, s.city).name}: ${s.n} day${s.n === 1 ? '' : 's'} from ${formatDay(s.from)}`}>
              <span>{cityOf(data, s.city).name}</span>
            </a>
          ))}
        </div>
        <p className="dim">{trip.route}</p>
      </div>

      <div className="block">
        <p>{trip.summary}</p>
        <p><a className="btn" href="#/itinerary">Open the itinerary</a> <a className="btn btn--ghost" href="#/calendar">Calendar</a></p>
      </div>

      <div className="block">
        <h2>Highlights</h2>
        <ul className="notes">
          {data.days.filter((d) => d.highlight).map((d) => (
            <li key={d.date}><CityDot data={data} id={d.city} /> <a href={`#/day/${d.date}`}><strong>{formatDay(d.date)}</strong> · {d.title}</a></li>
          ))}
        </ul>
      </div>

      <div className="block">
        <h2>Bookable now</h2>
        <ul className="notes">
          {open.slice(0, 4).map((b) => <li key={b.item}><strong>{b.item}</strong> — {b.note}</li>)}
        </ul>
        <p><a href="#/plan">Full booking plan →</a></p>
      </div>
    </section>
  );
}
