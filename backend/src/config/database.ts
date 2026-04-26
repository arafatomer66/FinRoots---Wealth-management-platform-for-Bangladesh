import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'finroots',
    user: process.env.DB_USER || 'finroots',
    password: process.env.DB_PASSWORD || 'finroots_dev_2026',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
