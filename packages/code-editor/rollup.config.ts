import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  extraExternal: ['monaco-editor', /^monaco-editor\//],
})
