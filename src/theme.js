// No theme toggle: the page just follows the OS light/dark setting, live.
// Sets the `.dark-theme` class on <html> that styles.css keys on.
import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    let mq = null;
    try { mq = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null; } catch { mq = null; }
    if (!mq) return undefined;
    const apply = () => document.documentElement.classList.toggle('dark-theme', mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
}
