import React, { useEffect, useRef, useState } from 'react';
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

const isActive = (route, name) => route.name === name || (name === 'itinerary' && route.name === 'day');

function TopBar({ route }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = NAV.find(([name]) => isActive(route, name))?.[2] ?? 'Menu';

  // Collapse after navigating, on Escape, and on a tap outside the header.
  useEffect(() => { setOpen(false); }, [route.name, route.date]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <header className="topbar" ref={ref}>
      <button type="button" className="topbar__toggle" aria-expanded={open} aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}>
        <span className="burger" aria-hidden="true"><span /><span /><span /></span>
        <span className="topbar__current">{current}</span>
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>
      <nav id="site-nav" className={`topbar__nav${open ? ' topbar__nav--open' : ''}`} aria-label="Sections">
        {NAV.map(([name, to, label]) => (
          <a key={name} href={hrefTo(to, name === 'itinerary' || name === 'calendar' ? route : null)}
            aria-current={isActive(route, name) ? 'page' : undefined}
            className={`topbar__link${isActive(route, name) ? ' topbar__link--on' : ''}`}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const route = useHashRoute();
  useTheme();

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
      <TopBar route={route} />
      <main className="main">{body}</main>
      <footer className="foot dim">
        {data ? `${data.trip.title} · ${data.trip.start} to ${data.trip.end} · estimates as of ${data.trip.asOf}` : ''}
      </footer>
    </div>
  );
}
