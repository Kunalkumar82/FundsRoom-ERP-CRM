import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus
} from '../controllers/challanController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All roles can view sales challans
router.get('/', getChallans);
router.get('/:id', getChallanById);

// Admin, Sales can create challans
router.post('/', requireRole(['Admin', 'Sales']), createChallan);

// Admin, Sales, Warehouse, Accounts can update challan status (e.g. Confirm draft)
router.put('/:id/status', requireRole(['Admin', 'Sales', 'Warehouse', 'Accounts']), updateChallanStatus);

export default router;
