// POST /api/book/receipt?id=..&tok=..  (body = image bytes) — customer uploads the InstaPay deposit screenshot.
// The screenshot is read automatically; if every check passes the booking is confirmed on the spot.
import {json} from '../../_lib.js';
import {readReceipt, checkReceipt} from '../../_receipt.js';
export async function onRequestPost({request, env}) {
  const u = new URL(request.url), id = u.searchParams.get('id') || '', tok = u.searchParams.get('tok') || '';
  const date = await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b = raw && JSON.parse(raw);
  if (!b || b.tok !== tok) return json({error: 'not_found'}, 404);
  if (b.status !== 'pending') return json({error: 'closed', status: b.status}, 400);
  if ((b.tries || 0) >= 5) return json({error: 'tries'}, 429);
  const type = request.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({error: 'type'}, 400);
  const buf = await request.arrayBuffer();
  if (buf.byteLength < 2000 || buf.byteLength > 1_200_000) return json({error: 'size'}, 400);
  await env.BOATS.put('rc:' + id, buf, {metadata: {type}});
  b.receipt = Date.now(); b.tries = (b.tries || 0) + 1;

  const data = await readReceipt(env, buf);
  const ref = String((data && data.reference) || '').replace(/\D/g, '');
  const used = ref.length >= 8 ? await env.BOATS.get('ref:' + ref) : null;
  const v = checkReceipt(data, b, Date.now(), used);
  b.verify = {at: Date.now(), ok: v.ok, reasons: v.reasons, read: data && !data.error ? data : {error: data && data.error, detail: data && (data.detail || data.raw)}};
  if (v.ok) {
    b.status = 'confirmed'; b.paid = v.amount; b.confirmedBy = 'انستاباي (أوتوماتيك)';
    b.log = (b.log || []).concat({t: Date.now(), by: 'auto', a: 'confirm', ref: v.reference});
    await env.BOATS.put('ref:' + v.reference, b.id);
  }
  await env.BOATS.put(`bk:${date}:${id}`, JSON.stringify(b));
  return json({ok: true, confirmed: v.ok, paid: v.ok ? v.amount : 0});
}
