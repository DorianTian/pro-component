import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parse } from 'acorn'

 
const log = {
  result: (msg: string) => console.log(msg),
  fail: (msg: string) => console.error(msg),
  warn: (msg: string) => console.warn(msg),
}
 

const PACKAGES_DIR = resolve(import.meta.dirname, '../packages')
const VUE_RUNTIME_MARKERS = [
  'createApp',
  '__VUE_OPTIONS_API__',
  '__VUE_PROD_DEVTOOLS__',
  'createElementBlock',
  'createVNode',
]

/** Result of validating a single package's build output */
interface ValidationResult {
  package: string
  errors: string[]
  warnings: string[]
}

/** Validate that package.json export fields point to existing files */
function validateExports(pkgDir: string, pkgJson: Record<string, unknown>): string[] {
  const errors: string[] = []

  const main = pkgJson.main as string | undefined
  const mod = pkgJson.module as string | undefined
  const types = pkgJson.types as string | undefined

  if (main && !existsSync(resolve(pkgDir, main))) {
    errors.push(`main field points to missing file: ${main}`)
  }
  if (mod && !existsSync(resolve(pkgDir, mod))) {
    errors.push(`module field points to missing file: ${mod}`)
  }
  if (types && !existsSync(resolve(pkgDir, types))) {
    errors.push(`types field points to missing file: ${types}`)
  }

  return errors
}

/** Validate conditional exports map entries point to existing files */
function validateConditionalExports(pkgDir: string, pkgJson: Record<string, unknown>): string[] {
  const errors: string[] = []
  const exports = pkgJson.exports as Record<string, Record<string, string>> | undefined

  if (!exports) return errors

  for (const [key, value] of Object.entries(exports)) {
    if (typeof value !== 'object' || value === null) continue
    for (const [condition, filePath] of Object.entries(value)) {
      if (typeof filePath === 'string' && !existsSync(resolve(pkgDir, filePath))) {
        errors.push(`exports["${key}"]["${condition}"] points to missing: ${filePath}`)
      }
    }
  }

  return errors
}

/** Detect accidentally bundled Vue runtime code in ESM output */
function validateNoVueRuntime(pkgDir: string): string[] {
  const errors: string[] = []
  const esmDir = resolve(pkgDir, 'dist/esm')

  if (!existsSync(esmDir)) return errors

  const files = readdirSync(esmDir).filter((f) => f.endsWith('.mjs'))

  for (const file of files) {
    const content = readFileSync(join(esmDir, file), 'utf-8')
    for (const marker of VUE_RUNTIME_MARKERS) {
      const defPattern = new RegExp(`(function|const|let|var)\\s+${marker}\\b`)
      if (defPattern.test(content)) {
        errors.push(`ESM file ${file} contains Vue runtime: ${marker} definition`)
      }
    }
  }

  return errors
}

/** Verify ESM output files are syntactically valid ES modules */
function validateEsmValidity(pkgDir: string): string[] {
  const errors: string[] = []
  const esmDir = resolve(pkgDir, 'dist/esm')

  if (!existsSync(esmDir)) return errors

  const files = readdirSync(esmDir).filter((f) => f.endsWith('.mjs'))

  for (const file of files) {
    const content = readFileSync(join(esmDir, file), 'utf-8')
    try {
      parse(content, { ecmaVersion: 2022, sourceType: 'module' })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      errors.push(`ESM file ${file} is not valid ES module: ${message}`)
    }
  }

  return errors
}

/** Validate that packages with style sources produce CSS output */
function validateCssOutput(pkgDir: string, pkgName: string): string[] {
  const errors: string[] = []
  const styleDir = resolve(pkgDir, 'dist', 'style')
  const hasSrcStyle = existsSync(resolve(pkgDir, 'src', 'style'))
  const hasVariablesCss = existsSync(resolve(pkgDir, 'src', 'variables.css'))
  const isThemePackage = pkgName.startsWith('@pro/themes')

  if (hasSrcStyle || hasVariablesCss || isThemePackage) {
    if (!existsSync(styleDir)) {
      errors.push(`${pkgName}: missing dist/style/ directory`)
    } else {
      const cssFiles = readdirSync(styleDir).filter((f) => f.endsWith('.css'))
      if (cssFiles.length === 0) {
        errors.push(`${pkgName}: dist/style/ contains no CSS files`)
      }
    }
  }

  return errors
}

/** Validate that type declaration files are generated */
function validateDts(pkgDir: string): string[] {
  const errors: string[] = []
  const typesDir = resolve(pkgDir, 'dist/types')

  if (!existsSync(typesDir)) {
    errors.push('dist/types/ directory missing — no type declarations generated')
    return errors
  }

  const dtsFiles = readdirSync(typesDir).filter((f) => f.endsWith('.d.ts'))
  if (dtsFiles.length === 0) {
    errors.push('dist/types/ exists but contains no .d.ts files')
  }

  return errors
}

/** Validate a single package's build output */
function validatePackage(dir: string): ValidationResult {
  const pkgDir = resolve(PACKAGES_DIR, dir)
  const pkgJson = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf-8')) as Record<
    string,
    unknown
  >
  const errors: string[] = []
  const warnings: string[] = []

  if (!existsSync(resolve(pkgDir, 'dist'))) {
    warnings.push('No dist/ directory — package not built yet')
    return { package: dir, errors, warnings }
  }

  errors.push(...validateExports(pkgDir, pkgJson))
  errors.push(...validateConditionalExports(pkgDir, pkgJson))
  errors.push(...validateNoVueRuntime(pkgDir))
  errors.push(...validateEsmValidity(pkgDir))
  errors.push(...validateCssOutput(pkgDir, pkgJson.name as string))
  errors.push(...validateDts(pkgDir))

  return { package: dir, errors, warnings }
}

/** Print validation results and exit with appropriate code */
function printResults(results: ValidationResult[]): void {
  let hasErrors = false

  for (const result of results) {
    const status = result.errors.length > 0 ? 'FAIL' : result.warnings.length > 0 ? 'WARN' : 'PASS'
    log.result(`\n[${status}] ${result.package}`)
    for (const err of result.errors) log.fail(`  ERROR: ${err}`)
    for (const w of result.warnings) log.warn(`  WARN: ${w}`)
    if (result.errors.length > 0) hasErrors = true
  }

  if (hasErrors) {
    log.fail('\nBuild validation FAILED')
    process.exit(1)
  } else {
    log.result('\nBuild validation PASSED')
  }
}

function main(): void {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) =>
    existsSync(resolve(PACKAGES_DIR, d, 'package.json')),
  )

  const results = pkgDirs.map(validatePackage)
  printResults(results)
}

main()
