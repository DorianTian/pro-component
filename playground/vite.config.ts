import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@pro/table': resolve(__dirname, '../packages/pro-table/src'),
      '@pro/form': resolve(__dirname, '../packages/pro-form/src'),
      '@pro/descriptions': resolve(__dirname, '../packages/pro-descriptions/src'),
      '@pro/hooks': resolve(__dirname, '../packages/hooks/src'),
      '@pro/utils': resolve(__dirname, '../packages/utils/src'),
      '@pro/themes': resolve(__dirname, '../packages/themes/src'),
      '@pro/locale': resolve(__dirname, '../packages/locale/src'),
      '@pro/pagination': resolve(__dirname, '../packages/pagination/src'),
      '@pro/code-editor': resolve(__dirname, '../packages/code-editor/src'),
      '@pro/pro-components': resolve(__dirname, '../packages/pro-components/src'),
    },
    dedupe: ['vue', 'element-plus'],
  },
})
