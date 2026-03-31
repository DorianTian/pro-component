import { describe, it, expect } from 'vitest'
import { hashToPercentage } from '../../src/utils/hash.js'

describe('hashToPercentage', () => {
  it('returns a number between 0 and 99', () => {
    for (let i = 0; i < 100; i++) {
      const result = hashToPercentage(`user-${i}`)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(100)
    }
  })

  it('is deterministic — same input always gives same output', () => {
    const a = hashToPercentage('user-abc')
    const b = hashToPercentage('user-abc')
    expect(a).toBe(b)
  })

  it('different inputs give different outputs (high probability)', () => {
    const results = new Set<number>()
    for (let i = 0; i < 1000; i++) {
      results.add(hashToPercentage(`user-${i}`))
    }
    // With 1000 inputs and 100 buckets, we should see at least 80 distinct values
    expect(results.size).toBeGreaterThan(80)
  })

  it('distributes roughly uniformly', () => {
    const buckets = new Array(10).fill(0) as number[]
    const total = 10000
    for (let i = 0; i < total; i++) {
      const pct = hashToPercentage(`test-user-${i}`)
      buckets[Math.floor(pct / 10)]++
    }
    // Each bucket should have ~1000 entries. Allow 30% tolerance.
    for (const count of buckets) {
      expect(count).toBeGreaterThan(700)
      expect(count).toBeLessThan(1300)
    }
  })
})
