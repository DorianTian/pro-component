import { createChecker } from 'vue-component-meta'
import { resolve, join } from 'node:path'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_DIR = resolve(ROOT, 'docs/api-data')

/** CLI logger wrapper — keeps raw console calls out of script body */
const log = {
  ok: (msg: string) => process.stdout.write(`[OK] ${msg}\n`),
  skip: (msg: string) => process.stdout.write(`[SKIP] ${msg}\n`),
  fail: (msg: string) => process.stderr.write(`[FAIL] ${msg}\n`),
  error: (msg: string) => process.stderr.write(`${msg}\n`),
  info: (msg: string) => process.stdout.write(`${msg}\n`),
}

interface PropDoc {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

interface EventDoc {
  name: string
  type: string
  description: string
}

interface SlotDoc {
  name: string
  type: string
  description: string
}

interface ComponentApiDoc {
  props: PropDoc[]
  events: EventDoc[]
  slots: SlotDoc[]
}

/**
 * Component packages to extract API documentation from.
 * Each entry maps a component name to its source file path.
 */
const COMPONENTS: Record<string, string> = {
  ProTable: 'packages/pro-table/src/ProTable.vue',
  ProForm: 'packages/pro-form/src/ProForm.vue',
  ProDescriptions: 'packages/pro-descriptions/src/ProDescriptions.vue',
}

interface TagDef {
  name: string
  text?: string
}

function cleanTypeString(raw: string): string {
  // Simplify complex union types for readability
  return raw
    .replace(/\s+/g, ' ')
    .replace(/import\([^)]+\)\./g, '')
    .trim()
}

function extractDescription(tags: TagDef[] | undefined): string {
  if (!tags || tags.length === 0) return ''
  const descTag = tags.find((t: TagDef) => t.name === 'description' || t.name === 'desc')
  return descTag?.text ?? ''
}

function extractApi(
  checker: ReturnType<typeof createChecker>,
  componentPath: string,
): ComponentApiDoc {
  const meta = checker.getComponentMeta(componentPath)

  const props: PropDoc[] = meta.props
    .filter((p) => !p.global) // Exclude global Vue props (class, style, key, ref)
    .map((p) => ({
      name: p.name,
      type: cleanTypeString(p.type),
      required: p.required,
      default: p.default ?? '',
      description: p.description || extractDescription(p.tags),
    }))

  const events: EventDoc[] = meta.events.map((e) => ({
    name: e.name,
    type: cleanTypeString(e.type),
    description: e.description || '',
  }))

  const slots: SlotDoc[] = meta.slots.map((s) => ({
    name: s.name,
    type: cleanTypeString(s.type),
    description: s.description || '',
  }))

  return { props, events, slots }
}

function main() {
  const tsConfigPath = resolve(ROOT, 'tsconfig.json')

  if (!existsSync(tsConfigPath)) {
    log.error('tsconfig.json not found at project root')
    process.exit(1)
  }

  const checker = createChecker(tsConfigPath)

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true })

  let hasErrors = false

  for (const [name, relativePath] of Object.entries(COMPONENTS)) {
    const fullPath = resolve(ROOT, relativePath)

    if (!existsSync(fullPath)) {
      log.skip(`${name}: source file not found at ${relativePath}`)
      continue
    }

    try {
      const api = extractApi(checker, fullPath)
      const outputFile = join(OUTPUT_DIR, `${name}.json`)
      writeFileSync(outputFile, JSON.stringify(api, null, 2), 'utf-8')
      log.ok(
        `${name} → ${outputFile} (${api.props.length} props, ${api.events.length} events, ${api.slots.length} slots)`,
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      log.fail(`${name}: ${message}`)
      hasErrors = true
    }
  }

  if (hasErrors) {
    log.error('\nAPI doc generation completed with errors')
    process.exit(1)
  }

  log.info('\nAPI doc generation completed successfully')
}

main()
