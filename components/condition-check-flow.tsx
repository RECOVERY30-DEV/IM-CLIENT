'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { demoItems, demoPreCondition, demoProof, demoSummary } from '@/shared/data/demo'
import { requestImApi } from '@/shared/lib/api'
import { formatKoreanDate, formatSignedWon, formatWon, statusCopy } from '@/shared/lib/format'
import type {
  ComparisonHeadline,
  ComparisonItem,
  ComparisonRun,
  ComparisonSummary,
  Decision,
  PreCondition,
  ProofStatus,
  ReviewGate,
  SignatureSession,
} from '@/shared/types/im'

type Screen = 'home' | 'progress' | 'summary' | 'item' | 'review' | 'proof' | 'expired'

const tone = {
  positive: 'bg-teal-50 text-teal-700',
  warning: 'bg-rose-50 text-rose-600',
  neutral: 'bg-amber-50 text-amber-700',
  muted: 'bg-slate-100 text-slate-500',
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-[430px] bg-white px-5 pb-28 shadow-[0_0_40px_rgba(23,49,36,0.08)]">
      <header className="flex h-16 items-center border-b border-slate-100">
        <Link href="/" aria-label="처음으로" className="mr-3 text-lg text-slate-500">
          ‹
        </Link>
        <strong className="text-[15px]">{title}</strong>
        <span className="ml-auto text-xs font-medium text-teal-600">iM</span>
      </header>
      {children}
    </main>
  )
}

function Bottom({
  children,
  secondary,
}: {
  children: React.ReactNode
  secondary?: React.ReactNode
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
      <div className="flex gap-2">
        {secondary}
        {children}
      </div>
    </div>
  )
}

