import { Router } from 'express';
import { receiptController } from '../controllers/receiptController';
import { requireAuth } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/upload', upload.single('receipt'), (req, res) => receiptController.uploadReceipt(req as any, res));
router.get('/', (req, res) => receiptController.getReceipts(req as any, res));
router.get('/:id', (req, res) => receiptController.getReceiptById(req as any, res));
router.delete('/:id', (req, res) => receiptController.deleteReceipt(req as any, res));
router.patch('/:id/invalid', receiptController.markInvalidReceipt);

export default router;
