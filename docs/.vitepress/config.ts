import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { resolve } from 'node:path'

export default defineConfig({
  title: 'Pro Components',
  description: 'Vue 3 + Element Plus higher-level component library',
  lang: 'zh-CN',

  /* ---- i18n: dual-language locale support ---- */
  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/i18n' },
          { text: 'API', link: '/en/api/locale' },
        ],
        sidebar: {
          '/en/guide/': [{ text: 'Internationalization', link: '/en/guide/i18n' }],
          '/en/api/': [{ text: 'Locale', link: '/en/api/locale' }],
        },
      },
    },
    zh: {
      label: '\u7b80\u4f53\u4e2d\u6587',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '\u6307\u5357', link: '/zh/guide/i18n' },
          { text: 'API', link: '/zh/api/locale' },
        ],
        sidebar: {
          '/zh/guide/': [{ text: '\u56fd\u9645\u5316', link: '/zh/guide/i18n' }],
          '/zh/api/': [{ text: 'Locale', link: '/zh/api/locale' }],
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: '组件', link: '/components/pro-table', activeMatch: '/components/' },
      { text: 'Composables', link: '/composables/use-pro-table', activeMatch: '/composables/' },
      { text: '平台', link: '/platform/overview', activeMatch: '/platform/' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速上手', link: '/guide/getting-started' },
            { text: 'CDN 模式', link: '/guide/cdn-mode' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'ProTable 高级表格', link: '/components/pro-table' },
            { text: 'ProForm 高级表单', link: '/components/pro-form' },
            { text: 'ProDescriptions 定义列表', link: '/components/pro-descriptions' },
          ],
        },
      ],
      '/composables/': [
        {
          text: 'Composables',
          items: [
            { text: 'useProTable', link: '/composables/use-pro-table' },
            { text: 'useProForm', link: '/composables/use-pro-form' },
            { text: 'useProDescriptions', link: '/composables/use-pro-descriptions' },
          ],
        },
      ],
      '/platform/': [
        {
          text: '版本管理平台',
          items: [
            { text: '概览', link: '/platform/overview' },
            { text: '灰度发布', link: '/platform/grayscale' },
            { text: 'API 参考', link: '/platform/api-reference' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/pro-components' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright \u00a9 2026-present',
    },
  },

  vite: {
    resolve: {
      alias: {
        '@pro/table': resolve(__dirname, '../../packages/pro-table/src'),
        '@pro/form': resolve(__dirname, '../../packages/pro-form/src'),
        '@pro/descriptions': resolve(__dirname, '../../packages/pro-descriptions/src'),
        '@pro/hooks': resolve(__dirname, '../../packages/hooks/src'),
        '@pro/utils': resolve(__dirname, '../../packages/utils/src'),
        '@pro/themes': resolve(__dirname, '../../packages/themes/src'),
        '@pro/locale': resolve(__dirname, '../../packages/locale/src'),
        '@pro/resolvers': resolve(__dirname, '../../packages/resolvers/src'),
        '@pro/pro-components': resolve(__dirname, '../../packages/pro-components/src'),
      },
    },
    ssr: {
      noExternal: ['element-plus'],
    },
  },

  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin)
    },
  },
})
