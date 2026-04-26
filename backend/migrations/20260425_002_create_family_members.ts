import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('family_members', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.enum('relationship', [
      'spouse', 'son', 'daughter', 'father', 'mother',
      'brother', 'sister', 'grandfather', 'grandmother',
      'grandson', 'granddaughter', 'uncle', 'aunt',
      'nephew', 'niece', 'other',
    ]).notNullable();
    table.date('date_of_birth');
    table.enum('gender', ['male', 'female', 'third_gender']);
    table.boolean('is_minor').defaultTo(false);
    table.integer('guardian_id').unsigned().references('id').inTable('family_members').onDelete('SET NULL');
    table.boolean('is_nominee').defaultTo(false);
    table.string('nid_number', 17);
    table.string('phone', 20);
    table.text('notes');
    table.timestamps(true, true);

    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('family_members');
}
