import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidator';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => budgetController.getBudgets(req as any, res));
router.post('/', validateRequest(createBudgetSchema), (req, res) => budgetController.createBudget(req as any, res));
router.put('/:id', validateRequest(updateBudgetSchema), (req, res) => budgetController.updateBudget(req as any, res));
router.delete('/:id', (req, res) => budgetController.deleteBudget(req as any, res));

export default router;
