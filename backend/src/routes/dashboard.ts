import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({ tasks: [] });
});

export default router;
