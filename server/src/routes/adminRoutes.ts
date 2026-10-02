import { Router } from 'express';
import {
  getCounters,
  updateCounter,
  callNext,
  skipTicket,
  recallTicket,
  transferTicket,
  reorderQueue,
  walkinRegistration,
} from '../controllers/adminQueueController';
import {
  createService,
  updateService,
  deleteService,
  createCounter,
  deleteCounter,
  createStaff,
  getBranchStaff,
  updateScheduleConfig,
  bulkReschedule,
} from '../controllers/adminScheduleController';
import {
  getAnalytics,
  simulateQueue,
  getSystemHealth,
  getAuditLogs,
} from '../controllers/adminAnalyticsController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect ALL admin routes: require authentication and role STAFF or ADMIN
router.use(authenticate, requireRole(UserRole.STAFF, UserRole.ADMIN));

// 1. Counter & Queue Operations (STAFF & ADMIN)
router.get('/counters', getCounters);
router.patch('/counters/:counterId', updateCounter);
router.post('/counters', createCounter);
router.delete('/counters/:counterId', deleteCounter);

router.post('/queue/call-next', callNext);
router.post('/queue/skip', skipTicket);
router.post('/queue/recall', recallTicket);
router.post('/queue/transfer', transferTicket);
router.post('/queue/reorder', reorderQueue);
router.post('/queue/walkin', walkinRegistration);

// 2. Service Management (ADMIN only)
router.post('/services', requireRole(UserRole.ADMIN), createService);
router.patch('/services/:serviceId', requireRole(UserRole.ADMIN), updateService);
router.delete('/services/:serviceId', requireRole(UserRole.ADMIN), deleteService);

// 3. Staff Management (ADMIN only)
router.post('/staff', requireRole(UserRole.ADMIN), createStaff);
router.get('/staff', getBranchStaff);

// 4. Schedule & Rescheduling (STAFF & ADMIN)
router.post('/schedule/config', requireRole(UserRole.ADMIN), updateScheduleConfig);
router.post('/schedule/bulk-reschedule', requireRole(UserRole.ADMIN), bulkReschedule);

// 5. Analytics, Simulation & Diagnostics (STAFF & ADMIN)
router.get('/analytics', getAnalytics);
router.post('/simulate', simulateQueue);
router.get('/system-health', getSystemHealth);
router.get('/audit-logs', requireRole(UserRole.ADMIN), getAuditLogs);


export default router;
