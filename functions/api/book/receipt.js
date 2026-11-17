// POST /api/book/receipt?id=..&tok=..  (body = image bytes) — customer uploads an InstaPay deposit screenshot.
// Each valid transfer is added to the booking; it is confirmed once the transfers reach the internal minimum.
import {json} from '../../_lib.js';
import {readReceipt, checkReceipt, minPaid} from '../../_receipt.js';
export async function onRequestPost({request, env}) {
  const u = new URL(request.url), id = u.searchParams.get('id') || '', tok = u.searchParams.get('tok') || '';
  const date = await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b = raw && JSON.parse(raw);
  if (!b || b.tok !== tok) return json({error: 'not_found'}, 404);
  if (b.status !== 'pending') return json({error: 'closed', status: b.status}, 400);
  if ((b.tries || 0) >= (u.hostname.endsWith('.pages.dev') ? 30 : 6)) return json({error: 'tries'}, 429);
  const type = request.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({error: 'type'}, 400);
  const buf = await request.arrayBuffer();
  if (buf.byteLength < 2000 || buf.byteLength > 1_200_000) return json({error: 'size'}, 400);
  b.tries = (b.tries || 0) + 1; b.receipt = Date.now();
  const n = (b.payments || []).length;
  await env.BOATS.put(`rc:${id}${n ? ':' + n : ''}`, buf, {metadata: {type}});

  const data = await readReceipt(env, buf);
  const ref = String((data && data.reference) || '').replace(/\D/g, '');
  const used = ref.length >= 8 ? await env.BOATS.get('ref:' + ref) : null;
  const v = checkReceipt(data, b, Date.now(), used);
  b.verify = {at: Date.now(), ok: v.ok, reasons: v.reasons, read: data && !data.error ? data : {error: data && data.error, detail: data && (data.detail || data.raw)}};
  let result = {ok: true, confirmed: false, rejected: v.ok ? [] : v.codes};
  if (v.ok) {
    b.payments = (b.payments || []).concat({ref: v.reference, amount: v.amount, when: v.when, img: n});
    await env.BOATS.put('ref:' + v.reference, b.id);
    const sum = b.payments.reduce((s, p) => s + p.amount, 0);
    b.paid = sum;
    if (sum >= minPaid(b)) {
      b.status = 'confirmed'; b.confirmedBy = 'انستاباي (أوتوماتيك)';
      b.log = (b.log || []).concat({t: Date.now(), by: 'auto', a: 'confirm', refs: b.payments.map(p => p.ref)});
      result = {ok: true, confirmed: true, paid: sum, rest: b.total - sum};
    } else {
      b.verify.reasons = [`وصل ${sum} بس، أقل من الحد الأدنى — العميل اتطلب منه يكمّل نص المبلغ`];
      result = {ok: true, confirmed: false, short: true, paid: sum, need: Math.max(0, (b.deposit || Math.ceil(b.total / 2)) - sum)};
    }
  }
  await env.BOATS.put(`bk:${date}:${id}`, JSON.stringify(b));
  return json(result);
}
