import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('goals', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.decimal('target_amount', 15, 2).notNullable();
    table.decimal('current_amount', 15, 2).defaultTo(0);
    table.date('target_date');
    table.enum('priority', ['high', 'medium', 'low']).defaultTo('medium');
    table.enum('category', [
      'retirement', 'education', 'housing', 'emergency',
      'hajj', 'marriage', 'vehicle', 'travel', 'business', 'other',
    ]).defaultTo('other');
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('goals');
}
