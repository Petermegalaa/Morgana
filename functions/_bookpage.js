// Online booking + deposit page (/book and /en/book). Uses the site's own header/footer (home template).
import {quote, ITEM_LABEL} from './_price.js';

const INSTAPAY = 'https://ipn.eg/S/peterssm/instapay/2bM7eZ';
const WA = '201028816191';

const T = {
  ar: {
    title: 'احجز رحلتك واحجز بالعربون | Morgana Yacht', h1: 'احجز يختك أونلاين',
    lead: 'اختار اليوم والإضافات، وشوف السعر على طول. بتدفع نص المبلغ عربون، والباقي يوم الرحلة.',
    s0: 'اختار اليخت', boats: {morgana: ['Morgana', 'لحد 10 أفراد · صيد وإضافات'], portofino2: ['Portofino 2', 'لحد 25 فرد'], coquette: ['Coquette', 'لحد 30 فرد']},
    tday: 'يوم كامل', tsun: 'رحلة الغروب 4 – 6 (صيف)', hol: 'اليوم ده إجازة رسمية، بيتحسب بسعر الجمعة', from: 'من', to: 'لـ', nextd: 'تاني يوم', noday: 'اليوم الكامل لليخت ده في الصيف بيتحجز على واتساب',
    s1: 'ميعاد الرحلة', date: 'اليوم', guests: 'عدد الأفراد', time: 'يوم كامل من 6 الصبح لـ 5 العصر', time24: '24 ساعة: من 6 الصبح لـ 6 الصبح تاني يوم',
    s2: 'الإضافات', fishing: 'رحلة صيد', h24: 'خلّيها 24 ساعة', rod: 'سنارة', bait: 'طبق طعم (نص كيلو جمبري)', each: 'للواحدة', plate: 'للطبق',
    s3: 'بياناتك', name: 'الاسم', phone: 'رقم الموبايل (واتساب)', phone2: 'رقم تاني (اختياري)', note: 'ملاحظات (اختياري)',
    sum: 'ملخص الحجز', total: 'الإجمالي', dep: 'العربون (نص المبلغ)', rest: 'الباقي يوم الرحلة', cur: 'جنيه',
    go: 'كمّل للدفع', free: 'اليوم ده متاح ✓', busy: 'اليوم ده محجوز، اختار يوم تاني', pick: 'اختار يوم عشان نشوف المتاح',
    pay: 'ادفع العربون', payTxt: 'حجزك اتسجل برقم', payHow: 'حوّل العربون بانستاباي من الزرار ده، وبعدين ارفع صورة التحويل هنا. أول ما نتأكد من التحويل هنبعتلك تأكيد الحجز على واتساب.',
    ipn: 'ادفع بانستاباي', up: 'ارفع صورة التحويل', upd: 'استلمنا صورة التحويل ✓ هنأكدلك الحجز على واتساب قريب.', wa: 'ابعتلنا على واتساب', inv: 'شوف فاتورة الحجز',
    hold: 'اليوم محجوزلك 24 ساعة لحد ما يوصل التحويل.',
    errs: {date: 'اختار يوم بعد النهارده', name: 'اكتب اسمك', phone: 'رقم الموبايل مش صح', guests: 'عدد الأفراد أكتر من اللي اليخت ياخده', trip: 'الرحلة دي مش متاحة في اليوم ده', taken: 'اليوم ده اتحجز، اختار يوم تاني', limit: 'جربت كتير النهارده، كلمنا على واتساب', slow: 'استنى ثواني وجرب تاني', net: 'حصلت مشكلة، جرب تاني'},
    note2: 'الإجازات الرسمية بتتحسب بسعر الجمعة. الأسعار بالجنيه المصري، ولايف جاكيت مجانًا.',
    other: 'English', otherHref: '/en/book',
  },
  en: {
    title: 'Book online & pay deposit | Morgana Yacht', h1: 'Book your yacht online',
    lead: 'Pick your day and add-ons and see the price instantly. Pay half as a deposit, the rest on the day.',
    s0: 'Choose your yacht', boats: {morgana: ['Morgana', 'Up to 10 guests · fishing & add-ons'], portofino2: ['Portofino 2', 'Up to 25 guests'], coquette: ['Coquette', 'Up to 30 guests']},
    tday: 'Full day', tsun: 'Sunset trip 4 – 6 PM (summer)', hol: 'Public holiday: priced as Friday', from: 'From', to: 'to', nextd: 'next day', noday: 'Summer full days on this yacht are booked on WhatsApp',
    s1: 'Trip date', date: 'Date', guests: 'Guests', time: 'Full day, 6 AM – 5 PM', time24: '24 hours: 6 AM – 6 AM next day',
    s2: 'Add-ons', fishing: 'Fishing trip', h24: 'Make it 24 hours', rod: 'Fishing rod', bait: 'Bait plate (½ kg shrimp)', each: 'each', plate: 'per plate',
    s3: 'Your details', name: 'Name', phone: 'Mobile (WhatsApp)', phone2: 'Second number (optional)', note: 'Notes (optional)',
    sum: 'Booking summary', total: 'Total', dep: 'Deposit (50%)', rest: 'Balance on the day', cur: 'EGP',
    go: 'Continue to payment', free: 'This day is available ✓', busy: 'This day is booked, please pick another', pick: 'Pick a day to check availability',
    pay: 'Pay the deposit', payTxt: 'Your booking request no.', payHow: 'Send the deposit with InstaPay using the button below, then upload the transfer screenshot here. We confirm your booking on WhatsApp as soon as we see the transfer.',
    ipn: 'Pay with InstaPay', up: 'Upload transfer screenshot', upd: 'Got your transfer screenshot ✓ We will confirm on WhatsApp shortly.', wa: 'Message us on WhatsApp', inv: 'View booking invoice',
    hold: 'The day is held for you for 24 hours until the transfer arrives.',
    errs: {date: 'Pick a date after today', name: 'Please enter your name', phone: 'Mobile number is not valid', guests: 'Too many guests for this yacht', trip: 'This trip is not available on that day', taken: 'That day was just booked, pick another', limit: 'Too many attempts today, please WhatsApp us', slow: 'Wait a few seconds and try again', net: 'Something went wrong, try again'},
    note2: 'Public holidays are priced as Friday. Prices in Egyptian pounds; life jackets are free.',
    other: 'عربي', otherHref: '/book',
  },
};

