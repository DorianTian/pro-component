/**
 * Scaffold script for generating component package boilerplate.
 *
 * Usage:
 *   tsx scripts/scaffold-component.ts                    # Generate all packages
 *   tsx scripts/scaffold-component.ts input select tag   # Generate specific packages
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/* ─── Component definitions ─────────────────────────────────────────── */

interface ComponentDef {
  /** Package directory name under packages/ */
  dirName: string
  /** npm package name */
  packageName: string
  /** Description for package.json */
  description: string
  /** Exported component names */
  exports: ExportDef[]
  /** Whether this is a Pro component (SFC, not render function) */
  isPro: boolean
  /** Extra dependencies beyond vue + element-plus */
  extraDeps?: Record<string, string>
}

interface ExportDef {
  /** Exported name (e.g., 'Input', 'ProTree') */
  name: string
  /** Element Plus component (e.g., 'ElInput') */
  elComponent: string
  /** Element Plus type exports (e.g., 'InputProps') */
  typeExports?: string[]
  /** Default props to merge */
  defaults?: Record<string, unknown>
}

const COMPONENTS: ComponentDef[] = [
  // ── Form Controls ──
  {
    dirName: 'input',
    packageName: '@pro/input',
    description: 'Input wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Input',
        elComponent: 'ElInput',
        typeExports: ['InputProps', 'InputEmits', 'InputInstance'],
        defaults: { clearable: true },
      },
    ],
  },
  {
    dirName: 'input-number',
    packageName: '@pro/input-number',
    description: 'InputNumber wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'InputNumber',
        elComponent: 'ElInputNumber',
        typeExports: ['InputNumberProps', 'InputNumberEmits', 'InputNumberInstance'],
        defaults: { controlsPosition: 'right' },
      },
    ],
  },
  {
    dirName: 'select',
    packageName: '@pro/select',
    description: 'Select wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Select',
        elComponent: 'ElSelect',
        typeExports: ['SelectProps'],
        defaults: { clearable: true, filterable: true },
      },
    ],
  },
  {
    dirName: 'cascader',
    packageName: '@pro/cascader',
    description: 'Cascader wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Cascader',
        elComponent: 'ElCascader',
        typeExports: ['CascaderProps', 'CascaderEmits', 'CascaderInstance'],
        defaults: { clearable: true, filterable: true },
      },
    ],
  },
  {
    dirName: 'tree-select',
    packageName: '@pro/tree-select',
    description: 'TreeSelect wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'TreeSelect',
        elComponent: 'ElTreeSelect',
        typeExports: [],
        defaults: { clearable: true, filterable: true },
      },
    ],
  },
  {
    dirName: 'date-picker',
    packageName: '@pro/date-picker',
    description: 'DatePicker wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'DatePicker',
        elComponent: 'ElDatePicker',
        typeExports: ['DatePickerProps'],
        defaults: { clearable: true, valueFormat: 'YYYY-MM-DD' },
      },
    ],
  },
  {
    dirName: 'time-picker',
    packageName: '@pro/time-picker',
    description: 'TimePicker wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'TimePicker',
        elComponent: 'ElTimePicker',
        typeExports: ['TimePickerDefaultProps'],
        defaults: { clearable: true },
      },
    ],
  },
  {
    dirName: 'switch',
    packageName: '@pro/switch',
    description: 'Switch wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Switch',
        elComponent: 'ElSwitch',
        typeExports: ['SwitchProps', 'SwitchEmits', 'SwitchInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'radio',
    packageName: '@pro/radio',
    description: 'Radio + RadioGroup + RadioButton wrappers',
    isPro: false,
    exports: [
      {
        name: 'Radio',
        elComponent: 'ElRadio',
        typeExports: ['RadioProps', 'RadioEmits', 'RadioInstance'],
        defaults: {},
      },
      {
        name: 'RadioGroup',
        elComponent: 'ElRadioGroup',
        typeExports: ['RadioGroupProps', 'RadioGroupEmits', 'RadioGroupInstance'],
        defaults: {},
      },
      {
        name: 'RadioButton',
        elComponent: 'ElRadioButton',
        typeExports: ['RadioButtonProps'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'checkbox',
    packageName: '@pro/checkbox',
    description: 'Checkbox + CheckboxGroup + CheckboxButton wrappers',
    isPro: false,
    exports: [
      {
        name: 'Checkbox',
        elComponent: 'ElCheckbox',
        typeExports: ['CheckboxProps', 'CheckboxEmits', 'CheckboxInstance'],
        defaults: {},
      },
      {
        name: 'CheckboxGroup',
        elComponent: 'ElCheckboxGroup',
        typeExports: ['CheckboxGroupProps', 'CheckboxGroupEmits', 'CheckboxGroupInstance'],
        defaults: {},
      },
      { name: 'CheckboxButton', elComponent: 'ElCheckboxButton', typeExports: [], defaults: {} },
    ],
  },
  {
    dirName: 'rate',
    packageName: '@pro/rate',
    description: 'Rate wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Rate',
        elComponent: 'ElRate',
        typeExports: ['RateProps', 'RateEmits', 'RateInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'slider',
    packageName: '@pro/slider',
    description: 'Slider wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Slider',
        elComponent: 'ElSlider',
        typeExports: ['SliderProps', 'SliderEmits', 'SliderInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'upload',
    packageName: '@pro/upload',
    description: 'Upload wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Upload',
        elComponent: 'ElUpload',
        typeExports: ['UploadProps', 'UploadInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'color-picker',
    packageName: '@pro/color-picker',
    description: 'ColorPicker wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'ColorPicker',
        elComponent: 'ElColorPicker',
        typeExports: ['ColorPickerProps', 'ColorPickerEmits', 'ColorPickerInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'auto-complete',
    packageName: '@pro/auto-complete',
    description: 'AutoComplete wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'AutoComplete',
        elComponent: 'ElAutocomplete',
        typeExports: ['AutocompleteProps', 'AutocompleteEmits', 'AutocompleteInstance'],
        defaults: {},
      },
    ],
  },

  // ── Feedback ──
  {
    dirName: 'dialog',
    packageName: '@pro/dialog',
    description: 'Dialog wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Dialog',
        elComponent: 'ElDialog',
        typeExports: ['DialogProps', 'DialogEmits', 'DialogInstance'],
        defaults: { appendToBody: true, draggable: true },
      },
    ],
  },
  {
    dirName: 'drawer',
    packageName: '@pro/drawer',
    description: 'Drawer wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Drawer',
        elComponent: 'ElDrawer',
        typeExports: ['DrawerProps', 'DrawerEmits', 'DrawerInstance'],
        defaults: { appendToBody: true },
      },
    ],
  },
  {
    dirName: 'popover',
    packageName: '@pro/popover',
    description: 'Popover wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Popover',
        elComponent: 'ElPopover',
        typeExports: ['PopoverProps', 'PopoverEmits', 'PopoverInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'tooltip',
    packageName: '@pro/tooltip',
    description: 'Tooltip wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Tooltip',
        elComponent: 'ElTooltip',
        typeExports: ['ElTooltipProps'],
        defaults: { showAfter: 300 },
      },
    ],
  },
  {
    dirName: 'popconfirm',
    packageName: '@pro/popconfirm',
    description: 'Popconfirm wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Popconfirm',
        elComponent: 'ElPopconfirm',
        typeExports: ['PopconfirmProps', 'PopconfirmEmits', 'PopconfirmInstance'],
        defaults: {},
      },
    ],
  },

  // ── Display (thin) ──
  {
    dirName: 'badge',
    packageName: '@pro/badge',
    description: 'Badge wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Badge',
        elComponent: 'ElBadge',
        typeExports: ['BadgeProps', 'BadgeInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'statistic',
    packageName: '@pro/statistic',
    description: 'Statistic wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Statistic',
        elComponent: 'ElStatistic',
        typeExports: ['StatisticProps', 'StatisticInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'pagination',
    packageName: '@pro/pagination',
    description: 'Pagination wrapper with enterprise defaults',
    isPro: false,
    exports: [
      {
        name: 'Pagination',
        elComponent: 'ElPagination',
        typeExports: ['PaginationProps', 'PaginationEmits'],
        defaults: {
          layout: 'total, sizes, prev, pager, next, jumper',
          pageSizes: [10, 20, 50, 100],
        },
      },
    ],
  },

  // ── Layout/Nav ──
  {
    dirName: 'breadcrumb',
    packageName: '@pro/breadcrumb',
    description: 'Breadcrumb + BreadcrumbItem wrappers',
    isPro: false,
    exports: [
      {
        name: 'Breadcrumb',
        elComponent: 'ElBreadcrumb',
        typeExports: ['BreadcrumbProps', 'BreadcrumbInstance'],
        defaults: { separator: '/' },
      },
      {
        name: 'BreadcrumbItem',
        elComponent: 'ElBreadcrumbItem',
        typeExports: ['BreadcrumbItemProps', 'BreadcrumbItemInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'steps',
    packageName: '@pro/steps',
    description: 'Steps + Step wrappers',
    isPro: false,
    exports: [
      {
        name: 'Steps',
        elComponent: 'ElSteps',
        typeExports: ['StepsProps', 'StepsEmits', 'StepsInstance'],
        defaults: {},
      },
      { name: 'Step', elComponent: 'ElStep', typeExports: ['StepProps'], defaults: {} },
    ],
  },
  {
    dirName: 'divider',
    packageName: '@pro/divider',
    description: 'Divider wrapper with unified styling',
    isPro: false,
    exports: [
      {
        name: 'Divider',
        elComponent: 'ElDivider',
        typeExports: ['DividerProps', 'DividerInstance'],
        defaults: {},
      },
    ],
  },

  // ── Pro Components (generated as stubs, manually implemented) ──
  {
    dirName: 'loading',
    packageName: '@pro/loading',
    description: 'ProLoading — declarative loading/empty/error state machine',
    isPro: true,
    exports: [{ name: 'ProLoading', elComponent: '', typeExports: [], defaults: {} }],
  },
  {
    dirName: 'tag',
    packageName: '@pro/tag',
    description: 'ProTag — enhanced tag with preset colors and status mapping',
    isPro: true,
    exports: [
      {
        name: 'ProTag',
        elComponent: 'ElTag',
        typeExports: ['TagProps', 'TagEmits', 'TagInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'empty',
    packageName: '@pro/empty',
    description: 'ProEmpty — enhanced empty state with preset types and illustrations',
    isPro: true,
    exports: [
      {
        name: 'ProEmpty',
        elComponent: 'ElEmpty',
        typeExports: ['EmptyProps', 'EmptyInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'result',
    packageName: '@pro/result',
    description: 'ProResult — enhanced result page with preset types',
    isPro: true,
    exports: [
      {
        name: 'ProResult',
        elComponent: 'ElResult',
        typeExports: ['ResultProps', 'ResultInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'tree',
    packageName: '@pro/tree',
    description: 'ProTree — enhanced tree with search, selection highlight, and count badges',
    isPro: true,
    extraDeps: { '@pro/hooks': 'workspace:*', '@pro/utils': 'workspace:*' },
    exports: [
      {
        name: 'ProTree',
        elComponent: 'ElTree',
        typeExports: ['TreeProps', 'TreeEmits', 'TreeInstance'],
        defaults: {},
      },
    ],
  },
  {
    dirName: 'tabs',
    packageName: '@pro/tabs',
    description: 'ProTabs — enhanced tabs with closable confirm and card variant',
    isPro: true,
    exports: [
      {
        name: 'ProTabs',
        elComponent: 'ElTabs',
        typeExports: ['TabsProps', 'TabsEmits', 'TabsInstance'],
        defaults: {},
      },
      {
        name: 'ProTabPane',
        elComponent: 'ElTabPane',
        typeExports: ['TabPaneProps', 'TabPaneInstance'],
        defaults: {},
      },
    ],
  },
]

/* ─── File generators ───────────────────────────────────────────────── */

function generatePackageJson(def: ComponentDef): string {
  const deps: Record<string, string> = { ...def.extraDeps }
  const pkg = {
    name: def.packageName,
    version: '0.0.1',
    description: def.description,
    type: 'module',
    main: 'dist/cjs/index.js',
    module: 'dist/esm/index.mjs',
    types: 'dist/types/index.d.ts',
    exports: {
      '.': {
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.js',
        types: './dist/types/index.d.ts',
      },
    },
    sideEffects: false,
    files: ['dist'],
    scripts: {
      build: 'tsx ../../scripts/build-package.ts .',
      'build:dts': 'vue-tsc --declaration --emitDeclarationOnly --outDir dist/types',
      'type-check': 'vue-tsc --noEmit',
      clean: 'rm -rf dist',
    },
    dependencies: Object.keys(deps).length > 0 ? deps : undefined,
    peerDependencies: {
      vue: '>=3.4.0',
      'element-plus': '>=2.9.0',
    },
  }
  return JSON.stringify(pkg, null, 2) + '\n'
}

function generateTsConfig(): string {
  return (
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
          outDir: 'dist',
          rootDir: 'src',
          baseUrl: '.',
          composite: true,
        },
        include: ['src/**/*.ts', 'src/**/*.vue'],
      },
      null,
      2,
    ) + '\n'
  )
}

function generateRollupConfig(): string {
  return `import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
})
`
}

/** Generate a render-function wrapper component */
function generateWrapperComponent(exp: ExportDef): string {
  const defaultsStr =
    Object.keys(exp.defaults ?? {}).length > 0
      ? JSON.stringify(exp.defaults, null, 2)
          .replace(/"([^"]+)":/g, '$1:')
          .replace(/"/g, "'")
      : '{}'

  return `import { defineComponent, h, mergeProps } from 'vue'
import { ${exp.elComponent} } from 'element-plus'

export const ${exp.name} = defineComponent({
  name: '${exp.name}',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(${exp.elComponent}, mergeProps(${defaultsStr}, attrs), slots)
  },
})
`
}

/** Generate multi-export wrapper file */
function generateMultiWrapperFile(exports: ExportDef[]): string {
  const imports = exports.map((e) => `import { ${e.elComponent} } from 'element-plus'`).join('\n')
  // Dedupe element-plus imports
  const uniqueImports = [...new Set(imports.split('\n'))].join('\n')

  const components = exports
    .map((e) => {
      const defaultsStr =
        Object.keys(e.defaults ?? {}).length > 0
          ? JSON.stringify(e.defaults, null, 2)
              .replace(/"([^"]+)":/g, '$1:')
              .replace(/"/g, "'")
          : '{}'

      return `
export const ${e.name} = defineComponent({
  name: '${e.name}',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(${e.elComponent}, mergeProps(${defaultsStr}, attrs), slots)
  },
})`
    })
    .join('\n')

  return `import { defineComponent, h, mergeProps } from 'vue'
${uniqueImports}
${components}
`
}

/** Generate index.ts barrel */
function generateIndex(def: ComponentDef): string {
  const fileName = def.exports.length === 1 ? toKebab(def.exports[0].name) : def.dirName

  const componentExports = def.exports.map((e) => e.name).join(', ')

  // Collect valid type exports (non-empty)
  const typeExports = def.exports.flatMap((e) => e.typeExports ?? []).filter(Boolean)

  const typeExportLine =
    typeExports.length > 0
      ? `\nexport type { ${typeExports.join(', ')} } from 'element-plus'\n`
      : ''

  return `export { ${componentExports} } from './${fileName}'
${typeExportLine}`
}

/** Generate a stub Pro component SFC */
function generateProStub(def: ComponentDef): string {
  const name = def.exports[0].name
  return `<script setup lang="ts">
defineOptions({ name: '${name}' })

// TODO: Implement ${name}
</script>

<template>
  <div class="${toKebab(name)}">
    <slot />
  </div>
</template>
`
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function toKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/* ─── Main ──────────────────────────────────────────────────────────── */

const ROOT = resolve(import.meta.dirname, '..')
const PACKAGES_DIR = resolve(ROOT, 'packages')

function scaffoldComponent(def: ComponentDef): void {
  const pkgDir = resolve(PACKAGES_DIR, def.dirName)
  const srcDir = resolve(pkgDir, 'src')

  if (existsSync(pkgDir)) {
    console.log(`  SKIP ${def.dirName} (already exists)`)
    return
  }

  mkdirSync(srcDir, { recursive: true })

  // package.json
  writeFileSync(resolve(pkgDir, 'package.json'), generatePackageJson(def))

  // tsconfig.json
  writeFileSync(resolve(pkgDir, 'tsconfig.json'), generateTsConfig())

  // rollup.config.ts
  writeFileSync(resolve(pkgDir, 'rollup.config.ts'), generateRollupConfig())

  // Component source
  if (def.isPro) {
    const fileName = `${def.exports[0].name}.vue`
    writeFileSync(resolve(srcDir, fileName), generateProStub(def))
  } else if (def.exports.length === 1) {
    const fileName = `${toKebab(def.exports[0].name)}.ts`
    writeFileSync(resolve(srcDir, fileName), generateWrapperComponent(def.exports[0]))
  } else {
    const fileName = `${def.dirName}.ts`
    writeFileSync(resolve(srcDir, fileName), generateMultiWrapperFile(def.exports))
  }

  // index.ts
  writeFileSync(resolve(srcDir, 'index.ts'), generateIndex(def))

  console.log(`  OK   ${def.dirName}`)
}

// Parse CLI args: specific packages or all
const requestedPkgs = process.argv.slice(2)
const toScaffold =
  requestedPkgs.length > 0
    ? COMPONENTS.filter((c) => requestedPkgs.includes(c.dirName))
    : COMPONENTS

console.log(`Scaffolding ${toScaffold.length} component packages...\n`)
toScaffold.forEach(scaffoldComponent)
console.log('\nDone.')
