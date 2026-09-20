import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function ItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string; itemId: string }>
  searchParams: Promise<{ demo?: string }>
}) {
  const [{ itemId, comparisonId }, { demo }] = await Promise.all([params, searchParams])
  return (
    <ConditionCheckFlow
      screen="item"
      itemId={itemId}
      comparisonId={comparisonId}
      demoMode={demo === '1'}
    />
  )
}
