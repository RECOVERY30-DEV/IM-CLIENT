import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConditionCheckFlow } from '@/components/condition-check-flow'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('ConditionCheckFlow Figma screen contract', () => {
  it('renders the V1 screen with the Figma heading, time badge, and action', () => {
    render(<ConditionCheckFlow screen="home" applicationId="demo-application" />)

    expect(screen.getByRole('heading', { name: '현재 신청 가능한 조건이에요' })).toBeInTheDocument()
    expect(screen.getByText('오늘 18:00까지')).toBeInTheDocument()
    expect(screen.getByText('유효한 조회 결과입니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '이 조건으로 신청' })).toBeInTheDocument()
  })

  it('marks a live entry without an application ID as a demo comparison flow', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')

    render(<ConditionCheckFlow screen="home" />)

    expect(screen.getByRole('link', { name: '이 조건으로 신청' })).toHaveAttribute(
      'href',
      '/comparison/101?demo=1',
    )
    expect(
      screen.queryByText('대출 신청 정보가 없어 조건을 저장할 수 없습니다.'),
    ).not.toBeInTheDocument()
  })

  it('keeps an explicit demo comparison in the progress UI when production live mode is enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('존재하지 않는 비교 결과입니다')))

    render(<ConditionCheckFlow screen="progress" comparisonId="101" demoMode />)
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByRole('heading', { name: '최종 조건을 비교하고 있어요' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '정보를 불러오지 못했어요' }),
    ).not.toBeInTheDocument()
  })

  it('preserves demo mode when moving from progress to the comparison result', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
    vi.useFakeTimers()

    render(<ConditionCheckFlow screen="progress" comparisonId="101" demoMode />)
    act(() => {
      vi.advanceTimersByTime(3_000)
    })

    expect(screen.getByRole('link', { name: '비교 결과 확인' })).toHaveAttribute(
      'href',
      '/comparison/101/summary?demo=1',
    )
  })

  it('renders the comparison progress copy and disabled checking action', () => {
    render(<ConditionCheckFlow screen="progress" comparisonId="101" />)

    expect(screen.getByRole('heading', { name: '최종 조건을 비교하고 있어요' })).toBeInTheDocument()
    expect(screen.getByText('대출금액·금리 연결')).toBeInTheDocument()
    expect(screen.getByText('우대조건 충족 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '비교 결과 확인중' })).toBeDisabled()
  })

  it('renders the summary status tabs and Figma impact hierarchy', () => {
    render(<ConditionCheckFlow screen="summary" comparisonId="101" />)

    expect(screen.getByText('부담 감소')).toBeInTheDocument()
    expect(screen.getByText('변경 없음')).toBeInTheDocument()
    expect(screen.getByText('확인필요')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '최종 조건에서 3가지가 달라졌어요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('월 +18,400원')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '변경 내용 자세히 보기' })).toBeInTheDocument()
  })

  it('renders the changed-rate reason and evidence structure', () => {
    render(<ConditionCheckFlow screen="item" comparisonId="101" itemId="1" />)

    expect(screen.getByRole('heading', { name: '왜 금리가 달라졌나요?' })).toBeInTheDocument()
    expect(screen.getByText('확인된 변경 사유')).toBeInTheDocument()
    expect(screen.getByText(/최종 약정서 3쪽/)).toBeInTheDocument()
    expect(screen.getByText('비용 계산 근거')).toBeInTheDocument()
  })

  it('renders the final agreement review controls from Figma', () => {
    render(<ConditionCheckFlow screen="review" comparisonId="101" />)

    expect(screen.getByRole('heading', { name: '왜 금리가 달라졌나요?' })).toBeInTheDocument()
    expect(screen.getByText('조건 변경 내용·사유·비용 영향 확인')).toBeInTheDocument()
    expect(screen.getByText('전자서명')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '현재 조건으로 약정하기' })).toBeInTheDocument()
  })

  it('renders the completed agreement and stored comparison record', () => {
    render(<ConditionCheckFlow screen="proof" decisionId="9001" />)

    expect(screen.getByRole('heading', { name: '대출 약정이 완료됐어요' })).toBeInTheDocument()
    expect(screen.getByText('조건 확인 기록')).toBeInTheDocument()
    expect(screen.getByText('사전조건 V1 ↔ 최종조건 V2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '내 대출에서 확인' })).toBeInTheDocument()
  })

  it('renders the Figma expiration explanation and retry action', () => {
    render(<ConditionCheckFlow screen="expired" />)

    expect(screen.getByRole('heading', { name: '사전 조회 조건이 만료됐어요' })).toBeInTheDocument()
    expect(screen.getByText('다시 조회할시')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '새 조건 다시 조회' })).toBeInTheDocument()
  })
})
