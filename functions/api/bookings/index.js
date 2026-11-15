import {json, rid, normPhone} from '../../_lib.js';
import {who, deny, listBookings, clash, getCfg} from '../../_bk.js';

const clean = (s, n) => String(s ?? '').replace(/[<>]/g, '').trim().slice(0, n);
const num = v => Math.max(0, Math.round(Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0));
const okDT = s => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s);

// Builds/validates a booking from the posted body. Shared with [id].js.
export async function shape(env, body, prev = {}) {
  const cfg = await getCfg(env);
  const b = {
    ...prev,
    boat: clean(body.boat, 30), trip: clean(body.trip, 20), kind: body.kind === 'fishing' ? 'fishing' : 'outing',
    start: clean(body.start, 16), end: clean(body.end, 16),
    name: clean(body.name, 60), phone: normPhone(body.phone) || '', phone2: normPhone(body.phone2) || '',
    guests: num(body.guests), total: num(body.total), paid: num(body.paid),
    captain: clean(body.captain, 60), lang: body.lang === 'en' ? 'en' : 'ar',
    holiday: !!body.holiday, note: clean(body.note, 400), source: clean(body.source, 30),
  };
  const bad = [];
  if (!cfg.boats.some(x => x.id === b.boat)) bad.push('boat');
  if (!okDT(b.start) || !okDT(b.end) || b.end <= b.start) bad.push('time');
  if (!b.name) bad.push('name');
  if (!b.phone) bad.push('phone');
  if (!b.total) bad.push('total');
  if (b.paid > b.total) bad.push('paid');
  b.date = b.start.slice(0, 10);
  return {b, bad};
}

// GET /api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function onRequestGet({request, env}) {
  const me = await who(env, request); if (!me) return deny();
  const u = new URL(request.url);
  const from = u.searchParams.get('from') || '0000', to = u.searchParams.get('to') || '9999';
  const cfg = await getCfg(env);
  return json({me, list: await listBookings(env, from, to),
    cfg: {boats: cfg.boats, marinas: cfg.marinas, captains: cfg.captains, staff: me.admin ? cfg.staff.map(s => s.name) : undefined}});
}

// POST /api/bookings  → create
export async function onRequestPost({request, env}) {
  const me = await who(env, request); if (!me) return deny();
  const body = await request.json().catch(() => ({}));
  const {b, bad} = await shape(env, body, {id: rid(10), created: Date.now(), by: me.name, status: 'confirmed'});
  if (bad.length) return json({error: 'invalid', fields: bad}, 400);
  const c = await clash(env, b);
  if (c && !body.force) return json({error: 'clash', with: {name: c.name, start: c.start, end: c.end}}, 409);
  await env.BOATS.put(`bk:${b.date}:${b.id}`, JSON.stringify(b));
  await env.BOATS.put('bi:' + b.id, b.date);
  return json({ok: true, booking: b});
}
