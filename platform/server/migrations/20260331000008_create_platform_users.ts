import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('platform_users', (table) => {
    table.bigIncrements('id').primary()
    table.string('username', 64).notNullable().unique()
    table.enum('role', ['viewer', 'publisher', 'operator', 'admin']).notNullable()
    table.string('api_key_hash', 256).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('platform_users')
}
