import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-deprecated': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'no-console': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: [
      'scripts/**/*.ts',
      '**/rollup.config.ts',
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/knexfile.ts',
      '**/migrations/*.ts',
      '**/seeds/*.ts',
      '**/__tests__/**/*.ts',
      '*.js',
    ],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      'no-console': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['platform/server/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts', '**/.rollup.cache/**'],
  },
)
