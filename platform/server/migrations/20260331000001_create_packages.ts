import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('packages', (table) => {
    table.bigIncrements('id').primary()
    table.string('name', 128).notNullable().unique()
    table.text('description').nullable()
    table.string('latest_version', 32).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('packages')
}
