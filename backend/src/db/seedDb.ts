import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { initializeDatabase } from './initDb';

dotenv.config();

/**
 * Seed Database Script
 * Supports local, Railway, and Aiven Cloud SSL connections.
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding Process...');

  // Ensure tables exist
  await initializeDatabase();

  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'defaultdb';

  const sslOption = (host.includes('aivencloud.com') || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : undefined;

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    ssl: sslOption
  });

  try {
    const connection = await pool.getConnection();

    // Check if users table already has records
    try {
      const [existingUsers]: any = await connection.query('SELECT COUNT(*) as count FROM users');
      if (existingUsers[0].count > 0) {
        console.log(`ℹ️ Users table already contains ${existingUsers[0].count} users. Skipping re-seeding.`);
        connection.release();
        await pool.end();
        return;
      }
    } catch (checkErr) {
      console.log('Table check note:', checkErr);
    }

    // Safely clear existing data (in reverse foreign key order)
    console.log('🧹 Clearing existing table data...');
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE challan_items').catch(() => {});
      await connection.query('TRUNCATE TABLE sales_challans').catch(() => {});
      await connection.query('TRUNCATE TABLE stock_logs').catch(() => {});
      await connection.query('TRUNCATE TABLE products').catch(() => {});
      await connection.query('TRUNCATE TABLE customers').catch(() => {});
      await connection.query('TRUNCATE TABLE users').catch(() => {});
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (clearErr) {
      console.warn('Truncate warning (safe to ignore on new DB):', clearErr);
    }

    // 1. Seed Users
    console.log('👤 Seeding Demo Users...');
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const users = [
      ['System Administrator', 'admin@erp.com', passwordHash, 'Admin', 'Active'],
      ['Sales Manager', 'sales@erp.com', passwordHash, 'Sales', 'Active'],
      ['Warehouse Inspector', 'warehouse@erp.com', passwordHash, 'Warehouse', 'Active'],
      ['Accounts Specialist', 'accounts@erp.com', passwordHash, 'Accounts', 'Active']
    ];

    for (const userRow of users) {
      await connection.query(
        'INSERT IGNORE INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        userRow
      );
    }

    // Get Admin user ID for log reference
    const [userRows]: any = await connection.query('SELECT id, role FROM users WHERE email = ?', ['admin@erp.com']);
    const adminId = userRows.length > 0 ? userRows[0].id : 1;

    // 2. Seed Customers
    console.log('🏢 Seeding CRM Customers...');
    const customers = [
      ['Apex Industrial Corp', '9876543210', 'contact@apexind.com', 'Apex Industrial Solutions Pvt Ltd', '27AAACA1234A1Z5', 'Distributor', '702 Cyber Heights, Tech Zone, Mumbai', 'Active', '2026-08-15', 'Key customer for industrial automation gear.'],
      ['BlueSky Logistics', '9812345678', 'procurement@bluesky.com', 'BlueSky Logistics India', '27BBBCB5678B1Z6', 'Wholesale', 'Plot 45, Cargo Hub, Bhiwandi', 'Active', '2026-08-18', 'Requires quarterly bulk shipment estimates.'],
      ['Acme Electronics Store', '9765432109', 'sales@acmeelectronics.in', 'Acme Retail Outlets', '27CCCC1234C1Z7', 'Retail', 'Shop 12, Commercial Complex, Pune', 'Lead', '2026-08-22', 'Interested in microcontroller kits. Sent quote.'],
      ['Zenith Robotics Tech', '9988776655', 'info@zenithrobotics.com', 'Zenith Systems & Automation', null, 'Distributor', 'Sector 5, Electronics City, Bengaluru', 'Lead', '2026-08-25', 'Follow up regarding motor driver availability.']
    ];

    for (const cust of customers) {
      await connection.query(
        `INSERT IGNORE INTO customers (name, mobile, email, business_name, gst_number, type, address, status, follow_up_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        cust
      );
    }

    // 3. Seed Products
    console.log('📦 Seeding Products & Inventory...');
    const products = [
      ['PRD-IND-001', 'Industrial Sensor Module V3', 'Electronics', 1250.00, 45, 10, 'Warehouse A - Rack 12'],
      ['PRD-IND-002', 'Microcontroller Board 32-Bit', 'Electronics', 2400.00, 8, 15, 'Warehouse A - Rack 04'],
      ['PRD-PWR-001', 'High Capacity Li-Ion Battery Pack 24V', 'Power Solutions', 5800.00, 25, 5, 'Warehouse B - Secure Storage'],
      ['PRD-MCH-001', 'Heavy Duty Stepper Motor 10Nm', 'Machinery', 3200.00, 3, 5, 'Warehouse C - Heavy Bay'],
      ['PRD-CAB-001', 'Industrial Ethernet Cable 50m Roll', 'Cabling', 450.00, 100, 20, 'Warehouse D - Spools']
    ];

    const insertedProductIds: number[] = [];
    for (const prd of products) {
      const [res]: any = await connection.query(
        `INSERT IGNORE INTO products (sku, name, category, unit_price, current_stock, min_stock_alert_qty, location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        prd
      );
      if (res.insertId) {
        insertedProductIds.push(res.insertId);
        await connection.query(
          `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
           VALUES (?, ?, 'IN', 'Initial Warehouse Inventory Import', ?)`,
          [res.insertId, prd[4], adminId]
        );
      }
    }

    connection.release();
    await pool.end();

    console.log('🎉 Seeding Complete! Demo accounts created.');
  } catch (error) {
    console.error('❌ Error Seeding MySQL Database:', error);
    await pool.end();
    throw error;
  }
};

// Run directly if invoked from CLI
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
