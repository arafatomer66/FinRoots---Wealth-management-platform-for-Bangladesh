import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('investments', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('ticker').notNullable();
    table.string('company_name').notNullable();
    table.enum('exchange', ['DSE', 'CSE']).defaultTo('DSE');
    table.string('sector');
    table.decimal('quantity', 15, 4).notNullable();
    table.decimal('buy_price', 15, 2).notNullable();
    table.decimal('current_price', 15, 2).notNullable();
    table.date('buy_date').notNullable();
    table.date('last_price_update').defaultTo(knex.fn.now());
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
    table.index(['user_id', 'ticker']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('investments');
}
