import React from 'react';
import { myMapsCsv, myMapsRows, MYMAPS_FILENAME } from '../lib/mymaps.js';

const statusClass = (s) => (s === 'BOOKED' ? 'ok' : s.startsWith('YES') ? 'go' : 'wait');

function downloadMyMapsCsv(data) {
  const url = URL.createObjectURL(new Blob([myMapsCsv(data)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = MYMAPS_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MyMapsBlock({ data }) {
  const count = myMapsRows(data).length;
  return (
    <div className="block">
      <h2>Map the whole trip in Google My Maps</h2>
      <p>
        Every hotel and sight ({count} places) in one file. Import it once into
        {' '}<a href="https://www.google.com/maps/d/" target="_blank" rel="noopener noreferrer">Google My Maps</a>{' '}
        to see the full trip as pins, also in the Google Maps app. It does not update itself, so download it again after the plan changes.
      </p>
      <p><button type="button" className="btn" onClick={() => downloadMyMapsCsv(data)}>Download CSV for My Maps</button></p>
      <ol className="notes">
        <li>In My Maps choose <strong>Create a new map</strong>, then <strong>Import</strong> and pick the downloaded file.</li>
        <li>For the pin position choose the <strong>Address</strong> column, and for the pin title choose <strong>Name</strong>.</li>
        <li>Open the layer's <strong>Style</strong> menu and set <strong>Group places by</strong> City (a color per city) or Type (hotels vs sights).</li>
        <li>Flights and train rides are not drawn; the Travel page has a map link for each.</li>
      </ol>
    </div>
  );
}

export default function Plan({ data }) {
  return (
    <section>
      <h1>Plan</h1>

      <MyMapsBlock data={data} />

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
