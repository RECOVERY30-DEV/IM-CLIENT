import type { ComparisonStatus } from '@/shared/types/im'

const numberFormatter = new Intl.NumberFormat('ko-KR')

function isNumber(value: number) {
  return Number.isFinite(value)
}

export function formatWon(value: number) {
  return isNumber(value) ? `${numberFormatter.format(value)}원` : '금액 정보 없음'
}

export function formatSignedWon(value: number) {
  if (!isNumber(value)) return '금액 정보 없음'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${numberFormatter.format(Math.abs(value))}원`
}

export function formatRate(value: number) {
  return isNumber(value) ? `연 ${value.toFixed(2)}%` : '금리 정보 없음'
}

export function formatSignedRate(value: number) {
  if (!isNumber(value)) return '금리 정보 없음'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${Math.abs(value).toFixed(2)}%p`
}

export function formatKoreanDate(value?: string) {
  if (!value) return '날짜 정보 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 정보 없음'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function statusCopy(status: ComparisonStatus) {
  const values: Record<
    ComparisonStatus,
    { label: string; tone: 'positive' | 'warning' | 'neutral' | 'muted' }
  > = {
    SAME: { label: '동일', tone: 'muted' },
    BETTER: { label: '개선됨', tone: 'positive' },
    WORSE: { label: '변경됨', tone: 'warning' },
    STRUCTURAL_CHANGE: { label: '방식 변경', tone: 'warning' },
    UNKNOWN: { label: '확인 필요', tone: 'neutral' },
  }
  return values[status]
}
