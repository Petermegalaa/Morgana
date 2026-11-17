import {bookPage} from './_bookpage.js';
export const onRequestGet = ({request, env}) => bookPage(request, env, 'ar');
