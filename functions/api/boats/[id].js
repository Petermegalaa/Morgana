import {json, sha256, getListing, TTL, DAY} from '../../_lib.js';

async function authorised(env, b, key) {
  if (!key) return false;
  const h = await sha256(key);
  return h === b.editHash || h === await env.BOATS.get('admin');
}
async function removeListing(env, b) {
  for (let n = 0; n < b.imgs; n++) await env.BOATS.delete(`i:${b.id}:${n}`);
  await env.BOATS.delete('s:' + b.slug);
  await env.BOATS.delete('b:' + b.id);
}

// POST /api/boats/<id>  {action: delete | renew | report, key}
export async function onRequestPost({request, env, params}) {
  const b = await getListing(env, params.id);
  if (!b) return json({error: 'not_found'}, 404);
  let body = {};
  try { body = await request.json(); } catch {}
  if (body.action === 'report') {
    b.reports = (b.reports || 0) + 1;
    if (b.reports >= 3) b.hidden = true;                 // hide after 3 reports until you look at it
    await env.BOATS.put('b:' + b.id, JSON.stringify(b), {expirationTtl: TTL + 7 * DAY});
    return json({ok: true});
  }
  if (!(await authorised(env, b, body.key))) return json({error: 'forbidden'}, 403);
  if (body.action === 'delete') { await removeListing(env, b); return json({ok: true}); }
  if (body.action === 'renew') {
    b.exp = Date.now() + TTL * 1000;
    await env.BOATS.put('b:' + b.id, JSON.stringify(b), {expirationTtl: TTL + 7 * DAY});
    return json({ok: true});
  }
  return json({error: 'bad_action'}, 400);
}