function Status({ value }: { value: ComparisonItem['itemStatus'] }) {
  const label = statusCopy(value)
  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone[label.tone]}`}>
      {label.label}
    </span>
  )
}

function ItemRow({ item, href }: { item: ComparisonItem; href?: string }) {
  const inner = (
    <>
      <div>
        <p className="font-semibold text-slate-800">{item.label}</p>
        <p className="mt-1 text-xs text-slate-500">
          {item.v1ValueText} <span className="mx-1 text-slate-300">→</span> {item.v2ValueText}
        </p>
      </div>
      <div className="text-right">
        <Status value={item.itemStatus} />
        <p className="mt-2 text-sm font-bold text-rose-600">{item.deltaLabel}</p>
      </div>
    </>
  )
  return href ? (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 shadow-sm transition hover:border-teal-200"
    >
      {inner}
    </Link>
  ) : (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 shadow-sm">
      {inner}
    </div>
  )
}

function HeadlineRow({ item, href }: { item: ComparisonHeadline; href: string }) {
  const label = statusCopy(item.itemStatus)
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 shadow-sm transition hover:border-teal-200"
    >
      <div>
        <p className="font-semibold text-slate-800">{item.label}</p>
        <p className="mt-1 text-xs text-slate-500">세부 변경 내용을 확인해 주세요.</p>
      </div>
      <div className="text-right">
        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone[label.tone]}`}>
          {label.label}
        </span>
        <p className="mt-2 text-sm font-bold text-rose-600">{item.deltaLabel}</p>
      </div>
    </Link>
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
  const [progress, setProgress] = useState(43)
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
    const id = window.setInterval(() => setProgress((value) => Math.min(value + 14, 92)), 850)
    return () => window.clearInterval(id)
  }, [liveMode, screen])
  useEffect(() => {
    if (screen !== 'home' || !liveMode) return
    if (!applicationId) {
      setLiveError('실서비스에서는 applicationId가 포함된 링크로 접근해 주세요.')
      return
    }
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
    if (screen !== 'progress' || !liveMode) return
    if (!comparisonId) {
      setLiveError('실서비스에서는 comparisonId가 포함된 링크로 접근해 주세요.')
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

  if (liveError && screen !== 'home') {
    return (
      <Shell title="iM 조건체크">
        <section className="pt-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-2xl text-rose-600">
            !
          </div>
          <h1 className="mt-5 text-2xl font-bold">정보를 불러오지 못했어요</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{liveError}</p>
        </section>
        <Bottom>
          <Link
            href="/"
            className="w-full rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            처음으로
          </Link>
        </Bottom>
      </Shell>
    )
  }

  if (screen === 'home')
    return (
      <Shell title="신용대출 조회 결과">
        <section className="pt-8">
          <p className="text-sm font-semibold text-teal-600">조회 결과를 안전하게 기록했어요</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            현재 신청 가능한
            <br />
            조건이에요
          </h1>
          {liveError ? (
            <div className="mt-7 rounded-2xl bg-rose-50 p-5 text-sm leading-6 text-rose-700">
              {liveError}
            </div>
          ) : (
            <>
              <div className="mt-7 rounded-3xl bg-[#eefbf7] p-5">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-600">대출 한도</span>
                  <strong className="text-xl">
                    {formatWon(preCondition.conditions.loanAmount)}
                  </strong>
                </div>
                <div className="my-4 border-t border-teal-100" />
                <div className="flex items-end justify-between">
                  <span className="text-sm text-slate-600">예상 금리</span>
                  <strong className="text-2xl text-teal-600">
                    연 {preCondition.conditions.finalRatePercent.toFixed(2)}%
                  </strong>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  {preCondition.conditions.termMonths}개월 ·{' '}
                  {preCondition.conditions.repaymentMethod}
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {formatKoreanDate(preCondition.expiresAt)}까지 유효한 조회 결과입니다.
              </div>
              <h2 className="mt-8 text-base font-bold">반영된 우대조건</h2>
              <div className="mt-3 space-y-2">
                {preCondition.conditions.preferentialConditions.map((benefit) => (
                  <div
                    key={benefit.code}
                    className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span>{benefit.label}</span>
                    <strong className="text-teal-600">
                      −{benefit.ratePercentOff.toFixed(2)}%p
                    </strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        <Bottom>
          <Link
            href={`/comparison/${routeComparisonId}`}
            className="w-full rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            이 조건으로 신청
          </Link>
        </Bottom>
      </Shell>
    )

  if (screen === 'progress')
    return (
      <Shell title="iM 조건체크">
        <section className="pt-12 text-center">
          <div
            className="mx-auto grid h-32 w-32 place-items-center rounded-full border-[10px] border-teal-100"
            style={{
              background: `conic-gradient(#14b887 ${displayedProgress * 3.6}deg, #eef7f4 0deg)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
              <strong className="text-2xl text-teal-600">{displayedProgress}%</strong>
              <span className="text-[11px] text-slate-500">
                {completedSteps} / {totalSteps} 항목
              </span>
            </div>
          </div>
          <h1 className="mt-8 text-xl font-bold">최종 조건을 비교하고 있어요</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            사전조건(V1)과 최종 약정조건(V2)의 같은 항목을 연결해 비용 영향을 계산합니다.
          </p>
          {comparisonRun?.status === 'FAILED' && (
            <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-left text-sm text-rose-700">
              비교를 완료하지 못했습니다. 다시 시도하거나 상담을 요청할 수 있습니다.
              {actionError && <p className="mt-2">{actionError}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void retryComparison()}
                  disabled={submitting}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  다시 비교
                </button>
                <button
                  type="button"
                  onClick={() => void requestConsultation()}
                  disabled={submitting}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold disabled:opacity-50"
                >
                  상담 요청
                </button>
              </div>
            </div>
          )}
          <div className="mt-8 space-y-3 text-left">
            {[
              '대출금액 · 금리 연결',
              '우대조건 충족 확인',
              '상환방식 · 기간 확인',
              '월 납입액 · 총이자 계산',
            ].map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span className={index < 3 ? 'text-teal-600' : 'text-teal-500'}>
                  {index < 3 ? '✓' : '•••'}
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>
        <Bottom>
          <Link
            href={`/comparison/${routeComparisonId}/summary`}
            className="w-full rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            비교 결과 확인
          </Link>
        </Bottom>
      </Shell>
    )

  if (screen === 'summary')
    return (
      <Shell title="비교 결과">
        <section className="pt-7">
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
            확인이 필요한 변경이 있어요
          </span>
          <h1 className="mt-4 text-2xl font-bold">
            최종 조건을
            <br />
            확인해 주세요
          </h1>
          <div className="mt-6 rounded-3xl bg-[#16382d] p-5 text-white">
            <p className="text-sm text-teal-100">최종 조건 기준 예상 비용 변화</p>
            <strong className="mt-2 block text-3xl">
              {formatSignedWon(summary.impact.totalCostDelta)}
            </strong>
            <p className="mt-2 text-xs text-slate-300">총 이자 기준 · 사전조회 조건 대비</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">월 납입액</p>
              <strong className="mt-1 block text-lg text-rose-600">
                {formatSignedWon(summary.impact.monthlyPaymentDelta)}
              </strong>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">확인 필요</p>
              <strong className="mt-1 block text-lg">{summary.requiredReviewCount}개 항목</strong>
            </div>
          </div>
          <h2 className="mt-8 text-base font-bold">주요 변경 항목</h2>
          <div className="mt-3 space-y-2">
            {summary.headlineItems.slice(0, 2).map((entry) => (
              <HeadlineRow
                key={entry.itemId}
                item={entry}
                href={`/comparison/${routeComparisonId}/items/${entry.itemId}`}
              />
            ))}
          </div>
        </section>
        <Bottom
          secondary={
            <Link
              href={`/comparison/${routeComparisonId}`}
              className="rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-600"
            >
              이전
            </Link>
          }
        >
          <Link
            href={`/comparison/${routeComparisonId}/items/${summary.headlineItems[0]?.itemId ?? 1}`}
            className="flex-1 rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            변경 사항 확인
          </Link>
        </Bottom>
      </Shell>
    )

  if (screen === 'item')
    return (
      <Shell title="변경 항목 확인">
        <section className="pt-7">
          <Status value={item.itemStatus} />
          <h1 className="mt-3 text-2xl font-bold">
            {item.label}이<br />
            변경되었어요
          </h1>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-4">
                <p className="text-xs text-slate-500">사전 조건(V1)</p>
                <strong className="mt-2 block">{item.v1ValueText}</strong>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500">최종 조건(V2)</p>
                <strong className="mt-2 block text-rose-600">{item.v2ValueText}</strong>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold">왜 바뀌었나요?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.reason ??
                item.unknownReason ??
                '최종 심사 결과를 반영해 조건이 변경되었습니다.'}
            </p>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-400">
            iM 조건체크는 계약 전 확인을 돕는 안내 서비스입니다. 최종 약정서의 내용을 다시 확인해
            주세요.
          </p>
        </section>
        <Bottom>
          <Link
            href={`/comparison/${routeComparisonId}/review`}
            className="w-full rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            확인했어요
          </Link>
        </Bottom>
      </Shell>
    )

  if (screen === 'review')
    return (
      <Shell title="최종 확인">
        <section className="pt-7">
          <p className="text-sm font-semibold text-teal-600">약정 전 마지막 확인</p>
          <h1 className="mt-2 text-2xl font-bold">
            변경된 조건을
            <br />
            모두 확인해 주세요
          </h1>
          <div className="mt-6 space-y-3">
            {reviewItems.map((entry) => (
              <div
                key={entry.itemId}
                className="flex items-center rounded-2xl border border-slate-100 p-4"
              >
                <span
                  className={`mr-3 grid h-6 w-6 place-items-center rounded-full text-xs text-white ${entry.reviewed ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  {entry.reviewed ? '✓' : '•'}
                </span>
                <div>
                  <p className="font-semibold">{entry.label}</p>
                  <p className="mt-1 text-xs text-slate-500">약정 전 필수 확인 항목</p>
                </div>
                {entry.reviewed ? (
                  <span className="ml-auto text-xs font-bold text-teal-600">확인 완료</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markReviewed(entry.itemId)}
                    disabled={submitting}
                    className="ml-auto rounded-lg bg-teal-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    확인하기
                  </button>
                )}
              </div>
            ))}
          </div>
          {actionError && (
            <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              {actionError}
            </div>
          )}
          {actionMessage && (
            <div className="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-800">
              {actionMessage}
            </div>
          )}
          <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-800">
            {allReviewed
              ? '모든 확인 항목을 검토했습니다.'
              : '모든 항목을 확인하면 약정을 진행할 수 있습니다.'}{' '}
            약정을 진행하면 이 확인 기록이 안전하게 저장됩니다.
          </div>
        </section>
        <Bottom
          secondary={
            liveMode ? (
              <button
                type="button"
                onClick={() => void reconsider()}
                disabled={submitting}
                className="rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-600 disabled:opacity-50"
              >
                재검토
              </button>
            ) : (
              <Link
                href={`/comparison/${routeComparisonId}/summary`}
                className="rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-600"
              >
                재검토
              </Link>
            )
          }
        >
          {liveMode ? (
            <button
              type="button"
              onClick={() => void proceed()}
              disabled={!allReviewed || submitting}
              className="flex-1 rounded-xl bg-teal-500 py-3.5 text-sm font-bold text-white disabled:bg-slate-300"
            >
              {submitting ? '약정 처리 중…' : '약정 진행하기'}
            </button>
          ) : (
            <Link
              href="/decision/9001"
              className="flex-1 rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
            >
              약정 진행하기
            </Link>
          )}
        </Bottom>
      </Shell>
    )

  if (screen === 'proof')
    return (
      <Shell title="약정 완료">
        <section className="pt-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-2xl text-teal-600">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-bold">
            약정 확인을
            <br />
            기록했어요
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            변경 조건 확인 기록이 무결성 증빙에 저장되었습니다.
          </p>
          <div className="mt-8 rounded-3xl border border-slate-100 p-5 text-left">
            <div className="flex justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-500">계약번호</span>
              <strong className="text-sm">{proof.contractNumber}</strong>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-sm text-slate-500">최종 적용금리</span>
              <strong>연 {proof.finalRatePercent.toFixed(2)}%</strong>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">증빙 상태</span>
              <span
                className={
                  proof.anchorStatus === 'CONFIRMED'
                    ? 'font-bold text-teal-600'
                    : 'font-bold text-amber-600'
                }
              >
                {proof.anchorStatus === 'CONFIRMED' ? '검증됨' : '처리 중'}
              </span>
            </div>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            약정 시각 · {formatKoreanDate(proof.decidedAt)}
          </p>
          {actionError && <p className="mt-3 text-sm text-rose-700">{actionError}</p>}
          {actionMessage && <p className="mt-3 text-sm text-teal-700">{actionMessage}</p>}
        </section>
        <Bottom>
          {liveMode && (
            <button
              type="button"
              onClick={() => void verifyProof()}
              disabled={submitting}
              className="rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              재검증
            </button>
          )}
          <Link
            href="/"
            className="flex-1 rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
          >
            처음으로
          </Link>
        </Bottom>
      </Shell>
    )

  return (
    <Shell title="사전조건 만료">
      <section className="pt-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-2xl">
          !
        </div>
        <h1 className="mt-5 text-2xl font-bold">
          조회 조건이
          <br />
          만료되었어요
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          정확한 최종 조건 확인을 위해 새로운 조회가 필요합니다.
        </p>
      </section>
      <Bottom>
        <Link
          href="/"
          className="w-full rounded-xl bg-teal-500 py-3.5 text-center text-sm font-bold text-white"
        >
          새로 조회하기
        </Link>
      </Bottom>
    </Shell>
  )
}
