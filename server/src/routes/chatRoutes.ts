import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { sendChatMessageSchema } from '../validators/chatValidator';

const router = Router();

router.use(requireAuth);

router.post('/message', validateRequest(sendChatMessageSchema), (req, res) => chatController.sendMessage(req as any, res));
router.get('/history', (req, res) => chatController.getChatHistory(req as any, res));
router.delete('/history', (req, res) => chatController.clearChatHistory(req as any, res));

export default router;
