export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ingest', '')
  const isStatic = path.startsWith('/static/')
  const host = isStatic ? 'us-assets.i.posthog.com' : 'us.i.posthog.com'
  const target = `https://${host}${path}${url.search}`

  const headers = new Headers(req.headers)
  headers.set('host', host)
  headers.set('origin', `https://${host}`)
  headers.set('referer', `https://${host}${path}`)

  return fetch(target, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
  })
}