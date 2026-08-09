import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  appendFollowUpNote
} from '../controllers/customerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All roles can view customer directory
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

// Admin, Sales, Accounts can create and edit customers
router.post('/', requireRole(['Admin', 'Sales', 'Accounts']), createCustomer);
router.put('/:id', requireRole(['Admin', 'Sales', 'Accounts']), updateCustomer);
router.post('/:id/notes', requireRole(['Admin', 'Sales', 'Accounts']), appendFollowUpNote);

export default router;
