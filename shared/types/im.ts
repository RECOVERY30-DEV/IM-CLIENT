export type ComparisonStatus = 'SAME' | 'BETTER' | 'WORSE' | 'STRUCTURAL_CHANGE' | 'UNKNOWN'
export type OverallStatus = 'NO_CHANGE' | 'BURDEN_DECREASE' | 'CHECK_REQUIRED' | 'UNCERTAIN'
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  error: { code?: string; message?: string } | null
}

export type ConditionFields = {
  loanAmount: number
  finalRatePercent: number
  termMonths: number
  repaymentMethod: string
  preferentialConditions: Array<{ code: string; label: string; ratePercentOff: number }>
}

export type PreCondition = {
  applicationId?: string
  status: 'VALID' | 'EXPIRED'
  inquiredAt: string
  expiresAt: string
  conditions: ConditionFields
}

export type SavePreConditionCommand = Pick<PreCondition, 'inquiredAt' | 'expiresAt' | 'conditions'>

export type SavePreConditionResult = {
  preSnapshotId: number
  applicationId: string
  expiresAt: string
  payloadHash: string
  conditions: ConditionFields
}

export type ComparisonItem = {
  itemId: number
  fieldCode: string
  label: string
  itemStatus: ComparisonStatus
  v1ValueText: string
  v2ValueText: string
  deltaLabel: string
  requiresReview: boolean
  reason?: string
  unknownReason?: string
}

export type ComparisonHeadline = Pick<
  ComparisonItem,
  'itemId' | 'fieldCode' | 'label' | 'itemStatus' | 'deltaLabel'
>

export type ComparisonSummary = {
  overallStatus: OverallStatus
  impact: {
    monthlyPaymentDelta: number
    totalInterestDelta: number
    fixedFeeDelta: number
    totalCostDelta: number
  }
  changedItemsCount: number
  unchangedItemsCount: number
  requiredReviewCount: number
  headlineItems: ComparisonHeadline[]
}

export type ComparisonRun = {
  comparisonId: number
  applicationId: string
  status: JobStatus
  overallStatus?: OverallStatus
  uncertainReason?: 'EXTRACTION_FAILED' | 'SOURCE_CONFLICT' | 'CALCULATION_UNAVAILABLE'
  progress: { percent: number; completedSteps: number; totalSteps: number }
}

export type ReviewGate = {
  requiredItems: Array<{ itemId: number; label: string; reviewed: boolean }>
  allReviewed: boolean
}

export type SignatureSession = {
  sessionId: string
  validUntil: string
}

export type Decision = {
  decisionId: number
  decisionType: 'PROCEED' | 'RECONSIDER' | 'CONSULT'
  signedAt?: string
}

export type ProofStatus = {
  proofId: string
  contractNumber: string
  loanAmount: number
  finalRatePercent: number
  decidedAt: string
  anchorStatus: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED'
  recordSummary: { changedItemsCount: number; allReviewed: boolean; evidenceLinked: boolean }
}
