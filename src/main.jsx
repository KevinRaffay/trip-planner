import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);

// Offline shell, production only. Registered relative to the DOCUMENT (not
// this module, which lives under ./assets/) so the scope includes index.html
// and trip.json at a Pages sub-path.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI), { scope: './' })
      .catch(() => {});
  });
}

// A Home Screen app on iOS is suspended, not closed, so it keeps showing the
// version it loaded. When it comes back after a while, reload: navigations and
// trip.json are network-first, so this picks up a new deploy. The hash route
// (and filters in it) survives the reload.
if (import.meta.env.PROD) {
  const STALE_MS = 60 * 1000;
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > STALE_MS && navigator.onLine) window.location.reload();
  });
}
