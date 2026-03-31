import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from './formatters'

dayjs.extend(relativeTime)

describe('formatDate', () => {
  it('formats date in en-US', () => {
    expect(formatDate('2026-03-15', 'date', 'en-US')).toBe('03/15/2026')
  })

  it('formats date in zh-CN', () => {
    expect(formatDate('2026-03-15', 'date', 'zh-CN')).toBe('2026-03-15')
  })

  it('formats dateTime in en-US', () => {
    const result = formatDate('2026-03-15T14:30:00', 'dateTime', 'en-US')
    expect(result).toBe('03/15/2026 2:30:00 PM')
  })

  it('formats dateTime in zh-CN', () => {
    const result = formatDate('2026-03-15T14:30:00', 'dateTime', 'zh-CN')
    expect(result).toBe('2026-03-15 14:30:00')
  })

  it('falls back to en-US format for unknown locale', () => {
    expect(formatDate('2026-03-15', 'date', 'ja-JP')).toBe('03/15/2026')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    dayjs.locale('en')
  })
  afterEach(() => {
    dayjs.locale('en')
  })

  it('returns relative time in English', () => {
    const twoHoursAgo = dayjs().subtract(2, 'hour').toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('returns relative time in Chinese when dayjs locale is zh-cn', () => {
    dayjs.locale('zh-cn')
    const twoHoursAgo = dayjs().subtract(2, 'hour').toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 小时前')
  })
})

describe('formatNumber', () => {
  it('formats with locale grouping', () => {
    expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
  })
})

describe('formatMoney', () => {
  it('formats USD by default for en-US', () => {
    expect(formatMoney(1234.5, 'en-US')).toBe('$1,234.50')
  })

  it('formats CNY by default for zh-CN', () => {
    const result = formatMoney(1234.5, 'zh-CN')
    expect(result).toContain('1,234.50')
  })

  it('allows custom currency', () => {
    expect(formatMoney(1234.5, 'en-US', 'EUR')).toContain('1,234.50')
  })
})

describe('formatPercent', () => {
  it('formats as percentage', () => {
    expect(formatPercent(0.856, 'en-US')).toBe('85.6%')
  })
})
