import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('expenses', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('category').notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one_time']).defaultTo('one_time');
    table.date('date').notNullable();
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.index('date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('expenses');
}
