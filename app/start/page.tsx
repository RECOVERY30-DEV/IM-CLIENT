import { ConditionCheckFlow } from '@/components/condition-check-flow'

export default async function Start({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>
}) {
  const { applicationId } = await searchParams
  return <ConditionCheckFlow screen="home" applicationId={applicationId} />
}
