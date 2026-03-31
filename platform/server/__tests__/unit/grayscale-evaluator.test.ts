import { describe, it, expect } from 'vitest'
import { evaluateRule } from '../../src/engines/grayscale-evaluator.js'
import type { GrayscaleCondition } from '../../src/types/grayscale.js'

describe('grayscale-evaluator', () => {
  describe('user_list condition', () => {
    const condition: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-1', 'uid-2', 'uid-3'],
    }

    it('returns true when userId is in the list', () => {
      expect(evaluateRule(condition, { userId: 'uid-2' })).toBe(true)
    })

    it('returns false when userId is NOT in the list', () => {
      expect(evaluateRule(condition, { userId: 'uid-99' })).toBe(false)
    })

    it('returns false for empty user list', () => {
      const empty: GrayscaleCondition = { type: 'user_list', values: [] }
      expect(evaluateRule(empty, { userId: 'uid-1' })).toBe(false)
    })
  })

  describe('department condition', () => {
    const condition: GrayscaleCondition = {
      type: 'department',
      values: ['engineering', 'product'],
    }

    it('returns true when department matches', () => {
      expect(evaluateRule(condition, { userId: 'u1', department: 'engineering' })).toBe(true)
    })

    it('returns false when department does not match', () => {
      expect(evaluateRule(condition, { userId: 'u1', department: 'sales' })).toBe(false)
    })

    it('returns false when department is undefined in context', () => {
      expect(evaluateRule(condition, { userId: 'u1' })).toBe(false)
    })
  })

  describe('percentage condition', () => {
    const condition50: GrayscaleCondition = {
      type: 'percentage',
      value: 50,
      hash_key: 'userId',
    }

    it('is deterministic for the same userId', () => {
      const result1 = evaluateRule(condition50, { userId: 'user-a' })
      const result2 = evaluateRule(condition50, { userId: 'user-a' })
      expect(result1).toBe(result2)
    })

    it('returns false when hash_key field is missing from context', () => {
      const conditionCustomKey: GrayscaleCondition = {
        type: 'percentage',
        value: 50,
        hash_key: 'custom_field',
      }
      expect(evaluateRule(conditionCustomKey, { userId: 'u1' })).toBe(false)
    })

    it('0% means nobody gets in', () => {
      const condition0: GrayscaleCondition = {
        type: 'percentage',
        value: 0,
        hash_key: 'userId',
      }
      let hitCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluateRule(condition0, { userId: `user-${i}` })) hitCount++
      }
      expect(hitCount).toBe(0)
    })

    it('100% means everyone gets in', () => {
      const condition100: GrayscaleCondition = {
        type: 'percentage',
        value: 100,
        hash_key: 'userId',
      }
      let hitCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluateRule(condition100, { userId: `user-${i}` })) hitCount++
      }
      expect(hitCount).toBe(100)
    })

    it('50% gives roughly half', () => {
      let hitCount = 0
      const total = 1000
      for (let i = 0; i < total; i++) {
        if (evaluateRule(condition50, { userId: `test-user-${i}` })) hitCount++
      }
      expect(hitCount).toBeGreaterThan(400)
      expect(hitCount).toBeLessThan(600)
    })
  })

  describe('composite AND', () => {
    it('returns true when ALL conditions are met', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['engineering'] },
          { type: 'user_list', values: ['uid-1', 'uid-2'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-1', department: 'engineering' })).toBe(true)
    })

    it('returns false when any condition fails', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['engineering'] },
          { type: 'user_list', values: ['uid-1'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-99', department: 'engineering' })).toBe(false)
    })

    it('returns false for empty conditions array', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [],
      }
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })
  })

  describe('composite OR', () => {
    it('returns true when ANY condition is met', () => {
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid-vip'] },
          { type: 'department', values: ['engineering'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-nobody', department: 'engineering' })).toBe(true)
    })

    it('returns false when NO condition is met', () => {
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid-vip'] },
          { type: 'department', values: ['engineering'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-nobody', department: 'sales' })).toBe(false)
    })
  })

  describe('deeply nested composite rules', () => {
    it('evaluates the design spec example correctly', () => {
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid1', 'uid2'] },
          {
            operator: 'AND',
            conditions: [
              { type: 'department', values: ['dept_a'] },
              { type: 'percentage', value: 50, hash_key: 'userId' },
            ],
          },
        ],
      }

      expect(evaluateRule(rule, { userId: 'uid1', department: 'dept_b' })).toBe(true)
      expect(evaluateRule(rule, { userId: 'uid99', department: 'dept_b' })).toBe(false)
    })

    it('handles 3 levels of nesting', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['eng'] },
          {
            operator: 'OR',
            conditions: [
              { type: 'user_list', values: ['uid-admin'] },
              {
                operator: 'AND',
                conditions: [{ type: 'percentage', value: 100, hash_key: 'userId' }],
              },
            ],
          },
        ],
      }

      expect(evaluateRule(rule, { userId: 'anyone', department: 'eng' })).toBe(true)
      expect(evaluateRule(rule, { userId: 'anyone', department: 'sales' })).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles unknown condition type gracefully (returns false)', () => {
      const rule = { type: 'unknown_type', values: ['a'] } as unknown as GrayscaleCondition
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })

    it('handles unknown operator gracefully (returns false)', () => {
      const rule = {
        operator: 'XOR' as 'AND',
        conditions: [{ type: 'user_list', values: ['u1'] }],
      } as GrayscaleCondition
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })
  })
})
