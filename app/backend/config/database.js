/**
 * Database Configuration
 * PostgreSQL connection with company context management
 */

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'phillips_datastream',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

/**
 * Set company context for Row Level Security
 * This must be called before executing queries to ensure data isolation
 */
const setCompanyContext = async (client, companyId) => {
  if (companyId) {
    await client.query(`SET app.current_company_id = '${companyId}'`);
  }
};

/**
 * Execute query with company context
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @param {number} companyId - Company ID for RLS context
 */
const query = async (text, params, companyId = null) => {
  const client = await pool.connect();
  try {
    await setCompanyContext(client, companyId);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * Get a client with company context set
 * @param {number} companyId - Company ID for RLS context
 */
const getClient = async (companyId = null) => {
  const client = await pool.connect();
  if (companyId) {
    await setCompanyContext(client, companyId);
  }
  return client;
};

/**
 * Transaction helper with company context
 * @param {Function} callback - Async function receiving client
 * @param {number} companyId - Company ID for RLS context
 */
const transaction = async (callback, companyId = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setCompanyContext(client, companyId);
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  setCompanyContext,
};
