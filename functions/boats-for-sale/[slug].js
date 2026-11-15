import {getListing, esc, fmt, imgUrl, listUrl, SITE, SALE_CSS} from '../_lib.js';

export async function onRequestGet({request, env, params}) {
  const slug = decodeURIComponent(params.slug);
  const id = await env.BOATS.get('s:' + slug);
  const b = id && await getListing(env, id);
  const tpl = await (await env.ASSETS.fetch(new URL('/boats-for-sale', request.url))).text();
  if (!b) {
    return new Response(tpl.replace(/<main id="top">[\s\S]*<\/main>/, `<main id="top"><section class="blk g"><div class="in" style="padding-block:120px 60px"><h1>الإعلان ده مش موجود</h1><p>ممكن يكون اتباع أو انتهت مدته. <a href="/boats-for-sale">شوف باقي المراكب للبيع</a></p></div></section></main>`)
      .replace('<head>', '<head><meta name="robots" content="noindex">'), {status: 404, headers: {'content-type': 'text/html; charset=utf-8'}});
  }
  const cur = b.currency === 'USD' ? 'USD' : 'جنيه';
  const url = SITE + listUrl(b);
  const sale = /للبيع|for sale/i.test(b.title) ? '' : ' للبيع';
  const title = `${b.title}${sale} – ${fmt(b.price)} ${cur} | Morgana Yacht`;
  const descr = `${b.title}${sale} في ${b.location}${b.length ? '، طول ' + b.length + ' متر' : ''}${b.year ? '، موديل ' + b.year : ''}. السعر ${fmt(b.price)} ${cur}. ${b.desc.slice(0, 90)}`.replace(/\s+/g, ' ');
  const imgs = Array.from({length: b.imgs}, (_, n) => imgUrl(b, n));
  const wa = `https://wa.me/${b.phone}?text=${encodeURIComponent('مرحبًا، شفت إعلان ' + b.title + ' على موقع Morgana Yacht: ' + url)}`;
  const schema = {"@context": "https://schema.org", "@type": "Product", name: b.title, description: b.desc.slice(0, 500), image: imgs.map(i => SITE + i), url,
    category: 'Boats for sale', offers: {"@type": "Offer", price: b.price, priceCurrency: b.currency, availability: "https://schema.org/InStock", url,
    itemCondition: "https://schema.org/UsedCondition", areaServed: b.location}};
  const spec = (l, v) => v ? `<div><small>${l}</small><b>${esc(v)}</b></div>` : '';
  const main = `<main id="top"><section class="blk g"><div class="in" style="padding-top:110px">
<p class="mini"><a href="/boats-for-sale">مراكب للبيع</a> › ${esc(b.location)}</p>
<h1 style="font-size:clamp(2rem,5vw,3.4rem);margin:6px 0 4px">${esc(b.title)}</h1>
<p class="sc-price" style="font-size:1.6rem;margin:0 0 18px">${fmt(b.price)} ${cur}</p>
<div class="boat-gal"><img class="main" id="bm" src="${imgs[0]}" alt="${esc(b.title)} للبيع" width="900" height="675">${imgs.slice(1, 4).map((s, i) => `<img class="sub" src="${s}" alt="${esc(b.title)} ${i + 2}" loading="lazy" width="400" height="300">`).join('')}</div>
${imgs.length > 1 ? `<div class="boat-thumbs">${imgs.map((s, i) => `<img src="${s}" alt="" loading="lazy" onclick="document.getElementById('bm').src=this.src">`).join('')}</div>` : ''}
<div class="specs">${spec('المكان', b.location)}${spec('النوع', b.type)}${spec('الطول (متر)', b.length)}${spec('عدد الأفراد', b.guests)}${spec('سنة الصنع', b.year)}</div>
<h2 style="font-size:1.6rem">الوصف</h2><p class="boat-desc">${esc(b.desc)}</p>
<div class="seller"><a class="btn coral" href="${wa}" target="_blank" rel="noopener nofollow">واتساب ${b.name ? esc(b.name) : 'البايع'}</a><a class="btn line" href="tel:+${b.phone}" rel="nofollow">اتصل بالبايع</a></div>
<p class="mini" style="margin-top:18px">الإعلان من صاحب المركب مباشرة، وMorgana Yacht مش طرف في البيع. اتأكد من المركب والأوراق بنفسك قبل أي دفع. · <button id="rep">بلّغ عن الإعلان</button></p>
<div id="own" class="mini" hidden style="margin-top:10px;padding:12px;border:1px dashed var(--mute);border-radius:12px">ده إعلانك. <button data-a="renew">جدّد 90 يوم</button> · <button data-a="delete">امسح الإعلان</button></div>
</div></section>
<section class="blk g"><div class="in"><a class="btn line" href="/boats-for-sale">شوف كل المراكب للبيع</a> <a class="btn line" href="/sell-your-boat">اعرض مركبك للبيع</a></div></section>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<script>(function(){var id=${JSON.stringify(b.id)},k=new URLSearchParams(location.search).get('edit');
function go(a){return fetch('/api/boats/'+id,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:a,key:k})}).then(function(r){return r.json()})}
document.getElementById('rep').onclick=function(){if(confirm('تبلّغ عن الإعلان ده؟'))go('report').then(function(){alert('شكرًا، هنراجعه.')})};
if(k){var o=document.getElementById('own');o.hidden=false;o.querySelectorAll('button').forEach(function(x){x.onclick=function(){var a=x.dataset.a;if(a==='delete'&&!confirm('متأكد إنك عايز تمسح الإعلان؟'))return;go(a).then(function(r){if(!r.ok)return alert('في مشكلة، جرّب تاني.');if(a==='delete')location.href='/boats-for-sale';else alert('اتجدد الإعلان 90 يوم.')})}})}})();</script>
</main>`;
  let html = tpl.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<meta property="og:image:(type|width|height)" content="[^"]*">\s*/g, '')
    .replace(/<main id="top">[\s\S]*<\/main>/, () => main)
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(descr)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${esc(descr)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${SITE}${imgs[0]}">`)
    .replace(/<link rel="alternate" hreflang[^>]*>\s*/g, '')
    .replace('</head>', SALE_CSS + '</head>');
  if (new URL(request.url).searchParams.has('edit')) html = html.replace('<head>', '<head><meta name="robots" content="noindex">');
  return new Response(html, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=120'}});
}
