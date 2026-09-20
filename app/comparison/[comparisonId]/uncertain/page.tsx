import { ConditionCheckFlow } from '@/components/condition-check-flow'

export default async function UncertainComparison({
  params,
}: {
  params: Promise<{ comparisonId: string }>
}) {
  const { comparisonId } = await params
  return <ConditionCheckFlow screen="uncertain" comparisonId={comparisonId} />
}
