// Booking board helpers (staff only). KV binding: BOATS (shared with the boats-for-sale feature).
import {sha256, json} from './_lib.js';

export const DEFAULT_CFG = {
  boats: [
    {id: 'morgana', name: 'Morgana', cap: 10, marina: 'portrait'},
    {id: 'portofino2', name: 'Portofino 2', cap: 25, marina: 'wadi'},
    {id: 'coquette', name: 'Coquette', cap: 30, marina: 'wadi'},
  ],
  marinas: {
    portrait: {ar: 'مارينا جنب فندق بورتريه السخنة', en: 'Marina next to Portrait Sokhna hotel', map: 'https://maps.app.goo.gl/SXAujUUTXbg5q87i8'},
    wadi: {ar: 'مارينا وادي الدوم قدام بورتو السخنة', en: 'Wadi El Dom marina, opposite Porto Sokhna', map: ''},
  },
  captains: [],   // [{name, phone}] — added from the board's settings, never hard-coded
  staff: [],      // [{name, keyHash}]
};

export async function getCfg(env) {
  const raw = await env.BOATS.get('cfg');
  const c = raw ? JSON.parse(raw) : {};
  return {...DEFAULT_CFG, ...c, marinas: {...DEFAULT_CFG.marinas, ...(c.marinas || {})}};
}

// Returns {name, admin} for a valid key, else null.
export async function who(env, request) {
  const key = request.headers.get('x-key') || '';
  if (key.length < 16) return null;
  const h = await sha256(key);
  if (h === await env.BOATS.get('admin')) return {name: 'Peter', admin: true};
  const cfg = await getCfg(env);
  const s = (cfg.staff || []).find(x => x.keyHash === h);
  return s ? {name: s.name, admin: false} : null;
}
export const deny = () => json({error: 'auth'}, 401);

// All bookings whose date is within [from, to] (YYYY-MM-DD strings).
export async function listBookings(env, from, to) {
  const out = [];
  let cursor;
  do {
    const r = await env.BOATS.list({prefix: 'bk:', cursor});
    for (const k of r.keys) {
      const d = k.name.slice(3, 13);
      if (d < from || d > to) continue;
      const v = await env.BOATS.get(k.name);
      if (v) out.push(JSON.parse(v));
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export const addDays = (d, n) => {
  const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

// Another active booking of the same boat whose time overlaps [start, end)?
export async function clash(env, b) {
  const near = await listBookings(env, addDays(b.date, -2), addDays(b.date, 2));
  return near.find(x => x.id !== b.id && holds(x) && x.boat === b.boat && x.start < b.end && b.start < x.end) || null;
}

// Does this booking block the boat? Unpaid website requests stop holding the slot after 24 h with no receipt.
export const holds = x => x.status === 'confirmed' || (x.status === 'pending' && (x.receipt || Date.now() - x.created < 86400000));
