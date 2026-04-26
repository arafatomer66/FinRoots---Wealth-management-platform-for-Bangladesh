import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.string('phone', 20);
    table.string('nid_number', 17);
    table.string('tin_number', 12);
    table.date('date_of_birth');
    table.enum('gender', ['male', 'female', 'third_gender']).defaultTo('male');
    table.enum('religion', ['muslim', 'hindu', 'christian', 'buddhist', 'other']).defaultTo('muslim');
    table.boolean('is_disabled').defaultTo(false);
    table.boolean('is_new_taxpayer').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
