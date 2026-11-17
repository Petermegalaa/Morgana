// POST /api/book/receipt?id=..&tok=..  (body = image bytes) — customer uploads the deposit transfer screenshot.
import {json} from '../../_lib.js';
export async function onRequestPost({request, env}) {
  const u = new URL(request.url), id = u.searchParams.get('id') || '', tok = u.searchParams.get('tok') || '';
  const date = await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b = raw && JSON.parse(raw);
  if (!b || b.tok !== tok) return json({error: 'not_found'}, 404);
  if (b.status !== 'pending') return json({error: 'closed'}, 400);
  const type = request.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({error: 'type'}, 400);
  const buf = await request.arrayBuffer();
  if (buf.byteLength < 2000 || buf.byteLength > 1_200_000) return json({error: 'size'}, 400);
  await env.BOATS.put('rc:' + id, buf, {metadata: {type}});
  b.receipt = Date.now();
  await env.BOATS.put(`bk:${date}:${id}`, JSON.stringify(b));
  return json({ok: true});
}
