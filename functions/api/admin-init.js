import {json, sha256} from '../_lib.js';
// One-time: stores the hash of the owner's admin key (only works while none is set).
export async function onRequestPost({request, env}) {
  if (await env.BOATS.get('admin')) return json({error: 'already_set'}, 409);
  const {key} = await request.json().catch(() => ({}));
  if (!key || String(key).length < 24) return json({error: 'weak'}, 400);
  await env.BOATS.put('admin', await sha256(key));
  return json({ok: true});
}
