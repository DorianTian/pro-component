import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      '@pro/hooks': resolve(__dirname, '../hooks/src/index.ts'),
      '@pro/utils': resolve(__dirname, '../utils/src/index.ts'),
      '@pro/themes': resolve(__dirname, '../themes/src/index.ts'),
      '@pro/locale': resolve(__dirname, '../locale/src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/index.ts', 'src/types/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
