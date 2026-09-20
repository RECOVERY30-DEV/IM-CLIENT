import { describe, expect, it } from 'vitest'

import { comparisonCompletionPath } from '@/shared/lib/comparison-route'

describe('comparisonCompletionPath', () => {
  it('sends completed uncertain jobs to their dedicated flow', () => {
    expect(comparisonCompletionPath('101', 'UNCERTAIN')).toBe('/comparison/101/uncertain')
  })

  it('sends other completed jobs to the result summary', () => {
    expect(comparisonCompletionPath('101', 'CHECK_REQUIRED')).toBe('/comparison/101/summary')
  })
})
