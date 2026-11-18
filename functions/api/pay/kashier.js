// GET /api/pay/kashier?id=..&tok=..&lang=ar|en → sends the customer to Kashier's checkout for the deposit.
import {checkoutUrl, kashierReady} from '../../_kashier.js';
export async function onRequestGet({request, env}) {
  const u = new URL(request.url), id = u.searchParams.get('id') || '', tok = u.searchParams.get('tok') || '';
  if (!kashierReady(env)) return new Response('Card payment is not set up yet', {status: 503});
  const date = await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b = raw && JSON.parse(raw);
  if (!b || b.tok !== tok) return new Response('Not found', {status: 404});
  if (b.status !== 'pending') return Response.redirect(`${u.origin}/invoice/${b.id}/${b.tok}`, 302);
  const amount = Math.max(1, (b.deposit || Math.ceil(b.total / 2)) - (b.paid || 0));
  const {url} = await checkoutUrl(env, b, u.origin, amount, u.searchParams.get('lang'));
  b.attempts = (b.attempts || 0) + 1;
  await env.BOATS.put(`bk:${date}:${id}`, JSON.stringify(b));
  return Response.redirect(url, 302);
}
