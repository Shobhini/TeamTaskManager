import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboard';

const router = Router();

router.get('/', authMiddleware, getDashboard);

export default router;
