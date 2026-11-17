import {json} from '../_lib.js';
import {listBookings, holds, addDays} from '../_bk.js';
// GET /api/availability?boat=morgana&from=YYYY-MM-DD&to=YYYY-MM-DD → busy time ranges only (no customer data)
export async function onRequestGet({request, env}) {
  const u = new URL(request.url), boat = u.searchParams.get('boat') || 'morgana';
  const from = u.searchParams.get('from') || '', to = u.searchParams.get('to') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from || to > addDays(from, 100)) return json({error: 'range'}, 400);
  const list = (await listBookings(env, addDays(from, -1), to)).filter(x => x.boat === boat && holds(x));
  return json({busy: list.map(x => [x.start, x.end])});
}
