import {allListings, SITE, listUrl, imgUrl, esc} from './_lib.js';
export async function onRequestGet({env}) {
  const items = await allListings(env);
  const urls = items.map(b => `<url><loc>${SITE}${listUrl(b)}</loc><lastmod>${new Date(b.created).toISOString().slice(0, 10)}</lastmod>`
    + Array.from({length: b.imgs}, (_, n) => `<image:image><image:loc>${SITE}${imgUrl(b, n)}</image:loc><image:title>${esc(b.title)}</image:title></image:image>`).join('')
    + `</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`,
    {headers: {'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600'}});
}
