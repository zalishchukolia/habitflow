export const runtime = 'edge'

export default async function handler(req) {
  // OPTIONS для CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  const url = new URL(req.url)

  const path = url.pathname.replace('/api/ph', '')
  const target = `https://eu.i.posthog.com${path}${url.search}`

  const response = await fetch(target, {
    method: req.method,
    headers: req.headers,
    body:
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : req.body,
    redirect: 'follow',
  })

  const headers = new Headers(response.headers)

  headers.set('Access-Control-Allow-Origin', '*')

  return new Response(response.body, {
    status: response.status,
    headers,
  })
}