import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Products & Inventory Controller
 */

// List products with search, category filter, low stock alert filter, pagination
export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, low_stock, page = 1, limit = 10 } = req.query;

    let query = 'SELECT *, (current_stock <= min_stock_alert_qty) AS is_low_stock FROM products WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ? OR category LIKE ? OR location LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (low_stock === 'true') {
      query += ' AND current_stock <= min_stock_alert_qty';
    }

    // Get count
    const countQuery = query.replace('SELECT *, (current_stock <= min_stock_alert_qty) AS is_low_stock', 'SELECT COUNT(*) as total');
    const [countRows]: any = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
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
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product By ID
export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      'SELECT *, (current_stock <= min_stock_alert_qty) AS is_low_stock FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Product
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { sku, name, category, unit_price, current_stock, min_stock_alert_qty, location } = req.body;

  if (!sku || !name || !category || unit_price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'SKU, name, category, and unit price are required.'
    });
  }

  try {
    // Check unique SKU
    const [existing]: any = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Product with SKU "${sku}" already exists.` });
    }

    const initialStock = Number(current_stock) || 0;

    const [result]: any = await pool.query(
      `INSERT INTO products (sku, name, category, unit_price, current_stock, min_stock_alert_qty, location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sku,
        name,
        category,
        Number(unit_price),
        initialStock,
        Number(min_stock_alert_qty) || 10,
        location || 'Main Warehouse'
      ]
    );

    const productId = result.insertId;

    // Log initial stock movement if stock > 0
    if (initialStock > 0) {
      await pool.query(
        `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
         VALUES (?, ?, 'IN', 'Initial Product Creation Stock', ?)`,
        [productId, initialStock, req.user?.userId]
      );
    }

    const [newProduct]: any = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct[0]
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product Info
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { sku, name, category, unit_price, min_stock_alert_qty, location } = req.body;

  try {
    const [existing]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (sku && sku !== existing[0].sku) {
      const [skuCheck]: any = await pool.query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
      if (skuCheck.length > 0) {
        return res.status(400).json({ success: false, message: `SKU "${sku}" is already in use by another product.` });
      }
    }

    await pool.query(
      `UPDATE products 
       SET sku = ?, name = ?, category = ?, unit_price = ?, min_stock_alert_qty = ?, location = ?
       WHERE id = ?`,
      [
        sku ?? existing[0].sku,
        name ?? existing[0].name,
        category ?? existing[0].category,
        unit_price !== undefined ? Number(unit_price) : existing[0].unit_price,
        min_stock_alert_qty !== undefined ? Number(min_stock_alert_qty) : existing[0].min_stock_alert_qty,
        location ?? existing[0].location,
        id
      ]
    );

    const [updated]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Manual Stock Adjustment (IN / OUT)
export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { qty_changed, movement_type, reason } = req.body;

  const qty = Number(qty_changed);

  if (!qty || qty <= 0 || !movement_type || !['IN', 'OUT'].includes(movement_type) || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Valid qty_changed (>0), movement_type ("IN" or "OUT"), and reason are required.'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products]: any = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [id]);
    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];

    if (movement_type === 'OUT' && product.current_stock < qty) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product [${product.name}]. Available: ${product.current_stock}, Requested: ${qty}`
      });
    }

    const newStock = movement_type === 'IN' 
      ? product.current_stock + qty 
      : product.current_stock - qty;

    // Update product stock
    await connection.query('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, id]);

    // Record Stock Log
    await connection.query(
      `INSERT INTO stock_logs (product_id, qty_changed, movement_type, reason, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [id, qty, movement_type, reason, req.user?.userId]
    );

    await connection.commit();
    connection.release();

    const [updated]: any = await pool.query('SELECT *, (current_stock <= min_stock_alert_qty) AS is_low_stock FROM products WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Stock adjusted successfully (${movement_type} ${qty}).`,
      data: updated[0]
    });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error('Error adjusting stock:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List Stock Movement Logs
export const getStockLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { product_id, movement_type, page = 1, limit = 15 } = req.query;

    let query = `
      SELECT sl.*, p.name as product_name, p.sku, u.name as created_by_name
      FROM stock_logs sl
      JOIN products p ON sl.product_id = p.id
      JOIN users u ON sl.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (product_id) {
      query += ' AND sl.product_id = ?';
      params.push(product_id);
    }

    if (movement_type) {
      query += ' AND sl.movement_type = ?';
      params.push(movement_type);
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM stock_logs sl 
      WHERE 1=1 ${product_id ? 'AND sl.product_id = ?' : ''} ${movement_type ? 'AND sl.movement_type = ?' : ''}
    `;
    const [countRows]: any = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const offset = (Number(page) - 1) * Number(limit);
    query += ' ORDER BY sl.created_at DESC LIMIT ? OFFSET ?';
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
    return res.status(500).json({ success: false, message: error.message });
  }
};
