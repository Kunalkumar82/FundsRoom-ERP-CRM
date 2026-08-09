import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ProductSnapshot } from '../types';

/**
 * Sales Challan & Transaction Engine Controller
 * Manages Sales Challan creation, confirmation with MySQL ACID Stock control,
 * static JSON snapshots of products, and stock movement logs.
 */

// Generate Auto-Incrementing Unique Challan Number: CH-YYYYMM-XXXX
const generateChallanNumber = async (): Promise<string> => {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `CH-${yearMonth}-`;

  const [rows]: any = await pool.query(
    'SELECT challan_number FROM sales_challans WHERE challan_number LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );

  if (rows.length === 0) {
    return `${prefix}0001`;
  }

  const lastNumStr = rows[0].challan_number.replace(prefix, '');
  const nextNum = parseInt(lastNumStr, 10) + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

// List Sales Challans with filters
export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, customer_id, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT sc.*, c.name as customer_name, c.business_name as customer_business, u.name as created_by_name
      FROM sales_challans sc
      JOIN customers c ON sc.customer_id = c.id
      JOIN users u ON sc.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (sc.challan_number LIKE ? OR c.name LIKE ? OR c.business_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status) {
      query += ' AND sc.status = ?';
      params.push(status);
    }

    if (customer_id) {
      query += ' AND sc.customer_id = ?';
      params.push(customer_id);
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM sales_challans sc 
      JOIN customers c ON sc.customer_id = c.id
      WHERE 1=1 ${search ? 'AND (sc.challan_number LIKE ? OR c.name LIKE ? OR c.business_name LIKE ?)' : ''} ${status ? 'AND sc.status = ?' : ''} ${customer_id ? 'AND sc.customer_id = ?' : ''}
    `;
    const [countRows]: any = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const offset = (Number(page) - 1) * Number(limit);
    query += ' ORDER BY sc.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows]: any = await pool.query(query, params);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching sales challans:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Challan by ID with Detailed Items & JSON Snapshots
export const getChallanById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [headerRows]: any = await pool.query(
      `SELECT sc.*, c.name as customer_name, c.email as customer_email, c.mobile as customer_mobile, 
              c.business_name as customer_business, c.gst_number as customer_gst, c.address as customer_address,
              u.name as created_by_name
       FROM sales_challans sc
       JOIN customers c ON sc.customer_id = c.id
       JOIN users u ON sc.created_by = u.id
       WHERE sc.id = ?`,
      [id]
    );

    if (headerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales challan not found.' });
    }

    const [itemRows]: any = await pool.query(
      'SELECT * FROM challan_items WHERE challan_id = ? ORDER BY id ASC',
      [id]
    );

    // Parse product_snapshot JSON string if mysql returns string
    const items = itemRows.map((item: any) => ({
      ...item,
      product_snapshot: typeof item.product_snapshot === 'string' 
        ? JSON.parse(item.product_snapshot) 
        : item.product_snapshot
    }));

    return res.json({
      success: true,
      data: {
        ...headerRows[0],
        items
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * CREATE SALES CHALLAN WITH ACID TRANSACTION LOGIC
 * Input Body:
 * {
 *   customer_id: number,
 *   items: Array<{ product_id: number, quantity: number, unit_price?: number }>,
 *   status: 'Draft' | 'Confirmed'
 * }
 */
export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  const { customer_id, items, status = 'Draft' } = req.body;

  if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Customer ID and at least one product item are required.'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify Customer exists
    const [custRows]: any = await connection.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (custRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    }

    // 2. Fetch all products referenced in items & construct item detail snapshots
    const productIds = items.map((i: any) => i.product_id);
    const [productRows]: any = await connection.query(
      `SELECT * FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) FOR UPDATE`,
      productIds
    );

    const productMap = new Map<number, any>();
    productRows.forEach((p: any) => productMap.set(p.id, p));

    let totalQuantity = 0;
    let totalAmount = 0;
    const processedItems: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
      snapshot: ProductSnapshot;
    }> = [];

    // Validate items and check stock if status === 'Confirmed'
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: `Product ID ${item.product_id} not found.` });
      }

      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: `Invalid quantity for product [${product.name}].` });
      }

      // If status is Confirmed, verify stock availability
      if (status === 'Confirmed') {
        if (product.current_stock < qty) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product [${product.name}]`
          });
        }
      }

      const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : Number(product.unit_price);
      const subtotal = qty * unitPrice;

      totalQuantity += qty;
      totalAmount += subtotal;

      // Build static JSON snapshot of product at creation time
      const snapshot: ProductSnapshot = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit_price: unitPrice
      };

      processedItems.push({
        product_id: product.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
        snapshot
      });
    }

    // Generate Challan Number
    const challanNumber = await generateChallanNumber();

    // 3. Insert Sales Challan Header
    const [challanRes]: any = await connection.query(
      `INSERT INTO sales_challans (challan_number, customer_id, total_quantity, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [challanNumber, customer_id, totalQuantity, totalAmount, status, req.user?.userId]
    );

    const challanId = challanRes.insertId;

    // 4. Insert Challan Items & apply inventory deduction if Confirmed
    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO challan_items (challan_id, product_id, quantity, unit_price, subtotal, product_snapshot)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          challanId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          JSON.stringify(item.snapshot)
        ]
      );

      // If status is Confirmed, decrement stock & add OUT log
      if (status === 'Confirmed') {
        await connection.query(
          'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );

        await connection.query(
          `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
           VALUES (?, ?, 'OUT', ?, ?)`,
          [item.product_id, item.quantity, `Sales Challan #${challanNumber}`, req.user?.userId]
        );
      }
    }

    // 5. Commit SQL Transaction
    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: `Sales Challan #${challanNumber} created successfully in status "${status}".`,
      data: {
        id: challanId,
        challan_number: challanNumber,
        status,
        total_quantity: totalQuantity,
        total_amount: totalAmount
      }
    });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error('Error creating sales challan:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE CHALLAN STATUS (Draft -> Confirmed / Cancelled)
 * Triggers ACID stock check & inventory decrement when confirming a draft.
 */
export const updateChallanStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  if (!newStatus || !['Draft', 'Confirmed', 'Cancelled'].includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status ("Draft", "Confirmed", "Cancelled") is required.'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch existing challan
    const [headerRows]: any = await connection.query(
      'SELECT * FROM sales_challans WHERE id = ? FOR UPDATE',
      [id]
    );

    if (headerRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Sales challan not found.' });
    }

    const challan = headerRows[0];

    if (challan.status === newStatus) {
      await connection.rollback();
      connection.release();
      return res.json({ success: true, message: `Challan is already in status "${newStatus}".` });
    }

    if (challan.status === 'Confirmed' && newStatus === 'Draft') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Cannot revert a Confirmed challan to Draft.' });
    }

    // 2. Fetch items
    const [itemRows]: any = await connection.query(
      'SELECT ci.*, p.name as product_name, p.current_stock FROM challan_items ci JOIN products p ON ci.product_id = p.id WHERE ci.challan_id = ?',
      [id]
    );

    // 3. If transitioning to Confirmed, check stock and reduce
    if (newStatus === 'Confirmed') {
      for (const item of itemRows) {
        if (item.current_stock < item.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product [${item.product_name}]`
          });
        }
      }

      // Deduct stock and add log entries
      for (const item of itemRows) {
        await connection.query(
          'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );

        await connection.query(
          `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
           VALUES (?, ?, 'OUT', ?, ?)`,
          [item.product_id, item.quantity, `Sales Challan #${challan.challan_number}`, req.user?.userId]
        );
      }
    }

    // 4. Update Challan Header Status
    await connection.query('UPDATE sales_challans SET status = ? WHERE id = ?', [newStatus, id]);

    await connection.commit();
    connection.release();

    return res.json({
      success: true,
      message: `Sales Challan #${challan.challan_number} status updated to "${newStatus}".`
    });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error('Error updating challan status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
