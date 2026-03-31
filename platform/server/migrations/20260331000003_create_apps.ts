import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('apps', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable().unique()
    table.string('name', 128).nullable()
    table.string('owner', 64).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('apps')
}
