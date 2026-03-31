import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('compat_results', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('version', 32).notNullable()
    table.string('vue_version', 32).notNullable()
    table.string('element_plus_version', 32).notNullable()
    table.enum('status', ['pass', 'fail', 'untested']).defaultTo('untested')
    table.string('ci_run_url', 256).nullable()
    table.timestamp('tested_at').nullable()

    table.index(['package_id', 'version'], 'idx_compat_pkg_version')
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('compat_results')
}
