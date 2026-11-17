// GET /api/receipt/<id> (staff key) — the deposit transfer screenshot a customer uploaded.
import {who, deny} from '../../_bk.js';
export async function onRequestGet({request, env, params}) {
  if (!await who(env, request)) return deny();
  const n = parseInt(new URL(request.url).searchParams.get('n')) || 0;
  const r = await env.BOATS.getWithMetadata('rc:' + params.id + (n ? ':' + n : ''), {type: 'arrayBuffer'});
  if (!r.value) return new Response('none', {status: 404});
  return new Response(r.value, {headers: {'content-type': (r.metadata && r.metadata.type) || 'image/jpeg', 'cache-control': 'no-store'}});
}
