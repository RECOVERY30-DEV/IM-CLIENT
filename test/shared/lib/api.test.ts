import { describe, expect, it, vi } from 'vitest'

import { requestImApi } from '@/shared/lib/api'

describe('requestImApi', () => {
  it('unwraps a successful proxy response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { comparisonId: 101 }, error: null }), {
        status: 200,
      }),
    )

    await expect(
      requestImApi<{ comparisonId: number }>('/comparisons/101', {}, fetcher),
    ).resolves.toEqual({
      comparisonId: 101,
    })
  })

  it('sends a JSON body and exposes an API error message', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, data: null, error: { message: '검토가 필요합니다.' } }),
        {
          status: 409,
        },
      ),
    )

    await expect(
      requestImApi(
        '/comparisons/items/1:review',
        { method: 'POST', body: { confirmed: true } },
        fetcher,
      ),
    ).rejects.toThrow('검토가 필요합니다.')
    expect(fetcher).toHaveBeenCalledWith('/api/im/comparisons/items/1:review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
      cache: 'no-store',
    })
  })
})
