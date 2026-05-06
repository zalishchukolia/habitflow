export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const target = `https://us.i.posthog.com/e/${url.search}`

  const headers = new Headers()
  headers.set('host', 'us.i.posthog.com')
  headers.set('content-type', req.headers.get('content-type') || 'application/json')

  const xff = req.headers.get('x-forwarded-for')
  if (xff) headers.set('x-forwarded-for', xff)

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()

  const response = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: 'follow',
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
