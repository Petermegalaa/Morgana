// Keep the pages.dev copies (test/preview) out of Google; the live domain is unaffected.
export async function onRequest({request, next}) {
  const res = await next();
  if (!new URL(request.url).hostname.endsWith('.pages.dev')) return res;
  const r = new Response(res.body, res);
  r.headers.set('X-Robots-Tag', 'noindex');
  return r;
}
