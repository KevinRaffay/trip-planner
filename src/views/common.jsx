import React from 'react';
import { formatDay } from '../lib/dates.js';
import { EMPTY_FILTERS, isFiltering } from '../lib/filters.js';
import { setFilters } from '../lib/route.js';
import { legUrl, legLinkLabel, placeUrl } from '../lib/maps.js';

export const cityOf = (data, id) => data.cities.find((c) => c.id === id);
export const tagName = (data, id) => data.tags.find((t) => t.id === id)?.name ?? id;

export const STATUS = {
  booked: { label: 'Booked', cls: 'ok' },
  bookable: { label: 'Bookable now', cls: 'go' },
  'opens-later': { label: 'Opens later', cls: 'wait' },
  optional: { label: 'Optional', cls: 'dim' },
};

export function StatusBadge({ leg }) {
  const s = STATUS[leg.status] ?? STATUS.optional;
  const label = leg.status === 'opens-later' && leg.opens ? `Opens ${leg.opens}` : s.label;
  return <span className={`badge badge--${s.cls}`}>{label}</span>;
}

export function CityDot({ data, id }) {
  return <span className="dot" style={{ background: cityOf(data, id)?.color }} aria-hidden="true" />;
}

/** A ranked "where to eat" list for a city, each spot with a Maps link. */
export function GuideBlock({ guide }) {
  return (
    <div className="block">
      <h2>{guide.title}</h2>
      {guide.intro && <p className="dim">{guide.intro}</p>}
      <ol className="guide">
        {guide.spots.map((s) => (
          <li key={s.query}>
            <div className="guide__head">
              <strong>{s.name}</strong>
              {s.pick && <span className="badge badge--ok">Top pick</span>}
              <MapLink href={placeUrl(s.query)}>Map</MapLink>
            </div>
            <p className="dim small">{s.address}</p>
            <p className="guide__note">{s.note}</p>
          </li>
        ))}
      </ol>
      {guide.tip && <p className="notice">{guide.tip}</p>}
    </div>
  );
}

export const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Tour status. "In cart" is not booked and "reserved" is not yet paid: say so. */
export const TOUR_STATUS = {
  'in-cart': { label: 'In cart, not booked', short: 'In cart', cls: 'wait' },
  reserved: { label: 'Reserved, pay later', short: 'Reserved', cls: 'go' },
  booked: { label: 'Booked', short: 'Booked', cls: 'ok' },
};

/** A guided tour (from a shopping cart or a reservation). */
export function TourCard({ tour }) {
  const s = TOUR_STATUS[tour.status] ?? TOUR_STATUS['in-cart'];
  return (
    <article className="leg leg--tour">
      <div className="leg__head">
        <span className="leg__icon" aria-hidden="true">🎟</span>
        <h3 className="leg__route">{tour.name}</h3>
        <span className={`badge badge--${s.cls}`}>{s.label}</span>
      </div>
      <dl className="facts">
        <dt>When</dt><dd>{formatDay(tour.date)}, {tour.time}</dd>
        <dt>Via</dt><dd>{tour.vendor}</dd>
        <dt>Party</dt><dd>{tour.party} ({tour.travelers.join(', ')})</dd>
        <dt>Price</dt><dd>{money(tour.price)}</dd>
        {tour.chargeOn && <><dt>Charged</dt><dd>Card charged {formatDay(tour.chargeOn)}</dd></>}
        {tour.cancelBy && <><dt>Cancel</dt><dd>Free until {formatDay(tour.cancelBy)}</dd></>}
      </dl>
      {tour.note && <p className="leg__note">{tour.note}</p>}
    </article>
  );
}

const modeIcon = (mode) => (mode === 'air' ? '✈' : '🚆');

/** External Google Maps link; opens the Maps app on a phone. */
export function MapLink({ href, children, className = 'maplink' }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">📍</span> {children}<span className="sr-only"> (opens Google Maps)</span>
    </a>
  );
}

/** One transport leg, used on the Travel page and inside day cards. */
export function LegCard({ leg, showDate = true }) {
  return (
    <article className={`leg leg--${leg.mode}`}>
      <div className="leg__head">
        <span className="leg__icon" aria-hidden="true">{modeIcon(leg.mode)}</span>
        <h3 className="leg__route">{leg.from} <span className="dim">→</span> {leg.to}</h3>
        <StatusBadge leg={leg} />
      </div>
      <dl className="facts">
        {showDate && <><dt>Date</dt><dd>{formatDay(leg.date)}</dd></>}
        <dt>Carrier</dt><dd>{leg.carrier}</dd>
        <dt>Class</dt><dd>{leg.cls}</dd>
        {leg.depart && <><dt>Departs</dt><dd>{leg.depart}</dd></>}
        {leg.arrive && <><dt>Arrives</dt><dd>{leg.arrive}</dd></>}
        <dt>Duration</dt><dd>{leg.duration}</dd>
        <dt>Fare (pp)</dt><dd>{leg.fare}</dd>
        <dt>Who</dt><dd>{leg.travelers.join(', ')}</dd>
      </dl>
      {leg.note && <p className="leg__note">{leg.note}</p>}
      <p className="leg__map"><MapLink href={legUrl(leg)}>{legLinkLabel(leg)}</MapLink></p>
    </article>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <button type="button" className={`chip${active ? ' chip--on' : ''}`} aria-pressed={active} onClick={onClick}
      style={active && color ? { background: color, borderColor: color, color: '#fff' } : undefined}>
      {children}
    </button>
  );
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Filter controls shared by Itinerary and Calendar; state lives in the URL. */
export function FilterBar({ data, route, filters, shown, total }) {
  const set = (patch) => setFilters(route, { ...filters, ...patch });
  const active = isFiltering(filters);
  return (
    <section className="filters" aria-label="Filter days">
      <input className="field" type="search" placeholder="Search days, places, hotels…" value={filters.q}
        onChange={(e) => set({ q: e.target.value })} aria-label="Search days" />
      <div className="filters__group" role="group" aria-label="Cities">
        {data.cities.map((c) => (
          <Chip key={c.id} color={c.color} active={filters.cities.includes(c.id)} onClick={() => set({ cities: toggle(filters.cities, c.id) })}>
            <CityDot data={data} id={c.id} /> {c.name}
          </Chip>
        ))}
      </div>
      <div className="filters__group" role="group" aria-label="Day types">
        {data.tags.map((t) => (
          <Chip key={t.id} active={filters.tags.includes(t.id)} onClick={() => set({ tags: toggle(filters.tags, t.id) })}>{t.name}</Chip>
        ))}
      </div>
      <p className="filters__status dim" aria-live="polite">
        Showing {shown} of {total} days
        {active && <> · <button type="button" className="linkbtn" onClick={() => setFilters(route, EMPTY_FILTERS)}>Clear filters</button></>}
      </p>
    </section>
  );
}
