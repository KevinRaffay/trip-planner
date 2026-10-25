import React from 'react';
import { formatDay } from '../lib/dates.js';
import { money, TOUR_STATUS } from './common.jsx';

const statusClass = (s) => (s === 'BOOKED' ? 'ok' : s.startsWith('YES') ? 'go' : 'wait');

function ToursBlock({ data }) {
  const tours = [...data.tours].sort((a, b) => a.date.localeCompare(b.date));
  const total = tours.reduce((n, t) => n + t.price, 0);
  const inCart = tours.some((t) => t.status === 'in-cart');
  return (
    <div className="block">
      <h2>Guided tours</h2>
      {inCart && <p className="dim">Items still in the thetourguy.com shopping cart are not booked until checkout. Free cancellation runs to the day before each tour.</p>}
      {tours.some((t) => t.status === 'reserved') && <p className="dim">Reserved tours are held but not yet paid; the card is charged on the date in the tour's note.</p>}
      <div className="tablewrap">
        <table className="table">
          <thead><tr><th>When</th><th>Tour</th><th>Party</th><th>Status</th><th className="num">Price</th></tr></thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td data-label="When"><a href={`#/day/${t.date}`}>{formatDay(t.date)}</a>, {t.time}</td>
                <td data-label="Tour">{t.name}{t.note && <span className="dim small"> {t.note}</span>}</td>
                <td data-label="Party">{t.party}</td>
                <td data-label="Status"><span className={`badge badge--${TOUR_STATUS[t.status].cls}`}>{TOUR_STATUS[t.status].short}</span></td>
                <td data-label="Price" className="num">{money(t.price)}</td>
              </tr>
            ))}
            <tr className="table__total"><td colSpan={4}><strong>Total ({tours.length} tours)</strong></td><td className="num"><strong>{money(total)}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Plan({ data }) {
  return (
    <section>
      <h1>Plan</h1>

      <div className="block">
        <h2>Confirmed bookings</h2>
        <div className="grid">
          {data.bookings.map((b) => (
            <article key={b.what} className="card">
              <div className="leg__head"><h3 className="leg__route">{b.what}</h3><span className="badge badge--ok">Confirmed</span></div>
              <p className="dim">{b.when}</p>
              <p className="leg__note">{b.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <ToursBlock data={data} />

      <div className="block">
        <h2>What to book, and when</h2>
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Item</th><th>Bookable</th><th>Notes</th></tr></thead>
            <tbody>
              {data.bookingSequence.map((b) => (
                <tr key={b.item}>
                  <td data-label="Item">{b.item}</td>
                  <td data-label="Bookable"><span className={`badge badge--${statusClass(b.bookable)}`}>{b.bookable}</span></td>
                  <td data-label="Notes">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="block">
        <h2>Estimated cost, all three travelers</h2>
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Item</th><th>Detail</th><th className="num">Estimate (USD)</th></tr></thead>
            <tbody>
              {data.costs.map((c) => (
                <tr key={c.item}><td data-label="Item">{c.item}</td><td data-label="Detail">{c.detail}</td><td data-label="Estimate" className="num">{c.estimate}</td></tr>
              ))}
              <tr className="table__total"><td colSpan={2}><strong>Total</strong></td><td className="num"><strong>{data.costTotal}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p>{data.costNote}</p>
      </div>

      <p className="dim small">{data.trip.disclaimer}</p>
    </section>
  );
}
