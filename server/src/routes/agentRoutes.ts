import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/run-workflow', (req, res) => agentController.runWorkflow(req as any, res));
router.get('/reports', (req, res) => agentController.getReports(req as any, res));
router.get('/reports/:id', (req, res) => agentController.getReportById(req as any, res));

export default router;
