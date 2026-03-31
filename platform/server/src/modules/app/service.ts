import type { Knex } from 'knex'
import { AppRepository } from './repository.js'
import { AppError } from '../../middleware/error-handler.js'
import type {
  CreateAppRequest,
  UpdateAppVersionsRequest,
  AppVersionsResponse,
} from '../../types/api.js'

/** Business logic for app management. */
export class AppService {
  private readonly repo: AppRepository

  constructor(private readonly db: Knex) {
    this.repo = new AppRepository(db)
  }

  async createApp(input: CreateAppRequest): Promise<{ id: number }> {
    const existing = await this.repo.findByAppId(input.appId)
    if (existing) {
      throw new AppError(409, 'APP_EXISTS', `App '${input.appId}' already exists`)
    }

    const id = await this.repo.create({
      app_id: input.appId,
      name: input.name,
      owner: input.owner,
    })

    return { id }
  }

  async listApps(
    page = 1,
    pageSize = 20,
  ): Promise<{
    data: Array<{ appId: string; name: string | null; owner: string | null }>
    total: number
  }> {
    const result = await this.repo.findAll(page, pageSize)
    return {
      data: result.data.map((row) => ({
        appId: row.app_id,
        name: row.name,
        owner: row.owner,
      })),
      total: result.total,
    }
  }

  async getAppVersions(appId: string): Promise<AppVersionsResponse> {
    const app = await this.repo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    const maps = await this.repo.getVersionMaps(appId)
    return {
      appId,
      versions: maps.map((m) => ({
        packageName: m.package_name,
        pinnedVersion: m.pinned_version,
        versionRange: m.version_range,
        resolvedVersion: m.resolved_version,
      })),
    }
  }

  async updateAppVersions(appId: string, input: UpdateAppVersionsRequest): Promise<void> {
    const app = await this.repo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    for (const ver of input.versions) {
      const pkg = await this.db('packages').where({ name: ver.packageName }).first()
      if (!pkg) {
        throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${ver.packageName}' not found`)
      }

      await this.repo.upsertVersionMap(appId, pkg.id, {
        pinned_version: ver.pinnedVersion || null,
        version_range: ver.versionRange || null,
      })
    }
  }
}
