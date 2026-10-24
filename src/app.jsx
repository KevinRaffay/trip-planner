import React, { useEffect, useState } from 'react';
import { validateTrip } from './lib/validate.js';
import { useHashRoute, hrefTo } from './lib/route.js';
import { useTheme } from './theme.js';
import Home from './views/Home.jsx';
import Itinerary from './views/Itinerary.jsx';
import Calendar from './views/Calendar.jsx';
import Travel from './views/Travel.jsx';
import Hotels from './views/Hotels.jsx';
import Plan from './views/Plan.jsx';
import DayDetail from './views/DayDetail.jsx';

const NAV = [
  ['home', '/', 'Home'],
  ['itinerary', '/itinerary', 'Itinerary'],
  ['calendar', '/calendar', 'Calendar'],
  ['travel', '/travel', 'Travel'],
  ['hotels', '/hotels', 'Hotels'],
  ['plan', '/plan', 'Plan'],
];

/** trip.json is a static asset beside index.html, so it moves with the deploy. */
async function loadTrip() {
  const res = await fetch(new URL('trip.json', document.baseURI), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`trip.json came back ${res.status}.`);
  const data = await res.json();
  const problems = validateTrip(data);
  if (problems.length) throw new Error(`trip.json is not valid:\n- ${problems.join('\n- ')}`);
  return data;
}

function TopBar({ route, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <a href="#/" className="topbar__brand">Iberian Grand Tour <span className="topbar__year">2027</span></a>
      <nav className="topbar__nav" aria-label="Sections">
        {NAV.map(([name, to, label]) => (
          <a key={name} href={hrefTo(to, name === 'itinerary' || name === 'calendar' ? route : null)}
            className={`topbar__link${route.name === name || (name === 'itinerary' && route.name === 'day') ? ' topbar__link--on' : ''}`}>
            {label}
          </a>
        ))}
      </nav>
      <button type="button" className="btn btn--ghost" onClick={onToggleTheme} title="Toggle theme">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const route = useHashRoute();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    let cancelled = false;
    loadTrip()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    // Cleanup must be a function, never a returned promise.
    return () => { cancelled = true; };
  }, []);

  // A route change is a new page; a filter tweak (same page) must not jump.
  const pageKey = route.name === 'day' ? `day-${route.date}` : route.name;
  useEffect(() => { window.scrollTo(0, 0); }, [pageKey]);

  let body;
  if (error) body = <div className="notice notice--error"><pre className="wrap">{error}</pre></div>;
  else if (!data) body = <p className="dim">Loading the trip…</p>;
  else if (route.name === 'itinerary') body = <Itinerary data={data} route={route} />;
  else if (route.name === 'calendar') body = <Calendar data={data} route={route} />;
  else if (route.name === 'travel') body = <Travel data={data} />;
  else if (route.name === 'hotels') body = <Hotels data={data} />;
  else if (route.name === 'plan') body = <Plan data={data} />;
  else if (route.name === 'day') body = <DayDetail data={data} date={route.date} route={route} />;
  else body = <Home data={data} />;

  return (
    <div className="app">
      <TopBar route={route} theme={theme} onToggleTheme={toggle} />
      <main className="main">{body}</main>
      <footer className="foot dim">
        {data ? `${data.trip.title} · ${data.trip.start} to ${data.trip.end} · estimates as of ${data.trip.asOf}` : ''}
      </footer>
    </div>
  );
}
