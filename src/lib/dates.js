// Trip dates are plain 'YYYY-MM-DD' strings. All math goes through UTC so a
// viewer's timezone can never shift a day.

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const toIso = (d) => d.toISOString().slice(0, 10);

export const addDays = (s, n) => {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};

export const dayOfWeek = (s) => parseDate(s).getUTCDay();
export const dowName = (s) => DOW[dayOfWeek(s)];
export const monthName = (m) => MONTHS[m];
export const monthIndex = (s) => parseDate(s).getUTCMonth();
export const dayOfMonth = (s) => parseDate(s).getUTCDate();

/** "Sat, May 22" */
export const formatDay = (s) => `${dowName(s)}, ${MONTHS[monthIndex(s)].slice(0, 3)} ${dayOfMonth(s)}`;
/** "May 22" */
export const formatShort = (s) => `${MONTHS[monthIndex(s)].slice(0, 3)} ${dayOfMonth(s)}`;

export const diffDays = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);

/** The viewer's local calendar date as 'YYYY-MM-DD'. */
export const todayLocal = () => {
  const n = new Date();
  const p = (v) => String(v).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
};
