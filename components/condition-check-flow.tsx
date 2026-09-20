'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { demoItems, demoPreCondition, demoProof, demoSummary } from '@/shared/data/demo'
import { requestImApi } from '@/shared/lib/api'
import { comparisonCompletionPath } from '@/shared/lib/comparison-route'
import { formatKoreanDate, formatSignedWon } from '@/shared/lib/format'
import { toSavePreConditionCommand } from '@/shared/lib/pre-condition-command'
import type {
  ComparisonItem,
  ComparisonRun,
  ComparisonSummary,
  Decision,
  PreCondition,
  ProofStatus,
  ReviewGate,
  SavePreConditionResult,
  SignatureSession,
} from '@/shared/types/im'

type Screen =
  'home' | 'progress' | 'summary' | 'item' | 'review' | 'proof' | 'expired' | 'uncertain'

const UI_ASSET = '/figma/ui'

function FigmaIcon({ src, className = 'h-6 w-6' }: { src: string; className?: string }) {
  return <img aria-hidden="true" alt="" className={className} src={`${UI_ASSET}/${src}`} />
}

function StatusBar() {
  return (
    <div className="flex h-[46px] items-center justify-between px-[26px] text-[16px] font-semibold tracking-[-0.3px] text-[#101828]">
      <span>9:23</span>
      <div className="flex items-center gap-[7px]">
        <FigmaIcon src="cellular.svg" className="h-[12px] w-[19px]" />
        <FigmaIcon src="wifi.svg" className="h-[12px] w-[17px]" />
        <FigmaIcon src="battery.svg" className="h-[13px] w-[27px]" />
      </div>
    </div>
  )
}

function NavBar({ title, info = false }: { title: string; info?: boolean }) {
  return (
    <header className="relative flex h-[75px] items-center justify-center bg-white shadow-[0_4px_4px_rgba(179,179,179,0.10)]">
      <button
        type="button"
        aria-label="뒤로"
        onClick={() => window.history.back()}
        className="absolute top-[27px] left-[13px] grid h-9 w-9 place-items-center"
      >
        <FigmaIcon src="back.svg" />
      </button>
      <strong className="mt-[17px] text-[18px] leading-none font-bold text-[#4a4a4a]">
        {title}
      </strong>
      {info && <FigmaIcon src="info.svg" className="absolute top-[33px] right-[21px] h-6 w-6" />}
    </header>
  )
}

function AppShell({
  children,
  navTitle,
  navInfo,
  long = false,
  tall = false,
}: {
  children: React.ReactNode
  navTitle?: string
  navInfo?: boolean
  long?: boolean
  tall?: boolean
}) {
  return (
    <main
      className={`relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[25px] bg-white text-[#101828] shadow-[0_0_40px_rgba(23,49,36,0.08)] ${tall ? 'min-h-[1073px]' : long ? 'min-h-[995px]' : 'min-h-[830px]'}`}
    >
      <StatusBar />
      {navTitle && <NavBar title={navTitle} info={navInfo} />}
      {children}
    </main>
  )
}

function BottomAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[111px] w-full max-w-[390px] items-start border-t border-[#e4e7ec] bg-white px-4 pt-[14px]">
      {children}
    </div>
  )
}

const primaryActionClass =
  'flex h-[57px] w-full items-center justify-center rounded-[12px] bg-[#17c8a1] px-4 text-center text-[16px] font-bold text-white disabled:bg-[#dce8ef]'

function StatusTabs() {
  return (
    <div className="flex h-[30px] items-start text-[12px] text-[#667085]">
      <span className="border-t-2 border-[#e4e7ec] px-2 pt-2">부담 감소</span>
      <span className="border-t-2 border-[#e4e7ec] px-2 pt-2">변경 없음</span>
      <span className="border-t-2 border-[#17c8a1] px-2 pt-2 font-semibold text-[#17c8a1]">
        확인필요
      </span>
    </div>
  )
}

function Divider() {
  return <div className="h-[10px] w-full bg-[#f7f7f7]" />
}

function ChevronRow({
  icon,
  children,
  href,
  onClick,
}: {
  icon?: string
  children: React.ReactNode
  href?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="flex items-center gap-[7px]">
        {icon && <FigmaIcon src={icon} />}
        <span className="text-[15px] font-medium text-[#667085]">{children}</span>
      </span>
      <FigmaIcon src="chevron.svg" className="h-4 w-4" />
    </>
  )
  const className = 'flex h-[52px] w-full items-center justify-between px-[14px]'
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  )
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div
      className={`mt-4 rounded-[12px] p-4 text-[13px] leading-5 ${tone === 'error' ? 'bg-[#fff1f2] text-[#e11d48]' : 'bg-[#effaf7] text-[#0f8f76]'}`}
    >
      {children}
    </div>
  )
}

