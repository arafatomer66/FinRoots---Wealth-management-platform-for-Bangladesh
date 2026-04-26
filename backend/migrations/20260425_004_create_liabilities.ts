import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('liabilities', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', [
      'home_loan', 'personal_loan', 'car_loan', 'credit_card',
      'education_loan', 'business_loan', 'other',
    ]).notNullable();
    table.string('name').notNullable();
    table.string('institution');
    table.decimal('principal_amount', 15, 2).notNullable();
    table.decimal('outstanding_amount', 15, 2).notNullable();
    table.decimal('interest_rate', 5, 2);
    table.decimal('emi_amount', 15, 2);
    table.date('start_date');
    table.date('end_date');
    table.jsonb('metadata');
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('liabilities');
}
