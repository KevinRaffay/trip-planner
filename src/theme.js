// Light/dark: an explicit choice in localStorage wins, otherwise follow the OS
// live. Same `.dark-theme` class on <html> that styles.css keys on.
import { useEffect, useState } from 'react';

const KEY = 'trip_planner_prefs';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(prefs) {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* no persistence, still works */ }
}
const osTheme = () => {
  try { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
};
const activeTheme = () => {
  const t = read().theme;
  return t === 'light' || t === 'dark' ? t : osTheme();
};

export function useTheme() {
  const [theme, setTheme] = useState(activeTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    let mq = null;
    try { mq = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null; } catch { mq = null; }
    if (!mq) return undefined;
    const onChange = () => { if (!read().theme) setTheme(osTheme()); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    write({ ...read(), theme: next });
    setTheme(next);
  };
  return { theme, toggle };
}
