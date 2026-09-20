import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function SummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string }>
  searchParams: Promise<{ demo?: string }>
}) {
  const [{ comparisonId }, { demo }] = await Promise.all([params, searchParams])
  return <ConditionCheckFlow screen="summary" comparisonId={comparisonId} demoMode={demo === '1'} />
}
