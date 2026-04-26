import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('income', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('source').notNullable();
    table.enum('type', [
      'salary', 'business', 'rental', 'dividend', 'interest',
      'freelance', 'agricultural', 'capital_gain', 'other',
    ]).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.enum('frequency', ['monthly', 'quarterly', 'yearly', 'one_time']).defaultTo('monthly');
    table.date('start_date');
    table.date('end_date');
    table.boolean('is_taxable').defaultTo(true);
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('income');
}
