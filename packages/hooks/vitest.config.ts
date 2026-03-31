import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      '@pro/utils': resolve(__dirname, '../utils/src/index.ts'),
      '@pro/locale': resolve(__dirname, '../locale/src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/test-utils.ts'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
})
