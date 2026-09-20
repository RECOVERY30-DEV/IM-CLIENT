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
    v1ValueText: '1,503,718원',
    v2ValueText: '1,522,118원',
    deltaLabel: '+18,400원',
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
    monthlyPaymentDelta: 18_400,
    totalInterestDelta: 662_400,
    fixedFeeDelta: 0,
    totalCostDelta: 662_400,
  },
  changedItemsCount: 3,
  unchangedItemsCount: 5,
  requiredReviewCount: 2,
  headlineItems: demoItems,
}

export const demoProof: ProofStatus = {
  proofId: 'proof-demo-9001',
  contractNumber: 'IM-260912-0182',
  loanAmount: 50_000_000,
  finalRatePercent: 5.5,
  decidedAt: '2026-09-12T09:46:00+09:00',
  anchorStatus: 'CONFIRMED',
  recordSummary: { changedItemsCount: 3, allReviewed: true, evidenceLinked: true },
}
