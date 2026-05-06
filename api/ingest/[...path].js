export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ingest', '')
  const isStatic = path.startsWith('/static/')
  const host = isStatic
    ? 'https://us-assets.i.posthog.com'
    : 'https://us.i.posthog.com'

  const target = `${host}${path}${url.search}`

  const headers = new Headers(req.headers)
  headers.set('host', isStatic ? 'us-assets.i.posthog.com' : 'us.i.posthog.com')
  headers.set('x-forwarded-for', req.headers.get('x-forwarded-for') || '')

  return fetch(target, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
  })
}