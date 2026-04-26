import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('insurance_policies', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['life', 'health', 'vehicle', 'property', 'travel', 'other']).notNullable();
    table.string('insurer').notNullable();
    table.string('policy_number').notNullable();
    table.decimal('sum_assured', 15, 2).notNullable();
    table.decimal('premium', 15, 2).notNullable();
    table.enum('premium_frequency', ['monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time']).defaultTo('yearly');
    table.date('start_date').notNullable();
    table.date('maturity_date');
    table.date('next_premium_date');
    table.string('beneficiary');
    table.integer('beneficiary_family_id').unsigned().references('id').inTable('family_members').onDelete('SET NULL');
    table.string('coverage_for');
    table.boolean('is_active').defaultTo(true);
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.index(['user_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('insurance_policies');
}
