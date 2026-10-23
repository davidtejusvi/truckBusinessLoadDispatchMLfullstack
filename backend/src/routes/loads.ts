import { Router } from 'express';
import {
    searchLoads,
    getLoadStats,
    getActiveLoads,
    pickLoad,
    getLoadById,
} from '../controllers/loadsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Specific named routes MUST come before /:id to prevent Express from
// treating 'search', 'stats', and 'active' as id params.
router.get('/search', searchLoads);
router.get('/stats', getLoadStats);
router.get('/active', authenticate, getActiveLoads);
router.post('/pick/:id', authenticate, pickLoad);
router.get('/:id', getLoadById);

export default router;
