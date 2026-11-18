// Kashier hosted checkout (card / wallet). Needs env.KASHIER_API_KEY (Payment API key) and env.KASHIER_MID.
// env.KASHIER_MODE = 'live' switches off test mode (default: test).
import {getCfg} from './_bk.js';

const enc = new TextEncoder();
export async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const kashierReady = env => !!(env.KASHIER_API_KEY && env.KASHIER_MID);
const mode = env => env.KASHIER_MODE === 'live' ? 'live' : 'test';

export async function checkoutUrl(env, b, origin, amount, lang) {
  const orderId = `${b.id}-${(b.attempts || 0) + 1}`;
  const amt = String(amount);
  const hash = await hmacHex(env.KASHIER_API_KEY, `/?payment=${env.KASHIER_MID}.${orderId}.${amt}.EGP`);
  const q = new URLSearchParams({
    merchantId: env.KASHIER_MID, orderId, amount: amt, currency: 'EGP', hash, mode: mode(env), type: 'external',
    merchantRedirect: `${origin}/pay/return`, failureRedirect: 'true', serverWebhook: `${origin}/api/pay/kashier-webhook`,
    redirectMethod: 'get', allowedMethods: 'card,wallet', display: lang === 'en' ? 'en' : 'ar',
    description: `Morgana booking ${b.id.slice(0, 6).toUpperCase()}`,
  });
  return {orderId, url: 'https://checkout.kashier.io/?' + q.toString()};
}

// Redirect back from the checkout: HMAC over "&key=value" of every param except signature and mode.
export async function verifyRedirect(env, params) {
  let s = '';
  for (const [k, v] of params) { if (k === 'signature' || k === 'mode') continue; s += `&${k}=${v}`; }
  const want = await hmacHex(env.KASHIER_API_KEY, s.slice(1));
  return want === (params.get('signature') || '').toLowerCase();
}

// Webhook: header x-kashier-signature = HMAC over sorted data.signatureKeys as key=urlencoded(value) joined by &.
export async function verifyWebhook(env, body, header) {
  const d = body && body.data;
  if (!d || !Array.isArray(d.signatureKeys) || !header) return false;
  const s = [...d.signatureKeys].sort().map(k => `${k}=${encodeURIComponent(d[k] ?? '')}`).join('&');
  return (await hmacHex(env.KASHIER_API_KEY, s)) === String(header).toLowerCase();
}

// Record a successful card payment once (idempotent by transaction id) and confirm the booking.
export async function applyPayment(env, {orderId, transactionId, amount}) {
  const id = String(orderId || '').split('-')[0];
  const date = id && await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  if (!raw) return null;
  const b = JSON.parse(raw);
  const tx = String(transactionId || orderId);
  if ((b.payments || []).some(p => p.tx === tx)) return b;
  const amt = Math.round(Number(amount) || 0);
  b.payments = (b.payments || []).concat({tx, amount: amt, via: 'Kashier', at: Date.now()});
  b.paid = b.payments.reduce((s, p) => s + p.amount, 0);
  if (b.status !== 'cancelled') { b.status = 'confirmed'; b.confirmedBy = 'Kashier (كارت / محفظة)'; }
  b.log = (b.log || []).concat({t: Date.now(), by: 'kashier', a: 'paid', tx, amount: amt});
  await env.BOATS.put(`bk:${date}:${id}`, JSON.stringify(b));
  return b;
}
