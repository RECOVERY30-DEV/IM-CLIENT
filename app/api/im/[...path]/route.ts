import { NextRequest, NextResponse } from 'next/server'

const upstreamBaseUrl = process.env.IM_API_BASE_URL?.replace(/\/$/, '')

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!upstreamBaseUrl) {
    return NextResponse.json(
      { success: false, data: null, error: { message: 'iM 서버 주소가 설정되지 않았습니다.' } },
      { status: 503 },
    )
  }

  const { path } = await context.params
  const url = new URL(`${upstreamBaseUrl}/${path.map(encodeURIComponent).join('/')}`)
  url.search = request.nextUrl.search
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const body = request.method === 'GET' ? undefined : await request.text()
    const response = await fetch(url, {
      method: request.method,
      body,
      signal: controller.signal,
      headers: body
        ? { 'content-type': request.headers.get('content-type') ?? 'application/json' }
        : undefined,
      cache: 'no-store',
    })
    return new NextResponse(response.body, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { message: 'iM 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      },
      { status: 503 },
    )
  } finally {
    clearTimeout(timer)
  }
}

export const GET = forward
export const POST = forward
