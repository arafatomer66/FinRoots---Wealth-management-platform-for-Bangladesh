import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('assets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('asset_type', [
      'sanchayapatra', 'fdr', 'dps', 'stock', 'mutual_fund',
      'gold', 'real_estate', 'insurance', 'bond', 'cash_bank', 'other',
    ]).notNullable();
    table.string('name').notNullable();
    table.string('institution');
    table.date('purchase_date');
    table.date('maturity_date');
    table.decimal('purchase_value', 15, 2).defaultTo(0);
    table.decimal('current_value', 15, 2).notNullable().defaultTo(0);
    table.string('currency', 3).defaultTo('BDT');
    table.decimal('interest_rate', 5, 2);
    table.jsonb('metadata');
    table.integer('nominee_id').unsigned().references('id').inTable('family_members').onDelete('SET NULL');
    table.text('notes');
    table.enum('status', ['active', 'matured', 'sold', 'closed']).defaultTo('active');
    table.timestamps(true, true);

    table.index('user_id');
    table.index('asset_type');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('assets');
}
