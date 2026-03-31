/**
 * @vitest-environment jsdom
 *
 * Integration test: SRI integrity verification.
 *
 * Verifies that SRI hashes are correctly applied to DOM elements.
 * Actual SRI rejection (browser refusing to load tampered files) requires
 * a real browser -- these tests verify the integrity attributes are set
 * correctly in the DOM for the browser to enforce.
 *
 * In CI with Vitest browser mode, add tests that actually load resources
 * with wrong SRI and verify the browser blocks them.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { injectModulePreloads, injectStylesheets } from '../../loader/src/inject'

describe('SRI Integrity Attributes', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('sets correct integrity attribute on modulepreload links', () => {
    const preloads = [
      'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
      'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
    ]

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs':
        'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
      'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs':
        'sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEb2VAf',
    }

    injectModulePreloads(preloads, sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(links).toHaveLength(2)

    const hooksLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"]',
    ) as HTMLLinkElement

    expect(hooksLink.getAttribute('integrity')).toBe(
      'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
    )
    expect(hooksLink.crossOrigin).toBe('anonymous')
  })

  it('sets correct integrity attribute on CSS links', () => {
    const styles = ['https://cdn.internal/@pro/table/1.2.3/style/index.css']

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/@pro/table/1.2.3/style/index.css':
        'sha384-Xq0n1H/N8FNLkXdG+FZ9O0lmQnE3cP3pREiKbm7fE0agORRhgUqjkNH+pYH/6Xj',
    }

    injectStylesheets(styles, sriHashes)

    const link = document.querySelector(
      'link[href="https://cdn.internal/@pro/table/1.2.3/style/index.css"]',
    ) as HTMLLinkElement

    expect(link.getAttribute('integrity')).toBe(
      'sha384-Xq0n1H/N8FNLkXdG+FZ9O0lmQnE3cP3pREiKbm7fE0agORRhgUqjkNH+pYH/6Xj',
    )
    expect(link.crossOrigin).toBe('anonymous')
  })

  it('omits integrity attribute when hash is not in sriHashes map', () => {
    const preloads = ['https://cdn.internal/@pro/unknown/1.0.0/esm/index.mjs']

    injectModulePreloads(preloads, {})

    const link = document.querySelector(
      'link[href="https://cdn.internal/@pro/unknown/1.0.0/esm/index.mjs"]',
    ) as HTMLLinkElement

    // integrity should not be set (null attribute)
    expect(link.getAttribute('integrity')).toBeNull()
    // crossOrigin should still be set (needed for CORS)
    expect(link.crossOrigin).toBe('anonymous')
  })

  it('handles SHA-384 hash format correctly', () => {
    const styles = ['https://cdn.internal/test.css']
    // Valid base64 length for SHA-384
    const validHash = 'sha384-' + 'A'.repeat(64)

    injectStylesheets(styles, {
      'https://cdn.internal/test.css': validHash,
    })

    const link = document.querySelector(
      'link[href="https://cdn.internal/test.css"]',
    ) as HTMLLinkElement
    expect(link.getAttribute('integrity')).toBe(validHash)
    expect(link.getAttribute('integrity')).toMatch(/^sha384-[A-Za-z0-9+/=]+$/)
  })

  it('applies SRI to multiple resources independently', () => {
    const styles = [
      'https://cdn.internal/a.css',
      'https://cdn.internal/b.css',
      'https://cdn.internal/c.css',
    ]

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/a.css': 'sha384-hashA',
      // b.css intentionally missing -- should have no integrity
      'https://cdn.internal/c.css': 'sha384-hashC',
    }

    injectStylesheets(styles, sriHashes)

    const linkA = document.querySelector(
      'link[href="https://cdn.internal/a.css"]',
    ) as HTMLLinkElement
    const linkB = document.querySelector(
      'link[href="https://cdn.internal/b.css"]',
    ) as HTMLLinkElement
    const linkC = document.querySelector(
      'link[href="https://cdn.internal/c.css"]',
    ) as HTMLLinkElement

    expect(linkA.getAttribute('integrity')).toBe('sha384-hashA')
    expect(linkB.getAttribute('integrity')).toBeNull()
    expect(linkC.getAttribute('integrity')).toBe('sha384-hashC')
  })
})
