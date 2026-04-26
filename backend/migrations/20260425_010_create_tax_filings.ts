import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tax_filings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('assessment_year', 10).notNullable();
    table.decimal('total_income', 15, 2);
    table.decimal('taxable_income', 15, 2);
    table.decimal('tax_liability', 15, 2);
    table.decimal('tax_paid', 15, 2).defaultTo(0);
    table.decimal('rebate_amount', 15, 2).defaultTo(0);
    table.enum('filing_status', ['draft', 'filed', 'assessed']).defaultTo('draft');
    table.jsonb('slab_breakdown');
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.index('assessment_year');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tax_filings');
}
