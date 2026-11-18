// GET /pay/return — customer comes back from Kashier. Verify the signature, record the payment, show the invoice.
import {verifyRedirect, applyPayment} from '../_kashier.js';
const page = (ar, en, href, ok) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Morgana</title><body style="font-family:Tahoma,system-ui,sans-serif;background:#f5f4f0;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="background:#fff;border-radius:20px;padding:28px;max-width:420px;text-align:center;box-shadow:0 4px 30px rgba(0,0,0,.08)">
<div style="font-size:48px">${ok ? '✅' : '❌'}</div><h2 dir="rtl">${ar}</h2><p>${en}</p>
<a href="${href}" style="display:inline-block;margin-top:10px;background:#D9583B;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none">${ok ? 'فاتورة الحجز · Invoice' : 'رجوع · Back'}</a></div>`,
  {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}});

export async function onRequestGet({request, env}) {
  const u = new URL(request.url), p = u.searchParams;
  const valid = env.KASHIER_API_KEY && await verifyRedirect(env, p);
  const orderId = p.get('merchantOrderId') || '';
  const id = orderId.split('-')[0];
  const date = id && await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b0 = raw && JSON.parse(raw);
  if (!valid || !b0) return page('مقدرناش نتأكد من الدفع', 'We could not verify this payment. Please contact us on WhatsApp.', '/book', false);
  const inv = `/invoice/${b0.id}/${b0.tok}`;
  if (String(p.get('paymentStatus')).toUpperCase() !== 'SUCCESS')
    return page('الدفع ما تمّش', 'The payment did not go through. You can try again.', `/api/pay/kashier?id=${b0.id}&tok=${b0.tok}`, false);
  await applyPayment(env, {orderId, transactionId: p.get('transactionId'), amount: p.get('amount')});
  return page('تم الدفع وتأكيد حجزك 🎉', 'Payment received — your booking is confirmed.', inv, true);
}
