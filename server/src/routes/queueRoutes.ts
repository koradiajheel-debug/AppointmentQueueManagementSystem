import { Router } from 'express';
import { joinQueue, getTicketStatus, leaveQueue } from '../controllers/queueController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/join', optionalAuth, joinQueue);
router.get('/ticket/:ticketId', getTicketStatus);
router.post('/ticket/:ticketId/leave', optionalAuth, leaveQueue);

export default router;
