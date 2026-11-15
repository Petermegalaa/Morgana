// Shared helpers for the boats-for-sale feature (Cloudflare Pages Functions + KV "BOATS")
export const DAY = 86400;
export const TTL = 90 * DAY;                 // listings expire after 90 days unless renewed
export const MAX_IMGS = 8, MAX_IMG_BYTES = 1_100_000, MAX_PER_PHONE = 3, MAX_PER_IP_DAY = 5;
export const SITE = 'https://www.morganayacht.com';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const json = (o, status = 200) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});
export const fmt = n => Number(n).toLocaleString('en-US');

export async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export const rid = (n = 8) => [...crypto.getRandomValues(new Uint8Array(n))].map(x => (x % 36).toString(36)).join('');

export function slugify(title, id) {
  const base = String(title).toLowerCase()
    .replace(/[ً-ْـ]/g, '')            // Arabic diacritics / tatweel
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  return (base || 'boat-for-sale') + '-' + id.slice(0, 5);
}

export function normPhone(p) {
  let d = String(p || '').replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (/^01\d{9}$/.test(d)) d = '2' + d;               // Egyptian mobile 01xxxxxxxxx → 201xxxxxxxxx
  return /^\d{8,15}$/.test(d) ? d : null;
}

export async function getListing(env, id) {
  const raw = await env.BOATS.get('b:' + id);
  if (!raw) return null;
  const b = JSON.parse(raw);
  if (b.hidden || b.exp < Date.now()) return null;
  return b;
}

export async function allListings(env) {
  const out = [];
  let cursor;
  do {
    const r = await env.BOATS.list({prefix: 'b:', cursor});
    for (const k of r.keys) {
      const b = await getListing(env, k.name.slice(2));
      if (b) out.push(b);
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out.sort((a, b) => b.created - a.created);
}

export const imgUrl = (b, n = 0) => `/boat-img/${b.id}/${n}`;
export const listUrl = b => `/boats-for-sale/${encodeURIComponent(b.slug)}`;

export function card(b) {
  return `<a class="sale-card" href="${listUrl(b)}"><img src="${imgUrl(b)}" alt="${esc(b.title)}" loading="lazy" width="600" height="450">`
    + `<span class="sc-body"><b>${esc(b.title)}</b><span class="sc-price">${fmt(b.price)} ${b.currency === 'USD' ? 'USD' : 'جنيه'}</span>`
    + `<span class="sc-meta">${esc(b.location)}${b.length ? ' · ' + esc(b.length) + ' م' : ''}${b.year ? ' · ' + esc(b.year) : ''}</span></span></a>`;
}

export const SALE_CSS = `<style>
.sale-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:20px}
.sale-card{display:grid;text-decoration:none;color:inherit;background:var(--salt);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:20px;overflow:hidden;transition:transform .2s,border-color .2s}
.sale-card:hover{transform:translateY(-3px);border-color:var(--sea)}
.sale-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--shell)}
.sc-body{display:grid;gap:4px;padding:14px 16px 16px}.sc-body b{font-size:1.05rem}
.sc-price{color:var(--coral);font-weight:700;font-size:1.1rem}.sc-meta{color:var(--mute);font-size:.88rem}
.sale-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px}
.boat-gal{display:grid;grid-template-columns:2fr 1fr;gap:10px}.boat-gal img{width:100%;height:100%;object-fit:cover;border-radius:16px;display:block;background:var(--shell)}
.boat-gal .main{grid-row:span 3;aspect-ratio:4/3}.boat-gal .sub{aspect-ratio:4/3}
.boat-thumbs{display:flex;gap:8px;overflow-x:auto;margin-top:10px}.boat-thumbs img{width:110px;aspect-ratio:4/3;object-fit:cover;border-radius:10px;cursor:pointer;flex:none}
.specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:18px 0}
.specs div{background:var(--shell);border-radius:14px;padding:12px 14px}.specs small{display:block;color:var(--mute);font-size:.8rem}.specs b{font-size:1.05rem}
.boat-desc{white-space:pre-line;line-height:1.9}
.seller{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.mini{font-size:.82rem;color:var(--mute)}.mini button{background:none;border:0;color:var(--mute);text-decoration:underline;cursor:pointer;font:inherit;padding:0}
@media (max-width:700px){.boat-gal{grid-template-columns:1fr}.boat-gal .sub{display:none}}
</style>`;
