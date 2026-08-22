import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/overview', (req, res) => dashboardController.getOverview(req as any, res));

export default router;
