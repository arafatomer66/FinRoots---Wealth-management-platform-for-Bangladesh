import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add 'umrah' to goal category enum and add pilgrimage_for FK
  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_category_check`);
  await knex.raw(`
    ALTER TABLE goals ADD CONSTRAINT goals_category_check
    CHECK (category IN ('retirement','education','housing','emergency','hajj','umrah','marriage','vehicle','travel','business','other'))
  `);

  await knex.schema.alterTable('goals', (table) => {
    table.integer('pilgrimage_for').unsigned().references('id').inTable('family_members').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('goals', (table) => {
    table.dropColumn('pilgrimage_for');
  });
  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_category_check`);
  await knex.raw(`
    ALTER TABLE goals ADD CONSTRAINT goals_category_check
    CHECK (category IN ('retirement','education','housing','emergency','hajj','marriage','vehicle','travel','business','other'))
  `);
}
