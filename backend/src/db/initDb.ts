import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Embedded SQL Table Schemas for MySQL
 */
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Sales', 'Warehouse', 'Accounts') NOT NULL DEFAULT 'Sales',
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    email VARCHAR(255),
    business_name VARCHAR(255),
    gst_number VARCHAR(50),
    type ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL DEFAULT 'Retail',
    address TEXT,
    status ENUM('Lead', 'Active', 'Inactive') NOT NULL DEFAULT 'Lead',
    follow_up_date DATE,
    notes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_alert_qty INT NOT NULL DEFAULT 10,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS stock_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    qty_changed INT NOT NULL,
    movement_type ENUM('IN', 'OUT') NOT NULL,
    reason TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS sales_challans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challan_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Draft', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS challan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challan_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    product_snapshot JSON,
    FOREIGN KEY (challan_id) REFERENCES sales_challans(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`
];

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
      ssl: sslOption
    };

    const dbConnection = await mysql.createConnection(connectionConfig);

    console.log(`📜 Executing MySQL Table Schemas on database "${dbName}"...`);
    for (const statement of SCHEMA_STATEMENTS) {
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
