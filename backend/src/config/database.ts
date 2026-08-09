import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL Connection Pool Configuration
 * Standard MySQL database connection pool using mysql2/promise for async/await support.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mini_erp_crm',
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
