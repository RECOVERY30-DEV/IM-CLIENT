'use client'

import { useEffect } from 'react'

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, 1_500)
    return () => window.clearTimeout(timeout)
  }, [onComplete])

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[430px] items-center justify-center overflow-hidden bg-white shadow-[0_0_40px_rgba(23,49,36,0.08)]">
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-72 h-[550px] w-[550px] max-w-none"
        src="/figma/splash/polygon-top.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-72 -left-44 h-[550px] w-[550px] max-w-none"
        src="/figma/splash/polygon-bottom.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 opacity-90"
        src="/figma/splash/glow.svg"
      />
      <section className="relative z-10 flex -translate-y-1/4 flex-col items-center gap-5">
        <img alt="iM" className="h-[58px] w-[102px]" src="/figma/splash/brand.svg" />
        <h1 className="bg-gradient-to-r from-[#00c795] to-[#94d1e5] bg-clip-text text-[27px] font-extrabold tracking-[-1.9px] text-transparent">
          iM 조건체크
        </h1>
      </section>
    </main>
  )
}
