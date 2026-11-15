// GET /invoice/<id>/<tok> — customer-facing booking invoice (secret link, not indexed).
import {esc, fmt} from '../_lib.js';
import {getCfg} from '../_bk.js';

const T = {
  ar: {dir: 'rtl', title: 'فاتورة حجز', status: {confirmed: 'مؤكد', cancelled: 'ملغي'}, no: 'رقم الحجز', billed: 'باسم', phone: 'موبايل', date: 'ميعاد الرحلة',
    desc: 'البيان', amount: 'المبلغ (جنيه)', total: 'إجمالي الحجز', paid: 'المدفوع (عربون)', due: 'الباقي يدفع عند الوصول', cur: 'جنيه',
    guests: 'عدد الأفراد', marina: 'مكان التحرك', captain: 'الريس', map: 'افتح اللوكيشن على الخريطة',
    notes: 'مهم', n1: 'هاتوا معاكم البطايق أو الباسبورات أو شهادات الميلاد للأطفال (الأصل).', n2: 'ممنوع تمامًا اصطحاب أو تناول الكحوليات على اليخت.', n3: 'المارينا بتفتح الساعة 6 الصبح.',
    thanks: 'شكرًا إنك اخترت Morgana', see: 'مستنيينكم ونتمنالكم يوم جميل.', next: 'تاني يوم', pdf: 'حفظ PDF', img: 'حفظ كصورة / مشاركة',
    days: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'], months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    trip: {day: 'رحلة يوم كامل', night: 'رحلة مسائية', h24: 'رحلة 24 ساعة', sunset: 'رحلة الغروب', custom: 'رحلة'}, fish: 'صيد', outing: 'نزهة', on: 'على يخت'},
  en: {dir: 'ltr', title: 'Booking invoice', status: {confirmed: 'CONFIRMED', cancelled: 'CANCELLED'}, no: 'Booking no.', billed: 'Billed to', phone: 'Phone', date: 'Booking date',
    desc: 'Description', amount: 'Amount (EGP)', total: 'Total booking amount', paid: 'Payment received', due: 'Balance due on arrival', cur: 'EGP',
    guests: 'Guests', marina: 'Departure', captain: 'Captain', map: 'Open location in Google Maps',
    notes: 'Important', n1: 'Please bring original national IDs or passports, and birth certificates for children.', n2: 'Alcohol is strictly not allowed on board.', n3: 'The marina opens at 6 AM.',
    thanks: 'Thank you for choosing Morgana.', see: 'We look forward to welcoming you.', next: 'next day', pdf: 'Save PDF', img: 'Save image / share',
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    trip: {day: 'Full-day trip', night: 'Overnight trip', h24: '24-hour trip', sunset: 'Sunset trip', custom: 'Trip'}, fish: 'fishing', outing: 'outing', on: 'on'},
};
const loc = p => p && p.startsWith('20') && p.length === 12 ? '0' + p.slice(2) : (p ? '+' + p : '');
function hour(t, L) {
  const h = +t.slice(0, 2), m = t.slice(3), mm = m === '00' ? '' : ':' + m, h12 = (h % 12) || 12;
  if (L === 'en') return h12 + mm + (h < 12 ? ' AM' : ' PM');
  return h12 + mm + ' ' + (h < 12 ? 'الصبح' : h < 16 ? 'الظهر' : h < 18 ? 'العصر' : h < 20 ? 'المغرب' : 'بالليل');
}

export async function onRequestGet({params, env}) {
  const [id, tok] = params.path || [];
  const date = id && await env.BOATS.get('bi:' + id);
  const raw = date && await env.BOATS.get(`bk:${date}:${id}`);
  const b = raw && JSON.parse(raw);
  if (!b || !b.tok || b.tok !== tok) return new Response('Not found', {status: 404, headers: {'x-robots-tag': 'noindex'}});
  const cfg = await getCfg(env), L = b.lang === 'en' ? 'en' : 'ar', t = T[L];
  const boat = cfg.boats.find(x => x.id === b.boat) || {name: b.boat, marina: 'portrait'};
  const mar = cfg.marinas[boat.marina] || {}, cap = cfg.captains.find(c => c.name === b.captain);
  const d = new Date(b.date + 'T12:00:00Z');
  const dateTxt = L === 'en' ? `${t.days[d.getUTCDay()]}, ${d.getUTCDate()} ${t.months[d.getUTCMonth()]} ${d.getUTCFullYear()}` : `${t.days[d.getUTCDay()]} ${d.getUTCDate()} ${t.months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const next = b.end.slice(0, 10) !== b.date;
  const time = `${hour(b.start.slice(11), L)} – ${hour(b.end.slice(11), L)}${next ? ` (${t.next})` : ''}`;
  const kind = b.trip.startsWith('night') ? 'night' : b.trip.startsWith('h24') ? 'h24' : (t.trip[b.trip] ? b.trip : 'custom');
  const what = `${t.trip[kind]} – ${b.kind === 'fishing' ? t.fish : t.outing} ${t.on} ${boat.name}`;
  const rest = b.total - b.paid, cur = t.cur, money = n => L === 'en' ? `EGP ${fmt(n)}` : `${fmt(n)} ${cur}`;
  const st = b.status === 'cancelled' ? 'cancelled' : 'confirmed';
  const html = `<!doctype html><html lang="${L}" dir="${t.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Morgana – ${t.title} ${esc(b.id.slice(0, 6).toUpperCase())}</title><link rel="icon" href="/img/favicon.png">
<style>
*{box-sizing:border-box}body{margin:0;background:#e9ece9;font-family:${L === 'ar' ? 'Tahoma,"Segoe UI",system-ui' : '"Helvetica Neue",Arial,system-ui'},sans-serif;color:#1f2d2b}
.page{max-width:820px;margin:24px auto;background:#fff;box-shadow:0 4px 30px rgba(0,0,0,.08)}
.top{background:#243f3b;color:#fff;padding:44px 64px 40px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px}
.top h1{margin:0;font-size:44px;letter-spacing:1px}.top p{margin:14px 0 0;color:#c9d3d0;letter-spacing:.5px}.top .st{font-weight:700;letter-spacing:1px}.top .st.x{color:#ffb4a8}
.body{padding:44px 64px 40px}.lab{font-size:12px;font-weight:700;color:#6b7774;letter-spacing:.6px;text-transform:uppercase;margin:0 0 8px}
.two{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}.two>div{flex:1;min-width:220px}
.name{font-size:28px;font-weight:700;margin:0 0 8px;color:#243f3b}.big{font-size:17px;font-weight:700;margin:0 0 8px}
hr{border:0;border-top:1px solid #dde2e0;margin:30px 0}
.row{display:flex;justify-content:space-between;gap:16px;margin:14px 0}.row b{white-space:nowrap}.sub{font-size:14px;color:#6b7774;margin-top:6px}
.due{background:#edf1ef;border-radius:12px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px;flex-wrap:wrap}.due b{font-size:30px;color:#243f3b}
ul{margin:8px 0 0;padding-inline-start:20px;line-height:1.9}a{color:#243f3b}
.end{border-top:1px solid #b6a76a;margin-top:34px;padding-top:20px}.end b{font-size:17px}
.tools{max-width:820px;margin:0 auto 30px;display:flex;gap:10px;justify-content:center}.tools button{font:inherit;padding:11px 18px;border-radius:10px;border:0;background:#243f3b;color:#fff;cursor:pointer}.tools button+button{background:#fff;color:#243f3b;border:1px solid #243f3b}
@media(max-width:640px){.page{margin:0}.top,.body{padding:28px 22px}.top h1{font-size:32px}.name{font-size:22px}.due b{font-size:24px}}
@media print{body{background:#fff}.page{margin:0;box-shadow:none;max-width:none}.tools{display:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="page" id="inv">
<div class="top"><div><h1>MORGANA</h1><p>${t.title.toUpperCase()} · ${t.no} ${esc(b.id.slice(0, 6).toUpperCase())}</p></div><div class="st${st === 'cancelled' ? ' x' : ''}">${t.status[st]}</div></div>
<div class="body">
<div class="two"><div><p class="lab">${t.billed}</p><p class="name">${esc(b.name)}</p><div>${t.phone}: <span dir="ltr">${[loc(b.phone), loc(b.phone2)].filter(Boolean).join(' / ')}</span></div>${b.guests ? `<div style="margin-top:6px">${t.guests}: ${b.guests}</div>` : ''}</div>
<div><p class="lab">${t.date}</p><p class="big">${dateTxt}</p><div>${time}</div></div></div>
<hr>
<div class="row lab"><span>${t.desc}</span><span>${t.amount}</span></div>
<div class="row"><div><b>${esc(what)}</b><div class="sub">${dateTxt} | ${time}</div></div><b>${fmt(b.total)}</b></div>
<hr>
<div class="row"><span>${t.total}</span><b>${money(b.total)}</b></div>
<div class="row"><span>${t.paid}</span><b>${money(b.paid)}</b></div>
<div class="due"><span class="lab" style="margin:0">${t.due}</span><b>${money(rest)}</b></div>
<hr>
<div class="two"><div><p class="lab">${t.marina}</p><div class="big">${esc(mar[L] || '')}</div>${mar.map ? `<a href="${esc(mar.map)}" target="_blank" rel="noopener">${t.map}</a>` : ''}</div>
${cap ? `<div><p class="lab">${t.captain}</p><div class="big">${esc(cap.name)}</div><span dir="ltr">${loc(cap.phone)}</span></div>` : ''}</div>
<p class="lab" style="margin-top:28px">${t.notes}</p><ul><li>${t.n1}</li><li>${t.n2}</li><li>${t.n3}</li></ul>
<div class="end"><b>${t.thanks}</b><div class="sub">${t.see} · morganayacht.com</div></div>
</div></div>
<div class="tools"><button onclick="print()">${t.pdf}</button><button id="shot">${t.img}</button></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
<script>
document.getElementById('shot').onclick=async function(){var c=await html2canvas(document.getElementById('inv'),{scale:2,backgroundColor:'#fff'});c.toBlob(async function(bl){var f=new File([bl],'Morgana-${esc(b.id.slice(0, 6).toUpperCase())}.png',{type:'image/png'});
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Morgana'});return}}catch(e){}
 var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=f.name;a.click()},'image/png')};
</script></body></html>`;
  return new Response(html, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow'}});
}
