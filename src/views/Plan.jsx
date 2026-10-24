import React from 'react';

const statusClass = (s) => (s === 'BOOKED' ? 'ok' : s.startsWith('YES') ? 'go' : 'wait');

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
