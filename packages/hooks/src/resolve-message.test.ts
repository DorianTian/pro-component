import { describe, expect, it } from 'vitest'
import { resolveMessage } from './resolve-message'

const messages = {
  pro: {
    table: {
      empty: 'No Data',
      pagination: {
        showing: 'Showing {start}\u2013{end} of {total}',
      },
    },
  },
}

describe('resolveMessage', () => {
  it('resolves nested key', () => {
    expect(resolveMessage(messages, 'pro.table.empty')).toBe('No Data')
  })

  it('resolves deeply nested key', () => {
    expect(resolveMessage(messages, 'pro.table.pagination.showing')).toBe(
      'Showing {start}\u2013{end} of {total}',
    )
  })

  it('returns key when not found', () => {
    expect(resolveMessage(messages, 'pro.table.nonexistent')).toBe('pro.table.nonexistent')
  })

  it('interpolates params', () => {
    expect(
      resolveMessage(messages, 'pro.table.pagination.showing', {
        start: 1,
        end: 20,
        total: 128,
      }),
    ).toBe('Showing 1\u201320 of 128')
  })

  it('preserves unmatched param placeholders', () => {
    expect(resolveMessage(messages, 'pro.table.pagination.showing', { start: 1 })).toBe(
      'Showing 1\u2013{end} of {total}',
    )
  })

  it('returns empty string for empty key', () => {
    expect(resolveMessage(messages, '')).toBe('')
  })

  it('returns key when messages is null-ish', () => {
    expect(resolveMessage(null as unknown as Record<string, unknown>, 'any.key')).toBe('any.key')
    expect(resolveMessage(undefined as unknown as Record<string, unknown>, 'any.key')).toBe(
      'any.key',
    )
  })

  it('returns key when value is not a string (intermediate node)', () => {
    expect(resolveMessage(messages, 'pro.table')).toBe('pro.table')
  })
})
