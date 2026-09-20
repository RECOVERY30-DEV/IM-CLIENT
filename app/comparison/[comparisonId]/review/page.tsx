import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string }>
  searchParams: Promise<{ demo?: string }>
}) {
  const [{ comparisonId }, { demo }] = await Promise.all([params, searchParams])
  return <ConditionCheckFlow screen="review" comparisonId={comparisonId} demoMode={demo === '1'} />
}
