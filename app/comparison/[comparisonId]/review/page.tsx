import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ comparisonId: string }>
}) {
  const { comparisonId } = await params
  return <ConditionCheckFlow screen="review" comparisonId={comparisonId} />
}
