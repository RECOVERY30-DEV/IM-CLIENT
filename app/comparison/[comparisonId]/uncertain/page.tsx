import { ConditionCheckFlow } from '@/components/condition-check-flow'

export default async function UncertainComparison({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string }>
  searchParams: Promise<{ demo?: string }>
}) {
  const [{ comparisonId }, { demo }] = await Promise.all([params, searchParams])
  return (
    <ConditionCheckFlow screen="uncertain" comparisonId={comparisonId} demoMode={demo === '1'} />
  )
}
