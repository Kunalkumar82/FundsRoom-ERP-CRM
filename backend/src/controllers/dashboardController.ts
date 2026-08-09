import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Dashboard Controller: Analytics & Operations KPI Summary
 */
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Customer KPIs
    const [custStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_customers,
        SUM(CASE WHEN status = 'Lead' THEN 1 ELSE 0 END) as lead_customers
      FROM customers
    `);

    // 2. Product KPIs
    const [prodStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN current_stock <= min_stock_alert_qty THEN 1 ELSE 0 END) as low_stock_alerts,
        SUM(current_stock) as total_stock_quantity
      FROM products
    `);

    // 3. Sales Challan KPIs
    const [challanStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_challans,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_challans,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_challans,
        COALESCE(SUM(CASE WHEN status = 'Confirmed' THEN total_amount ELSE 0 END), 0) as total_confirmed_revenue
      FROM sales_challans
    `);

    // 4. Low Stock Products Warning List
    const [lowStockProducts]: any = await pool.query(`
      SELECT id, sku, name, category, current_stock, min_stock_alert_qty, location
      FROM products
      WHERE current_stock <= min_stock_alert_qty
      ORDER BY current_stock ASC
      LIMIT 5
    `);

    // 5. Recent Sales Challans
    const [recentChallans]: any = await pool.query(`
      SELECT sc.id, sc.challan_number, sc.status, sc.total_amount, sc.created_at, c.name as customer_name
      FROM sales_challans sc
      JOIN customers c ON sc.customer_id = c.id
      ORDER BY sc.created_at DESC
      LIMIT 5
    `);

    // 6. Recent Stock Movements
    const [recentStockLogs]: any = await pool.query(`
      SELECT sl.id, sl.qty_changed, sl.movement_type, sl.reason, sl.created_at, p.name as product_name, p.sku
      FROM stock_logs sl
      JOIN products p ON sl.product_id = p.id
      ORDER BY sl.created_at DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      data: {
        customers: custStats[0],
        products: prodStats[0],
        challans: challanStats[0],
        lowStockProducts,
        recentChallans,
        recentStockLogs
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
