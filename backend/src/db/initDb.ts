import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * Database Initialization Script for MySQL
 * Supports local, Railway, and Aiven Cloud SSL connections.
 */
export const initializeDatabase = async () => {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
  const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'defaultdb';

  const sslOption = (host.includes('aivencloud.com') || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : undefined;

  console.log(`📡 Connecting to MySQL Server at ${host}:${port}...`);

  try {
    const connectionConfig: any = {
      host,
      port,
      user,
      password,
      database: dbName,
      ssl: sslOption,
      multipleStatements: true
    };

    const dbConnection = await mysql.createConnection(connectionConfig);

    console.log(`📜 Executing MySQL Table Schemas on database "${dbName}"...`);
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
