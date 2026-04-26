import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add recurring transaction tracking fields to income and expenses
  await knex.schema.alterTable('income', (table) => {
    table.boolean('is_recurring').defaultTo(false);
    table.date('next_due_date');
  });

  await knex.schema.alterTable('expenses', (table) => {
    table.boolean('is_recurring').defaultTo(false);
    table.date('next_due_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('income', (table) => {
    table.dropColumn('is_recurring');
    table.dropColumn('next_due_date');
  });
  await knex.schema.alterTable('expenses', (table) => {
    table.dropColumn('is_recurring');
    table.dropColumn('next_due_date');
  });
}
