import { describe, expect, it } from 'vitest'

import {
  formatKoreanDate,
  formatSignedRate,
  formatSignedWon,
  formatWon,
  statusCopy,
} from '@/shared/lib/format'

describe('financial display formatting', () => {
  it('formats cost changes with an explicit sign', () => {
    expect(formatWon(50_000_000)).toBe('50,000,000원')
    expect(formatSignedWon(-14_800)).toBe('−14,800원')
    expect(formatSignedRate(0.3)).toBe('+0.30%p')
  })

  it('keeps unknown states and invalid dates understandable', () => {
    expect(statusCopy('UNKNOWN').label).toBe('확인 필요')
    expect(formatKoreanDate('not-a-date')).toBe('날짜 정보 없음')
  })
})
