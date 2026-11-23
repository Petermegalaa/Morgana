// GET /staff — Morgana booking board (staff only; data is loaded with a key, page itself holds nothing private).
const PAGE = String.raw`<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>حجوزات Morgana</title>
<link rel="icon" href="/img/favicon.png">
<style>
:root{--deep:#0B4F63;--coral:#D9583B;--salt:#fff;--ink:#14262c;--mute:#5f6f74;--line:#e3e6e6;--bg:#f5f4f0;--ok:#1f8a5b;--warn:#b7791f}
[hidden]{display:none!important}*{box-sizing:border-box}body{margin:0;font-family:system-ui,"Segoe UI",Tahoma,sans-serif;background:var(--bg);color:var(--ink)}
header{background:var(--deep);color:#fff;padding:12px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;position:sticky;top:0;z-index:5}
header h1{font-size:1.1rem;margin:0;flex:1}header button{background:rgba(255,255,255,.15);color:#fff;border:0}
button,select,input,textarea{font:inherit}button{border:1px solid var(--line);background:var(--salt);border-radius:10px;padding:8px 12px;cursor:pointer}
.pri{background:var(--coral);color:#fff;border:0}.dark{background:var(--deep);color:#fff;border:0}
main{max-width:1200px;margin:auto;padding:14px}
.tabs{display:flex;gap:8px;margin-bottom:12px;overflow-x:auto}.tabs button{flex:1;min-width:110px;padding:12px;font-weight:700;border-radius:14px;border:2px solid var(--line)}.tabs button.on{background:var(--deep);color:#fff;border-color:var(--deep)}.tabs button.on.portofino2{background:#6a4c93;border-color:#6a4c93}.tabs button.on.coquette{background:#b5651d;border-color:#b5651d}.tabs small{display:block;font-weight:400;font-size:.75rem;opacity:.8}
.bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.bar b{font-size:1.15rem;min-width:150px;text-align:center}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dow{font-size:.8rem;color:var(--mute);text-align:center}
.day{min-width:0;overflow:hidden;background:var(--salt);border-radius:12px;min-height:92px;padding:6px;border:1px solid var(--line)}.day.out{opacity:.4}.day.today{outline:2px solid var(--coral)}
.day .n{font-size:.8rem;color:var(--mute);display:flex;justify-content:space-between}.day .n button{padding:0 7px;border-radius:7px;font-size:.8rem}
.chip{display:block;width:100%;text-align:start;margin-top:4px;padding:4px 6px;border-radius:8px;font-size:.78rem;border:0;color:#fff;background:var(--deep);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip.portofino2{background:#6a4c93}.chip.coquette{background:#b5651d}.chip.x{background:#9aa5a8;text-decoration:line-through}.chip.p{background:repeating-linear-gradient(45deg,#d9a21f,#d9a21f 6px,#c99212 6px,#c99212 12px)}.pend{background:#fff6e0;border:1px solid #f0d27a;border-radius:12px;padding:12px;display:grid;gap:8px}.pend img{max-width:100%;max-height:340px;border-radius:8px;justify-self:start}.chip.cont{opacity:.6}
.list{display:grid;gap:8px;margin-top:16px}.row{background:var(--salt);border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;cursor:pointer}
.row .s{color:var(--mute);font-size:.85rem}.tag{font-size:.75rem;padding:2px 8px;border-radius:20px;background:#e8f1f3;color:var(--deep)}.tag.due{background:#fdf0e5;color:var(--warn)}
.ifw{height:58vh;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#e9ece9}.ifw iframe{width:100%;height:100%;border:0}
dialog{border:0;border-radius:18px;padding:0;width:min(760px,96vw);max-height:92vh}dialog::backdrop{background:rgba(0,0,0,.45)}
.dlg{padding:18px;display:grid;gap:10px}.dlg h2{margin:0;font-size:1.15rem}
label{display:grid;gap:4px;font-size:.85rem;color:var(--mute)}label input,label select,label textarea{color:var(--ink);padding:9px 10px;border:1px solid var(--line);border-radius:10px;background:#fff}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.acts{display:flex;gap:8px;flex-wrap:wrap}.msg{white-space:pre-wrap;background:#eef7ef;border-radius:12px;padding:12px;font-size:.9rem;max-height:260px;overflow:auto}
.err{color:var(--coral);font-size:.9rem}.hint{font-size:.8rem;color:var(--mute)}
#login{max-width:420px;margin:60px auto;background:#fff;border-radius:18px;padding:22px;display:grid;gap:12px}
@media(max-width:700px){.dow{font-size:.62rem}.bar b{min-width:0;font-size:1rem}main{padding:8px}.g2{grid-template-columns:1fr}.cal{gap:3px}.day{min-height:64px;padding:3px}.chip{font-size:.68rem;padding:2px 4px}.g3{grid-template-columns:1fr 1fr}}
</style></head><body>
<div id="login" hidden><h2 style="margin:0">حجوزات Morgana</h2><label>مفتاح الدخول<input id="k" type="password" autocomplete="current-password"></label><button class="pri" id="kgo">دخول</button><p class="err" id="kerr"></p></div>
<div id="app" hidden>
<header><h1>حجوزات Morgana</h1><span id="me"></span><button id="set" hidden>الإعدادات</button><button id="out">خروج</button></header>
<main>
<div class="tabs" id="tabs"></div>
<div class="bar"><button id="prev">‹</button><b id="mon"></b><button id="next">›</button><button id="tod">النهارده</button>
<span style="flex:1"></span><button class="dark" id="paste">📋 الصق رسالة التأكيد</button><button class="pri" id="add">+ حجز جديد</button></div>
<div class="cal" id="cal"></div>
<h3 style="margin:18px 0 0">الحجوزات الجاية</h3><div class="list" id="up"></div>
</main></div>

<dialog id="dEdit"><form class="dlg" id="f" method="dialog">
<h2 id="ft">حجز جديد</h2>
<div class="g2"><label>المركب<select name="boat" id="fboat"></select></label>
<label>نوع الرحلة<select name="trip" id="ftrip">
<option value="day">يوم كامل 6 الصبح – 5 العصر</option><option value="night5">مسائي 5 العصر – 6 الصبح</option><option value="night4">مسائي 4 العصر – 6 الصبح</option><option value="night6">مسائي 6 المغرب – 6 الصبح</option>
<option value="h24m">24 ساعة من 6 الصبح</option><option value="h24e">24 ساعة من 5 العصر</option><option value="sunset">غروب 4 – 6 (صيف)</option><option value="custom">مواعيد تانية</option></select></label></div>
<div class="g3"><label>التاريخ<input type="date" name="date" id="fdate" required></label>
<label>من<input type="time" name="t1" id="ft1"></label><label>لحد<input type="time" name="t2" id="ft2"></label></div>
<div class="g3"><label>نزهة / صيد<select name="kind" id="fkind"><option value="outing">نزهة</option><option value="fishing">صيد</option></select></label>
<label>عدد الأفراد<input name="guests" inputmode="numeric"></label>
<label style="align-content:end"><span><input type="checkbox" name="holiday" id="fhol"> إجازة رسمية / عيد</span></label></div>
<div class="g2"><label>اسم العميل<input name="name" required></label><label>موبايل العميل<input name="phone" inputmode="tel" required placeholder="01xxxxxxxxx"></label></div>
<div class="g2"><label>موبايل تاني (اختياري)<input name="phone2" inputmode="tel"></label><label>الريس<select name="captain" id="fcap"><option value="">—</option></select></label></div>
<div class="g3"><label>السعر الإجمالي<input name="total" id="ftotal" inputmode="numeric" required></label><label>العربون المدفوع<input name="paid" id="fpaid" inputmode="numeric"></label><label>لغة الرسالة<select name="lang"><option value="both">عربي + English</option><option value="ar">عربي</option><option value="en">English</option></select></label></div>
<p class="hint" id="fhint"></p>
<div class="g2"><label>الحجز جه منين<select name="source"><option>واتساب</option><option>الموقع</option><option>فيسبوك</option><option>انستجرام</option><option>تليفون</option><option>تاني</option></select></label><label>ملاحظات<input name="note"></label></div>
<p class="err" id="ferr"></p>
<div class="acts"><button class="pri" value="save" id="fsave">حفظ وتأكيد الحجز</button><button value="cancel" formnovalidate>إلغاء</button></div>
</form></dialog>

<dialog id="dView"><div class="dlg"><h2 id="vt"></h2><div id="vinfo" class="hint"></div>
<div class="pend" id="vpend" hidden><b>حجز من الموقع مستني تأكيد العربون</b><span id="vpinfo"></span><span id="vver" style="white-space:pre-line"></span><div id="vrcs" style="display:flex;gap:8px;flex-wrap:wrap"></div><div class="g2"><input id="vpaid" inputmode="numeric" placeholder="المبلغ اللي وصل"><button class="pri" type="button" id="vconf">تأكيد استلام العربون</button></div></div>
<div class="ifw"><iframe id="vinv" title="الفاتورة"></iframe></div>
<div class="acts"><a id="wC" target="_blank"><button class="pri" type="button">1. ابعت الفاتورة للعميل</button></a><a id="wG" target="_blank"><button class="dark" type="button">2. ابعت لجروب ح مرجانه</button></a><a id="wK" target="_blank"><button type="button">ابعت للريس</button></a><a id="vopen" target="_blank"><button type="button">افتح الفاتورة (PDF / صورة)</button></a><button id="cp" type="button">نسخ اللينك</button></div><pre class="msg" id="vmsg" hidden></pre>

<div class="acts"><button id="ved" type="button">تعديل</button><button id="vcx" type="button">إلغاء الحجز</button><button id="vdel" type="button" hidden>مسح نهائي</button><span style="flex:1"></span><button type="button" onclick="dView.close()">قفل</button></div>
<p class="err" id="verr"></p></div></dialog>

<dialog id="dPaste"><div class="dlg"><h2>الصق رسالة تأكيد الحجز</h2>
<p class="hint">انسخ رسالة «تأكيد الحجز» من الواتساب (أو من الجروب) والزقها هنا. ممكن تلزق كذا رسالة مع بعض.</p>
<textarea id="ptxt" rows="10" style="font:inherit;padding:10px;border:1px solid var(--line);border-radius:10px;width:100%"></textarea>
<div class="acts"><button class="pri" type="button" id="pgo">اقرا الرسالة</button><button type="button" onclick="dPaste.close()">قفل</button></div>
<div id="pres" class="hint" style="white-space:pre-line"></div></div></dialog>
<dialog id="dSet"><div class="dlg"><h2>الإعدادات</h2>
<b>الريّسين</b><div id="caps"></div><button type="button" id="capAdd">+ ريس</button><button class="dark" type="button" id="capSave">حفظ الريّسين</button>
<b>لوكيشن مارينا وادي الدوم</b><label>لينك جوجل مابس<input id="wadiMap" placeholder="https://maps.app.goo.gl/..."></label><button class="dark" type="button" id="mapSave">حفظ اللوكيشن</button>
<b>الستاف</b><div id="stf"></div><div class="g2"><input id="stName" placeholder="اسم الموظف"><button class="dark" type="button" id="stAdd">اعمل مفتاح دخول</button></div><p class="msg" id="stKey" hidden></p>
<p class="err" id="serr"></p><button type="button" onclick="dSet.close()">قفل</button></div></dialog>

<script>
const $=s=>document.querySelector(s),AR_D=['الاحد','الاثنين','الثلاثاء','الاربعاء','الخميس','الجمعه','السبت'],EN_D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const AR_M=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const PRESET={day:['06:00','17:00',0],night5:['17:00','06:00',1],night4:['16:00','06:00',1],night6:['18:00','06:00',1],h24m:['06:00','06:00',1],h24e:['17:00','17:00',1],sunset:['16:00','18:00',0]};
let BOAT='morgana',KEY='',ME=null,CFG={boats:[],marinas:{},captains:[]},LIST=[],cur=new Date(),editing=null,viewing=null;
try{KEY=localStorage.getItem('mk')||'';BOAT=localStorage.getItem('mb')||BOAT}catch(e){}
const fmt=n=>Number(n||0).toLocaleString('en-US');
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addD=(s,n)=>{const d=new Date(s+'T12:00');d.setDate(d.getDate()+n);return ymd(d)};
const loc=p=>p&&p.startsWith('20')&&p.length==12?'0'+p.slice(2):(p?'+'+p:'');
const boat=id=>CFG.boats.find(b=>b.id==id)||{name:id,marina:'portrait'};
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:{'x-key':KEY,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const j=await r.json().catch(()=>({error:'net'}));if(r.status==401){logout();throw 0}
 if(body&&j.ok&&/^\/api\/bookings/.test(path)){if(j.booking)remember(j.booking.id,j.booking);else if(body.action==='delete')remember(path.split('/').pop(),null)}return j}
function logout(){KEY='';try{localStorage.removeItem('mk')}catch(e){}$('#app').hidden=true;$('#login').hidden=false}
$('#kgo').onclick=async()=>{KEY=$('#k').value.trim();$('#kerr').textContent='';try{await load();try{localStorage.setItem('mk',KEY)}catch(e){}}catch(e){$('#kerr').textContent='المفتاح مش صح'}};
$('#out').onclick=logout;
// KV takes up to a minute to show new writes everywhere: keep our own recent changes and lay them over what the server returns.
let RECENT={};try{RECENT=JSON.parse(sessionStorage.getItem('rc')||'{}')}catch(e){}
function remember(id,b){RECENT[id]={b,t:Date.now()};try{sessionStorage.setItem('rc',JSON.stringify(RECENT))}catch(e){}}
function applyRecent(list){const now=Date.now(),m=new Map(list.map(x=>[x.id,x]));for(const[id,r]of Object.entries(RECENT)){if(now-r.t>120000){delete RECENT[id];continue}if(r.b)m.set(id,r.b);else m.delete(id)}return[...m.values()].sort((a,b)=>a.start.localeCompare(b.start))}
function goTo(b){if(b&&b.boat)BOAT=b.boat;if(b&&b.date){const d=new Date(b.date+'T12:00');cur=new Date(d.getFullYear(),d.getMonth(),1)}}
async function load(){const a=new Date(cur.getFullYear(),cur.getMonth(),1),from=addD(ymd(a),-7),to=addD(ymd(new Date(cur.getFullYear(),cur.getMonth()+1,0)),45);
 const j=await api('/api/bookings?from='+from+'&to='+to);ME=j.me;CFG=j.cfg;LIST=applyRecent(j.list);$('#login').hidden=true;$('#app').hidden=false;$('#me').textContent=ME.name;$('#set').hidden=!ME.admin;
 if(!CFG.boats.some(b=>b.id==BOAT))BOAT=CFG.boats[0].id;render()}
function season(d){const m=+d.slice(5,7),dd=+d.slice(8,10);return (m>=4&&m<=9)||(m==10&&dd<=15)?'summer':'winter'}
function suggest(b){ // returns [price, note] — Morgana price list; others are typed by hand
 if(b.boat!='morgana'){const BIG={portofino2:[8000,11000,14000],coquette:[10000,12000,15000]}[b.boat];if(!BIG)return [0,'السعر يتكتب بالإيد للمركب ده'];
  const dw=new Date(b.date+'T12:00').getDay(),i=(dw==5||b.holiday)?2:dw==6?1:0;
  if(season(b.date)=='winter'&&b.trip=='day')return [BIG[i],'سعر الشتاء (6 – 4)'];if(season(b.date)=='summer'&&b.trip=='sunset')return [4000,'رحلة الساعتين صيف'];if(season(b.date)=='summer'&&b.trip=='day'){const W={portofino2:[11000,10000,10000,10000,11000,16500,12000],coquette:[12000,11000,11000,11000,12000,18000,14000]}[b.boat];return [W[(dw==5||b.holiday)?5:dw],'سعر الصيف (6 – 4)']}return [0,'السعر يتكتب بالإيد للرحلة دي']}
 const dw=new Date(b.date+'T12:00').getDay(),fri=dw==5||b.holiday,sat=dw==6,fish=b.kind=='fishing'?2000:0,s=season(b.date),t=b.trip;
 if(s=='winter'){if(t=='day')return[(fri?5500:sat?4500:3500)+fish,'سعر الشتاء'];if(t=='h24m'||t=='h24e')return[(fri?9000:sat?7000:6000)+fish,'سعر 24 ساعة شتاء'];}
 else{if(t=='day')return[(fri?12000:sat?8500:(dw==0||dw==4)?7000:6000)+fish,'سعر الصيف'];if(t=='sunset')return[(fri||sat)?2500:2000,'غروب صيف'];}
 return [0,'السعر يتكتب بالإيد للرحلة دي']}
function render(){const y=cur.getFullYear(),m=cur.getMonth(),f=BOAT;$('#tabs').innerHTML=CFG.boats.map(b=>'<button class="'+b.id+(b.id==f?' on':'')+'" data-boat="'+b.id+'">'+b.name+'<small>'+b.cap+' فرد</small></button>').join('');$('#mon').textContent=AR_M[m]+' '+y;
 const first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const today=ymd(new Date());let h=AR_D.map(d=>'<div class="dow">'+d+'</div>').join('');
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const s=ymd(d);
  const items=LIST.filter(b=>b.boat==f&&b.start.slice(0,10)<=s&&b.end.slice(0,10)>=s&&!(b.end.slice(0,10)==s&&b.end.slice(11)<='08:00'&&b.start.slice(0,10)!=s));
  h+='<div class="day'+(d.getMonth()!=m?' out':'')+(s==today?' today':'')+'"><div class="n"><span>'+d.getDate()+'</span><button data-new="'+s+'" title="حجز جديد">+</button></div>'+
   items.map(b=>'<button class="chip '+b.boat+(b.status=='cancelled'?' x':b.status=='pending'?' p':'')+(b.start.slice(0,10)!=s?' cont':'')+'" data-id="'+b.id+'" title="'+boat(b.boat).name+' '+b.start.slice(11)+'">'+esc(b.name)+' · '+(tripLab(b,'ar')||'يوم')+'</button>').join('')+'</div>'}
 $('#cal').innerHTML=h;
 const up=LIST.filter(b=>b.status!='cancelled'&&b.end.slice(0,10)>=today&&b.boat==f);
 $('#up').innerHTML=up.map(b=>{const rest=b.total-b.paid;return '<div class="row" data-id="'+b.id+'"><b>'+b.date.split('-').reverse().join('/')+'</b><span>'+boat(b.boat).name+'</span><span>'+tripLab(b,'ar')+'</span><span>'+esc(b.name)+'</span><span class="s">'+loc(b.phone)+'</span><span class="tag'+(rest?' due':'')+'">'+(b.status=='pending'?'⏳ مستني عربون'+(b.receipt?' · رفع التحويل':''):rest?'باقي '+fmt(rest):'مدفوع بالكامل')+'</span><span class="s">'+esc(b.by||'')+'</span></div>'}).join('')||'<p class="hint">مفيش حجوزات جاية.</p>'}
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
document.addEventListener('click',e=>{const t=e.target.closest('[data-boat]');if(t){BOAT=t.dataset.boat;try{localStorage.setItem('mb',BOAT)}catch(x){}return render()}const n=e.target.closest('[data-new]');if(n)return openEdit(null,n.dataset.new);const c=e.target.closest('[data-id]');if(c)openView(c.dataset.id)});
$('#prev').onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()-1,1);load()};$('#next').onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);load()};
$('#tod').onclick=()=>{cur=new Date();load()};$('#add').onclick=()=>openEdit(null,ymd(new Date()));
// ---- form
const F=$('#f');
function fillSelects(){$('#fboat').innerHTML=CFG.boats.map(b=>'<option value="'+b.id+'">'+b.name+' ('+b.cap+' فرد)</option>').join('');
 $('#fcap').innerHTML='<option value="">—</option>'+CFG.captains.map(c=>'<option>'+esc(c.name)+'</option>').join('')}
function applyPreset(){const p=PRESET[$('#ftrip').value];if(p){$('#ft1').value=p[0];$('#ft2').value=($('#ftrip').value=='day'&&($('#fboat').value!='morgana'||season($('#fdate').value||'2026-01-01')=='summer'))?'16:00':p[1]}reprice()}
let autoPrice=true;
function formData(){const fd=Object.fromEntries(new FormData(F));const p=PRESET[fd.trip];const d2=p?addD(fd.date,p[2]):(fd.t2<=fd.t1?addD(fd.date,1):fd.date);
 return {...fd,holiday:$('#fhol').checked,start:fd.date+'T'+fd.t1,end:d2+'T'+fd.t2}}
function reprice(){const b=formData();const[p,n]=suggest(b);$('#fhint').textContent=n+(p?' · المقترح '+fmt(p)+' · العربون نص المبلغ':'');if(p&&autoPrice){$('#ftotal').value=p;$('#fpaid').value=p/2}}
['#fkind','#fhol'].forEach(s=>$(s).addEventListener('change',reprice));['#fboat','#fdate'].forEach(s=>$(s).addEventListener('change',applyPreset));$('#ftrip').addEventListener('change',applyPreset);
$('#ftotal').addEventListener('input',()=>{autoPrice=false;$('#fpaid').value=Math.round(($('#ftotal').value||0)/2)});
function openEdit(b,date){editing=b;fillSelects();F.reset();$('#ferr').textContent='';$('#ft').textContent=b?'تعديل الحجز':'حجز جديد';autoPrice=!b;
 if(b){for(const k of['boat','trip','kind','guests','name','captain','total','paid','lang','source','note'])if(F[k])F[k].value=b[k]??'';F.phone.value=loc(b.phone);F.phone2.value=loc(b.phone2);$('#fhol').checked=!!b.holiday;F.date.value=b.date;$('#ft1').value=b.start.slice(11);$('#ft2').value=b.end.slice(11);reprice()}
 else{F.boat.value=BOAT;F.date.value=date;F.trip.value='day';applyPreset()}
 dView.close();dEdit.showModal()}
F.addEventListener('submit',async e=>{if(e.submitter&&e.submitter.value=='cancel')return;e.preventDefault();await save(false)});
async function save(force){const b=formData();$('#ferr').textContent='';$('#fsave').disabled=true;
 const j=editing?await api('/api/bookings/'+editing.id,{...b,action:'update',force}):await api('/api/bookings',{...b,force});$('#fsave').disabled=false;
 if(j.error=='clash'){if(confirm('المركب ده محجوز في نفس الوقت ('+j.with.name+' '+j.with.start.replace('T',' ')+'). تسجل الحجز برضو؟'))return save(true);return}
 if(j.error){$('#ferr').textContent='راجع: '+(j.fields||[j.error]).map(x=>({boat:'المركب',time:'المواعيد',name:'الاسم',phone:'الموبايل',total:'السعر',paid:'العربون أكبر من السعر'}[x]||x)).join('، ');return}
 dEdit.close();goTo(j.booking);await load();openView(j.booking.id)}
// ---- paste a WhatsApp confirmation
// Reads a Morgana booking-confirmation message (Arabic or English, as staff write it on WhatsApp).
function parseConfirm(raw){
  var t=String(raw||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/‏|‎|‪|‬|\*/g,'').replace(/\.{3,}/g,'\n');
  var o={},low=t.toLowerCase();
  var dm=t.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);
  if(dm){var y=+dm[3];if(y<100)y+=2000;o.date=y+'-'+String(dm[2]).padStart(2,'0')+'-'+String(dm[1]).padStart(2,'0')}
  var num=function(s){return Number(String(s).replace(/[^\d]/g,''))||0};
  var pm=t.match(/بدفع\s*مبلغ\s*([\d,.]+)[\s\S]*?(?:من\s*)?اصل\s*([\d,.]+)/)||t.match(/paying\s*([\d,.]+)[\s\S]*?out\s*of\s*([\d,.]+)/i);
  if(pm){o.paid=num(pm[1]);o.total=num(pm[2])}
  o.kind=/صيد|fishing/i.test(t)?'fishing':'outing';
  var h24=/24\s*(ساع|hour)/i.test(t);
  var tm=t.match(/من\s*(\d{1,2})(?::(\d{2}))?\s*(ص|م|صباح\S*|مساء\S*|am|pm)?\s*(?:الي|إلى|الى|ل|لـ|-)\s*(\d{1,2})(?::(\d{2}))?\s*(ص|م|صباح\S*|مساء\S*|am|pm)?/i)||t.match(/from\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  var s=6,e=17;
  if(tm){s=+tm[1];e=+tm[4];var sa=(tm[3]||'').toLowerCase(),ea=(tm[6]||'').toLowerCase();
    if(/^pm|^مساء/.test(sa)&&s<12)s+=12; if(/^pm|^مساء/.test(ea)&&e<12)e+=12;
    if(!/^(am|pm|صباح|مساء|ص)/.test(sa)){ if(s<=5)s+=12; }          // "م" is written for any time: 1–5 → afternoon, 6–11 → morning
    if(!/^(am|pm|صباح|مساء)/.test(ea)){ if(e<=7&&!(h24&&e===s-12))e+=12; }
    if(h24){e=s}}
  else if(h24){s=6;e=6}
  var pad=function(n){return String(n).padStart(2,'0')};
  o.t1=pad(s%24)+':'+(tm&&tm[2]?tm[2]:'00'); o.t2=pad(e%24)+':'+(tm&&tm[5]?tm[5]:'00');
  o.trip=h24?'custom':(s>=15?'custom':'day'); if(h24&&s===6)o.trip='h24m'; if(h24&&s===17)o.trip='h24e'; if(!h24&&s===6&&e===17)o.trip='day';
  if(!h24&&s===17&&e===6)o.trip='night5'; if(!h24&&s===16&&e===18)o.trip='sunset';
  o.boat=/portofino|بورتوفينو/i.test(t)?'portofino2':/coquette|كوكيت|كوكات/i.test(t)?'coquette':'morgana';
  var lines=t.split(/\n+/).map(function(l){return l.trim()}).filter(Boolean);
  var phones=[];lines.forEach(function(l){var d=l.replace(/^(mobile|موبايل|رقم)\s*:?\s*/i,'');if(/^\+?[\d\s\-]{10,20}$/.test(d)&&d.replace(/\D/g,'').length>=10)phones.push(d.replace(/[\s\-]/g,''))});
  o.phone=phones[0]||'';o.phone2=phones[1]||'';
  var nm=t.match(/name\s*:\s*(.+)/i);
  if(nm)o.name=nm[1].trim();
  else{var idx=lines.findIndex(function(l){return /^(morgana|portofino|coquette)/i.test(l)});
    if(idx>=0)for(var k=idx+1;k<lines.length;k++){if(!/\d{6,}/.test(lines[k])){o.name=lines[k];break}}}
  var ti=lines.findIndex(function(l){return /^(من|from)\s*\d/i.test(l)}),bi=lines.findIndex(function(l){return /^(morgana|portofino|coquette)/i.test(l)});
  if(ti>=0&&bi>ti)o.note=lines.slice(ti+1,bi).map(function(l){return l.replace(/^[-–•]\s*/,'')}).join(' · ');
  o.lang=/[a-z]{4}/i.test(t)&&/reservation/i.test(t)?'en':'ar';
  return o;
}

$('#paste').onclick=()=>{$('#ptxt').value='';$('#pres').textContent='';dPaste.showModal();setTimeout(()=>$('#ptxt').focus(),50)};
function splitMsgs(t){return t.split(/(?=رسال[هة]\s*تا?[أا]?كيد\s*الحجز|reservation\s*confirmation)/i).map(x=>x.trim()).filter(x=>/\d{1,2}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{2,4}/.test(x.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))))}
function toBooking(o){const p=PRESET[o.trip];const next=p?p[2]:(o.t2<=o.t1?1:0);return {boat:o.boat,trip:o.trip,kind:o.kind,date:o.date,start:o.date+'T'+o.t1,end:addD(o.date,next)+'T'+o.t2,name:o.name||'',phone:o.phone||'',phone2:o.phone2||'',total:o.total||0,paid:o.paid||0,lang:o.lang,source:'واتساب',guests:'',captain:'',holiday:false,note:o.note||''}}
$('#pgo').onclick=async()=>{const msgs=splitMsgs($('#ptxt').value);if(!msgs.length){$('#pres').textContent='مش لاقي تاريخ في الرسالة. اتأكد إنك لزقت رسالة تأكيد الحجز كاملة.';return}
 if(msgs.length===1){const o=parseConfirm(msgs[0]);dPaste.close();openEdit(null,o.date);autoPrice=false;
  for(const k of['boat','trip','kind','name','total','paid','lang'])if(F[k]&&o[k]!==undefined&&o[k]!=='')F[k].value=o[k];
  F.phone.value=o.phone||'';F.phone2.value=o.phone2||'';F.source.value='واتساب';F.note.value=o.note||'';$('#ft1').value=o.t1;$('#ft2').value=o.t2;
  $('#fhint').textContent='اتملت من رسالة الواتساب — راجعها ودوس حفظ';$('#ft').textContent='حجز من رسالة واتساب';return}
 let ok=0,res=[],last=null;$('#pgo').disabled=true;
 for(const m of msgs){const o=parseConfirm(m),b=toBooking(o);
  if(!b.name||!b.phone||!b.total){res.push('⚠️ '+(o.date||'?')+' '+(b.name||'')+': ناقص اسم أو موبايل أو سعر — اتسابت');continue}
  const j=await api('/api/bookings',b);
  if(j.ok){ok++;last=j.booking;res.push('✓ '+o.date+' '+boat(b.boat).name+' — '+b.name)}
  else if(j.error==='clash')res.push('↩︎ '+o.date+' '+b.name+': متسجلة قبل كده أو اليوم محجوز ('+j.with.name+')');
  else res.push('⚠️ '+o.date+' '+b.name+': '+(j.fields||[j.error]).join(','))}
 $('#pgo').disabled=false;$('#pres').textContent='اتسجل '+ok+' من '+msgs.length+'\n'+res.join('\n');if(last)goTo(last);await load()};
// ---- messages
function hl(t,lang){let h=+t.slice(0,2),mi=t.slice(3);const mm=mi=='00'?'':':'+mi;
 if(lang=='en'){const ap=h<12?'am':'pm';return ((h%12)||12)+mm+ap}
 const w=h<12?'الصبح':h<16?'الظهر':h<18?'العصر':h<20?'المغرب':'بالليل';return ((h%12)||12)+mm+' '+w}
function tripLab(b,lang){const t=b.trip,en=lang=='en';const a=[];
 if(t=='h24m'||t=='h24e')a.push(en?'24 hours':'24 ساعه');else if(t.startsWith('night'))a.push(en?'Overnight':'مسائي');else if(t=='sunset')a.push(en?'Sunset':'غروب');
 if(b.kind=='fishing')a.push(en?'Fishing':'صيد');return a.join(' ')}
function conf(b){if(b.lang=='both')return conf({...b,lang:'ar'});const d=new Date(b.date+'T12:00'),dd=b.date.split('-').reverse().map(Number).join('/'),rest=b.total-b.paid,bt=boat(b.boat),next=b.end.slice(0,10)!=b.date;
 const ph=[loc(b.phone),loc(b.phone2)].filter(Boolean).join('\n'),lab=tripLab(b,b.lang);
 if(b.lang=='en')return 'Reservation confirmation\n\nThe reservation is confirmed\n\nDate: '+EN_D[d.getDay()]+'  '+dd+'\n\nby paying '+fmt(b.paid)+' out of '+fmt(b.total)+' and the remaining amount of '+fmt(rest)+' to be paid upon arrival\n\nFrom '+hl(b.start.slice(11),'en')+' to '+hl(b.end.slice(11),'en')+(next?' (next day)':'')+'\n\n'+(lab?lab+'\n\n':'')+bt.name+' '+(bt.cap||'')+'\n\nName: '+b.name+'\n\nMobile: '+ph;
 return 'رساله تاكيد الحجز\n\nتم تأكيد الحجز يوم '+AR_D[d.getDay()]+'  '+dd+' بدفع مبلغ '+fmt(b.paid)+' جم من اصل '+fmt(b.total)+' جم ومتبقي '+fmt(rest)+' يتم دفعها عند الوصول\n\nمن '+hl(b.start.slice(11),'ar')+' الي '+hl(b.end.slice(11),'ar')+(next?' (تاني يوم)':'')+'\n\n'+(lab?lab+'\n\n':'')+bt.name+'\n\n'+b.name+'\n\n'+ph}
function full(b){const bt=boat(b.boat),m=CFG.marinas[bt.marina]||{},cap=CFG.captains.find(c=>c.name==b.captain),en=b.lang=='en';
 let s=conf(b)+'\n\n📍 '+(en?m.en:m.ar)+(m.map?'\n'+m.map:'');
 if(cap)s+=en?'\n\nYour captain: '+cap.name+'\n'+loc(cap.phone):'\n\nده رقم الريس '+cap.name+' اللي هيكون معاكم\n'+loc(cap.phone);
 s+=en?'\n\nImportant: please bring original national IDs or passports, and birth certificates for children.\nAlcohol is strictly not allowed on board.\n\nHave a great day with us!':'\n\nاهم حاجه هاتوا معاكوا البطايق او الباسبورات او شهادات الميلاد للاطفال (الاصل)\n\nانشاء الله تقضوا يوم جميل وتتبسطوا';return s}
const wa=(p,t)=>'https://wa.me/'+(p||'')+'?text='+encodeURIComponent(t);
function invUrl(b){return location.origin+'/invoice/'+b.id+'/'+b.tok}
function custMsg(b){if(b.lang=='both'){const u=invUrl(b),dd=b.date.split('-').reverse().map(Number).join('/');return 'أهلا '+b.name+'\nتم تأكيد حجزك مع Morgana يوم '+dd+' ✅\nYour Morgana booking on '+dd+' is confirmed ✅\n\nفاتورة الحجز / Your invoice:\n'+u+'\n\nاهم حاجه هاتوا معاكوا البطايق او الباسبورات او شهادات الميلاد للاطفال (الاصل)\nPlease bring original IDs / passports, and birth certificates for children.\n\nانشاء الله تقضوا يوم جميل وتتبسطوا 🌊'}const u=invUrl(b),dd=b.date.split('-').reverse().map(Number).join('/');
 if(b.lang=='en')return 'Hello '+b.name+',\nYour Morgana booking on '+dd+' is confirmed ✅\n\nYour invoice:\n'+u+'\n\nPlease bring original IDs / passports, and birth certificates for children.\nSee you soon!';
 return 'أهلا '+b.name+'\nتم تأكيد حجزك مع Morgana يوم '+dd+' ✅\n\nفاتورة الحجز:\n'+u+'\n\nاهم حاجه هاتوا معاكوا البطايق او الباسبورات او شهادات الميلاد للاطفال (الاصل)\n\nانشاء الله تقضوا يوم جميل وتتبسطوا'}
async function openView(id){let b=LIST.find(x=>x.id==id);if(!b)return;
 if(!b.tok){const j=await api('/api/bookings/'+b.id,{action:'tok'});if(j.booking){Object.assign(b,j.booking)}}
 viewing=b;const bt=boat(b.boat),cap=CFG.captains.find(c=>c.name==b.captain),u=invUrl(b);
 $('#vt').textContent=bt.name+' · '+b.date.split('-').reverse().join('/')+(b.status=='cancelled'?' (ملغي)':b.status=='pending'?' (مستني عربون)':'');
 $('#vinfo').textContent=(b.confirmedBy?'✓ اتأكد بـ '+b.confirmedBy+' · ':'')+'سجّله: '+(b.by||'')+(b.source?' · من '+b.source:'')+(b.note?' · '+b.note:'');
 $('#vinv').src=u;$('#vopen').href=u;$('#vmsg').textContent=u;
 $('#wC').href=wa(b.phone,custMsg(b));$('#wG').href=wa('',conf(b)+'\n\n'+u);
 $('#wK').hidden=!cap||!cap.phone;if(cap)$('#wK').href=wa(cap.phone,conf(b));
 $('#vcx').textContent=b.status=='cancelled'?'رجّع الحجز':'إلغاء الحجز';$('#vdel').hidden=!ME.admin;$('#verr').textContent='';
 const pe=b.status=='pending';$('#vpend').hidden=!pe;$('#vrcs').innerHTML='';
 if(pe){$('#vpaid').value=b.deposit||Math.ceil(b.total/2);$('#vpinfo').textContent='الإجمالي '+fmt(b.total)+' · العربون المطلوب '+fmt(b.deposit||Math.ceil(b.total/2))+(b.receipt?' · العميل رفع صورة التحويل':' · لسه ما رفعش صورة التحويل');
  $('#vver').textContent=b.verify?(b.verify.ok?'':'الفحص الأوتوماتيك لصورة التحويل ما عدّاش:\n• '+b.verify.reasons.join('\n• ')):'';
  if(b.receipt){const cnt=(b.payments||[]).length+1;for(let i=0;i<cnt;i++)fetch('/api/receipt/'+b.id+'?n='+i,{headers:{'x-key':KEY}}).then(r=>r.ok?r.blob():null).then(x=>{if(x){const im=new Image();im.src=URL.createObjectURL(x);im.style.maxHeight='300px';im.style.borderRadius='8px';$('#vrcs').append(im)}})}
  if(b.payments&&b.payments.length)$('#vpinfo').textContent+=' · التحويلات: '+b.payments.map(p=>fmt(p.amount)+' (Ref '+p.ref+')').join(' + ')+' = '+fmt(b.paid);}
 dView.showModal()}
$('#vconf').onclick=async()=>{const j=await api('/api/bookings/'+viewing.id,{action:'confirm',paid:$('#vpaid').value});if(j.error){$('#verr').textContent=j.error=='paid'?'اكتب المبلغ صح':j.error=='clash'?'اليوم محجوز لحد تاني':j.error;return}await load();openView(viewing.id)}
$('#cp').onclick=()=>navigator.clipboard.writeText(invUrl(viewing)).then(()=>{$('#cp').textContent='اتنسخ ✓';setTimeout(()=>$('#cp').textContent='نسخ اللينك',1500)});
$('#ved').onclick=()=>openEdit(viewing);
$('#vcx').onclick=async()=>{const a=viewing.status=='cancelled'?'restore':'cancel';if(a=='cancel'&&!confirm('تلغي الحجز ده؟'))return;const j=await api('/api/bookings/'+viewing.id,{action:a});if(j.error){$('#verr').textContent=j.error=='clash'?'المركب اتحجز في نفس الوقت':j.error;return}dView.close();load()};
$('#vdel').onclick=async()=>{if(!confirm('مسح نهائي للحجز؟ مش هيرجع تاني.'))return;await api('/api/bookings/'+viewing.id,{action:'delete'});dView.close();load()};
// ---- settings (owner)
function capRow(c){return '<div class="g2" style="margin-bottom:6px"><input class="cn" placeholder="اسم الريس" value="'+esc(c.name)+'"><input class="cp" placeholder="موبايل" value="'+esc(loc(c.phone))+'"></div>'}
$('#set').onclick=()=>{$('#caps').innerHTML=CFG.captains.map(capRow).join('')||capRow({});$('#wadiMap').value=(CFG.marinas.wadi||{}).map||'';$('#stf').innerHTML=(CFG.staff||[]).map(n=>'<div class="row" style="cursor:auto">'+esc(n)+'<span style="flex:1"></span><button type="button" data-rm="'+esc(n)+'">شيل</button></div>').join('');$('#stKey').hidden=true;$('#serr').textContent='';dSet.showModal()};
$('#capAdd').onclick=()=>$('#caps').insertAdjacentHTML('beforeend',capRow({}));
async function sset(body){const j=await api('/api/booking-settings',body);if(j.error){$('#serr').textContent=j.error;return null}CFG.captains=j.captains;CFG.marinas=j.marinas;CFG.staff=j.staff;CFG.boats=j.boats;$('#serr').textContent='اتحفظ ✓';return j}
$('#capSave').onclick=()=>sset({action:'captains',captains:[...document.querySelectorAll('#caps .g2')].map(r=>({name:r.querySelector('.cn').value,phone:r.querySelector('.cp').value}))});
$('#mapSave').onclick=()=>sset({action:'marina',id:'wadi',map:$('#wadiMap').value.trim()});
$('#stAdd').onclick=async()=>{const j=await sset({action:'add_staff',name:$('#stName').value});if(j){$('#stKey').hidden=false;$('#stKey').textContent='مفتاح '+$('#stName').value+' (ابعتهوله، مش هيظهر تاني):\n'+j.key+'\n\nاللينك: '+location.origin+'/staff';$('#stName').value='';$('#set').onclick()}};
document.addEventListener('click',async e=>{const r=e.target.closest('[data-rm]');if(r&&confirm('تشيل '+r.dataset.rm+'؟ مفتاحه هيبطل يشتغل.')){await sset({action:'remove_staff',name:r.dataset.rm});$('#set').onclick()}});
if(KEY)load().catch(()=>logout());else logout();
</script></body></html>`;

export function onRequestGet() {
  return new Response(PAGE, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow'}});
}
