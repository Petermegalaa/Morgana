import {json, sha256, rid, normPhone} from '../_lib.js';
import {who, deny, getCfg} from '../_bk.js';

// POST /api/booking-settings  (owner only)
// {action:'captains', captains:[{name,phone}]} | {action:'marina', id, map} | {action:'add_staff', name} | {action:'remove_staff', name} | {action:'boats', boats:[...]}
export async function onRequestPost({request, env}) {
  const me = await who(env, request); if (!me) return deny();
  if (!me.admin) return json({error: 'admin_only'}, 403);
  const body = await request.json().catch(() => ({}));
  const cfg = await getCfg(env);
  let extra = {};
  if (body.action === 'captains') {
    cfg.captains = (body.captains || []).map(c => ({name: String(c.name || '').slice(0, 60), phone: normPhone(c.phone) || ''})).filter(c => c.name);
  } else if (body.action === 'marina' && cfg.marinas[body.id]) {
    const m = String(body.map || '');
    cfg.marinas[body.id].map = /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)\//.test(m) ? m : '';
  } else if (body.action === 'add_staff') {
    const name = String(body.name || '').trim().slice(0, 40);
    if (!name || cfg.staff.some(s => s.name === name)) return json({error: 'name'}, 400);
    const key = rid(12) + '-' + rid(12);
    cfg.staff.push({name, keyHash: await sha256(key)});
    extra = {key};                       // shown once, only to the owner
  } else if (body.action === 'remove_staff') {
    cfg.staff = cfg.staff.filter(s => s.name !== body.name);
  } else if (body.action === 'boats') {
    cfg.boats = (body.boats || []).map(b => ({id: String(b.id).replace(/[^a-z0-9-]/g, '').slice(0, 20), name: String(b.name).slice(0, 30), cap: Number(b.cap) || 0, marina: b.marina === 'wadi' ? 'wadi' : 'portrait'})).filter(b => b.id && b.name);
  } else return json({error: 'action'}, 400);
  await env.BOATS.put('cfg', JSON.stringify(cfg));
  return json({ok: true, ...extra, captains: cfg.captains, marinas: cfg.marinas, staff: cfg.staff.map(s => s.name), boats: cfg.boats});
}
