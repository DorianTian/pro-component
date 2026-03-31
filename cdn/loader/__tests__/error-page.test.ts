/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { buildErrorPageHtml, renderErrorPage } from '../src/error-page'
import type { ErrorDiagnostics } from '../src/error-page'

const MOCK_DIAGNOSTICS: ErrorDiagnostics = {
  appId: 'user-center',
  userId: 'dorian',
  failedSources: ['api', 'sw-cache', 'localstorage'],
  timestamp: '2026-03-30T12:00:00.000Z',
  userAgent: 'Mozilla/5.0 Test',
}

describe('buildErrorPageHtml', () => {
  it('includes error message in diagnostic output', () => {
    const html = buildErrorPageHtml(new Error('Network timeout'), MOCK_DIAGNOSTICS)
    expect(html).toContain('Network timeout')
  })

  it('includes appId and userId in diagnostics', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('user-center')
    expect(html).toContain('dorian')
  })

  it('includes retry button', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('id="pro-error-retry"')
    expect(html).toContain('Retry')
  })

  it('escapes HTML in error messages', () => {
    const html = buildErrorPageHtml(new Error('<script>alert("xss")</script>'), MOCK_DIAGNOSTICS)
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;')
  })

  it('includes all inline styles (no external CSS dependencies)', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('style="')
    // Should not reference any external stylesheet
    expect(html).not.toContain('href=')
    expect(html).not.toContain('.css')
  })

  it('includes failed sources list', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('api')
    expect(html).toContain('sw-cache')
    expect(html).toContain('localstorage')
  })
})

describe('renderErrorPage', () => {
  it('replaces document.body with error page', () => {
    document.body.innerHTML = '<div id="app">existing content</div>'

    renderErrorPage(new Error('Render test'), MOCK_DIAGNOSTICS)

    expect(document.body.innerHTML).toContain('pro-error-container')
    expect(document.body.innerHTML).not.toContain('existing content')
  })

  it('binds retry button to window.location.reload', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    })

    renderErrorPage(new Error('test'), MOCK_DIAGNOSTICS)

    const retryBtn = document.getElementById('pro-error-retry')
    expect(retryBtn).not.toBeNull()

    retryBtn!.click()
    expect(reloadMock).toHaveBeenCalled()
  })
})
