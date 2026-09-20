import { describe, expect, it } from 'vitest'

import { toSavePreConditionCommand } from '@/shared/lib/pre-condition-command'

describe('toSavePreConditionCommand', () => {
  it('uses only the latest V1 values represented in the Swagger save payload', () => {
    const command = toSavePreConditionCommand({
      status: 'VALID',
      inquiredAt: '2026-09-20T09:00:00+09:00',
      expiresAt: '2026-09-20T18:00:00+09:00',
      conditions: {
        loanAmount: 50_000_000,
        finalRatePercent: 5.2,
        termMonths: 36,
        repaymentMethod: '원리금균등',
        preferentialConditions: [],
      },
    })

    expect(command).toEqual({
      inquiredAt: '2026-09-20T09:00:00+09:00',
      expiresAt: '2026-09-20T18:00:00+09:00',
      conditions: {
        loanAmount: 50_000_000,
        finalRatePercent: 5.2,
        termMonths: 36,
        repaymentMethod: '원리금균등',
        preferentialConditions: [],
      },
    })
  })
})
