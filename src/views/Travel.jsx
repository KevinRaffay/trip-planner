import React, { useState } from 'react';
import { LegCard } from './common.jsx';

const MODES = [['all', 'All'], ['air', 'Air'], ['train', 'Train']];

export default function Travel({ data }) {
  const [mode, setMode] = useState('all');
  const legs = [...data.legs].sort((a, b) => a.date.localeCompare(b.date));
  const count = (m) => legs.filter((l) => m === 'all' || l.mode === m).length;
  const sections = (mode === 'all' ? ['air', 'train'] : [mode]).map((m) => ({ mode: m, legs: legs.filter((l) => l.mode === m) }));

  return (
    <section>
      <h1>Travel</h1>
      <div className="segmented" role="tablist" aria-label="Mode">
        {MODES.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id}
            className={`segmented__btn${mode === id ? ' segmented__btn--on' : ''}`} onClick={() => setMode(id)}>
            {label} ({count(id)})
          </button>
        ))}
      </div>
      {sections.map((s) => (
        <div key={s.mode} className="block">
          <h2>{s.mode === 'air' ? '✈ Air' : '🚆 Train'}</h2>
          <div className="grid">{s.legs.map((l) => <LegCard key={l.id} leg={l} />)}</div>
        </div>
      ))}
      <div className="block">
        <h2>Public transport notes</h2>
        <ul className="notes">
          {data.transitNotes.map((n) => <li key={n.place}><strong>{n.place}:</strong> {n.text}</li>)}
        </ul>
      </div>
    </section>
  );
}
