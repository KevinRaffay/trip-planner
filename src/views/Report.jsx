import React from 'react';
import { formatDay, formatShort } from '../lib/dates.js';
import { cityOf, money, TOUR_STATUS } from './common.jsx';

const GROUPS = [['marriott', 'Marriott Bonvoy'], ['ihg', 'IHG One Rewards'], ['eurostars', 'Eurostars']];
const LEG_STATUS = { booked: 'Booked', bookable: 'Bookable now', tbd: 'To be decided', 'opens-later': 'Opens later', optional: 'Optional' };

/** The whole trip as one printable document (Print / Save as PDF). */
export default function Report({ data }) {
  const { trip } = data;
  const legs = [...data.legs].sort((a, b) => a.date.localeCompare(b.date));
  const tours = [...data.tours].sort((a, b) => a.date.localeCompare(b.date));
  const tourTotal = tours.reduce((n, t) => n + (t.price ?? 0), 0);

  // Day-by-day, grouped by consecutive hotel stay (transit days form their own group).
  const groups = [];
  for (const d of data.days) {
    const key = d.stay ?? 'transit';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.days.push(d);
    else groups.push({ key, stay: data.stays.find((s) => s.id === d.stay), city: d.city, days: [d] });
  }

  return (
    <article className="report">
      <div className="no-print report__bar">
        <button type="button" className="btn" onClick={() => window.print()}>Print / Save as PDF</button>
        <p className="dim small">
          In the print dialog choose <strong>Save as PDF</strong> as the destination. For a clean page, turn off
          "Headers and footers"; the report always prints in light colors.
        </p>
      </div>

      <header className="report__title">
        <h1>{trip.title}</h1>
        <p className="report__sub">{trip.subtitle}</p>
        <p>{formatDay(trip.start)} – {formatDay(trip.end)}, 2027 · {data.days.length} days</p>
        <p>{trip.travelers.map((p) => (p.from > trip.start ? `${p.name} (joins ${formatShort(p.from)})` : p.name)).join(' · ')}</p>
        <p className="dim">{trip.route}</p>
      </header>
      <p>{trip.summary}</p>

      <section>
        <h2>Trip at a glance</h2>
        <table className="table">
          <thead><tr><th>Dates</th><th>City</th><th>Hotel</th></tr></thead>
          <tbody>
            {data.stays.map((s) => (
              <tr key={s.id}>
                <td data-label="Dates" className="nowrap">{formatShort(s.checkIn)} – {formatShort(s.checkOut)} ({s.nights} night{s.nights === 1 ? '' : 's'})</td>
                <td data-label="City">{cityOf(data, s.city).name}</td>
                <td data-label="Hotel">{s.hotel}{s.status === 'booked' ? ' (booked)' : ''}, {s.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Confirmed bookings</h2>
        <table className="table">
          <thead><tr><th>What</th><th>When</th><th>Details</th></tr></thead>
          <tbody>
            {data.bookings.map((b) => (
              <tr key={b.what}><td data-label="What">{b.what}</td><td data-label="When" className="nowrap">{b.when}</td><td data-label="Details">{b.detail}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Getting there and around</h2>
        <table className="table">
          <thead><tr><th>Date</th><th>Leg</th><th>Carrier / class</th><th>Times</th><th>Fare (pp)</th><th>Status</th></tr></thead>
          <tbody>
            {legs.map((l) => (
              <tr key={l.id}>
                <td data-label="Date" className="nowrap">{formatDay(l.date)}</td>
                <td data-label="Leg">{l.mode === 'air' ? 'Flight' : 'Train'}: {l.from} to {l.to}{l.travelers.length === 1 ? ` (${l.travelers[0]})` : ''}</td>
                <td data-label="Carrier">{l.carrier}, {l.cls}</td>
                <td data-label="Times">{[l.depart && `Dep ${l.depart}`, l.arrive && `arr ${l.arrive}`, l.duration].filter(Boolean).join(' · ')}</td>
                <td data-label="Fare">{l.fare}</td>
                <td data-label="Status">{LEG_STATUS[l.status]}{l.status === 'opens-later' && l.opens ? ` (${l.opens})` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Public transport notes</h3>
        <ul className="notes">
          {data.transitNotes.map((n) => <li key={n.place}><strong>{n.place}:</strong> {n.text}</li>)}
        </ul>
      </section>

      <section>
        <h2>Hotels</h2>
        <table className="table">
          <thead><tr><th>Hotel</th><th>Stay</th><th>Rate</th><th>Notes</th></tr></thead>
          <tbody>
            {data.stays.map((s) => (
              <tr key={s.id}>
                <td data-label="Hotel"><strong>{s.hotel}</strong><br />{cityOf(data, s.city).name}, {s.area}</td>
                <td data-label="Stay" className="nowrap">{formatShort(s.checkIn)} – {formatShort(s.checkOut)}</td>
                <td data-label="Rate" className="nowrap">{s.rate}</td>
                <td data-label="Notes">{s.blurb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Day by day</h2>
        {groups.map((g, i) => (
          <div key={`${g.key}-${i}`} className="report__group">
            <h3>{cityOf(data, g.city).name}{g.stay ? ` · ${g.stay.hotel} · ${formatShort(g.stay.checkIn)} – ${formatShort(g.stay.checkOut)}` : ' · overnight flight'}</h3>
            <table className="table">
              <tbody>
                {g.days.map((d) => (
                  <tr key={d.date}>
                    <td data-label="Day" className="report__date">{formatDay(d.date)}</td>
                    <td data-label="Plan">
                      <strong>{d.title}.</strong> {d.plan}
                      {d.legs.map((id) => {
                        const l = data.legs.find((x) => x.id === id);
                        return <div key={id} className="report__line">{l.mode === 'air' ? 'Flight' : 'Train'}: {l.from} to {l.to} ({l.carrier})</div>;
                      })}
                      {(d.links ?? []).map((l) => <div key={l.url} className="report__line">Link: {l.label} ({l.url})</div>)}
                      {(d.tours ?? []).map((id) => {
                        const t = data.tours.find((x) => x.id === id);
                        return <div key={id} className="report__line">Tour {t.time}: {t.name} ({TOUR_STATUS[t.status].label})</div>;
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {(data.guides ?? []).map((g) => (
        <section key={g.id}>
          <h2>{cityOf(data, g.city).name}: {g.title.replace(/^Where to eat: /, 'where to eat, ')}</h2>
          <table className="table">
            <thead><tr><th>#</th><th>Place</th><th>Notes</th></tr></thead>
            <tbody>
              {g.spots.map((s) => (
                <tr key={s.query}>
                  <td data-label="#">{s.rank}</td>
                  <td data-label="Place"><strong>{s.name}</strong><br />{s.address}</td>
                  <td data-label="Notes">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {g.tip && <p>{g.tip}</p>}
          {g.source && <p className="dim small">Source: {g.source.name}, {g.source.url}. Summarized, not quoted.</p>}
        </section>
      ))}

      <section>
        <h2>Guided tours</h2>
        <table className="table">
          <thead><tr><th>When</th><th>Tour</th><th>Party</th><th>Status</th><th className="num">Price</th></tr></thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td data-label="When" className="nowrap">{formatDay(t.date)}, {t.time}</td>
                <td data-label="Tour">{t.name} ({t.vendor}){t.note ? ` ${t.note}` : ''}</td>
                <td data-label="Party">{t.party}</td>
                <td data-label="Status">{TOUR_STATUS[t.status].label}{t.cancelBy ? `; free cancellation until ${formatShort(t.cancelBy)}` : ''}</td>
                <td data-label="Price" className="num">{t.price === null ? 'n/a' : money(t.price)}</td>
              </tr>
            ))}
            <tr className="table__total"><td colSpan={4}><strong>Total ({tours.length} tours)</strong></td><td className="num"><strong>{money(tourTotal)}</strong></td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>What to book, and when</h2>
        <table className="table">
          <thead><tr><th>Item</th><th>Bookable</th><th>Notes</th></tr></thead>
          <tbody>
            {data.bookingSequence.map((b) => (
              <tr key={b.item}><td data-label="Item">{b.item}</td><td data-label="Bookable">{b.bookable}</td><td data-label="Notes">{b.note}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Estimated cost, all three travelers</h2>
        <table className="table">
          <thead><tr><th>Item</th><th>Detail</th><th className="num">Estimate (USD)</th></tr></thead>
          <tbody>
            {data.costs.map((c) => (
              <tr key={c.item}><td data-label="Item">{c.item}</td><td data-label="Detail">{c.detail}</td><td data-label="Estimate" className="num">{c.estimate}</td></tr>
            ))}
            <tr className="table__total"><td colSpan={2}><strong>Total</strong></td><td className="num"><strong>{data.costTotal}</strong></td></tr>
          </tbody>
        </table>
        <p>{data.costNote}</p>
      </section>

      <section>
        <h2>Hotel alternatives</h2>
        <p className="dim small">A short list of Marriott, IHG and Eurostars options per city, not every property. Confirm availability and rates on the chain's site.</p>
        {data.cities.filter((c) => (data.alternatives ?? []).some((a) => a.city === c.id)).map((c) => (
          <div key={c.id} className="report__group">
            <h3>{c.name}</h3>
            {GROUPS.map(([group, label]) => {
              const items = data.alternatives.filter((a) => a.city === c.id && a.group === group);
              return (
                <p key={group} className="report__alts">
                  <strong>{label}:</strong> {items.length ? items.map((a) => `${a.name} (${a.area})`).join('; ') : 'none found in the central area'}
                </p>
              );
            })}
          </div>
        ))}
      </section>

      <p className="dim small">{trip.disclaimer}</p>
      <p className="dim small">Plan as of {trip.asOf}. Fares and rates are estimates and will vary with booking date and availability.</p>
    </article>
  );
}
