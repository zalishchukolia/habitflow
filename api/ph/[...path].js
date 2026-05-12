export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/ph/, '').replace(/\/$/, '') || '/'

  const host = 'eu.i.posthog.com'
  const target = `https://${host}${path}${url.search}`

  const headers = new Headers()
  headers.set('host', host)

  const ct = req.headers.get('content-type')
  if (ct) headers.set('content-type', ct)

  const ce = req.headers.get('content-encoding')
  if (ce) headers.set('content-encoding', ce)

  const xff = req.headers.get('x-forwarded-for')
  if (xff) headers.set('x-forwarded-for', xff)

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body

  return fetch(target, {
    method: req.method,
    headers,
    body,
  })
}
