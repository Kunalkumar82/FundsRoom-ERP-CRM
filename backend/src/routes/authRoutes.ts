import { Router } from 'express';
import { login, register, getMe, listUsers } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public auth routes
router.post('/login', login);
router.post('/register', register);

// Authenticated session route
router.get('/me', authenticateToken, getMe);

// Admin-only user list route
router.get('/users', authenticateToken, requireRole(['Admin']), listUsers);

export default router;
