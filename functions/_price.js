// Price list for the online booking page. The same function runs on the server (authoritative)
// and is injected into the page for the live total, so the two can never disagree.
// o = {boat, trip: 'day'|'sunset', date: 'YYYY-MM-DD', holiday: bool, fishing, h24, rods, bait}
export function quote(o) {
  var P = {
    morgana: {cap: 10, addons: true,
      winter: {day: [3500, 4500, 5500], h24: [2500, 2500, 3500], hours: ['06:00', '17:00']},
      summer: {day: null, sunset: [2000, 2500], hours: ['06:00', '16:00']}},
    portofino2: {cap: 25, addons: false,
      winter: {day: [8000, 11000, 14000], hours: ['06:00', '16:00']},
      summer: {day: null, sunset: [4000, 4000], hours: ['06:00', '16:00']}},
    coquette: {cap: 30, addons: false,
      winter: {day: [10000, 12000, 15000], hours: ['06:00', '16:00']},
      summer: {day: null, sunset: [4000, 4000], hours: ['06:00', '16:00']}},
  };
  var b = P[o.boat];
  if (!b || !/^\d{4}-\d{2}-\d{2}$/.test(o.date || '')) return {ok: false, err: 'date'};
  var d = new Date(o.date + 'T12:00:00Z'), m = d.getUTCMonth() + 1, dd = d.getUTCDate(), w = d.getUTCDay();
  var season = (m >= 4 && m <= 9) || (m === 10 && dd <= 15) ? 'summer' : 'winter', S = b[season];
  var fri = w === 5 || !!o.holiday, sat = w === 6 && !fri;
  var idx = fri ? 2 : sat ? 1 : 0;                      // [Sun–Thu, Sat, Fri / public holiday]
  if (o.boat === 'morgana' && season === 'summer') S = Object.assign({}, S, {day: [fri ? 12000 : sat ? 8500 : (w === 0 || w === 4) ? 7000 : 6000]});
  var trip = o.trip === 'sunset' ? 'sunset' : 'day';
  var opts = {day: !!(S.day), sunset: !!S.sunset, h24: !!(S.h24 && b.addons), addons: b.addons};
  var next = function (s) { var t = new Date(s + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };
  if (!opts[trip]) return {ok: false, err: 'trip', season: season, opts: opts, cap: b.cap};
  var base = trip === 'sunset' ? S.sunset[fri || sat ? 1 : 0] : (S.day.length === 1 ? S.day[0] : S.day[idx]);
  var add = {fishing: 2000, h24: S.h24 ? S.h24[idx] : 0, rod: 100, bait: 150};
  var items = [{k: o.boat + '_' + trip, qty: 1, unit: base, amount: base}];
  var h24 = trip === 'day' && opts.h24 && !!o.h24;
  if (b.addons && trip === 'day' && o.fishing) items.push({k: 'fishing', qty: 1, unit: add.fishing, amount: add.fishing});
  if (h24) items.push({k: 'h24', qty: 1, unit: add.h24, amount: add.h24});
  var dayAdd = b.addons && trip === 'day';
  var rods = dayAdd ? Math.max(0, Math.min(10, parseInt(o.rods) || 0)) : 0, bait = dayAdd ? Math.max(0, Math.min(20, parseInt(o.bait) || 0)) : 0;
  if (rods) items.push({k: 'rod', qty: rods, unit: add.rod, amount: rods * add.rod});
  if (bait) items.push({k: 'bait', qty: bait, unit: add.bait, amount: bait * add.bait});
  var total = items.reduce(function (s, i) { return s + i.amount; }, 0);
  var start = o.date + 'T' + (trip === 'sunset' ? '16:00' : S.hours[0]);
  var end = h24 ? next(o.date) + 'T06:00' : o.date + 'T' + (trip === 'sunset' ? '18:00' : S.hours[1]);
  return {ok: true, season: season, opts: opts, add: add, cap: b.cap, items: items, total: total, deposit: Math.ceil(total / 2), start: start, end: end, h24: h24, fishing: !!(b.addons && trip === 'day' && o.fishing)};
}
export const ITEM_LABEL = {
  morgana_day: {ar: 'رحلة يوم كامل على يخت Morgana', en: 'Full-day trip on Morgana'},
  morgana_sunset: {ar: 'رحلة الغروب (ساعتين) على Morgana', en: 'Sunset trip (2 hours) on Morgana'},
  portofino2_day: {ar: 'رحلة يوم كامل على يخت Portofino 2', en: 'Full-day trip on Portofino 2'},
  portofino2_sunset: {ar: 'رحلة الغروب (ساعتين) على Portofino 2', en: 'Sunset trip (2 hours) on Portofino 2'},
  coquette_day: {ar: 'رحلة يوم كامل على يخت Coquette', en: 'Full-day trip on Coquette'},
  coquette_sunset: {ar: 'رحلة الغروب (ساعتين) على Coquette', en: 'Sunset trip (2 hours) on Coquette'},
  fishing: {ar: 'رحلة صيد', en: 'Fishing trip'},
  h24: {ar: 'تحويل الرحلة لـ 24 ساعة', en: 'Extend to 24 hours'},
  rod: {ar: 'سنارة', en: 'Fishing rod'},
  bait: {ar: 'طبق طعم (نص كيلو جمبري)', en: 'Bait plate (½ kg shrimp)'},
};
