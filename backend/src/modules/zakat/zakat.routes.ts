import { Router } from 'express';
import { zakatController } from './zakat.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/calculate', (req, res, next) => zakatController.calculate(req, res, next));

export default router;
