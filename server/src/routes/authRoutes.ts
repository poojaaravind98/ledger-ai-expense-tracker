import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authMiddleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRequest(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validateRequest(loginSchema), (req, res) => authController.login(req, res));
router.get('/profile', requireAuth, (req, res) => authController.getProfile(req as any, res));
router.put('/profile', requireAuth, validateRequest(updateProfileSchema), (req, res) => authController.updateProfile(req as any, res));

export default router;
