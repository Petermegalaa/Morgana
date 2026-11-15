export const onRequestGet = () => new Response('User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://www.morganayacht.com/sitemap.xml\nSitemap: https://www.morganayacht.com/sitemap-boats.xml\n',
  {headers: {'content-type': 'text/plain; charset=utf-8'}});
