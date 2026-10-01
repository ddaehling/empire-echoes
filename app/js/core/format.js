/**
 * format.js — every number, year and date the user reads passes through here,
 * so the whole atlas speaks with one voice.
 *
 * House rules encoded below:
 *   • Approximate years read "c. 1612", never "circa 1612" or "~1612".
 *   • Ranges use an en dash with no spaces: 1757–1858. Open ranges: "1815–present".
 *   • Dates read in British order: 12 August 1858.
 *   • Big numbers are grouped (1,204,000) and only made vague on request (1.2 million).
 *   • Anything unknown reads "unknown", never "N/A", "null" or an empty cell.
 */

const EN_DASH = '–';
const NBSP = ' ';
const UNKNOWN = 'unknown';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/* ---------------------------------------------------------------- years -- */

/**
 * year(1612)                      -> "1612"
 * year(1612, { circa:true })      -> "c. 1612"
 * year(-55)                       -> "55 BCE"
 * year(1612, { era:true })        -> "1612 CE"
 * Accepts a span-ish object too: year({ year:1612, circa:true }).
 */
export function year(y, opts = {}) {
  if (y && typeof y === 'object') { opts = { ...y, ...opts }; y = y.year ?? y.start ?? y.value; }
  if (y == null || y === '') return opts.unknown ?? UNKNOWN;
  if (typeof y === 'string') { const n = parseInt(y, 10); if (!Number.isFinite(n)) return y; y = n; }
  if (!isNum(y)) return opts.unknown ?? UNKNOWN;
  const abs = Math.abs(Math.trunc(y));
  let s = String(abs);
  if (y < 0) s += NBSP + 'BCE';
  else if (opts.era) s += NBSP + 'CE';
  if (opts.circa) s = 'c.' + NBSP + s;
  return s;
}

/**
 * yearRange(1757, 1858)                      -> "1757–1858"
 * yearRange(1815, null)                      -> "1815–present"
 * yearRange(1815, null, { open:'onwards' })  -> "1815 onwards"
 * yearRange(1612, 1612)                      -> "1612"
 * Flags: circaStart, circaEnd, present (label for an open end).
 */
export function yearRange(a, b, opts = {}) {
  const open = opts.open ?? opts.present ?? 'present';
  const start = year(a, { circa: opts.circaStart || opts.circa });
  if (a != null && b != null && a === b && !opts.circaEnd) return start;
  if (b == null || b === Infinity) {
    if (a == null) return opts.unknown ?? UNKNOWN;
    return open === 'onwards' ? start + ' onwards' : start + EN_DASH + open;
  }
  if (a == null) return 'until ' + year(b, { circa: opts.circaEnd });
  return start + EN_DASH + year(b, { circa: opts.circaEnd });
}

/** span({ start, end, circa, circaEnd }) -> "c. 1600–1858" */
export function span(s, opts = {}) {
  if (!s) return UNKNOWN;
  return yearRange(s.start ?? s.from, s.end ?? s.to, {
    circaStart: s.circa || s.circaStart, circaEnd: s.circaEnd, ...opts,
  });
}

/** century(1857) -> "19th century";  century(1857, {short:true}) -> "C19" */
export function century(y, { short = false } = {}) {
  if (!isNum(y)) return UNKNOWN;
  const c = y > 0 ? Math.floor((y - 1) / 100) + 1 : Math.floor(y / 100) - 1;
  return short ? 'C' + Math.abs(c) : ordinal(Math.abs(c)) + ' century' + (c < 0 ? ' BCE' : '');
}

/** decade(1857) -> "1850s" */
export function decade(y) { return isNum(y) ? Math.floor(y / 10) * 10 + 's' : UNKNOWN; }

/* ---------------------------------------------------------------- dates -- */

/**
 * date({ year:1858, month:8, day:2 })  -> "2 August 1858"   (month is 1-based)
 * date('1858-08-02')                   -> "2 August 1858"
 * date({ year:1858, month:8 })         -> "August 1858"
 * date({ year:1858 })                  -> "1858"
 * Options: circa, short ("2 Aug 1858"), numeric ("02/08/1858").
 */
export function date(input, opts = {}) {
  const d = parseDate(input);
  if (!d) return opts.unknown ?? UNKNOWN;
  const circa = opts.circa || d.circa;
  if (d.month == null) return year(d.year, { circa });
  const month = opts.short ? MONTHS[d.month - 1].slice(0, 3) : MONTHS[d.month - 1];
  if (opts.numeric) {
    const pad = (n) => String(n).padStart(2, '0');
    return (d.day ? pad(d.day) + '/' : '') + pad(d.month) + '/' + d.year;
  }
  const core = (d.day ? d.day + ' ' : '') + month + ' ' + Math.abs(d.year) + (d.year < 0 ? NBSP + 'BCE' : '');
  return circa ? 'c.' + NBSP + core : core;
}

