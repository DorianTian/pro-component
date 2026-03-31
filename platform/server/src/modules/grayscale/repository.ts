import type { Knex } from 'knex'
import type { GrayscaleRuleRow } from '../../types/index.js'

/** Data access layer for the grayscale_rules table. */
export class GrayscaleRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: number): Promise<GrayscaleRuleRow | undefined> {
    return this.db('grayscale_rules').where({ id }).first()
  }

  async findActiveByAppAndPackage(
    appId: string,
    packageId: number,
  ): Promise<GrayscaleRuleRow | undefined> {
    return this.db('grayscale_rules')
      .where({ app_id: appId, package_id: packageId, status: 'active' })
      .first()
  }

  async findByAppId(appId: string): Promise<GrayscaleRuleRow[]> {
    return this.db('grayscale_rules').where({ app_id: appId }).orderBy('created_at', 'desc')
  }

  async create(data: {
    app_id: string
    package_id: number
    target_version: string
    strategy: string
    rule_config: string
  }): Promise<number> {
    const [id] = await this.db('grayscale_rules').insert({
      ...data,
      status: 'active',
    })
    return id
  }

  async updateStatus(id: number, status: GrayscaleRuleRow['status']): Promise<void> {
    await this.db('grayscale_rules').where({ id }).update({ status })
  }
}
