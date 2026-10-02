import { Router } from 'express';
import {
  getBranches,
  getBranchById,
  calculateTravelTime,
  registerDeviceToken,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchServiceController';
import { optionalAuth, authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', getBranches);
router.post('/', createBranch);
router.get('/travel-time', calculateTravelTime);
router.get('/:branchId', getBranchById);
router.patch('/:branchId', updateBranch);
router.delete('/:branchId', deleteBranch);
router.post('/device-token', optionalAuth, registerDeviceToken);

export default router;
