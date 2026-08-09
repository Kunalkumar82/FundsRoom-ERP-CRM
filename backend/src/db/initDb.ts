import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * Database Initialization Script for MySQL
 * 1. Creates target database `mini_erp_crm` if it doesn't exist.
 * 2. Runs schema definitions to create all 6 tables:
 *    - users, customers, products, stock_logs, sales_challans, challan_items
 */
export const initializeDatabase = async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_NAME || 'mini_erp_crm';

  console.log(`📡 Connecting to MySQL Server at ${host}:${port}...`);

  try {
    // 1. Initial connection without database to ensure database exists
    const rootConnection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    console.log(`🛠️ Creating database "${dbName}" if not exists...`);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    // 2. Connect directly to target database
    const dbConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database: dbName,
      multipleStatements: true
    });

    console.log(`📜 Executing MySQL Table Schemas...`);
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await dbConnection.query(schemaSql);
    await dbConnection.end();

    console.log(`✅ Database "${dbName}" initialized successfully with all tables!`);
  } catch (error) {
    console.error('❌ Error during MySQL database initialization:', error);
    throw error;
  }
};

// Run directly if invoked from CLI
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
