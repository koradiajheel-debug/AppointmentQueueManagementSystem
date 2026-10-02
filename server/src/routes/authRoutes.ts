import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  refreshAccessToken,
  getCurrentUser,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, registerCustomer);
router.post('/login', authLimiter, loginCustomer);
router.post('/admin-login', authLimiter, loginAdmin);
router.post('/refresh', refreshAccessToken);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
