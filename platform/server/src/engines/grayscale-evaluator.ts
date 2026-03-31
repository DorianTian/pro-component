import { hashToPercentage } from '../utils/hash.js'
import type {
  GrayscaleCondition,
  GrayscaleContext,
  LeafCondition,
  CompositeCondition,
} from '../types/grayscale.js'

/**
 * Evaluate a grayscale rule against a user context.
 * Returns true if the user should receive the grayscale version.
 *
 * Pure function — no I/O. All data passed in via parameters.
 * Supports recursive composite AND/OR rules with arbitrary nesting.
 */
export function evaluateRule(condition: GrayscaleCondition, context: GrayscaleContext): boolean {
  if (isComposite(condition)) {
    return evaluateComposite(condition, context)
  }
  return evaluateLeaf(condition, context)
}

function isComposite(condition: GrayscaleCondition): condition is CompositeCondition {
  return 'operator' in condition && 'conditions' in condition
}

function evaluateComposite(condition: CompositeCondition, context: GrayscaleContext): boolean {
  if (!condition.conditions || condition.conditions.length === 0) {
    return false
  }

  if (condition.operator === 'AND') {
    return condition.conditions.every((c) => evaluateRule(c, context))
  }

  if (condition.operator === 'OR') {
    return condition.conditions.some((c) => evaluateRule(c, context))
  }

  // Unknown operator — deny by default
  return false
}

function evaluateLeaf(condition: LeafCondition, context: GrayscaleContext): boolean {
  switch (condition.type) {
    case 'user_list':
      return evaluateUserList(condition.values, context)
    case 'department':
      return evaluateDepartment(condition.values, context)
    case 'percentage':
      return evaluatePercentage(condition.value, condition.hash_key, context)
    default:
      return false
  }
}

function evaluateUserList(userIds: string[], context: GrayscaleContext): boolean {
  return userIds.includes(context.userId)
}

function evaluateDepartment(departments: string[], context: GrayscaleContext): boolean {
  if (!context.department) {
    return false
  }
  return departments.includes(context.department)
}

function evaluatePercentage(
  percentage: number,
  hashKey: string,
  context: GrayscaleContext,
): boolean {
  const value = context[hashKey]
  if (value === undefined) {
    return false
  }
  const bucket = hashToPercentage(value)
  return bucket < percentage
}
