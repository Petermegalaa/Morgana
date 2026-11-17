import {json, rid} from '../../_lib.js';
import {who, deny, clash} from '../../_bk.js';
import {shape} from './index.js';

// POST /api/bookings/<id>  {action: 'update' | 'cancel' | 'restore' | 'delete', ...fields}
export async function onRequestPost({request, env, params}) {
  const me = await who(env, request); if (!me) return deny();
  const date = await env.BOATS.get('bi:' + params.id);
  const raw = date && await env.BOATS.get(`bk:${date}:${params.id}`);
  if (!raw) return json({error: 'not_found'}, 404);
  const old = JSON.parse(raw);
  const body = await request.json().catch(() => ({}));
  const log = (old.log || []).concat({t: Date.now(), by: me.name, a: body.action});
  if (body.action === 'cancel' || body.action === 'restore') {
    const b = {...old, status: body.action === 'cancel' ? 'cancelled' : 'confirmed', log};
    if (b.status === 'confirmed') { const c = await clash(env, b); if (c && !body.force) return json({error: 'clash', with: {name: c.name, start: c.start, end: c.end}}, 409); }
    await env.BOATS.put(`bk:${date}:${b.id}`, JSON.stringify(b));
    return json({ok: true, booking: b});
  }
  if (body.action === 'confirm') {
    const paid = Math.max(0, Math.round(Number(body.paid) || 0));
    if (!paid || paid > old.total) return json({error: 'paid'}, 400);
    const b = {...old, status: 'confirmed', paid, log};
    const c = await clash(env, b);
    if (c && !body.force) return json({error: 'clash', with: {name: c.name, start: c.start, end: c.end}}, 409);
    await env.BOATS.put(`bk:${date}:${b.id}`, JSON.stringify(b));
    return json({ok: true, booking: b});
  }
  if (body.action === 'tok') {
    if (old.tok) return json({ok: true, booking: old});
    const b = {...old, tok: rid(14)};
    await env.BOATS.put(`bk:${date}:${b.id}`, JSON.stringify(b));
    return json({ok: true, booking: b});
  }
  if (body.action === 'delete') {
    if (!me.admin) return json({error: 'admin_only'}, 403);
    await env.BOATS.delete(`bk:${date}:${old.id}`); await env.BOATS.delete('bi:' + old.id); for (let i = 0; i < 7; i++) await env.BOATS.delete('rc:' + old.id + (i ? ':' + i : ''));
    return json({ok: true});
  }
  if (body.action !== 'update') return json({error: 'action'}, 400);
  const {b, bad} = await shape(env, body, {...old, log});
  if (bad.length) return json({error: 'invalid', fields: bad}, 400);
  const c = await clash(env, b);
  if (c && !body.force) return json({error: 'clash', with: {name: c.name, start: c.start, end: c.end}}, 409);
  if (b.date !== date) await env.BOATS.delete(`bk:${date}:${b.id}`);
  await env.BOATS.put(`bk:${b.date}:${b.id}`, JSON.stringify(b));
  await env.BOATS.put('bi:' + b.id, b.date);
  return json({ok: true, booking: b});
}
