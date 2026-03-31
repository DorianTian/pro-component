import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('version_events', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().nullable()
    table.string('app_id', 64).nullable()
    table
      .enum('action', [
        'publish',
        'pin',
        'upgrade',
        'rollback',
        'deprecate',
        'grayscale_start',
        'grayscale_complete',
      ])
      .notNullable()
    table.string('from_version', 32).nullable()
    table.string('to_version', 32).nullable()
    table.string('operator', 64).notNullable()
    table.text('reason').nullable()
    table.json('metadata').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.index(['package_id', 'action'], 'idx_events_pkg_action')
    table.index(['app_id', 'action'], 'idx_events_app_action')
    table.index('created_at', 'idx_events_created')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('version_events')
}
