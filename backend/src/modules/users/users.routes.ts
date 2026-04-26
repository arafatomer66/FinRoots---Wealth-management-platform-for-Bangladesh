import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { profileValidation } from '../../utils/validators';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

router.get('/profile', authMiddleware, (req, res, next) => usersController.getProfile(req, res, next));
router.put('/profile', authMiddleware, profileValidation, validate, (req, res, next) => usersController.updateProfile(req, res, next));

export default router;
