import type {
  ComparisonItem,
  ComparisonSummary,
  PreCondition,
  ProofStatus,
} from '@/shared/types/im'

export const demoPreCondition: PreCondition = {
  applicationId: 'demo-application',
  status: 'VALID',
  inquiredAt: '2026-09-19T08:50:00+09:00',
  expiresAt: '2026-09-19T18:00:00+09:00',
  conditions: {
    loanAmount: 50_000_000,
    finalRatePercent: 5.2,
    termMonths: 36,
    repaymentMethod: '원리금균등',
    preferentialConditions: [
      { code: 'SALARY', label: '급여이체', ratePercentOff: 0.3 },
      { code: 'MAIN', label: 'iM뱅크 주거래', ratePercentOff: 0.1 },
    ],
  },
}

export const demoItems: ComparisonItem[] = [
  {
    itemId: 1,
    fieldCode: 'FINAL_RATE',
    label: '대출금리',
    itemStatus: 'WORSE',
    v1ValueText: '연 5.20%',
    v2ValueText: '연 5.50%',
    deltaLabel: '+0.30%p',
    requiresReview: true,
    reason: '급여이체 우대조건 충족 여부가 최종 심사에서 변경되었어요.',
  },
  {
    itemId: 2,
    fieldCode: 'MONTHLY_PAYMENT',
    label: '월 납입액',
    itemStatus: 'WORSE',
    v1ValueText: '1,505,342원',
    v2ValueText: '1,512,441원',
    deltaLabel: '+7,099원',
    requiresReview: true,
    reason: '최종 적용금리 변화에 따라 월 납입액이 다시 계산되었어요.',
  },
  {
    itemId: 3,
    fieldCode: 'TERM_MONTHS',
    label: '대출기간',
    itemStatus: 'SAME',
    v1ValueText: '36개월',
    v2ValueText: '36개월',
    deltaLabel: '변화 없음',
    requiresReview: false,
  },
]

export const demoSummary: ComparisonSummary = {
  overallStatus: 'CHECK_REQUIRED',
  impact: {
    monthlyPaymentDelta: 7099,
    totalInterestDelta: 255564,
    fixedFeeDelta: 0,
    totalCostDelta: 255564,
  },
  changedItemsCount: 2,
  unchangedItemsCount: 6,
  requiredReviewCount: 2,
  headlineItems: demoItems,
}

export const demoProof: ProofStatus = {
  proofId: 'proof-demo-9001',
  contractNumber: 'IM-2026-0919-9001',
  loanAmount: 50_000_000,
  finalRatePercent: 5.5,
  decidedAt: '2026-09-19T10:17:00+09:00',
  anchorStatus: 'CONFIRMED',
  recordSummary: { changedItemsCount: 2, allReviewed: true, evidenceLinked: false },
}
