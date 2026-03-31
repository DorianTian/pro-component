import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('grayscale_rules', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('target_version', 32).notNullable()
    table.enum('strategy', ['user_list', 'department', 'percentage', 'composite']).notNullable()
    table.json('rule_config').nullable()
    table.enum('status', ['active', 'paused', 'completed']).defaultTo('active')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.index(['app_id', 'package_id', 'status'], 'idx_grayscale_app_pkg_status')
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('grayscale_rules')
}
