import { Router } from 'express';
import { getAvailableSlots } from '../controllers/appointmentController';
import { getCrowdForecast } from '../controllers/branchServiceController';

const router = Router();

router.get('/', getAvailableSlots);
router.get('/crowd-forecast', getCrowdForecast);

export default router;
