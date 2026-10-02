import { Router } from 'express';
import authRoutes from './authRoutes';
import branchRoutes from './branchRoutes';
import serviceRoutes from './serviceRoutes';
import slotRoutes from './slotRoutes';
import appointmentRoutes from './appointmentRoutes';
import queueRoutes from './queueRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/services', serviceRoutes);
router.use('/slots', slotRoutes);
router.use('/crowd-forecast', slotRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queue', queueRoutes);
router.use('/admin', adminRoutes);

export default router;
