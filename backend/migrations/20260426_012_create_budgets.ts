import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('budgets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('category').notNullable();
    table.decimal('monthly_limit', 15, 2).notNullable();
    table.integer('year').notNullable();
    table.integer('month').notNullable(); // 1-12
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.unique(['user_id', 'category', 'year', 'month']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('budgets');
}
