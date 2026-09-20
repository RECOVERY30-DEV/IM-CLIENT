import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'iM 조건체크',
  description: '사전조회 조건과 최종 약정조건을 비교합니다.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
