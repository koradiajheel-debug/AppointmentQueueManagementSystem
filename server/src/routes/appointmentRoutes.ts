import { Router } from 'express';
import {
  createAppointment,
  cancelAppointment,
  swapAppointment,
  getAppointments,
  getAppointmentById,
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/', authenticate, getAppointments);
router.get('/:appointmentId', authenticate, getAppointmentById);
router.post('/:appointmentId/cancel', authenticate, cancelAppointment);
router.post('/:appointmentId/swap', authenticate, swapAppointment);

export default router;
