import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SplashScreen } from '@/components/splash-screen'

describe('SplashScreen', () => {
  it('shows the iM condition check brand and enters the start screen after the splash delay', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()

    render(<SplashScreen onComplete={onComplete} />)

    expect(screen.getByRole('heading', { name: 'iM 조건체크' })).toBeInTheDocument()

    vi.advanceTimersByTime(1_500)

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
