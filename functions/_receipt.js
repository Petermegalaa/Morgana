// Reads an InstaPay "Transaction Successful" screenshot with Workers AI (vision) and checks it against a booking.
// The booking is auto-confirmed only if EVERY check passes; anything else stays pending for staff to check by hand.
export const PAYEE = {phone: '1028816191', name: /^peter/i};   // Morgana's InstaPay receiving account
const MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';
const PROMPT = `This is a screenshot of an Egyptian InstaPay (IPN) bank transfer receipt. Read it and answer with ONLY this JSON, nothing else:
{"status":"success|failed|pending|unknown","title":"<the big status title text exactly as shown>","amount":<transfer amount as a number, no commas>,"currency":"<e.g. EGP>","to_name":"<receiver name as shown>","to_phone":"<receiver mobile number as shown, digits only>","reference":"<reference number, digits only>","date":"<date and time exactly as shown>","date_iso":"<the same date/time as YYYY-MM-DDTHH:MM in 24-hour time>"}
status is "success" only if the receipt clearly says the transaction was successful with a check mark. Use "failed" for failed/declined/rejected/error and "pending" for pending/processing. If it is not an InstaPay receipt, use "unknown".`;

export async function readReceipt(env, buf) {
  if (!env.AI) return {error: 'no_ai'};
  const bytes = new Uint8Array(buf);
  let b64 = ''; for (let i = 0; i < bytes.length; i += 32768) b64 += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
  const dataUrl = 'data:image/jpeg;base64,' + btoa(b64);
  const run = async () => {
    try { return await env.AI.run(MODEL, {prompt: PROMPT, image: [...bytes], max_tokens: 300, temperature: 0}); }
    catch (e) {
      if (/agree/i.test(String(e))) throw e;
      return await env.AI.run(MODEL, {messages: [{role: 'user', content: [{type: 'text', text: PROMPT}, {type: 'image_url', image_url: {url: dataUrl}}]}], max_tokens: 300, temperature: 0});
    }
  };
  let r;
  try { r = await run(); }
  catch (e) {
    if (!/agree/i.test(String(e))) return {error: 'ai', detail: String(e).slice(0, 200)};
    try { await env.AI.run(MODEL, {prompt: 'agree'}); r = await run(); } catch (e2) { return {error: 'ai', detail: String(e2).slice(0, 200)}; }
  }
  const txt = (r && (r.response || r.result || '')) + '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return {error: 'parse', raw: txt.slice(0, 300)};
  try { return JSON.parse(m[0]); } catch (e) { return {error: 'parse', raw: txt.slice(0, 300)}; }
}

// Cairo wall-clock "YYYY-MM-DDTHH:MM" for a timestamp (handles Egypt's summer time).
export function cairo(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})
    .formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
const MON = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12};
export function parseDate(d) {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(d.date_iso || '')) return d.date_iso.slice(0, 16);
  const m = String(d.date || '').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})\D+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return '';
  let h = +m[4]; if (m[6]) { const pm = /pm/i.test(m[6]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
  const mo = MON[m[2].toLowerCase()]; if (!mo) return '';
  const z = n => String(n).padStart(2, '0');
  return `${m[3]}-${z(mo)}-${z(+m[1])}T${z(h)}:${m[5]}`;
}

// Pure check (unit-testable). Returns {ok, reasons[], amount, reference, when}.
export function checkReceipt(d, b, nowMs, usedRef) {
  const reasons = [];
  if (!d || d.error) return {ok: false, reasons: ['مقدرناش نقرا الصورة']};
  const title = String(d.title || '');
  if (d.status !== 'success' || /fail|declin|reject|pending|process|error|فشل|مرفوض|قيد/i.test(title) || !/success|نجاح|بنجاح/i.test(title))
    reasons.push('حالة التحويل مش «Transaction Successful»');
  const amount = Number(String(d.amount ?? '').replace(/[^\d.]/g, '')) || 0;
  const need = b.deposit || Math.ceil(b.total / 2);
  if (String(d.currency || 'EGP').toUpperCase().indexOf('EGP') < 0) reasons.push('العملة مش جنيه');
  if (amount < need) reasons.push(`المبلغ ${amount} أقل من العربون ${need}`);
  if (amount > b.total) reasons.push(`المبلغ ${amount} أكبر من إجمالي الحجز`);
  const phone = String(d.to_phone || '').replace(/\D/g, '');
  if (!(phone.endsWith(PAYEE.phone) || PAYEE.name.test(String(d.to_name || '').trim()))) reasons.push('التحويل مش لحساب Morgana على انستاباي');
  const ref = String(d.reference || '').replace(/\D/g, '');
  if (ref.length < 8) reasons.push('رقم العملية (Reference) مش واضح');
  else if (usedRef && usedRef !== b.id) reasons.push('رقم العملية ده اتستخدم قبل كده في حجز تاني');
  const when = parseDate(d);
  const from = cairo(b.created - 10 * 60e3), to = cairo(nowMs + 10 * 60e3);
  if (!when) reasons.push('تاريخ التحويل مش واضح');
  else if (when < from || when > to) reasons.push(`تاريخ التحويل ${when.replace('T', ' ')} مش بعد وقت الحجز ${cairo(b.created).replace('T', ' ')}`);
  return {ok: reasons.length === 0, reasons, amount, reference: ref, when};
}
