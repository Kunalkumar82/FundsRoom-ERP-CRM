import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { User, JWTPayload, UserRole } from '../types';
import { initializeDatabase } from '../db/initDb';
import { seedDatabase } from '../db/seedDb';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_mini_erp_crm_key_2026';

/**
 * Self-healing helper: Ensures MySQL tables exist and demo users are seeded
 */
const ensureDatabaseReady = async () => {
  try {
    console.log('⚡ Self-healing: Initializing and Seeding MySQL database...');
    await initializeDatabase();
    await seedDatabase();
  } catch (err) {
    console.error('Self-healing DB error:', err);
  }
};

/**
 * Auth Controller: User Register, Login & Session Info
 */

// User Registration API
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role = 'Sales' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required for registration.'
    });
  }

  const validRoles: UserRole[] = ['Admin', 'Sales', 'Warehouse', 'Accounts'];
  const userRole: UserRole = validRoles.includes(role) ? role : 'Sales';

  try {
    let existingUsers: any;
    try {
      const [rows]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      existingUsers = rows;
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_NO_SUCH_TABLE' || dbErr.message?.includes("doesn't exist")) {
        await ensureDatabaseReady();
        const [rows]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        existingUsers = rows;
      } else {
        throw dbErr;
      }
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${email}" already exists.`
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'Active')",
      [name, email, passwordHash, userRole]
    );

    const userId = result.insertId;

    const payload: JWTPayload = {
      userId,
      email,
      name,
      role: userRole
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      success: true,
      message: 'User account registered successfully in MySQL database.',
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          role: userRole
        }
      }
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during user registration.',
      error: error.message
    });
  }
};

// User Login API
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  try {
    let rows: any;
    try {
      const [result]: any = await pool.query(
        "SELECT * FROM users WHERE email = ? AND status = 'Active'",
        [email]
      );
      rows = result;
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_NO_SUCH_TABLE' || dbErr.message?.includes("doesn't exist")) {
        await ensureDatabaseReady();
        const [result]: any = await pool.query(
          "SELECT * FROM users WHERE email = ? AND status = 'Active'",
          [email]
        );
        rows = result;
      } else {
        throw dbErr;
      }
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user: User = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    let msg = 'Internal server error during authentication.';
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      msg = `MySQL Database Error: Access denied for user '${process.env.DB_USER || 'root'}'. Please update DB_PASSWORD in backend/.env with your MySQL root password.`;
    } else if (error.code === 'ECONNREFUSED') {
      msg = `MySQL Database Error: Cannot connect to MySQL server at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}. Please ensure MySQL service is started.`;
    } else if (error.message) {
      msg = `Database Error: ${error.message}`;
    }
    return res.status(500).json({
      success: false,
      message: msg,
      error: error.message
    });
  }
};

/**
 * Get current logged in user details
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * List users (Admin restricted)
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY name ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
