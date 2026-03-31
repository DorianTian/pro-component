import type { Knex } from 'knex'
import { AppError } from '../../middleware/error-handler.js'
import type { CompatReportRequest } from '../../types/api.js'
import type { CompatResultRow } from '../../types/index.js'

/** Business logic for the compatibility matrix. */
export class CompatService {
  constructor(private readonly db: Knex) {}

  async getCompatMatrix(packageName: string): Promise<{
    packageName: string
    results: Array<{
      version: string
      vueVersion: string
      elementPlusVersion: string
      status: string
      ciRunUrl: string | null
      testedAt: Date | null
    }>
  }> {
    const pkg = await this.db('packages').where({ name: packageName }).first()
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const results: CompatResultRow[] = await this.db('compat_results')
      .where({ package_id: pkg.id })
      .orderBy([
        { column: 'version', order: 'desc' },
        { column: 'vue_version', order: 'desc' },
        { column: 'element_plus_version', order: 'desc' },
      ])

    return {
      packageName,
      results: results.map((r) => ({
        version: r.version,
        vueVersion: r.vue_version,
        elementPlusVersion: r.element_plus_version,
        status: r.status,
        ciRunUrl: r.ci_run_url,
        testedAt: r.tested_at,
      })),
    }
  }

  /** Report a compatibility test result. Upserts: updates existing or inserts new. */
  async reportResult(input: CompatReportRequest): Promise<{ id: number }> {
    const pkg = await this.db('packages').where({ name: input.packageName }).first()
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${input.packageName}' not found`)
    }

    const existing = await this.db('compat_results')
      .where({
        package_id: pkg.id,
        version: input.version,
        vue_version: input.vueVersion,
        element_plus_version: input.elementPlusVersion,
      })
      .first()

    if (existing) {
      await this.db('compat_results')
        .where({ id: existing.id })
        .update({
          status: input.status,
          ci_run_url: input.ciRunUrl || null,
          tested_at: this.db.fn.now(),
        })
      return { id: existing.id }
    }

    const [id] = await this.db('compat_results').insert({
      package_id: pkg.id,
      version: input.version,
      vue_version: input.vueVersion,
      element_plus_version: input.elementPlusVersion,
      status: input.status,
      ci_run_url: input.ciRunUrl || null,
      tested_at: this.db.fn.now(),
    })

    return { id }
  }
}