/** Normalise "1858-08-02" | {year,month,day} | 1858 into {year, month, day, circa}. */
export function parseDate(input) {
  if (input == null || input === '') return null;
  if (isNum(input)) return { year: Math.trunc(input), month: null, day: null, circa: false };
  if (typeof input === 'string') {
    const m = /^(-?\d{1,4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(input.trim());
    if (!m) return null;
    return { year: +m[1], month: m[2] ? +m[2] : null, day: m[3] ? +m[3] : null, circa: /^c\.?\s|circa/i.test(input) };
  }
  if (typeof input === 'object') {
    const y = input.year ?? input.y;
    if (!isNum(y)) return input.date ? parseDate(input.date) : null;
    return { year: Math.trunc(y), month: input.month ?? null, day: input.day ?? null, circa: !!input.circa };
  }
  return null;
}

/* ------------------------------------------------------------ durations -- */

/**
 * duration(191)   -> "191 years"
 * duration(1)     -> "1 year"
 * duration(0)     -> "less than a year"
 * duration(191, { approx:true }) -> "almost 200 years"
 */
export function duration(years, opts = {}) {
  if (!isNum(years)) return UNKNOWN;
  const n = Math.round(years);
  if (n <= 0) return 'less than a year';
  if (opts.approx && n >= 25) {
    const step = n >= 200 ? 50 : n >= 80 ? 25 : 10;
    const near = Math.round(n / step) * step;
    if (near !== n) return (near > n ? 'almost ' : 'more than ') + near + ' years';
  }
  return number(n) + (n === 1 ? ' year' : ' years');
}

/** tenure(1757, 1947) -> "190 years" (inclusive-exclusive, the way an atlas counts). */
export function tenure(from, to) { return isNum(from) && isNum(to) ? duration(to - from) : UNKNOWN; }

/* -------------------------------------------------------------- numbers -- */

const GROUP = new Intl.NumberFormat('en-GB');

/** number(1204000) -> "1,204,000" */
export function number(n, opts = {}) {
  if (!isNum(n)) return opts.unknown ?? UNKNOWN;
  if (opts.dp != null) return n.toLocaleString('en-GB', { minimumFractionDigits: opts.dp, maximumFractionDigits: opts.dp });
  return GROUP.format(n);
}

/** compact(1204000) -> "1.2 million";  compact(940) -> "940" */
export function compact(n, opts = {}) {
  if (!isNum(n)) return opts.unknown ?? UNKNOWN;
  const abs = Math.abs(n), sign = n < 0 ? '-' : '';
  const units = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
  for (const [size, word] of units) {
    if (abs >= size) {
      const v = abs / size;
      return sign + (v >= 100 ? Math.round(v) : +v.toFixed(v >= 10 ? 0 : 1)) + ' ' + word;
    }
  }
  if (abs >= 1000 && opts.thousands) return sign + Math.round(abs / 1000) + ',000';
  return number(n);
}

/** percent(0.372) -> "37%";  percent(0.372, {dp:1}) -> "37.2%" */
export function percent(fraction, { dp = 0, ofTotal = null } = {}) {
  const v = ofTotal ? fraction / ofTotal : fraction;
  if (!isNum(v)) return UNKNOWN;
  return (v * 100).toFixed(dp) + '%';
}

/** ordinal(1) -> "1st", ordinal(22) -> "22nd" */
export function ordinal(n) {
  if (!isNum(n)) return UNKNOWN;
  const a = Math.abs(n) % 100, b = a % 10;
  const suffix = (a > 10 && a < 14) ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
  return number(n) + suffix;
}

/** area(2350000) -> "2,350,000 km²" */
export function area(km2, { compact: useCompact = true } = {}) {
  if (!isNum(km2)) return UNKNOWN;
  return (useCompact && km2 >= 1e6 ? compact(km2) : number(km2)) + NBSP + 'km²';
}

/* ----------------------------------------------------------------- text -- */

/** list(['a','b','c']) -> "a, b and c" */
export function list(items, { conjunction = 'and', max = 0, more = 'others' } = {}) {
  const a = (items || []).filter(x => x != null && x !== '').map(String);
  if (!a.length) return '';
  if (max && a.length > max) {
    const shown = a.slice(0, max);
    return shown.join(', ') + ' ' + conjunction + ' ' + (a.length - max) + ' ' + more;
  }
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' ' + conjunction + ' ' + a[a.length - 1];
}

/** plural(3, 'territory', 'territories') -> "3 territories" */
export function plural(n, singular, pluralForm) {
  const word = Math.abs(n) === 1 ? singular : (pluralForm || singular + 's');
  return number(n) + ' ' + word;
}

/** Turn a machine status id into readable text: "crown-colony" -> "Crown colony". */
export function statusLabel(id, labels) {
  if (!id) return UNKNOWN;
  if (labels && labels[id]) return labels[id];
  const s = String(id).replace(/[-_]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Sentence-safe truncation at a word boundary. */
export function truncate(text, max = 140) {
  const s = String(text || '');
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '') + '…';
}

export const dash = EN_DASH;
export const unknown = UNKNOWN;

export default {
  year, yearRange, span, century, decade,
  date, parseDate, duration, tenure,
  number, compact, percent, ordinal, area,
  list, plural, statusLabel, truncate, dash, unknown,
};
