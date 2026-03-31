import type { Knex } from 'knex'
import type { AppRow, AppVersionMapRow } from '../../types/index.js'

/** Data access layer for the apps and app_version_maps tables. */
export class AppRepository {
  constructor(private readonly db: Knex) {}

  async findByAppId(appId: string): Promise<AppRow | undefined> {
    return this.db('apps').where({ app_id: appId }).first()
  }

  async findAll(page: number, pageSize: number): Promise<{ data: AppRow[]; total: number }> {
    const [{ count }] = await this.db('apps').count('* as count')
    const data = await this.db('apps')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    return { data, total: Number(count) }
  }

  async create(app: { app_id: string; name: string; owner: string }): Promise<number> {
    const [id] = await this.db('apps').insert(app)
    return id
  }

  async getVersionMaps(appId: string): Promise<Array<AppVersionMapRow & { package_name: string }>> {
    return this.db('app_version_maps')
      .join('packages', 'app_version_maps.package_id', 'packages.id')
      .where('app_version_maps.app_id', appId)
      .select('app_version_maps.*', 'packages.name as package_name')
  }

  async upsertVersionMap(
    appId: string,
    packageId: number,
    data: {
      pinned_version?: string | null
      version_range?: string | null
      resolved_version?: string | null
    },
  ): Promise<void> {
    const existing = await this.db('app_version_maps')
      .where({ app_id: appId, package_id: packageId })
      .first()

    if (existing) {
      await this.db('app_version_maps')
        .where({ app_id: appId, package_id: packageId })
        .update({ ...data, updated_at: this.db.fn.now() })
    } else {
      await this.db('app_version_maps').insert({
        app_id: appId,
        package_id: packageId,
        ...data,
        updated_at: this.db.fn.now(),
      })
    }
  }
}
