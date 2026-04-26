import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('inheritance_plans', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('plan_name').notNullable();
    table.enum('succession_law', ['muslim', 'hindu', 'christian', 'custom']).notNullable();
    table.text('will_text');
    table.decimal('total_estate_value', 15, 2);
    table.enum('status', ['draft', 'finalized']).defaultTo('draft');
    table.timestamps(true, true);

    table.index('user_id');
  });

  await knex.schema.createTable('inheritance_shares', (table) => {
    table.increments('id').primary();
    table.integer('plan_id').unsigned().notNullable().references('id').inTable('inheritance_plans').onDelete('CASCADE');
    table.integer('family_member_id').unsigned().notNullable().references('id').inTable('family_members').onDelete('CASCADE');
    table.decimal('share_percentage', 8, 4);
    table.decimal('share_amount', 15, 2);
    table.specificType('asset_ids', 'integer[]');
    table.text('notes');
    table.timestamps(true, true);

    table.index('plan_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('inheritance_shares');
  await knex.schema.dropTableIfExists('inheritance_plans');
}
