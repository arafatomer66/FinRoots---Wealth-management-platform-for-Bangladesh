import { Router } from 'express';
import { budgetsController } from './budgets.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => budgetsController.getAll(req, res, next));
router.get('/summary', (req, res, next) => budgetsController.getSummary(req, res, next));
router.post('/', (req, res, next) => budgetsController.create(req, res, next));
router.put('/:id', (req, res, next) => budgetsController.update(req, res, next));
router.delete('/:id', (req, res, next) => budgetsController.delete(req, res, next));

export default router;
