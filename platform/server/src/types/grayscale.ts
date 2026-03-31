/**
 * Grayscale rule configuration types.
 * Supports composite AND/OR rules with nested conditions.
 */

export interface UserListCondition {
  type: 'user_list'
  values: string[]
}

export interface DepartmentCondition {
  type: 'department'
  values: string[]
}

export interface PercentageCondition {
  type: 'percentage'
  value: number
  hash_key: string
}

export type LeafCondition = UserListCondition | DepartmentCondition | PercentageCondition

export interface CompositeCondition {
  operator: 'AND' | 'OR'
  conditions: GrayscaleCondition[]
}

export type GrayscaleCondition = LeafCondition | CompositeCondition

/** Top-level rule config stored in grayscale_rules.rule_config */
export type GrayscaleRuleConfig = GrayscaleCondition

/** Context passed to the grayscale evaluator */
export interface GrayscaleContext {
  userId: string
  department?: string
  [key: string]: string | undefined
}
