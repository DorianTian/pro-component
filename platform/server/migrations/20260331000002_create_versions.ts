import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('versions', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('version', 32).notNullable()
    table.json('dependencies').nullable()
    table.json('peer_dependencies').nullable()
    table.string('cdn_path', 256).nullable()
    table.text('changelog').nullable()
    table.json('breaking_changes').nullable()
    table.json('sri_hashes').nullable()
    table.enum('status', ['published', 'deprecated', 'yanked']).defaultTo('published')
    table.timestamp('published_at').defaultTo(knex.fn.now())

    table.unique(['package_id', 'version'])
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('versions')
}
