export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ph', '')
  const target = `https://us-assets.i.posthog.com${path}${url.search}`

  const headers = new Headers()
  headers.set('host', 'us-assets.i.posthog.com')

  const response = await fetch(target, {
    method: req.method,
    headers,
    redirect: 'follow',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('transfer-encoding')

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}
