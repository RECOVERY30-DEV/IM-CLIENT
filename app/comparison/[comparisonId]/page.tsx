import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ comparisonId: string }>
}) {
  const { comparisonId } = await params
  return <ConditionCheckFlow screen="progress" comparisonId={comparisonId} />
}
