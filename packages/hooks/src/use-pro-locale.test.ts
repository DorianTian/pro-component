import { computed, defineComponent, h, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useProLocale } from './use-pro-locale'
import { PRO_LOCALE_KEY } from './constants'
import type { ProLocaleContext } from './use-pro-locale'

describe('useProLocale', () => {
  it('returns fallback en-US when no provider', () => {
    let result: ProLocaleContext | undefined

    const Comp = defineComponent({
      setup() {
        result = useProLocale()
        return () => h('div')
      },
    })

    mount(Comp)

    expect(result).toBeDefined()
    expect(result!.locale.value).toBe('en-US')
    expect(result!.t('pro.table.empty')).toBe('No Data')
  })

  it('returns injected context when provider exists', () => {
    let result: ProLocaleContext | undefined

    const mockCtx: ProLocaleContext = {
      t: (key) => `mock:${key}`,
      locale: computed(() => 'zh-CN'),
    }

    const Child = defineComponent({
      setup() {
        result = useProLocale()
        return () => h('div')
      },
    })

    const Parent = defineComponent({
      setup() {
        provide(PRO_LOCALE_KEY, mockCtx)
        return () => h(Child)
      },
    })

    mount(Parent)

    expect(result!.locale.value).toBe('zh-CN')
    expect(result!.t('pro.table.empty')).toBe('mock:pro.table.empty')
  })

  it('warns in dev mode when no provider', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const Comp = defineComponent({
      setup() {
        useProLocale()
        return () => h('div')
      },
    })

    mount(Comp)

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ProComponents]'))

    warnSpy.mockRestore()
  })
})
