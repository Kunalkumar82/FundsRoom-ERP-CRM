import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { initializeDatabase } from './initDb';

dotenv.config();

/**
 * Seed Database Script
 * Populates initial demonstration data into MySQL tables:
 * - 4 Users with standard role privileges (Admin, Sales, Warehouse, Accounts)
 * - Sample Customers across CRM statuses
 * - Sample Products (with low stock warnings for testing)
 * - Initial Stock Logs
 * - Sample Sales Challans with static JSON snapshots
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding Process...');
  
  // Ensure tables exist
  await initializeDatabase();

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mini_erp_crm',
  });

  try {
    const connection = await pool.getConnection();

    // Clear existing data (in reverse foreign key order)
    console.log('🧹 Clearing existing table data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE challan_items');
    await connection.query('TRUNCATE TABLE sales_challans');
    await connection.query('TRUNCATE TABLE stock_logs');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

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

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }

    // Get Admin user ID for log reference
    const [userRows]: any = await connection.query('SELECT id, role FROM users WHERE email = ?', ['admin@erp.com']);
    const adminId = userRows[0].id;

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
        `INSERT INTO customers (name, mobile, email, business_name, gst_number, type, address, status, follow_up_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        cust
      );
    }

    // 3. Seed Products
    console.log('📦 Seeding Products & Inventory...');
    const products = [
      ['PRD-IND-001', 'Industrial Sensor Module V3', 'Electronics', 1250.00, 45, 10, 'Warehouse A - Rack 12'],
      ['PRD-IND-002', 'Microcontroller Board 32-Bit', 'Electronics', 2400.00, 8, 15, 'Warehouse A - Rack 04'], // LOW STOCK
      ['PRD-PWR-001', 'High Capacity Li-Ion Battery Pack 24V', 'Power Solutions', 5800.00, 25, 5, 'Warehouse B - Secure Storage'],
      ['PRD-MCH-001', 'Heavy Duty Stepper Motor 10Nm', 'Machinery', 3200.00, 3, 5, 'Warehouse C - Heavy Bay'], // LOW STOCK
      ['PRD-CAB-001', 'Industrial Ethernet Cable 50m Roll', 'Cabling', 450.00, 100, 20, 'Warehouse D - Spools']
    ];

    const insertedProductIds: number[] = [];
    for (const prd of products) {
      const [res]: any = await connection.query(
        `INSERT INTO products (sku, name, category, unit_price, current_stock, min_stock_alert_qty, location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        prd
      );
      insertedProductIds.push(res.insertId);

      // Record initial IN stock movement log
      await connection.query(
        `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
         VALUES (?, ?, 'IN', 'Initial Warehouse Inventory Import', ?)`,
        [res.insertId, prd[4], adminId]
      );
    }

    // 4. Seed Sales Challans
    console.log('📑 Seeding Sales Challans with Product Snapshots...');
    const [customerRows]: any = await connection.query('SELECT id FROM customers LIMIT 2');
    const customer1Id = customerRows[0].id;
    const customer2Id = customerRows[1].id;

    // Challan 1: Confirmed
    const challan1Number = 'CH-202608-0001';
    const [ch1Res]: any = await connection.query(
      `INSERT INTO sales_challans (challan_number, customer_id, total_quantity, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, 'Confirmed', ?)`,
      [challan1Number, customer1Id, 5, 6250.00, adminId]
    );
    const challan1Id = ch1Res.insertId;

    // Create JSON Snapshot for Item 1
    const item1Snapshot = JSON.stringify({
      id: insertedProductIds[0],
      sku: 'PRD-IND-001',
      name: 'Industrial Sensor Module V3',
      category: 'Electronics',
      unit_price: 1250.00
    });

    await connection.query(
      `INSERT INTO challan_items (challan_id, product_id, quantity, unit_price, subtotal, product_snapshot)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [challan1Id, insertedProductIds[0], 5, 1250.00, 6250.00, item1Snapshot]
    );

    // Record Stock Log for Confirmed Challan 1
    await connection.query(
      `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
       VALUES (?, 5, 'OUT', ?, ?)`,
      [insertedProductIds[0], `Sales Challan #${challan1Number}`, adminId]
    );

    // Challan 2: Draft
    const challan2Number = 'CH-202608-0002';
    const [ch2Res]: any = await connection.query(
      `INSERT INTO sales_challans (challan_number, customer_id, total_quantity, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, 'Draft', ?)`,
      [challan2Number, customer2Id, 2, 4800.00, adminId]
    );
    const challan2Id = ch2Res.insertId;

    const item2Snapshot = JSON.stringify({
      id: insertedProductIds[1],
      sku: 'PRD-IND-002',
      name: 'Microcontroller Board 32-Bit',
      category: 'Electronics',
      unit_price: 2400.00
    });

    await connection.query(
      `INSERT INTO challan_items (challan_id, product_id, quantity, unit_price, subtotal, product_snapshot)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [challan2Id, insertedProductIds[1], 2, 2400.00, 4800.00, item2Snapshot]
    );

    connection.release();
    await pool.end();

    console.log('🎉 Seeding Complete! Demo accounts created:');
    console.log('----------------------------------------------------');
    console.log('🔐 Default Password for all accounts: Password123!');
    console.log('👑 Admin:     admin@erp.com');
    console.log('💼 Sales:     sales@erp.com');
    console.log('📦 Warehouse: warehouse@erp.com');
    console.log('💳 Accounts:  accounts@erp.com');
    console.log('----------------------------------------------------');
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
