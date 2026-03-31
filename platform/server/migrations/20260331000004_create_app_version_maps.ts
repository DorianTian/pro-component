import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('app_version_maps', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('pinned_version', 32).nullable()
    table.string('version_range', 32).nullable()
    table.string('resolved_version', 32).nullable()
    table.timestamp('updated_at').nullable()

    table.unique(['app_id', 'package_id'])
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('app_version_maps')
}
