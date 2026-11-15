// GET /boat-img/<id>/<n>  → listing photo stored in KV
export async function onRequestGet({env, params}) {
  const [id, n] = params.path || [];
  if (!id || !/^\d$/.test(n || '')) return new Response('Not found', {status: 404});
  const {value, metadata} = await env.BOATS.getWithMetadata(`i:${id}:${n}`, {type: 'arrayBuffer'});
  if (!value) return new Response('Not found', {status: 404});
  return new Response(value, {headers: {'content-type': metadata?.type || 'image/webp', 'cache-control': 'public, max-age=86400'}});
}
