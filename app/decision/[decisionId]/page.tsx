import { ConditionCheckFlow } from '@/components/condition-check-flow'
export default async function DecisionPage({
  params,
}: {
  params: Promise<{ decisionId: string }>
}) {
  const { decisionId } = await params
  return <ConditionCheckFlow screen="proof" decisionId={decisionId} />
}
