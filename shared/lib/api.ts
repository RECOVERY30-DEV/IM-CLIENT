import type { ApiEnvelope } from '@/shared/types/im'

export function unwrapApi<T>(body: unknown): T {
  if (!body || typeof body !== 'object' || !('success' in body) || !('data' in body)) {
    throw new Error('서버 응답 형식이 올바르지 않습니다.')
  }
  const envelope = body as ApiEnvelope<T>
  if (!envelope.success) throw new Error(envelope.error?.message ?? '요청을 처리하지 못했습니다.')
  return envelope.data
}

export function imApiPath(path: string) {
  return `/api/im/${path.replace(/^\/+/, '')}`
}

type ImRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function requestImApi<T>(
  path: string,
  { body, headers, ...options }: ImRequestOptions = {},
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(imApiPath(path), {
    ...options,
    headers: body === undefined ? headers : { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  const responseBody: unknown = await response.json().catch(() => null)

  if (!response.ok) return unwrapApi<T>(responseBody)
  return unwrapApi<T>(responseBody)
}
