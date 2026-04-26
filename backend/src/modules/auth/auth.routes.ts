import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { registerValidation, loginValidation } from '../../utils/validators';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', registerValidation, validate, (req, res, next) => authController.register(req, res, next));
router.post('/login', loginValidation, validate, (req, res, next) => authController.login(req, res, next));
router.post('/change-password', authMiddleware, (req, res, next) => authController.changePassword(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

export default router;
