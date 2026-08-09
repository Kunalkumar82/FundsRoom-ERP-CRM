import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * Database Initialization Script for MySQL
 * Supports standard local env variables AND Railway MySQL variables (MYSQLHOST, etc.)
 */
export const initializeDatabase = async () => {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
  const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'mini_erp_crm';

  console.log(`📡 Connecting to MySQL Server at ${host}:${port}...`);

  try {
    // 1. Initial connection to target or root
    const connectionConfig: any = {
      host,
      port,
      user,
      password,
      multipleStatements: true
    };

    if (process.env.MYSQLDATABASE || process.env.DB_NAME) {
      connectionConfig.database = dbName;
    }

    const dbConnection = await mysql.createConnection(connectionConfig);

    console.log(`🛠️ Ensuring database "${dbName}" exists...`);
    await dbConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await dbConnection.query(`USE \`${dbName}\`;`);

    console.log(`📜 Executing MySQL Table Schemas...`);
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema statements split cleanly
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await dbConnection.query(statement);
    }

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
