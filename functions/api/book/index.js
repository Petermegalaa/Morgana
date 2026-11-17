// POST /api/book — public booking request from the website. Creates a *pending* booking that staff confirm
// on /staff once the deposit transfer is checked.
import {json, rid, normPhone, sha256} from '../../_lib.js';
import {clash, addDays} from '../../_bk.js';
import {quote, ITEM_LABEL} from '../../_price.js';
import {getHolidays} from '../../_holidays.js';

const clean = (s, n) => String(s ?? '').replace(/[<>]/g, '').trim().slice(0, n);

export async function onRequestPost({request, env}) {
  const body = await request.json().catch(() => ({}));
  if (body.website) return json({ok: true});                                   // honeypot
  if (!body.t || Date.now() - Number(body.t) < 6000) return json({error: 'slow'}, 400);
  const ip = request.headers.get('cf-connecting-ip') || '0';
  const ipKey = 'bip:' + (await sha256(ip)).slice(0, 16) + ':' + new Date().toISOString().slice(0, 10);
  const n = Number(await env.BOATS.get(ipKey) || 0);
  const LIMIT = new URL(request.url).hostname.endsWith('.pages.dev') ? 50 : 4;   // relaxed on the test copy only
  if (n >= LIMIT) return json({error: 'limit'}, 429);

  const date = clean(body.date, 10), today = new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
  const bad = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date <= today || date > addDays(today, 365)) bad.push('date');
  const name = clean(body.name, 60), phone = normPhone(body.phone);
  if (name.length < 2) bad.push('name');
  if (!phone) bad.push('phone');
  const boat = ['morgana', 'portofino2', 'coquette'].includes(body.boat) ? body.boat : 'morgana';
  const holiday = (await getHolidays(env)).includes(date);
  const q = quote({boat, trip: body.trip, date, holiday, fishing: !!body.fishing, h24: !!body.h24, rods: body.rods, bait: body.bait});
  if (!q.ok) bad.push(q.err === 'trip' ? 'trip' : 'date');
  const guests = Math.round(Number(body.guests) || 0);
  if (guests < 1 || (q.cap && guests > q.cap)) bad.push('guests');
  if (bad.length) return json({error: 'invalid', fields: bad}, 400);

  const b = {
    id: rid(10), tok: rid(14), created: Date.now(), by: 'الموقع', source: 'الموقع', status: 'pending',
    boat, trip: q.h24 ? 'h24m' : body.trip === 'sunset' ? 'sunset' : 'day', kind: q.fishing ? 'fishing' : 'outing',
    start: q.start, end: q.end, date, name, phone, phone2: normPhone(body.phone2) || '', guests,
    total: q.total, paid: 0, deposit: q.deposit, captain: '', lang: body.lang === 'en' ? 'en' : 'both', holiday,
    note: clean(body.note, 300),
    items: q.items.map(i => ({...i, ar: ITEM_LABEL[i.k].ar, en: ITEM_LABEL[i.k].en})),
  };
  if (await clash(env, b)) return json({error: 'taken'}, 409);
  await env.BOATS.put(`bk:${b.date}:${b.id}`, JSON.stringify(b));
  await env.BOATS.put('bi:' + b.id, b.date);
  await env.BOATS.put(ipKey, String(n + 1), {expirationTtl: 86400});
  return json({ok: true, id: b.id, tok: b.tok, ref: b.id.slice(0, 6).toUpperCase(), total: b.total, deposit: b.deposit, invoice: `/invoice/${b.id}/${b.tok}`});
}
