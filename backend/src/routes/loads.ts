import { Router } from 'express';
import { searchLoads, pickLoad, getActiveLoads } from '../controllers/loadsController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/search', searchLoads);
router.post('/pick/:id', authenticate, pickLoad);
router.get('/active', authenticate, getActiveLoads);
export default router;
