import {json} from '../_lib.js';
import {getHolidays} from '../_holidays.js';
export async function onRequestGet({env}) { return json({dates: await getHolidays(env)}); }
