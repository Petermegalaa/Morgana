// Morgana price list for the online booking page. Same code runs on the server (authoritative)
// and is injected into the page for the live total, so the two can never disagree.
export function quote(o) {
  const ADD = {fishing: 2000, h24: 3000, rod: 100, bait: 150};
  const d = new Date(o.date + 'T12:00:00Z'), m = d.getUTCMonth() + 1, day = d.getUTCDate(), w = d.getUTCDay();
  const summer = (m >= 4 && m <= 9) || (m === 10 && day <= 15);
  const fri = w === 5, sat = w === 6;
  const base = summer ? (fri ? 12000 : sat ? 8500 : (w === 0 || w === 4) ? 7000 : 6000)
                      : (fri ? 5500 : sat ? 4500 : 3500);
  const rods = Math.max(0, Math.min(10, parseInt(o.rods) || 0)), bait = Math.max(0, Math.min(20, parseInt(o.bait) || 0));
  const items = [{k: 'base', qty: 1, unit: base, amount: base}];
  if (o.fishing) items.push({k: 'fishing', qty: 1, unit: ADD.fishing, amount: ADD.fishing});
  if (o.h24) items.push({k: 'h24', qty: 1, unit: ADD.h24, amount: ADD.h24});
  if (rods) items.push({k: 'rod', qty: rods, unit: ADD.rod, amount: rods * ADD.rod});
  if (bait) items.push({k: 'bait', qty: bait, unit: ADD.bait, amount: bait * ADD.bait});
  const total = items.reduce((s, i) => s + i.amount, 0);
  return {season: summer ? 'summer' : 'winter', items, total, deposit: Math.ceil(total / 2)};
}
export const ITEM_LABEL = {
  base: {ar: 'رحلة يوم كامل على يخت Morgana', en: 'Full-day trip on Morgana'},
  fishing: {ar: 'رحلة صيد', en: 'Fishing trip'},
  h24: {ar: 'تحويل الرحلة لـ 24 ساعة', en: 'Extend to 24 hours'},
  rod: {ar: 'سنارة', en: 'Fishing rod'},
  bait: {ar: 'طبق طعم (نص كيلو جمبري)', en: 'Bait plate (½ kg shrimp)'},
};
