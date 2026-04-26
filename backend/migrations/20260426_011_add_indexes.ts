import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Assets indexes
  await knex.schema.alterTable('assets', (table) => {
    table.index(['user_id', 'status'], 'idx_assets_user_status');
    table.index(['user_id', 'asset_type'], 'idx_assets_user_type');
    table.index(['user_id', 'maturity_date'], 'idx_assets_user_maturity');
    table.index(['user_id', 'created_at'], 'idx_assets_user_created');
  });

  // Liabilities indexes
  await knex.schema.alterTable('liabilities', (table) => {
    table.index(['user_id'], 'idx_liabilities_user');
    table.index(['user_id', 'created_at'], 'idx_liabilities_user_created');
  });

  // Income indexes
  await knex.schema.alterTable('income', (table) => {
    table.index(['user_id'], 'idx_income_user');
    table.index(['user_id', 'frequency'], 'idx_income_user_frequency');
  });

  // Expenses indexes
  await knex.schema.alterTable('expenses', (table) => {
    table.index(['user_id', 'date'], 'idx_expenses_user_date');
  });

  // Family members indexes
  await knex.schema.alterTable('family_members', (table) => {
    table.index(['user_id', 'is_nominee'], 'idx_family_user_nominee');
    table.index(['user_id', 'is_minor'], 'idx_family_user_minor');
  });

  // Goals indexes
  await knex.schema.alterTable('goals', (table) => {
    table.index(['user_id', 'target_date'], 'idx_goals_user_target');
  });

  // Inheritance plans indexes
  await knex.schema.alterTable('inheritance_plans', (table) => {
    table.index(['user_id', 'status'], 'idx_inheritance_plans_user_status');
  });

  // Tax filings indexes
  await knex.schema.alterTable('tax_filings', (table) => {
    table.index(['user_id', 'assessment_year'], 'idx_tax_filings_user_year');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('assets', (table) => {
    table.dropIndex([], 'idx_assets_user_status');
    table.dropIndex([], 'idx_assets_user_type');
    table.dropIndex([], 'idx_assets_user_maturity');
    table.dropIndex([], 'idx_assets_user_created');
  });

  await knex.schema.alterTable('liabilities', (table) => {
    table.dropIndex([], 'idx_liabilities_user');
    table.dropIndex([], 'idx_liabilities_user_created');
  });

  await knex.schema.alterTable('income', (table) => {
    table.dropIndex([], 'idx_income_user');
    table.dropIndex([], 'idx_income_user_frequency');
  });

  await knex.schema.alterTable('expenses', (table) => {
    table.dropIndex([], 'idx_expenses_user_date');
  });

  await knex.schema.alterTable('family_members', (table) => {
    table.dropIndex([], 'idx_family_user_nominee');
    table.dropIndex([], 'idx_family_user_minor');
  });

  await knex.schema.alterTable('goals', (table) => {
    table.dropIndex([], 'idx_goals_user_target');
  });

  await knex.schema.alterTable('inheritance_plans', (table) => {
    table.dropIndex([], 'idx_inheritance_plans_user_status');
  });

  await knex.schema.alterTable('tax_filings', (table) => {
    table.dropIndex([], 'idx_tax_filings_user_year');
  });
}
