import type { OverallStatus } from '@/shared/types/im'

export function comparisonCompletionPath(comparisonId: string | number, overallStatus?: OverallStatus) {
  const routeId = encodeURIComponent(String(comparisonId))
  return overallStatus === 'UNCERTAIN'
    ? `/comparison/${routeId}/uncertain`
    : `/comparison/${routeId}/summary`
}
