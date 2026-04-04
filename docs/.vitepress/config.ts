import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { resolve } from 'node:path'

export default defineConfig({
  title: 'Pro Components',
  description: 'Vue 3 + Element Plus enterprise SaaS component library',
  lang: 'zh-CN',

  /* Exclude internal planning/spec docs from VitePress page generation */
  srcExclude: ['superpowers/**'],

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
          text: 'Pro 高阶组件',
          items: [
            { text: 'ProTable 高级表格', link: '/components/pro-table' },
            { text: 'ProForm 高级表单', link: '/components/pro-form' },
            { text: 'ProDescriptions 定义列表', link: '/components/pro-descriptions' },
          ],
        },
        {
          text: '增强组件',
          items: [
            { text: 'ProTree 增强树', link: '/components/pro-tree' },
            { text: 'ProTabs 增强标签页', link: '/components/pro-tabs' },
            { text: 'ProTag 增强标签', link: '/components/pro-tag' },
            { text: 'ProEmpty 空状态', link: '/components/pro-empty' },
            { text: 'ProResult 结果页', link: '/components/pro-result' },
            { text: 'ProLoading 加载状态', link: '/components/pro-loading' },
          ],
        },
        {
          text: '表单控件',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'InputNumber 数字输入框', link: '/components/input-number' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Cascader 级联选择器', link: '/components/cascader' },
            { text: 'TreeSelect 树选择器', link: '/components/tree-select' },
            { text: 'DatePicker 日期选择器', link: '/components/date-picker' },
            { text: 'TimePicker 时间选择器', link: '/components/time-picker' },
            { text: 'Switch 开关', link: '/components/switch' },
            { text: 'Radio 单选框', link: '/components/radio' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'Rate 评分', link: '/components/rate' },
            { text: 'Slider 滑块', link: '/components/slider' },
            { text: 'Upload 上传', link: '/components/upload' },
            { text: 'ColorPicker 取色器', link: '/components/color-picker' },
            { text: 'AutoComplete 自动补全', link: '/components/auto-complete' },
          ],
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Dialog 对话框', link: '/components/dialog' },
            { text: 'Drawer 抽屉', link: '/components/drawer' },
            { text: 'Popover 弹出框', link: '/components/popover' },
            { text: 'Tooltip 文字提示', link: '/components/tooltip' },
            { text: 'Popconfirm 确认弹框', link: '/components/popconfirm' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'Badge 徽标数', link: '/components/badge' },
            { text: 'Statistic 统计数值', link: '/components/statistic' },
            { text: 'Pagination 分页', link: '/components/pagination' },
          ],
        },
        {
          text: '布局导航',
          items: [
            { text: 'Breadcrumb 面包屑', link: '/components/breadcrumb' },
            { text: 'Steps 步骤条', link: '/components/steps' },
            { text: 'Divider 分割线', link: '/components/divider' },
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
      options: {
        detailedView: true,
        miniSearch: {
          options: {
            tokenize: (text: string) =>
              text.split(/[\s\-_/()（）【】「」、，。！？：；]+/u).filter(Boolean),
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关结果',
            footer: { selectText: '选择', navigateText: '导航', closeText: '关闭' },
          },
        },
      },
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
        '@pro/tree': resolve(__dirname, '../../packages/tree/src'),
        '@pro/tabs': resolve(__dirname, '../../packages/tabs/src'),
        '@pro/tag': resolve(__dirname, '../../packages/tag/src'),
        '@pro/empty': resolve(__dirname, '../../packages/empty/src'),
        '@pro/result': resolve(__dirname, '../../packages/result/src'),
        '@pro/loading': resolve(__dirname, '../../packages/loading/src'),
        '@pro/input': resolve(__dirname, '../../packages/input/src'),
        '@pro/input-number': resolve(__dirname, '../../packages/input-number/src'),
        '@pro/select': resolve(__dirname, '../../packages/select/src'),
        '@pro/cascader': resolve(__dirname, '../../packages/cascader/src'),
        '@pro/tree-select': resolve(__dirname, '../../packages/tree-select/src'),
        '@pro/date-picker': resolve(__dirname, '../../packages/date-picker/src'),
        '@pro/time-picker': resolve(__dirname, '../../packages/time-picker/src'),
        '@pro/switch': resolve(__dirname, '../../packages/switch/src'),
        '@pro/radio': resolve(__dirname, '../../packages/radio/src'),
        '@pro/checkbox': resolve(__dirname, '../../packages/checkbox/src'),
        '@pro/rate': resolve(__dirname, '../../packages/rate/src'),
        '@pro/slider': resolve(__dirname, '../../packages/slider/src'),
        '@pro/upload': resolve(__dirname, '../../packages/upload/src'),
        '@pro/color-picker': resolve(__dirname, '../../packages/color-picker/src'),
        '@pro/auto-complete': resolve(__dirname, '../../packages/auto-complete/src'),
        '@pro/dialog': resolve(__dirname, '../../packages/dialog/src'),
        '@pro/drawer': resolve(__dirname, '../../packages/drawer/src'),
        '@pro/popover': resolve(__dirname, '../../packages/popover/src'),
        '@pro/tooltip': resolve(__dirname, '../../packages/tooltip/src'),
        '@pro/popconfirm': resolve(__dirname, '../../packages/popconfirm/src'),
        '@pro/badge': resolve(__dirname, '../../packages/badge/src'),
        '@pro/statistic': resolve(__dirname, '../../packages/statistic/src'),
        '@pro/pagination': resolve(__dirname, '../../packages/pagination/src'),
        '@pro/breadcrumb': resolve(__dirname, '../../packages/breadcrumb/src'),
        '@pro/steps': resolve(__dirname, '../../packages/steps/src'),
        '@pro/divider': resolve(__dirname, '../../packages/divider/src'),
        '@pro/code-editor': resolve(__dirname, '../../packages/code-editor/src'),
        '@pro/editor': resolve(__dirname, '../../packages/editor/src'),
      },
    },
    ssr: {
      noExternal: ['element-plus', 'monaco-editor', /^@tiptap\//],
    },
  },

  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin)
    },
  },
})
