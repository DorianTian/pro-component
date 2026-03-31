import type { Knex } from 'knex'
import { GrayscaleRepository } from './repository.js'
import { VersionRepository } from '../version/repository.js'
import { AppError } from '../../middleware/error-handler.js'
import { clearCache } from '../import-map/cache.js'
import type { CreateGrayscaleRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

/** Business logic for grayscale rule lifecycle management. */
export class GrayscaleService {
  private readonly repo: GrayscaleRepository
  private readonly versionRepo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new GrayscaleRepository(db)
    this.versionRepo = new VersionRepository(db)
  }

  async createRule(input: CreateGrayscaleRequest, operator: string): Promise<{ id: number }> {
    const pkg = await this.versionRepo.findPackageByName(input.packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${input.packageName}' not found`)
    }

    const existing = await this.repo.findActiveByAppAndPackage(input.appId, pkg.id)
    if (existing) {
      throw new AppError(
        409,
        'ACTIVE_RULE_EXISTS',
        `An active grayscale rule already exists for app '${input.appId}' and package '${input.packageName}'. Pause or complete the existing rule first.`,
      )
    }

    const id = await this.repo.create({
      app_id: input.appId,
      package_id: pkg.id,
      target_version: input.targetVersion,
      strategy: input.strategy,
      rule_config: JSON.stringify(input.ruleConfig),
    })

    await this.versionRepo.insertEvent({
      package_id: pkg.id,
      app_id: input.appId,
      action: 'grayscale_start',
      to_version: input.targetVersion,
      operator,
      metadata: JSON.stringify({ ruleId: id, strategy: input.strategy }),
    })

    clearCache()

    logger.info(
      { appId: input.appId, packageName: input.packageName, targetVersion: input.targetVersion },
      'Grayscale rule created',
    )

    return { id }
  }

  async pauseRule(id: number, operator: string): Promise<void> {
    const rule = await this.repo.findById(id)
    if (!rule) {
      throw new AppError(404, 'RULE_NOT_FOUND', 'Grayscale rule not found')
    }

    if (rule.status !== 'active') {
      throw new AppError(400, 'INVALID_STATE', `Cannot pause a rule with status '${rule.status}'`)
    }

    await this.repo.updateStatus(id, 'paused')
    clearCache()

    logger.info({ ruleId: id, operator }, 'Grayscale rule paused')
  }

  async completeRule(id: number, operator: string): Promise<void> {
    const rule = await this.repo.findById(id)
    if (!rule) {
      throw new AppError(404, 'RULE_NOT_FOUND', 'Grayscale rule not found')
    }

    if (rule.status !== 'active' && rule.status !== 'paused') {
      throw new AppError(
        400,
        'INVALID_STATE',
        `Cannot complete a rule with status '${rule.status}'`,
      )
    }

    await this.db('app_version_maps')
      .where({ app_id: rule.app_id, package_id: rule.package_id })
      .update({
        resolved_version: rule.target_version,
        pinned_version: rule.target_version,
        updated_at: this.db.fn.now(),
      })

    await this.repo.updateStatus(id, 'completed')

    await this.versionRepo.insertEvent({
      package_id: rule.package_id,
      app_id: rule.app_id,
      action: 'grayscale_complete',
      to_version: rule.target_version,
      operator,
      metadata: JSON.stringify({ ruleId: id }),
    })

    clearCache()

    logger.info({ ruleId: id, operator }, 'Grayscale rule completed — promoted to full release')
  }

  async listRules(appId: string): Promise<
    Array<{
      id: number
      appId: string
      packageId: number
      targetVersion: string
      strategy: string
      status: string
      createdAt: Date
    }>
  > {
    const rules = await this.repo.findByAppId(appId)
    return rules.map((r) => ({
      id: r.id,
      appId: r.app_id,
      packageId: r.package_id,
      targetVersion: r.target_version,
      strategy: r.strategy,
      status: r.status,
      createdAt: r.created_at,
    }))
  }
}
