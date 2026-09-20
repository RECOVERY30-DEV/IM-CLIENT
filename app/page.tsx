import { SplashEntry } from '@/components/splash-entry'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>
}) {
  const { applicationId } = await searchParams
  return <SplashEntry applicationId={applicationId} />
}
