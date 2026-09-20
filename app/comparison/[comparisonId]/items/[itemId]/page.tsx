import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function ItemPage({
  params,
}: {
  params: Promise<{ comparisonId: string; itemId: string }>
}) {
  const { itemId, comparisonId } = await params
  return <ConditionCheckFlow screen="item" itemId={itemId} comparisonId={comparisonId} />
}
