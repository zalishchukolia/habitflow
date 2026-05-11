export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ph', '') || '/'

  // EU регіон (де зареєстрований ваш проєкт)
  const isAssets = path.startsWith('/static/') || path.startsWith('/array/')
  const host = isAssets ? 'eu-assets.i.posthog.com' : 'eu.i.posthog.com'
  const target = `https://${host}${path}${url.search}`

  const headers = new Headers()
  headers.set('host', host)
  headers.set('content-type', req.headers.get('content-type') || 'application/json')

  // Передаємо реальний IP користувача (важливо для геоаналітики)
  const xff = req.headers.get('x-forwarded-for')
  if (xff) headers.set('x-forwarded-for', xff)
  
  // Передаємо реальний User-Agent
  const ua = req.headers.get('user-agent')
  if (ua) headers.set('user-agent', ua)

  // Передаємо origin для CORS
  const origin = req.headers.get('origin')
  if (origin) headers.set('origin', origin)

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()

  const response = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: 'follow',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('transfer-encoding')
  
  // CORS заголовки щоб працювало з будь-якого домену
  responseHeaders.set('access-control-allow-origin', '*')
  responseHeaders.set('access-control-allow-methods', 'GET, POST, OPTIONS')
  responseHeaders.set('access-control-allow-headers', 'content-type')

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}