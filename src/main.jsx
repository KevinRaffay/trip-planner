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
