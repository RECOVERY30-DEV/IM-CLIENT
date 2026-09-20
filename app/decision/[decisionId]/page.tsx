import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function DecisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ decisionId: string }>
  searchParams: Promise<{ demo?: string }>
}) {
  const [{ decisionId }, { demo }] = await Promise.all([params, searchParams])
  return <ConditionCheckFlow screen="proof" decisionId={decisionId} demoMode={demo === '1'} />
}
