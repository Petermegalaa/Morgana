// Egypt public holidays, imported from Google Calendar's public "Holidays in Egypt" calendar.
// Only events marked "Public holiday" count (observances are ignored). Cached in KV for 12 hours.
const ICS = 'https://calendar.google.com/calendar/ical/en.eg%23holiday%40group.v.calendar.google.com/public/basic.ics';

export function parseIcs(txt) {
  const out = new Set();
  const un = txt.replace(/\r?\n[ \t]/g, '');                       // unfold long lines
  for (const ev of un.split('BEGIN:VEVENT').slice(1)) {
    const desc = (ev.match(/\nDESCRIPTION[^:]*:(.*)/) || [])[1] || '';
    if (!/public holiday/i.test(desc)) continue;
    const s = (ev.match(/\nDTSTART[^:]*:(\d{8})/) || [])[1];
    const e = (ev.match(/\nDTEND[^:]*:(\d{8})/) || [])[1];
    if (!s) continue;
    const iso = x => `${x.slice(0, 4)}-${x.slice(4, 6)}-${x.slice(6, 8)}`;
    const t = new Date(iso(s) + 'T12:00:00Z'), end = e ? new Date(iso(e) + 'T12:00:00Z') : new Date(t.getTime() + 864e5);
    for (let i = 0; t < end && i < 10; i++) { out.add(t.toISOString().slice(0, 10)); t.setUTCDate(t.getUTCDate() + 1); }
  }
  return [...out].sort();
}

export async function getHolidays(env) {
  const raw = await env.BOATS.get('hol');
  const c = raw ? JSON.parse(raw) : null;
  if (c && Date.now() - c.at < 12 * 3600e3) return c.dates;
  try {
    const r = await fetch(ICS, {cf: {cacheTtl: 3600}});
    if (!r.ok) throw new Error(r.status);
    const dates = parseIcs(await r.text());
    if (dates.length) { await env.BOATS.put('hol', JSON.stringify({at: Date.now(), dates})); return dates; }
  } catch (e) {}
  return c ? c.dates : [];
}
