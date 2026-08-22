import { Router } from 'express';
import authRoutes from './authRoutes';
import expenseRoutes from './expenseRoutes';
import budgetRoutes from './budgetRoutes';
import receiptRoutes from './receiptRoutes';
import chatRoutes from './chatRoutes';
import agentRoutes from './agentRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/receipts', receiptRoutes);
router.use('/chat', chatRoutes);
router.use('/agents', agentRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Ledger API',
    version: '1.0.0',
  });
});

export default router;
