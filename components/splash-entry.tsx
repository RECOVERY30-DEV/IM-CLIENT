'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { SplashScreen } from '@/components/splash-screen'

export function SplashEntry({ applicationId }: { applicationId?: string }) {
  const router = useRouter()
  const enterStartScreen = useCallback(() => {
    const query = applicationId ? `?applicationId=${encodeURIComponent(applicationId)}` : ''
    router.replace(`/start${query}`)
  }, [applicationId, router])

  return <SplashScreen onComplete={enterStartScreen} />
}
