// POST /api/pay/kashier-webhook — Kashier's server-to-server notification (authoritative).
import {verifyWebhook, applyPayment} from '../../_kashier.js';
export async function onRequestPost({request, env}) {
  const body = await request.json().catch(() => null);
  if (!body || !await verifyWebhook(env, body, request.headers.get('x-kashier-signature'))) return new Response('bad signature', {status: 401});
  const d = body.data;
  if (String(d.status).toUpperCase() === 'SUCCESS' && (body.event === 'pay' || body.event === 'idempotency' || !body.event))
    await applyPayment(env, {orderId: d.merchantOrderId, transactionId: d.transactionId, amount: d.amount});
  return new Response('ok');
}