function formatLoanAmount(value: number) {
  if (!Number.isFinite(value)) return '금액 정보 없음'
  if (value >= 10_000) return `${new Intl.NumberFormat('ko-KR').format(value / 10_000)}만원`
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`
}

function formatRate(value: number) {
  return Number.isFinite(value) ? `연 ${value.toFixed(2)}%` : '금리 정보 없음'
}

function expiryTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '18:00'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function expiryLabel(value: string, demo: boolean) {
  if (demo) return `오늘 ${expiryTime(value)}까지`
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '유효시간 확인 필요'
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) return `오늘 ${expiryTime(value)}까지`
  return `${new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)}까지`
}

function compactDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return formatKoreanDate(value)
  const part = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}.${part(date.getMonth() + 1)}.${part(date.getDate())} ${part(date.getHours())}:${part(date.getMinutes())}`
}

function ProgressArt({
  percent,
  completedSteps,
  totalSteps,
}: {
  percent: number
  completedSteps: number
  totalSteps: number
}) {
  const lines = (right = false) => (
    <>
      <span
        className={`absolute top-[24px] h-[3px] w-[35px] rounded-full bg-gradient-to-r from-[#edf3ff] to-[#d0e1ff] ${right ? 'right-[7px]' : 'left-[7px]'}`}
      />
      <span
        className={`absolute top-[31px] h-[3px] w-[22px] rounded-full bg-gradient-to-r from-[#edf3ff] to-[#d0e1ff] ${right ? 'right-[7px]' : 'left-[7px]'}`}
      />
    </>
  )
  return (
    <div className="relative mx-auto h-[135px] w-[220px]" aria-hidden="true">
      <div className="absolute top-0 left-[18px] h-[46px] w-[50px] rotate-[2deg] rounded-[7px] bg-[#f7f9ff] shadow-[inset_1px_-1px_0_#d0e1ff]">
        <span className="absolute top-[5px] left-[7px] text-[12px] font-semibold text-[#8da1c7]">
          V1
        </span>
        {lines()}
      </div>
      <div className="absolute top-[49px] left-0 h-6 w-[45px] rounded-[7px] bg-[#f7f9ff]">
        <span className="absolute top-2 left-[5px] h-[3px] w-[35px] rounded-full bg-gradient-to-r from-[#edf3ff] to-[#cfdcf4]" />
        <span className="absolute top-[14px] left-[5px] h-[3px] w-[22px] rounded-full bg-gradient-to-r from-[#edf3ff] to-[#cfdcf4]" />
      </div>
      <div className="absolute top-[11px] left-[144px] h-6 w-[33px] rounded-[7px] bg-[#f7f9ff]">
        <span className="absolute top-2 left-1 h-[3px] w-[25px] rounded-full bg-[#dce6f8]" />
        <span className="absolute top-[14px] right-1 h-[3px] w-4 rounded-full bg-[#dce6f8]" />
      </div>
      <div className="absolute top-[33px] left-[165px] h-[49px] w-[52px] -rotate-6 rounded-[7px] bg-[#f7f9ff] shadow-[inset_-1px_-1px_0_#d0e1ff]">
        <span className="absolute top-[5px] left-[8px] text-[12px] font-semibold text-[#8da1c7]">
          V2
        </span>
        {lines(true)}
      </div>
      <FigmaIcon
        src="progress.svg"
        className="absolute top-[42px] left-[55px] h-[56px] w-[111px]"
      />
      <strong className="absolute inset-x-0 top-[72px] bg-gradient-to-b from-[#73dae7] to-[#516e80] bg-clip-text text-[30px] text-transparent">
        {percent}%
      </strong>
      <span className="absolute inset-x-0 top-[116px] text-[12px] text-[#667085]">
        {completedSteps} / {totalSteps} 항목
      </span>
    </div>
  )
}

function DocumentArt({ expired = false }: { expired?: boolean }) {
  return (
    <div className="relative h-[92px] w-[100px]" aria-hidden="true">
      <div className="absolute top-[8px] left-[18px] h-[47px] w-[50px] rotate-[2deg] rounded-[7px] bg-[#f7f9ff] shadow-[inset_1px_-1px_0_#d0e1ff]">
        <span className="absolute top-[6px] left-[8px] text-[12px] font-semibold text-[#8da1c7]">
          V1
        </span>
        <span className="absolute top-[25px] left-[9px] h-[3px] w-[34px] rounded-full bg-[#d0e1ff]" />
        <span className="absolute top-[32px] left-[9px] h-[3px] w-[26px] rounded-full bg-[#d0e1ff]" />
      </div>
      <div
        className={`absolute top-0 right-[8px] grid h-6 w-6 place-items-center rounded-full ${expired ? 'bg-[#ffe0e0]' : 'bg-[#e7fff8]'}`}
      >
        {expired ? (
          <FigmaIcon src="expired-x.svg" className="h-5 w-5" />
        ) : (
          <span className="text-[18px] font-bold text-[#17c8a1]">✓</span>
        )}
      </div>
      <div
        className={`absolute top-[62px] left-0 h-[24px] w-[45px] rounded-[7px] ${expired ? 'bg-[#fff3f3]' : 'bg-[#f7f9ff]'}`}
      >
        <span
          className={`absolute top-[8px] left-[6px] h-[3px] w-[32px] rounded-full ${expired ? 'bg-[#ffdede]' : 'bg-[#d0e1ff]'}`}
        />
        <span
          className={`absolute top-[14px] left-[6px] h-[3px] w-[20px] rounded-full ${expired ? 'bg-[#ffdede]' : 'bg-[#d0e1ff]'}`}
        />
      </div>
    </div>
  )
}

