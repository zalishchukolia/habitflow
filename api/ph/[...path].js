export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/ph/, '').replace(/\/$/, '') || '/'

  const host = 'us.i.posthog.com'
  const target = `https://${host}${path}${url.search}`

  const headers = new Headers()
  headers.set('host', host)
  headers.set('content-type', req.headers.get('content-type') || 'application/json')

  const xff = req.headers.get('x-forwarded-for')
  if (xff) headers.set('x-forwarded-for', xff)

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()

  return fetch(target, {
    method: req.method,
    headers,
    body,
  })
}
