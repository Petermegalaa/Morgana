import {allListings, card, SALE_CSS} from '../_lib.js';
// /boats-for-sale : the existing static page, untouched, plus the live list of boats for sale added before </main>
export async function onRequestGet({request, env}) {
  const page = await env.ASSETS.fetch(new URL('/boats-for-sale', request.url));
  if (!page.ok) return page;
  let html = await page.text();
  const items = await allListings(env);
  const grid = `<section class="blk g" id="listings"><div class="in"><div class="sale-top"><h2>مراكب ويخوت للبيع <small lang="en">· Boats &amp; yachts for sale</small></h2>`
    + `<a class="btn coral" href="/sell-your-boat">اعرض مركبك للبيع مجانًا · List your boat</a></div>`
    + (items.length ? `<div class="sale-grid">${items.map(card).join('')}</div>`
                    : `<p class="mini" style="margin-top:14px">لسه مفيش مراكب معروضة. كن أول واحد يعرض مركبه.</p>`)
    + `</div></section>`;
  html = html.replace('</head>', () => SALE_CSS + '</head>').replace('</main>', () => grid + '</main>');
  return new Response(html, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=120'}});
}
