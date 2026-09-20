import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function SummaryPage({
  params,
}: {
  params: Promise<{ comparisonId: string }>
}) {
  const { comparisonId } = await params
  return <ConditionCheckFlow screen="summary" comparisonId={comparisonId} />
}
