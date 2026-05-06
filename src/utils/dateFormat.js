// Date helpers for calendar-only values stored as 'YYYY-MM-DD'.
// Avoids the JS spec quirk where `new Date('YYYY-MM-DD')` is parsed as
// midnight UTC and then converted to the browser TZ — which silently rolls
// the displayed day back in negative-offset zones (e.g. America/Monterrey).

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})/;

const parseLocalDate = value => {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;
  const m = YMD_RE.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

export const formatGameDate = (value, locale = 'es-MX', options) => {
  const d = parseLocalDate(value);
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, options);
};

export const todayLocalISODate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
