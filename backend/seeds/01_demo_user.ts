import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data
  await knex('tax_filings').del();
  await knex('inheritance_shares').del();
  await knex('inheritance_plans').del();
  await knex('documents').del();
  await knex('goals').del();
  await knex('expenses').del();
  await knex('income').del();
  await knex('liabilities').del();
  await knex('assets').del();
  await knex('family_members').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('demo1234', 12);

  // Demo user
  const [user] = await knex('users').insert({
    email: 'demo@finroots.com',
    password_hash: passwordHash,
    name: 'Rahim Uddin',
    phone: '01712345678',
    date_of_birth: '1985-06-15',
    gender: 'male',
    religion: 'muslim',
    tin_number: '123456789012',
  }).returning('*');

  // Family members
  const [wife] = await knex('family_members').insert({
    user_id: user.id,
    name: 'Fatima Begum',
    relationship: 'spouse',
    date_of_birth: '1988-03-20',
    gender: 'female',
    is_nominee: true,
  }).returning('*');

  const [son] = await knex('family_members').insert({
    user_id: user.id,
    name: 'Arif Uddin',
    relationship: 'son',
    date_of_birth: '2012-09-10',
    gender: 'male',
    is_minor: true,
  }).returning('*');

  const [daughter] = await knex('family_members').insert({
    user_id: user.id,
    name: 'Nusrat Uddin',
    relationship: 'daughter',
    date_of_birth: '2015-01-25',
    gender: 'female',
    is_minor: true,
  }).returning('*');

  await knex('family_members').insert({
    user_id: user.id,
    name: 'Karim Uddin',
    relationship: 'father',
    date_of_birth: '1955-11-08',
    gender: 'male',
  });

  await knex('family_members').insert({
    user_id: user.id,
    name: 'Amina Khatun',
    relationship: 'mother',
    date_of_birth: '1960-04-12',
    gender: 'female',
  });

  // Assets
  await knex('assets').insert([
    {
      user_id: user.id,
      asset_type: 'sanchayapatra',
      name: '5-Year BD Sanchayapatra',
      institution: 'National Savings Bureau',
      purchase_date: '2023-01-15',
      maturity_date: '2028-01-15',
      purchase_value: 500000,
      current_value: 580000,
      interest_rate: 11.83,
      metadata: JSON.stringify({ scheme_type: 'five_year_bd', certificate_number: 'SC-2023-001' }),
      nominee_id: wife.id,
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'fdr',
      name: 'Dutch Bangla Bank FDR',
      institution: 'Dutch Bangla Bank',
      purchase_date: '2024-06-01',
      maturity_date: '2025-06-01',
      purchase_value: 300000,
      current_value: 327000,
      interest_rate: 9.0,
      metadata: JSON.stringify({ account_number: 'FDR-DBBL-2024', auto_renewal: true }),
      nominee_id: wife.id,
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'stock',
      name: 'Grameenphone Ltd',
      institution: 'DSE',
      purchase_date: '2024-01-10',
      purchase_value: 200000,
      current_value: 225000,
      metadata: JSON.stringify({ symbol: 'GP', exchange: 'DSE', quantity: 500, avg_buy_price: 400 }),
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'gold',
      name: 'Family Gold Jewelry',
      purchase_value: 350000,
      current_value: 450000,
      metadata: JSON.stringify({ form: 'jewelry', weight_gram: 50, karat: 22 }),
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'real_estate',
      name: 'Apartment in Mirpur',
      purchase_date: '2020-03-01',
      purchase_value: 5000000,
      current_value: 6500000,
      metadata: JSON.stringify({ location: 'Mirpur-10, Dhaka', area_sqft: 1200, deed_number: 'DEED-2020-MIR' }),
      nominee_id: wife.id,
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'cash_bank',
      name: 'Savings Account - BRAC Bank',
      institution: 'BRAC Bank',
      current_value: 150000,
      metadata: JSON.stringify({ account_number: 'SAV-BRAC-001' }),
      status: 'active',
    },
    {
      user_id: user.id,
      asset_type: 'insurance',
      name: 'MetLife Insurance',
      institution: 'MetLife Bangladesh',
      purchase_date: '2022-01-01',
      current_value: 200000,
      metadata: JSON.stringify({ policy_number: 'ML-2022-001', premium_amount: 10000, premium_frequency: 'monthly', sum_assured: 2000000, policy_type: 'life' }),
      nominee_id: wife.id,
      status: 'active',
    },
  ]);

  // Liabilities
  await knex('liabilities').insert([
    {
      user_id: user.id,
      type: 'home_loan',
      name: 'Apartment Loan - Mirpur',
      institution: 'BRAC Bank',
      principal_amount: 3000000,
      outstanding_amount: 1800000,
      interest_rate: 9.5,
      emi_amount: 35000,
      start_date: '2020-03-01',
      end_date: '2030-03-01',
    },
  ]);

  // Income
  await knex('income').insert([
    {
      user_id: user.id,
      source: 'Tech Solutions Ltd',
      type: 'salary',
      amount: 85000,
      frequency: 'monthly',
      is_taxable: true,
    },
    {
      user_id: user.id,
      source: 'Freelance Web Dev',
      type: 'freelance',
      amount: 25000,
      frequency: 'monthly',
      is_taxable: true,
    },
  ]);

  // Goals
  await knex('goals').insert([
    {
      user_id: user.id,
      name: "Arif's University Fund",
      target_amount: 2000000,
      current_amount: 350000,
      target_date: '2030-09-01',
      priority: 'high',
      category: 'education',
    },
    {
      user_id: user.id,
      name: 'Hajj Fund',
      target_amount: 800000,
      current_amount: 200000,
      target_date: '2028-06-01',
      priority: 'medium',
      category: 'hajj',
    },
    {
      user_id: user.id,
      name: 'Emergency Fund',
      target_amount: 500000,
      current_amount: 150000,
      priority: 'high',
      category: 'emergency',
    },
  ]);
}
