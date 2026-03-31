import { describe, it, expect } from 'vitest'
import { mountComposable } from '../src/test-utils'
import { useValueType } from '../src/use-value-type'

import type { ValueType } from '@pro/utils'

describe('useValueType', () => {
  it('should return table render config for text type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('text')
    expect(config.component).toBe('span')
    expect(config.format('hello')).toBe('hello')

    unmount()
  })

  it('should return table render config for money type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('money')
    expect(config.format(1234.5)).toBe('$1,234.50')

    unmount()
  })

  it('should return table render config for percent type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('percent')
    expect(config.format(0.856)).toBe('85.60%')

    unmount()
  })

  it('should return table render config for number type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('number')
    expect(config.format(1234567)).toBe('1,234,567')

    unmount()
  })

  it('should return table render config for date type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('date')
    const formatted = config.format('2026-03-31T10:00:00Z')
    expect(formatted).toMatch(/2026/)

    unmount()
  })

  it('should return table render config for dateTime type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('dateTime')
    const formatted = config.format('2026-03-31T10:30:00Z')
    expect(formatted).toMatch(/2026/)
    expect(formatted).toMatch(/:/)

    unmount()
  })

  it('should return search component name for text type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('text')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElInput')
    expect(config!.props).toEqual({})

    unmount()
  })

  it('should return search component name for select type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('select')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElSelect')

    unmount()
  })

  it('should return search component name for date type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('date')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElDatePicker')
    expect(config!.props.type).toBe('date')

    unmount()
  })

  it('should return search component name for dateRange type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('dateRange')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElDatePicker')
    expect(config!.props.type).toBe('daterange')

    unmount()
  })

  it('should return search component name for dateTime type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('dateTime')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElDatePicker')
    expect(config!.props.type).toBe('datetime')

    unmount()
  })

  it('should return search component name for number type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('number')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElInputNumber')

    unmount()
  })

  it('should return search component name for switch type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('switch')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElSwitch')

    unmount()
  })

  it('should return search component name for textarea type', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getSearchConfig('textarea')
    expect(config).not.toBeNull()
    expect(config!.component).toBe('ElInput')
    expect(config!.props.type).toBe('textarea')

    unmount()
  })

  it('should return null search config for non-searchable types', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    expect(result.getSearchConfig('progress')).toBeNull()
    expect(result.getSearchConfig('image')).toBeNull()
    expect(result.getSearchConfig('code')).toBeNull()

    unmount()
  })

  it('should handle unknown value types gracefully', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('unknown_type' as ValueType)
    expect(config.component).toBe('span')
    expect(config.format('anything')).toBe('anything')

    unmount()
  })

  it('should format null/undefined values as empty string', () => {
    const { result, unmount } = mountComposable(() => useValueType())

    const config = result.getTableRenderConfig('money')
    expect(config.format(null)).toBe('-')
    expect(config.format(undefined)).toBe('-')

    unmount()
  })
})
