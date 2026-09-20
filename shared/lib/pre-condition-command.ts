import type { PreCondition, SavePreConditionCommand } from '@/shared/types/im'

export function toSavePreConditionCommand(
  preCondition: PreCondition,
): SavePreConditionCommand {
  return {
    inquiredAt: preCondition.inquiredAt,
    expiresAt: preCondition.expiresAt,
    conditions: preCondition.conditions,
  }
}
