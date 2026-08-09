import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs
} from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All authenticated roles can view products & stock logs
router.get('/', getProducts);
router.get('/logs', getStockLogs);
router.get('/:id', getProductById);

// Admin, Warehouse can create/edit products and adjust inventory
router.post('/', requireRole(['Admin', 'Warehouse']), createProduct);
router.put('/:id', requireRole(['Admin', 'Warehouse']), updateProduct);
router.post('/:id/adjust-stock', requireRole(['Admin', 'Warehouse', 'Sales']), adjustStock);

export default router;
