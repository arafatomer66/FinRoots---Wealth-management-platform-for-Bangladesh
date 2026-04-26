import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('documents', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('file_path').notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.enum('category', [
      'deed', 'certificate', 'policy', 'tax_return', 'nid', 'tin', 'will', 'other',
    ]).defaultTo('other');
    table.integer('related_asset_id').unsigned().references('id').inTable('assets').onDelete('SET NULL');
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('documents');
}
