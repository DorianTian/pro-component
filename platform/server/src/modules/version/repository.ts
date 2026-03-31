import type { Knex } from 'knex'
import type { VersionRow, PackageRow } from '../../types/index.js'

/** Data access layer for the packages, versions, and version_events tables. */
export class VersionRepository {
  constructor(private readonly db: Knex) {}

  async findPackageByName(name: string): Promise<PackageRow | undefined> {
    return this.db('packages').where({ name }).first()
  }

  async findPackageById(id: number): Promise<PackageRow | undefined> {
    return this.db('packages').where({ id }).first()
  }

  async createPackage(data: { name: string; description?: string }): Promise<number> {
    const [id] = await this.db('packages').insert(data)
    return id
  }

  async updatePackageLatest(packageId: number, latestVersion: string): Promise<void> {
    await this.db('packages').where({ id: packageId }).update({ latest_version: latestVersion })
  }

  async findVersion(packageId: number, version: string): Promise<VersionRow | undefined> {
    return this.db('versions').where({ package_id: packageId, version }).first()
  }

  async findVersionById(id: number): Promise<VersionRow | undefined> {
    return this.db('versions').where({ id }).first()
  }

  async findVersionsByPackageId(packageId: number): Promise<VersionRow[]> {
    return this.db('versions').where({ package_id: packageId }).orderBy('published_at', 'desc')
  }

  async findPublishedVersions(packageId: number): Promise<VersionRow[]> {
    return this.db('versions')
      .where({ package_id: packageId, status: 'published' })
      .orderBy('published_at', 'desc')
  }

  async createVersion(data: {
    package_id: number
    version: string
    dependencies?: string | null
    peer_dependencies?: string | null
    cdn_path?: string | null
    changelog?: string | null
    breaking_changes?: string | null
    sri_hashes?: string | null
    status?: string
  }): Promise<number> {
    const [id] = await this.db('versions').insert(data)
    return id
  }

  async updateVersionStatus(id: number, status: VersionRow['status']): Promise<void> {
    await this.db('versions').where({ id }).update({ status })
  }

  async insertEvent(data: {
    package_id?: number | null
    app_id?: string | null
    action: string
    from_version?: string | null
    to_version?: string | null
    operator: string
    reason?: string | null
    metadata?: string | null
  }): Promise<void> {
    await this.db('version_events').insert(data)
  }
}
