'use client'

import { useEffect } from 'react'

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, 1_500)
    return () => window.clearTimeout(timeout)
  }, [onComplete])

  return (
    <main className="relative mx-auto min-h-[830px] w-full max-w-[390px] overflow-hidden rounded-[25px] bg-white shadow-[0_0_40px_rgba(23,49,36,0.08)]">
      <div className="relative z-20 flex h-[46px] items-center justify-between px-[26px] text-[16px] font-semibold tracking-[-0.3px] text-[#8ea3aa]">
        <span>9:23</span>
        <div className="flex items-center gap-[7px] opacity-20">
          <img
            alt=""
            aria-hidden="true"
            className="h-[12px] w-[19px]"
            src="/figma/ui/cellular.svg"
          />
          <img alt="" aria-hidden="true" className="h-[12px] w-[17px]" src="/figma/ui/wifi.svg" />
          <img
            alt=""
            aria-hidden="true"
            className="h-[13px] w-[27px]"
            src="/figma/ui/battery.svg"
          />
        </div>
      </div>
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-[249px] -left-[21px] h-[550px] w-[550px] max-w-none"
        src="/figma/splash/polygon-top.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[435px] left-[-173px] h-[550px] w-[550px] max-w-none"
        src="/figma/splash/polygon-bottom.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[97px] left-[-422px] h-[1158px] w-[1125px] max-w-none rotate-90 opacity-90"
        src="/figma/splash/glow.svg"
      />
      <section className="absolute top-[301px] left-[129px] z-10 flex w-[132px] flex-col items-center gap-[21px]">
        <img alt="iM" className="h-[57px] w-[100px]" src="/figma/splash/brand.svg" />
        <h1 className="bg-gradient-to-r from-[#00c795] to-[#94d1e5] bg-clip-text text-[27px] font-extrabold tracking-[-1.9px] whitespace-nowrap text-transparent">
          iM 조건체크
        </h1>
      </section>
    </main>
  )
}
