import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Customer CRM Controller
 */

// List customers with search, status & type filter, pagination
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR business_name LIKE ? OR mobile LIKE ? OR email LIKE ? OR gst_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows]: any = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Apply pagination
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
    console.error('Error fetching customers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Customer By ID
export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Customer
export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { name, mobile, email, business_name, gst_number, type, address, status, follow_up_date, notes } = req.body;

  if (!name || !mobile || !email || !business_name || !address) {
    return res.status(400).json({
      success: false,
      message: 'Name, mobile, email, business name, and address are required.'
    });
  }

  try {
    const [result]: any = await pool.query(
      `INSERT INTO customers (name, mobile, email, business_name, gst_number, type, address, status, follow_up_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        mobile,
        email,
        business_name,
        gst_number || null,
        type || 'Retail',
        address,
        status || 'Lead',
        follow_up_date || null,
        notes || null
      ]
    );

    const newCustomerId = result.insertId;
    const [newCustomer]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [newCustomerId]);

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: newCustomer[0]
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Customer
export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, mobile, email, business_name, gst_number, type, address, status, follow_up_date, notes } = req.body;

  try {
    const [existing]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(
      `UPDATE customers 
       SET name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?, type = ?, address = ?, status = ?, follow_up_date = ?, notes = ?
       WHERE id = ?`,
      [
        name ?? existing[0].name,
        mobile ?? existing[0].mobile,
        email ?? existing[0].email,
        business_name ?? existing[0].business_name,
        gst_number ?? existing[0].gst_number,
        type ?? existing[0].type,
        address ?? existing[0].address,
        status ?? existing[0].status,
        follow_up_date ?? existing[0].follow_up_date,
        notes ?? existing[0].notes,
        id
      ]
    );

    const [updated]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Customer updated successfully.',
      data: updated[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Append Follow-up Note to Customer
export const appendFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { new_note, follow_up_date } = req.body;

  if (!new_note) {
    return res.status(400).json({ success: false, message: 'Note text is required.' });
  }

  try {
    const [existing]: any = await pool.query('SELECT notes FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const timestamp = new Date().toLocaleString();
    const formattedNote = `[${timestamp} - ${req.user?.name || 'User'}]: ${new_note}`;
    const updatedNotes = existing[0].notes ? `${existing[0].notes}\n${formattedNote}` : formattedNote;

    await pool.query(
      'UPDATE customers SET notes = ?, follow_up_date = COALESCE(?, follow_up_date) WHERE id = ?',
      [updatedNotes, follow_up_date || null, id]
    );

    const [updated]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Follow-up note appended successfully.',
      data: updated[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
