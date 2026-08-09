import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL Connection Pool Configuration
 * Supports standard local env variables AND Railway MySQL variables (MYSQLHOST, MYSQLUSER, etc.)
 */
const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'mini_erp_crm';

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

/**
 * Helper to get a standalone connection from the pool.
 * Useful for ACID transactions where multiple queries run on a single connection.
 */
export const getConnection = async () => {
  return await pool.getConnection();
};

/**
 * Executes a callback inside a MySQL ACID Transaction.
 * Automatically handles `beginTransaction()`, `commit()`, and `rollback()`.
 */
export const executeInTransaction = async <T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;