export async function bookPage(request, env, L) {
  const t = T[L], labels = Object.fromEntries(Object.entries(ITEM_LABEL).map(([k, v]) => [k, v[L]]));
  const tpl = await (await env.ASSETS.fetch(new URL(L === 'en' ? '/en' : '/', request.url))).text();
  const main = `<main id="top"><section class="blk g bk"><div class="in" style="padding-top:110px">
<p class="mini"><a href="${t.otherHref}" lang="${L === 'en' ? 'ar' : 'en'}">${t.other}</a></p>
<h1>${t.h1}</h1><p class="lead">${t.lead}</p>
<div class="bk-grid">
<form id="bf" autocomplete="on" novalidate>
<fieldset><legend>${t.s0}</legend><div class="boats">${Object.entries(t.boats).map(([k, v], i) => `<label class="bt"><input type="radio" name="boat" value="${k}"${i ? '' : ' checked'}><b>${v[0]}</b><small>${v[1]}</small></label>`).join('')}</div></fieldset>
<fieldset><legend>${t.s1}</legend>
<div class="r2"><label>${t.date}<input type="date" name="date" id="bdate" required></label><label>${t.guests}<input type="number" name="guests" min="1" max="10" value="2" inputmode="numeric" id="bguests"></label></div>
<div class="trips"><label id="w_day"><input type="radio" name="trip" value="day" checked> ${t.tday}</label><label id="w_sun"><input type="radio" name="trip" value="sunset"> ${t.tsun}</label></div><p class="mini" id="noday" hidden>${t.noday}</p><p class="av" id="av">${t.pick}</p><p class="mini" id="hol" hidden>${t.hol}</p><p class="mini" id="btime">${t.time}</p></fieldset>
<fieldset id="addf"><legend>${t.s2}</legend>
<label class="add" id="w_fish"><input type="checkbox" name="fishing"><span>${t.fishing}</span><b id="p_fish">+2,000</b></label>
<label class="add" id="w_24"><input type="checkbox" name="h24"><span>${t.h24}</span><b id="p_24"></b></label>
<div class="add"><span>${t.rod} <small>100 ${t.each}</small></span><div class="qty"><button type="button" data-q="rods" data-d="-1">−</button><output id="q_rods">0</output><button type="button" data-q="rods" data-d="1">+</button></div></div>
<div class="add"><span>${t.bait} <small>150 ${t.plate}</small></span><div class="qty"><button type="button" data-q="bait" data-d="-1">−</button><output id="q_bait">0</output><button type="button" data-q="bait" data-d="1">+</button></div></div>
</fieldset>
<fieldset><legend>${t.s3}</legend>
<div class="r2"><label>${t.name}<input name="name" required autocomplete="name"></label><label>${t.phone}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx" dir="ltr"></label></div>
<div class="r2"><label>${t.phone2}<input name="phone2" inputmode="tel" dir="ltr"></label><label>${t.note}<input name="note"></label></div>
<input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
</fieldset></form>
<aside class="sum" id="sum"><h2>${t.sum}</h2><div id="lines"></div>
<div class="tot"><span>${t.total}</span><b id="tot">—</b></div>
<div class="dep"><span>${t.dep}</span><b id="dep">—</b></div>
<div class="rest"><span>${t.rest}</span><b id="rest">—</b></div>
<button class="btn coral" id="go" type="button" disabled>${t.go}</button><p class="err" id="err" role="alert"></p>
<p class="mini">${t.note2}</p></aside>
</div>
<div id="pay" class="payb" hidden><h2>${t.pay}: <span id="pdep"></span></h2><p>${t.payTxt} <b id="pref"></b>. ${t.hold}</p><p>${t.payHow}</p>
<p><a class="btn coral" href="${INSTAPAY}" target="_blank" rel="noopener nofollow">${t.ipn}</a></p>
<p><label class="btn line" style="cursor:pointer">${t.up}<input type="file" id="rc" accept="image/*" hidden></label></p><p id="rcs" class="mini"></p>
<p><a class="btn line" id="pwa" target="_blank" rel="noopener">${t.wa}</a> <a class="btn line" id="pinv" target="_blank" rel="noopener">${t.inv}</a></p></div>
</div></section>
<style>
.bk h1{font-size:clamp(2rem,5vw,3.2rem);margin:6px 0}.bk .lead{max-width:60ch;color:var(--mute)}
.bk-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:24px;align-items:start;margin-top:20px}
.bk fieldset{border:1px solid color-mix(in srgb,var(--mute) 30%,transparent);border-radius:18px;padding:16px 18px;margin:0 0 16px;background:var(--salt)}
.bk legend{font-weight:700;padding:0 6px;color:var(--deep)}.bk label{display:grid;gap:6px;font-size:.92rem;color:var(--mute)}
.bk input:not([type=checkbox]){font:inherit;color:var(--ink);background:var(--salt);border:1px solid color-mix(in srgb,var(--mute) 40%,transparent);border-radius:12px;padding:11px 12px;width:100%}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px}
.add{display:flex!important;grid-template-columns:none;align-items:center;gap:10px;padding:12px 0;border-top:1px solid color-mix(in srgb,var(--mute) 18%,transparent);color:var(--ink)!important;font-size:1rem!important}
.add:first-of-type{border-top:0}.add span{flex:1}.add small{color:var(--mute)}.add input[type=checkbox]{width:22px;height:22px;accent-color:var(--coral)}
.qty{display:flex;align-items:center;gap:6px}.qty button{width:36px;height:36px;border-radius:50%;border:1px solid color-mix(in srgb,var(--mute) 40%,transparent);background:var(--salt);color:var(--ink);font-size:1.2rem;cursor:pointer}.qty output{min-width:24px;text-align:center;font-weight:700}
.boats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.bt{position:relative;border:2px solid color-mix(in srgb,var(--mute) 30%,transparent);border-radius:16px;padding:14px!important;cursor:pointer;color:var(--ink)!important}.bt input{position:absolute;opacity:0}.bt b{font-size:1.15rem}.bt small{color:var(--mute)}.bt:has(input:checked){border-color:var(--coral);background:color-mix(in srgb,var(--coral) 8%,transparent)}
.trips{display:flex;gap:16px;flex-wrap:wrap;margin:4px 0}.trips label{display:flex!important;align-items:center;gap:6px;color:var(--ink)!important;font-size:1rem!important}.trips input{accent-color:var(--coral);width:18px;height:18px}
.av{font-weight:700;margin:6px 0 0}.av.ok{color:#1f8a5b}.av.no{color:var(--coral)}
.sum{position:sticky;top:90px;background:var(--shell);border-radius:20px;padding:20px}.sum h2{margin:0 0 10px;font-size:1.4rem}
.sum .ln{display:flex;justify-content:space-between;gap:10px;padding:6px 0;font-size:.95rem}.sum .ln small{color:var(--mute)}
.sum .tot,.sum .dep,.sum .rest{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid color-mix(in srgb,var(--mute) 25%,transparent)}
.sum .tot b{font-size:1.3rem}.sum .dep b{font-size:1.5rem;color:var(--coral)}.sum .btn{width:100%;margin-top:12px;justify-content:center}
.sum .btn[disabled]{opacity:.5;pointer-events:none}.err{color:var(--coral);font-weight:700}.bk .hp{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;border:0!important;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none}
.bk [hidden]{display:none!important}.payb{margin-top:24px;background:var(--shell);border-radius:20px;padding:22px}
@media(max-width:860px){.boats{grid-template-columns:1fr}.bk-grid{grid-template-columns:1fr}.sum{position:static}.r2{grid-template-columns:1fr}}
</style>
<script>(function(){
var L=${JSON.stringify(L)},T=${JSON.stringify({errs: t.errs, free: t.free, busy: t.busy, pick: t.pick, cur: t.cur, upd: t.upd, from: t.from, to: t.to, nextd: t.nextd})},LAB=${JSON.stringify(labels)},WA=${JSON.stringify(WA)};
var __name=function(f){return f},__name2=__name;   // bundler keep-names helper used inside quote()
var quote=${quote.toString()};
var f=document.getElementById('bf'),q={rods:0,bait:0},busy=[],busyKey='',t0=Date.now(),taken=false,HOL=[];
fetch('/api/holidays').then(function(r){return r.json()}).then(function(j){HOL=j.dates||[];avail()}).catch(function(){});
function $(i){return document.getElementById(i)}
function money(n){return Number(n).toLocaleString('en-US')+' '+T.cur}
function pad(n){return String(n).padStart(2,'0')}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function add(s,n){var d=new Date(s+'T12:00');d.setDate(d.getDate()+n);return ymd(d)}
var tmr=add(ymd(new Date()),1);$('bdate').min=tmr;$('bdate').max=add(tmr,364);
function state(){return {boat:f.boat.value,trip:f.trip.value,date:f.date.value,holiday:HOL.indexOf(f.date.value)>=0,fishing:f.fishing.checked,h24:f.h24.checked,rods:q.rods,bait:q.bait,guests:f.guests.value}}
function hr(t){var h=+t.slice(0,2),m=t.slice(3),mm=m==='00'?'':':'+m,h12=(h%12)||12;if(L==='en')return h12+mm+(h<12?' AM':' PM');return h12+mm+' '+(h<12?'الصبح':h<16?'الظهر':h<18?'العصر':'المغرب')}
function opts(){var s=state(),d=s.date||add(ymd(new Date()),1),r=quote(Object.assign({},s,{date:d,trip:'day'}));if(!r.opts)r=quote(Object.assign({},s,{date:d,trip:'sunset'}));var o=r.opts||{};
 $('w_day').hidden=!o.day;$('w_sun').hidden=!o.sunset;$('noday').hidden=!!o.day||!s.date;
 if(!o[f.trip.value]){f.trip.value=o.day?'day':'sunset'}
 var day=f.trip.value==='day';$('addf').hidden=!o.addons||!day;$('w_fish').hidden=!day;$('w_24').hidden=!(o.h24&&day);if(!(o.h24&&day))f.h24.checked=false;if(!day)f.fishing.checked=false;
 if(r.add){$('p_24').textContent='+'+Number(r.add.h24).toLocaleString('en-US');}
 if(r.cap){$('bguests').max=r.cap;if(+f.guests.value>r.cap)f.guests.value=r.cap}}
async function avail(){opts();var s=state(),av=$('av');taken=false;$('hol').hidden=!s.holiday;if(!s.date){av.textContent=T.pick;av.className='av';calc();return}
 var r=quote(s);if(!r.ok){av.textContent='';calc();return}
 var key=s.boat+s.date.slice(0,7);if(key!==busyKey){try{var j=await (await fetch('/api/availability?boat='+s.boat+'&from='+s.date.slice(0,7)+'-01&to='+add(s.date.slice(0,7)+'-28',5))).json();busy=j.busy||[];busyKey=key}catch(e){busy=[]}}
 taken=busy.some(function(x){return x[0]<r.end&&r.start<x[1]});
 av.textContent=taken?T.busy:T.free;av.className='av '+(taken?'no':'ok');calc()}
function calc(){var s=state(),r=s.date?quote(s):null;
 $('btime').textContent=r&&r.ok?T.from+' '+hr(r.start.slice(11))+' '+T.to+' '+hr(r.end.slice(11))+(r.end.slice(0,10)!==s.date?' ('+T.nextd+')':''):'';
 if(!s.date||!r||!r.ok){$('lines').innerHTML='';$('tot').textContent=$('dep').textContent=$('rest').textContent='—';$('go').disabled=true;return}
 $('lines').innerHTML=r.items.map(function(i){return '<div class="ln"><span>'+LAB[i.k]+(i.qty>1?' <small>× '+i.qty+'</small>':'')+'</span><span>'+money(i.amount)+'</span></div>'}).join('');
 $('tot').textContent=money(r.total);$('dep').textContent=money(r.deposit);$('rest').textContent=money(r.total-r.deposit);$('go').disabled=taken}
var AV={date:1,h24:1,boat:1,trip:1};
f.addEventListener('change',function(e){if(AV[e.target.name])avail();else calc()});
f.addEventListener('input',function(e){if(e.target.name==='date')avail();else if(!AV[e.target.name])calc()});
document.querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){var k=b.dataset.q,max=k==='rods'?10:20;q[k]=Math.max(0,Math.min(max,q[k]+Number(b.dataset.d)));$('q_'+k).textContent=q[k];calc()}});
var BK=null;
$('go').onclick=async function(){$('err').textContent='';var s=state();
 if(!s.date){$('err').textContent=T.errs.date;return}if(!f.name.value.trim()){$('err').textContent=T.errs.name;f.name.focus();return}
 if(!/^(\\+?20|0)?1[0125]\\d{8}$/.test(f.phone.value.replace(/[\\s-]/g,''))&&f.phone.value.replace(/\\D/g,'').length<9){$('err').textContent=T.errs.phone;f.phone.focus();return}
 this.disabled=true;var body=Object.assign({},s,{name:f.name.value,phone:f.phone.value,phone2:f.phone2.value,note:f.note.value,website:f.website.value,t:t0,lang:L});
 try{var r=await fetch('/api/book',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});var j=await r.json()}catch(e){j={error:'net'}}
 this.disabled=false;if(!j.ok){$('err').textContent=(j.fields?j.fields.map(function(k){return T.errs[k]}).join('، '):T.errs[j.error]||T.errs.net);if(j.error==='taken'){busyKey='';avail()}return}
 BK=j;document.querySelector('.bk-grid').hidden=true;$('pay').hidden=false;$('pdep').textContent=money(j.deposit);$('pref').textContent=j.ref;$('pinv').href=j.invoice;
 $('pwa').href='https://wa.me/'+WA+'?text='+encodeURIComponent((L==='en'?'Hello, I booked online. Booking no. ':'أهلا، أنا حجزت من الموقع. رقم الحجز ')+j.ref+' – '+s.boat+' – '+s.date+' – '+location.origin+j.invoice);
 $('pay').scrollIntoView({behavior:'smooth'})};
$('rc').onchange=async function(){var file=this.files[0];if(!file||!BK)return;$('rcs').textContent='…';
 var img=await createImageBitmap(file),sc=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
 var blob,qq=.85;do{blob=await new Promise(function(r){c.toBlob(r,'image/jpeg',qq)});qq-=.15}while(blob.size>1100000&&qq>.3);
 var r=await fetch('/api/book/receipt?id='+BK.id+'&tok='+BK.tok,{method:'POST',headers:{'content-type':'image/jpeg'},body:blob});var j=await r.json().catch(function(){return{}});
 $('rcs').textContent=j.ok?T.upd:T.errs.net};
avail();
})();</script>
</main>`;
  const html = tpl.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<main id="top">[\s\S]*<\/main>/, () => main)
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${t.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${t.lead}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="https://www.morganayacht.com${L === 'en' ? '/en/book' : '/book'}">`)
    .replace(/<link rel="alternate" hreflang[^>]*>\s*/g, '')
    .replace('<head>', '<head><meta name="robots" content="noindex">');
  return new Response(html, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}});
}
