import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('charity', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['zakat', 'sadaqah', 'fitra', 'qurbani', 'lillah', 'other']).defaultTo('sadaqah');
    table.decimal('amount', 15, 2).notNullable();
    table.string('recipient');
    table.enum('category', ['cash', 'food', 'clothing', 'medical', 'education', 'orphan', 'mosque', 'other']).defaultTo('cash');
    table.date('date').notNullable();
    table.string('hijri_year');
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.index(['user_id', 'date']);
    table.index(['user_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('charity');
}