export function ConditionCheckFlow({
  screen,
  itemId,
  applicationId,
  comparisonId,
  decisionId,
}: {
  screen: Screen
  itemId?: string
  applicationId?: string
  comparisonId?: string
  decisionId?: string
}) {
  const liveMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'false'
  const [progress, setProgress] = useState(75)
  const [preCondition, setPreCondition] = useState<PreCondition>(demoPreCondition)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [comparisonRun, setComparisonRun] = useState<ComparisonRun | null>(null)
  const [summary, setSummary] = useState<ComparisonSummary>(demoSummary)
  const [comparisonItem, setComparisonItem] = useState<ComparisonItem | null>(null)
  const [reviewGate, setReviewGate] = useState<ReviewGate | null>(null)
  const [proof, setProof] = useState<ProofStatus>(demoProof)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [savingPreCondition, setSavingPreCondition] = useState(false)
  const routeComparisonId = comparisonId ?? '101'
  const item =
    comparisonItem ?? demoItems.find((entry) => String(entry.itemId) === itemId) ?? demoItems[0]
  const displayedProgress = comparisonRun?.progress.percent ?? progress
  const completedSteps = comparisonRun?.progress.completedSteps ?? 6
  const totalSteps = comparisonRun?.progress.totalSteps ?? 8
  const reviewItems =
    reviewGate?.requiredItems ??
    demoItems
      .filter((entry) => entry.requiresReview)
      .map((entry) => ({ itemId: entry.itemId, label: entry.label, reviewed: true }))
  const allReviewed = reviewGate?.allReviewed ?? true

  useEffect(() => {
    if (screen !== 'progress' || liveMode) return
    const id = window.setInterval(() => setProgress((value) => Math.min(value + 13, 100)), 850)
    return () => window.clearInterval(id)
  }, [liveMode, screen])

  useEffect(() => {
    if (screen !== 'home' || !liveMode || !applicationId) return
    let cancelled = false
    void requestImApi<PreCondition>(`applications/${applicationId}/pre-conditions/latest`)
      .then((data) => {
        if (!cancelled) setPreCondition(data)
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setLiveError(error instanceof Error ? error.message : '사전조건을 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [applicationId, liveMode, screen])

  useEffect(() => {
    if ((screen !== 'progress' && screen !== 'uncertain') || !liveMode) return
    if (!comparisonId) {
      setLiveError('비교 정보가 포함된 링크로 다시 접근해 주세요.')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const data = await requestImApi<ComparisonRun>(`comparisons/${comparisonId}`)
        if (!cancelled) setComparisonRun(data)
      } catch (error) {
        if (!cancelled)
          setLiveError(error instanceof Error ? error.message : '비교 상태를 불러오지 못했습니다.')
      }
    }
    void load()
    const poller = window.setInterval(() => void load(), 1_500)
    return () => {
      cancelled = true
      window.clearInterval(poller)
    }
  }, [comparisonId, liveMode, screen])

  useEffect(() => {
    if (screen !== 'progress' || !liveMode || comparisonRun?.status !== 'COMPLETED') return
    window.location.assign(
      comparisonCompletionPath(comparisonRun.comparisonId, comparisonRun.overallStatus),
    )
  }, [comparisonRun, liveMode, screen])

  useEffect(() => {
    if (screen !== 'summary' || !liveMode || !comparisonId) return
    void requestImApi<ComparisonSummary>(`comparisons/${comparisonId}/summary`)
      .then(setSummary)
      .catch((error: unknown) =>
        setLiveError(error instanceof Error ? error.message : '비교 요약을 불러오지 못했습니다.'),
      )
  }, [comparisonId, liveMode, screen])

  useEffect(() => {
    if (screen !== 'item' || !liveMode || !itemId) return
    void requestImApi<ComparisonItem>(`comparisons/items/${itemId}`)
      .then(setComparisonItem)
      .catch((error: unknown) =>
        setLiveError(error instanceof Error ? error.message : '변경 항목을 불러오지 못했습니다.'),
      )
  }, [itemId, liveMode, screen])

  useEffect(() => {
    if (screen !== 'review' || !liveMode || !comparisonId) return
    void requestImApi<ReviewGate>(`comparisons/${comparisonId}/review-gate`)
      .then(setReviewGate)
      .catch((error: unknown) =>
        setLiveError(error instanceof Error ? error.message : '검토 상태를 불러오지 못했습니다.'),
      )
  }, [comparisonId, liveMode, screen])

  useEffect(() => {
    if (screen !== 'proof' || !liveMode || !decisionId) return
    void requestImApi<ProofStatus>(`decisions/${decisionId}/proof`)
      .then(setProof)
      .catch((error: unknown) =>
        setLiveError(error instanceof Error ? error.message : '증빙을 불러오지 못했습니다.'),
      )
  }, [decisionId, liveMode, screen])

  async function markReviewed(id: number) {
    setActionError(null)
    setSubmitting(true)
    try {
      await requestImApi(`comparisons/items/${id}:review`, { method: 'POST' })
      if (comparisonId)
        setReviewGate(await requestImApi<ReviewGate>(`comparisons/${comparisonId}/review-gate`))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '항목 확인을 저장하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function savePreCondition() {
    if (!liveMode) {
      window.location.assign(`/comparison/${routeComparisonId}`)
      return
    }
    if (!applicationId) {
      setActionError('대출 신청 정보가 없어 조건을 저장할 수 없습니다.')
      return
    }
    if (preCondition.status === 'EXPIRED') {
      window.location.assign('/expired')
      return
    }
    setActionError(null)
    setActionMessage(null)
    setSavingPreCondition(true)
    try {
      const result = await requestImApi<SavePreConditionResult>(
        `applications/${applicationId}/pre-conditions`,
        {
          method: 'POST',
          headers: { 'Idempotency-Key': `${applicationId}:${preCondition.inquiredAt}` },
          body: toSavePreConditionCommand(preCondition),
        },
      )
      setActionMessage(`조건을 저장했습니다. (V1 #${result.preSnapshotId})`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '조건을 저장하지 못했습니다.')
    } finally {
      setSavingPreCondition(false)
    }
  }

  async function proceed() {
    if (!comparisonId) return
    setActionError(null)
    setSubmitting(true)
    try {
      const session = await requestImApi<SignatureSession>(
        `comparisons/${comparisonId}/signature-sessions`,
        { method: 'POST' },
      )
      const decision = await requestImApi<Decision>(`comparisons/${comparisonId}/decisions`, {
        method: 'POST',
        body: {
          decisionType: 'PROCEED',
          signatureSessionId: session.sessionId,
          bypassedUncertainItems: false,
        },
      })
      window.location.assign(`/decision/${decision.decisionId}`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '약정을 진행하지 못했습니다.')
      setSubmitting(false)
    }
  }

  async function reconsider() {
    if (!comparisonId) return
    setActionError(null)
    setSubmitting(true)
    try {
      await requestImApi<Decision>(`comparisons/${comparisonId}/decisions`, {
        method: 'POST',
        body: { decisionType: 'RECONSIDER', bypassedUncertainItems: false },
      })
      window.location.assign(`/comparison/${comparisonId}/summary`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '재검토 요청을 저장하지 못했습니다.')
      setSubmitting(false)
    }
  }

  async function requestConsultation() {
    if (!comparisonId) return
    setActionError(null)
    setSubmitting(true)
    try {
      await requestImApi(`comparisons/${comparisonId}/consultation-referrals`, {
        method: 'POST',
        body: { transferConsentGranted: true },
      })
      setActionMessage('상담 요청을 접수했어요. 확인 후 안내드리겠습니다.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '상담 요청을 저장하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function retryComparison() {
    if (!comparisonRun?.applicationId) return
    setActionError(null)
    setSubmitting(true)
    try {
      const retry = await requestImApi<{ comparisonId: number }>(
        `applications/${comparisonRun.applicationId}/comparisons:retry`,
        { method: 'POST' },
      )
      window.location.assign(`/comparison/${retry.comparisonId}`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '비교를 다시 시작하지 못했습니다.')
      setSubmitting(false)
    }
  }

  async function verifyProof() {
    setActionError(null)
    setSubmitting(true)
    try {
      const result = await requestImApi<{ verified: boolean; reason: string }>(
        `proof/${proof.proofId}:verify`,
        { method: 'POST' },
      )
      setActionMessage(
        result.verified ? '증빙 기록을 다시 검증했습니다.' : `증빙 검증 결과: ${result.reason}`,
      )
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '증빙을 다시 검증하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (liveError && screen !== 'home')
    return (
      <AppShell navTitle="iM 조건체크">
        <section className="px-5 pt-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff1f2] text-2xl font-bold text-[#e11d48]">
            !
          </div>
          <h1 className="mt-5 text-[22px] font-bold">정보를 불러오지 못했어요</h1>
          <p className="mt-3 text-[14px] leading-6 text-[#667085]">{liveError}</p>
        </section>
        <BottomAction>
          <Link href="/" className={primaryActionClass}>
            처음으로
          </Link>
        </BottomAction>
      </AppShell>
    )

  if (screen === 'home')
    return (
      <AppShell navTitle="신용대출 조회 결과">
        <div className="absolute inset-x-0 top-[605px] bottom-[110px] bg-[#eff9fc]" />
        <section className="relative px-6 pt-[41px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] leading-[26px] font-bold">현재 신청 가능한 조건이에요</h1>
            <FigmaIcon src="info.svg" />
          </div>
          {liveError ? (
            <Message tone="error">{liveError}</Message>
          ) : (
            <>
              <div className="mt-[30px] flex w-full flex-col gap-[17px] rounded-[20px] bg-white">
                <div className="rounded-[20px] bg-gradient-to-b from-[#f7f8fa] to-white px-[14px] py-[15px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#667085]">대출 한도</span>
                    <strong className="text-[21px] leading-none">
                      {formatLoanAmount(preCondition.conditions.loanAmount)}
                    </strong>
                  </div>
                </div>
                <div className="flex items-center justify-between px-[14px]">
                  <span className="text-[13px] text-[#667085]">예상 금리</span>
                  <strong className="text-[15px] text-[#19b895]">
                    {formatRate(preCondition.conditions.finalRatePercent)}
                  </strong>
                </div>
                <div className="flex items-center justify-between px-[14px]">
                  <span className="text-[13px] text-[#667085]">기간 · 상환</span>
                  <strong className="text-[15px] font-medium">
                    {preCondition.conditions.termMonths}개월 ·{' '}
                    {preCondition.conditions.repaymentMethod}
                  </strong>
                </div>
              </div>
              <div className="mt-8 flex h-10 items-center justify-center rounded-[10px] bg-[#eff5f7] text-[15px] text-[#8ea3aa]">
                <strong className="font-semibold text-[#17c8a1]">
                  {expiryLabel(preCondition.expiresAt, !liveMode)}
                </strong>
                <span className="ml-1">유효한 조회 결과입니다.</span>
              </div>
              <div className="mt-[43px] flex items-center gap-[10px]">
                <FigmaIcon src="condition.svg" className="h-[26px] w-[15px]" />
                <h2 className="text-[18px] font-bold">반영된 우대조건</h2>
              </div>
              <div className="mt-[14px] space-y-[10px]">
                {preCondition.conditions.preferentialConditions.map((benefit) => (
                  <div
                    key={benefit.code}
                    className="flex h-[46px] items-center justify-between rounded-[10px] border border-[#c3f9ed] px-[13px] text-[13px]"
                  >
                    <span className="text-[#667085]">{benefit.label}</span>
                    <strong>-{benefit.ratePercentOff.toFixed(2)}%p</strong>
                  </div>
                ))}
              </div>
              {actionError && <Message tone="error">{actionError}</Message>}
              {actionMessage && <Message tone="success">{actionMessage}</Message>}
            </>
          )}
        </section>
        <BottomAction>
          {liveMode && applicationId ? (
            <button
              type="button"
              onClick={() => void savePreCondition()}
              disabled={savingPreCondition || Boolean(liveError)}
              className={primaryActionClass}
            >
              {savingPreCondition ? '조건 저장 중…' : '이 조건으로 신청'}
            </button>
          ) : (
            <Link href={`/comparison/${routeComparisonId}`} className={primaryActionClass}>
              이 조건으로 신청
            </Link>
          )}
        </BottomAction>
      </AppShell>
    )

  if (screen === 'progress') {
    const finished = liveMode ? comparisonRun?.status === 'COMPLETED' : displayedProgress >= 100
    return (
      <AppShell navTitle="iM 조건체크">
        <section className="px-6 pt-[62px] text-center">
          <ProgressArt
            percent={displayedProgress}
            completedSteps={completedSteps}
            totalSteps={totalSteps}
          />
          <h1 className="mt-[14px] text-[24px] leading-none font-bold">
            최종 조건을 비교하고 있어요
          </h1>
          <p className="mx-auto mt-[13px] w-[266px] text-[14px] leading-5 text-[#667085]">
            사전조건(V1)과 최종 약정조건(V2)의
            <br />
            같은 항목을 연결해 비용 영향을 계산합니다.
          </p>
          <div className="mt-[36px] rounded-[20px] bg-gradient-to-b from-[#f7f8fa] to-white px-[20px] py-[15px] text-left">
            {['대출금액·금리 연결', '우대조건 충족 확인', '상환방식·기간 확인'].map((label) => (
              <div key={label} className="flex h-[34px] items-center gap-[10px]">
                <FigmaIcon src="check.svg" />
                <span className="text-[13px] text-[#667085]">{label}</span>
              </div>
            ))}
            <div className="flex h-[34px] items-center gap-[10px]">
              <FigmaIcon src="pending.svg" />
              <span className="text-[13px] text-[#667085]">월 납입액·총이자 계산</span>
            </div>
          </div>
          {comparisonRun?.status === 'FAILED' && (
            <Message tone="error">
              비교를 완료하지 못했습니다.
              <div className="mt-3 flex justify-center gap-2">
                <button type="button" onClick={() => void retryComparison()} disabled={submitting}>
                  다시 비교
                </button>
                <button
                  type="button"
                  onClick={() => void requestConsultation()}
                  disabled={submitting}
                >
                  상담 요청
                </button>
              </div>
            </Message>
          )}
        </section>
        <BottomAction>
          {finished ? (
            <Link
              href={comparisonCompletionPath(
                routeComparisonId,
                comparisonRun?.overallStatus ?? demoSummary.overallStatus,
              )}
              className={primaryActionClass}
            >
              비교 결과 확인
            </Link>
          ) : (
            <button type="button" disabled className={primaryActionClass}>
              비교 결과 확인중
            </button>
          )}
        </BottomAction>
      </AppShell>
    )
  }

  if (screen === 'summary')
    return (
      <AppShell navTitle="iM 조건체크" navInfo>
        <section className="px-[18px] pt-[35px]">
          <StatusTabs />
          <h1 className="mt-[24px] text-[22px] leading-[26px] font-bold">
            최종 조건에서 {summary.changedItemsCount}가지가 달라졌어요
          </h1>
          <div className="mt-[18px] h-[113px] rounded-[14px] bg-[#f7f7f7] p-4">
            <p className="text-[14px] font-medium text-[#19b895]">예상 부담 변화</p>
            <strong className="mt-2 block text-[25px] text-[#03ab86]">
              월 {formatSignedWon(summary.impact.monthlyPaymentDelta)}
            </strong>
            <p className="mt-2 text-[14px] font-medium text-[#19b895]">
              대출기간 총 {formatSignedWon(summary.impact.totalCostDelta)}
            </p>
          </div>
          <div className="mt-[28px] space-y-[21px] px-4">
            {summary.headlineItems.slice(0, 2).map((entry) => {
              const detail = demoItems.find((candidate) => candidate.itemId === entry.itemId)
              return (
                <div key={entry.itemId}>
                  <div className="flex items-center justify-between text-[14px] font-medium">
                    <span>{entry.label}</span>
                    <strong className="text-[13px] font-medium text-[#03a4da]">
                      {entry.deltaLabel}
                    </strong>
                  </div>
                  <p className="mt-[10px] text-[18px] font-semibold">
                    {detail
                      ? `${detail.v1ValueText}  →  ${detail.v2ValueText}`
                      : '세부 변경 내용을 확인해 주세요.'}
                  </p>
                  {entry.itemId === summary.headlineItems[0]?.itemId && (
                    <p className="mt-[15px] text-[12px] text-[#667085]">급여이체 우대금리 미반영</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
        <div className="absolute inset-x-0 top-[586px]">
          <Divider />
          <div className="mx-auto mt-4 w-[350px]">
            <ChevronRow icon="section.svg">
              변경 없는 조건 {summary.unchangedItemsCount}개
            </ChevronRow>
            <ChevronRow icon="consult.svg" onClick={() => void requestConsultation()}>
              상담원에게 문의
            </ChevronRow>
          </div>
        </div>
        <BottomAction>
          <Link
            href={`/comparison/${routeComparisonId}/items/${summary.headlineItems[0]?.itemId ?? 1}`}
            className={primaryActionClass}
          >
            변경 내용 자세히 보기
          </Link>
        </BottomAction>
      </AppShell>
    )

  if (screen === 'item')
    return (
      <AppShell navTitle="변경 사유 및 근거" tall>
        <section className="px-[18px] pt-[35px]">
          <StatusTabs />
          <h1 className="mt-[24px] text-[22px] font-bold">왜 금리가 달라졌나요?</h1>
          <div className="mt-[22px] rounded-[14px] bg-[#f7f8fa] p-3">
            <p className="px-4 text-[18px] font-bold text-[#667085]">{item.v1ValueText}</p>
            <div className="mt-[13px] flex h-[44px] items-center justify-between rounded-[12px] border border-[#17c8a1] bg-white px-4">
              <span className="text-[12px] text-[#667085]">최종조건 V2</span>
              <strong className="text-[18px] text-[#17c8a1]">{item.v2ValueText}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[14px] bg-[#f0f5fb] p-[15px]">
            <p className="text-[13px] font-semibold text-[#003875]">확인된 변경 사유</p>
            <p className="mt-2 text-[14px] leading-[22px]">
              {item.reason ??
                item.unknownReason ??
                '최종 심사 결과를 반영해 조건이 변경되었습니다.'}
            </p>
          </div>
          <Link
            href="#evidence"
            className="mt-[22px] flex h-[40px] items-center rounded-[12px] border border-[#ccddfa] px-3 text-[12px]"
          >
            <strong className="mr-2 text-[#003875]">서명</strong>
            <span className="flex-1">
              <b className="font-medium text-[#17c8a1]">[필수]</b> 최종 약정서 3쪽 · 금리 산정 항목
            </span>
            <FigmaIcon src="chevron.svg" className="h-4 w-4" />
          </Link>
        </section>
        <div className="mt-[22px]">
          <Divider />
          <div className="mx-auto w-[350px] py-[8px]">
            <ChevronRow>
              <span className="text-[#17c8a1]">[변경]</span> 월 납입액{' '}
              <small className="ml-2 rounded-full bg-[#eef1f6] px-3 py-1 text-[9px]">
                {demoItems[1].deltaLabel}
              </small>
            </ChevronRow>
            <ChevronRow>
              <span className="text-[#17c8a1]">[변경]</span> 총 이자{' '}
              <small className="ml-2 rounded-full bg-[#eef1f6] px-3 py-1 text-[9px]">
                {formatSignedWon(summary.impact.totalInterestDelta)}
              </small>
            </ChevronRow>
          </div>
          <Divider />
        </div>
        <section id="evidence" className="px-5 pt-[28px] pb-[130px]">
          <div className="flex items-center gap-1">
            <FigmaIcon src="cost.svg" className="h-[21px] w-[30px]" />
            <h2 className="text-[18px] font-bold">비용 계산 근거</h2>
          </div>
          <div className="mt-[17px] rounded-[12px] bg-[#f7f7f7] p-[14px]">
            <p className="text-[12px] text-[#667085]">원리금균등 · 36개월</p>
            <p className="mt-[7px] text-[14px] font-bold">금리 0.30%p 상승 → 월 +18,400원</p>
            <p className="mt-[7px] text-[11px] text-[#667085]">
              계산 기준일 2026.09.12 · 원 단위 반올림
            </p>
          </div>
        </section>
        <BottomAction>
          <Link href={`/comparison/${routeComparisonId}/review`} className={primaryActionClass}>
            확인
          </Link>
        </BottomAction>
      </AppShell>
    )

  if (screen === 'review') {
    const firstUnreviewed = reviewItems.find((entry) => !entry.reviewed)
    return (
      <AppShell navTitle="최종 약정 확인" long tall={allReviewed}>
        <section className="px-[17px] pt-[39px]">
          <h1 className="text-[22px] font-bold">왜 금리가 달라졌나요?</h1>
          <div className="mt-[20px] space-y-[22px] rounded-[20px] bg-white">
            <div className="rounded-[20px] bg-gradient-to-b from-[#f7f8fa] to-white px-[14px] py-[15px]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#667085]">대출 한도</span>
                <strong className="text-[21px]">
                  {formatLoanAmount(preCondition.conditions.loanAmount)}
                </strong>
              </div>
            </div>
            <div className="flex items-center justify-between px-[14px] text-[13px]">
              <span className="text-[#667085]">예상 금리</span>
              <strong className="text-[15px] text-[#19b895]">연 5.20%</strong>
            </div>
            <div className="flex items-center justify-between px-[14px] text-[13px]">
              <span className="text-[#667085]">월 납입액</span>
              <strong className="text-[14px] font-medium">1,522,118원</strong>
            </div>
            <div className="flex items-center justify-between px-[14px] text-[13px]">
              <span className="text-[#667085]">기간 · 상환</span>
              <strong className="text-[15px] font-medium">36개월 · 원리금균등</strong>
            </div>
          </div>
          <div className="mt-[34px] rounded-[14px] bg-[#f0f5fb] p-[15px]">
            <p className="text-[13px] font-semibold text-[#003875]">부담금 안내</p>
            <p className="mt-2 text-[14px]">금리 +0.30%p · 총 부담 +662,400원</p>
          </div>
          <button
            type="button"
            disabled={allReviewed || submitting}
            onClick={() => firstUnreviewed && void markReviewed(firstUnreviewed.itemId)}
            className={`mt-[20px] flex h-[47px] w-full items-center gap-2 rounded-[12px] border p-3 text-left ${allReviewed ? 'border-[#19b895]' : 'border-[#e1e2e4]'}`}
          >
            <FigmaIcon src={allReviewed ? 'checkbox-checked.svg' : 'checkbox-empty.svg'} />
            <span className="text-[12px] font-medium text-[#667085]">
              조건 변경 내용·사유·비용 영향 확인
            </span>
          </button>
          <div className="mt-[20px] rounded-[12px] border border-dashed border-[#98a2b3] p-[14px]">
            <p className="text-[13px] font-bold text-[#667085]">전자서명</p>
            <div className="grid h-[66px] place-items-center text-[28px] font-medium text-[#e4e7ec]">
              {allReviewed ? (
                <FigmaIcon src="signature.svg" className="h-[94px] w-[114px]" />
              ) : (
                '서명'
              )}
            </div>
            <p className="text-[11px] font-medium text-[#17c8a1]">유효시간 04:51</p>
          </div>
          <p className="mt-[20px] text-[12px] leading-[19px] text-[#667085]">
            계약은 진행 전까지 체결되지 않아요.
            <br />
            언제든 다시 검토하거나 상담받을 수 있어요.
          </p>
          {actionError && <Message tone="error">{actionError}</Message>}
          {actionMessage && <Message tone="success">{actionMessage}</Message>}
        </section>
        <div className="mt-[34px]">
          <Divider />
          <div className="mx-auto mt-[20px] w-[350px]">
            <ChevronRow icon="consult.svg" onClick={() => void requestConsultation()}>
              상담원에게 문의
            </ChevronRow>
            <ChevronRow icon="refresh.svg" onClick={() => void reconsider()}>
              다시 검토
            </ChevronRow>
          </div>
        </div>
        <BottomAction>
          {liveMode ? (
            <button
              type="button"
              onClick={() => void proceed()}
              disabled={!allReviewed || submitting}
              className={primaryActionClass}
            >
              {submitting ? '약정 처리 중…' : '현재 조건으로 약정하기'}
            </button>
          ) : (
            <Link href="/decision/9001" className={primaryActionClass}>
              현재 조건으로 약정하기
            </Link>
          )}
        </BottomAction>
      </AppShell>
    )
  }

  if (screen === 'proof')
    return (
      <AppShell>
        <section className="px-5 pt-[72px] text-center">
          <div className="mx-auto w-[100px]">
            <DocumentArt />
          </div>
          <h1 className="mt-[20px] text-[22px] font-bold">대출 약정이 완료됐어요</h1>
          <p className="mt-[12px] text-[14px] text-[#667085]">
            서명 전 확인한 조건과 비교 결과가 함께 보관돼요.
          </p>
          <div className="mt-[42px] text-left">
            <div className="flex h-[40px] items-center justify-between rounded-[12px] bg-[#f7f7f7] px-[14px] text-[13px]">
              <span className="text-[#667085]">약정번호</span>
              <strong>{proof.contractNumber}</strong>
            </div>
            <div className="mt-[12px] space-y-[18px] px-[14px] text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#667085]">대출금액</span>
                <strong className="text-[#17c8a1]">{formatLoanAmount(proof.loanAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">최종금리</span>
                <strong>{formatRate(proof.finalRatePercent)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">약정일시</span>
                <strong>{compactDateTime(proof.decidedAt)}</strong>
              </div>
            </div>
          </div>
        </section>
        <div className="absolute inset-x-0 top-[526px]">
          <Divider />
          <section className="px-5 pt-[28px] text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FigmaIcon src="complete-condition.svg" className="h-[26px] w-[19px]" />
                <h2 className="text-[18px] font-bold">조건 확인 기록</h2>
              </span>
              <strong className="text-[13px] text-[#17c8a1]">
                {proof.anchorStatus === 'CONFIRMED' ? '검증됨' : '처리 중'}
              </strong>
            </div>
            <div className="mt-[18px] rounded-[12px] bg-[#f7f7f7] p-[14px]">
              <p className="text-[14px] font-bold">사전조건 V1 ↔ 최종조건 V2</p>
              <p className="mt-[8px] text-[11px] text-[#667085]">
                변경 {proof.recordSummary.changedItemsCount}건 · 확인 완료 · 원문 연결 완료
              </p>
            </div>
            <ChevronRow href="#record">기록 자세히 보기</ChevronRow>
            {actionError && <Message tone="error">{actionError}</Message>}
            {actionMessage && <Message tone="success">{actionMessage}</Message>}
          </section>
        </div>
        <BottomAction>
          {liveMode && (
            <button
              type="button"
              onClick={() => void verifyProof()}
              disabled={submitting}
              className="mr-2 h-[57px] rounded-[12px] bg-[#eef1f6] px-4 text-[14px] font-bold text-[#667085]"
            >
              재검증
            </button>
          )}
          <Link href="/" className={primaryActionClass}>
            내 대출에서 확인
          </Link>
        </BottomAction>
      </AppShell>
    )

  if (screen === 'uncertain')
    return (
      <AppShell navTitle="iM 조건체크">
        <section className="px-5 pt-[55px] text-center">
          <div className="mx-auto w-[100px]">
            <DocumentArt expired />
          </div>
          <h1 className="mt-5 text-[22px] font-bold">일부 조건은 자동으로 확인하지 못했어요</h1>
          <p className="mt-3 text-[14px] leading-6 text-[#667085]">
            계약 전 약정서 원문을 확인하거나 상담원과 함께 확인할 수 있습니다.
          </p>
          {comparisonRun?.uncertainReason && (
            <div className="mt-7 rounded-[14px] bg-[#f0f5fb] p-4 text-left text-[13px]">
              확인 사유: {comparisonRun.uncertainReason}
            </div>
          )}
          {actionMessage && <Message tone="success">{actionMessage}</Message>}
          {actionError && <Message tone="error">{actionError}</Message>}
        </section>
        <BottomAction>
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => void requestConsultation()}
              disabled={submitting}
              className="h-[57px] rounded-[12px] bg-[#eef1f6] px-4 text-[14px] font-bold text-[#667085]"
            >
              상담원 문의
            </button>
            <Link href={`/comparison/${routeComparisonId}/summary`} className={primaryActionClass}>
              비교 결과 보기
            </Link>
          </div>
        </BottomAction>
      </AppShell>
    )

  return (
    <AppShell>
      <section className="px-5 pt-[70px] text-center">
        <div className="mx-auto w-[100px]">
          <DocumentArt expired />
        </div>
        <h1 className="mt-[20px] text-[22px] font-bold">사전 조회 조건이 만료됐어요</h1>
        <p className="mt-[12px] text-[14px] leading-[22px] text-[#667085]">
          금리와 한도는 시점에 따라 달라져
          <br />
          만료된 조건은 최종 약정과 비교할 수 없어요.
        </p>
        <div className="mt-[42px] text-left">
          <div className="flex h-[40px] items-center justify-between rounded-[12px] bg-[#f7f7f7] px-[14px] text-[13px]">
            <span className="text-[#667085]">현재상태</span>
            <strong>비교 기준으로 사용 불가</strong>
          </div>
          <div className="mt-[18px] flex justify-between px-[14px] text-[13px]">
            <span className="text-[#667085]">조회일시</span>
            <strong>2026.09.11 17:40</strong>
          </div>
          <div className="mt-[18px] flex justify-between px-[14px] text-[13px]">
            <span className="text-[#667085]">유효기간</span>
            <strong>2026.09.12 18:00</strong>
          </div>
        </div>
      </section>
      <div className="absolute inset-x-0 top-[526px]">
        <Divider />
        <section className="px-5 pt-[22px] text-left">
          <div className="rounded-[14px] bg-[#f0f5fb] p-[15px]">
            <h2 className="text-[13px] font-semibold text-[#003875]">다시 조회할시</h2>
            <p className="mt-2 text-[14px] leading-[22px]">
              새 공식 조건이 V1으로 저장되고, 최종 심사 후 해당 조건과 자동 비교됩니다.
            </p>
          </div>
          <ChevronRow href="/start">이전 조회 결과 보기</ChevronRow>
        </section>
      </div>
      <BottomAction>
        <Link href="/start" className={primaryActionClass}>
          새 조건 다시 조회
        </Link>
      </BottomAction>
    </AppShell>
  )
}
