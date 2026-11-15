import {json, sha256, rid, slugify, normPhone, TTL, DAY, MAX_IMGS, MAX_IMG_BYTES, MAX_PER_PHONE, MAX_PER_IP_DAY} from '../../_lib.js';

const clean = (s, max) => String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const LINKS = /(https?:\/\/|www\.|\.com\b|\.net\b|t\.me\/)/i;

export async function onRequestPost({request, env}) {
  let f;
  try { f = await request.formData(); } catch { return json({error: 'bad_form'}, 400); }

  // spam guards: hidden honeypot field + the form must have been open for at least 8 seconds
  if (f.get('website')) return json({error: 'spam'}, 400);
  if (Date.now() - Number(f.get('t') || 0) < 8000) return json({error: 'too_fast'}, 400);

  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const ipKey = 'ip:' + (await sha256(ip)).slice(0, 16);
  const ipCount = Number(await env.BOATS.get(ipKey) || 0);
  if (ipCount >= MAX_PER_IP_DAY) return json({error: 'limit_ip'}, 429);

  const title = clean(f.get('title'), 90);
  const desc = clean(f.get('desc'), 3000);
  const price = Math.round(Number(String(f.get('price') || '').replace(/[^\d.]/g, '')));
  const currency = f.get('currency') === 'USD' ? 'USD' : 'EGP';
  const phone = normPhone(f.get('phone'));
  const name = clean(f.get('name'), 50);
  const location = clean(f.get('location'), 60);
  const type = clean(f.get('type'), 30);
  const length = clean(f.get('length'), 10).replace(/[^\d.]/g, '');
  const guests = clean(f.get('guests'), 4).replace(/\D/g, '');
  const year = clean(f.get('year'), 4).replace(/\D/g, '');
  const imgs = f.getAll('images').filter(x => x && typeof x === 'object' && x.size);

  const bad = [];
  if (title.length < 8) bad.push('title');
  if (desc.length < 40) bad.push('desc');
  if (!(price >= 1000 && price <= 2_000_000_000)) bad.push('price');
  if (!phone) bad.push('phone');
  if (!location) bad.push('location');
  if (!imgs.length) bad.push('images');
  if (LINKS.test(title + ' ' + desc)) bad.push('links');
  if (imgs.length > MAX_IMGS || imgs.some(i => i.size > MAX_IMG_BYTES || !/^image\/(webp|jpeg|png)$/.test(i.type))) bad.push('images');
  if (bad.length) return json({error: 'invalid', fields: [...new Set(bad)]}, 400);

  const phoneKey = 'p:' + phone;
  const perPhone = Number(await env.BOATS.get(phoneKey) || 0);
  if (perPhone >= MAX_PER_PHONE) return json({error: 'limit_phone'}, 429);

  const id = rid(10), editKey = rid(16), now = Date.now();
  const b = {id, slug: slugify(title, id), title, desc, price, currency, phone, name, location, type, length, guests, year,
             imgs: imgs.length, created: now, exp: now + TTL * 1000, reports: 0, editHash: await sha256(editKey)};

  for (let n = 0; n < imgs.length; n++)
    await env.BOATS.put(`i:${id}:${n}`, await imgs[n].arrayBuffer(), {expirationTtl: TTL + 7 * DAY, metadata: {type: imgs[n].type}});
  await env.BOATS.put('b:' + id, JSON.stringify(b), {expirationTtl: TTL + 7 * DAY});
  await env.BOATS.put('s:' + b.slug, id, {expirationTtl: TTL + 7 * DAY});
  await env.BOATS.put(phoneKey, String(perPhone + 1), {expirationTtl: TTL});
  await env.BOATS.put(ipKey, String(ipCount + 1), {expirationTtl: DAY});

  return json({ok: true, url: `/boats-for-sale/${encodeURIComponent(b.slug)}`, edit: `/boats-for-sale/${encodeURIComponent(b.slug)}?edit=${editKey}`});
}
