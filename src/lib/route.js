import { useEffect, useState } from 'react';
import { filtersFromQuery, filtersToQuery } from './filters.js';

// Hash routing: GitHub Pages answers unknown paths with its own 404, but a
// fragment never reaches the server, so every deep link survives a reload.

const SECTIONS = ['itinerary', 'calendar', 'travel', 'hotels', 'plan', 'report'];

function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const query = new URLSearchParams(qs);
  let m;
  if ((m = /^\/day\/(\d{4}-\d{2}-\d{2})$/.exec(path))) return { name: 'day', date: m[1], query };
  const section = path.replace(/^\//, '');
  if (SECTIONS.includes(section)) return { name: section, query };
  return { name: 'home', query };
}

export function useHashRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const routePath = (route) => (route.name === 'home' ? '/' : route.name === 'day' ? `/day/${route.date}` : `/${route.name}`);

/** Only the filter keys travel between pages; other query params stay local. */
export const filterQueryString = (route) => {
  const qs = filtersToQuery(filtersFromQuery(route.query)).toString();
  return qs ? `?${qs}` : '';
};

export const hrefTo = (path, route) => `#${path}${route ? filterQueryString(route) : ''}`;

export function setFilters(route, filters) {
  const qs = filtersToQuery(filters).toString();
  // replace, not push: toggling a chip should not fill the back button.
  window.history.replaceState(null, '', `#${routePath(route)}${qs ? `?${qs}` : ''}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
