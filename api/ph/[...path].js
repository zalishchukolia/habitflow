export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ph', '')

  const isAssets = path.startsWith('/static/') || path.startsWith('/array/')
  const host = isAssets ? 'us-assets.i.posthog.com' : 'us.i.posthog.com'
  const target = `https://${host}${path}${url.search}`

  const headers = new Headers(req.headers)
  headers.set('host', host)

  headers.delete('content-length')
  headers.delete('cookie')

  return fetch(target, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    redirect: 'follow',
  })
}
