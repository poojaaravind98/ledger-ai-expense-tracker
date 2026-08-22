import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expenseValidator';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => expenseController.getExpenses(req as any, res));
router.get('/categories', (req, res) => expenseController.getCategories(req as any, res));
router.post('/categories', (req, res) => expenseController.createCategory(req as any, res));
router.get('/:id', (req, res) => expenseController.getExpenseById(req as any, res));
router.post('/', validateRequest(createExpenseSchema), (req, res) => expenseController.createExpense(req as any, res));
router.put('/:id', validateRequest(updateExpenseSchema), (req, res) => expenseController.updateExpense(req as any, res));
router.delete('/:id', (req, res) => expenseController.deleteExpense(req as any, res));

export default router;
