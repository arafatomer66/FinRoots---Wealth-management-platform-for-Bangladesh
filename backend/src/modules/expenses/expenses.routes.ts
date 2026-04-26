import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => expensesController.getAll(req, res, next));
router.get('/:id', (req, res, next) => expensesController.getById(req, res, next));
router.post('/', (req, res, next) => expensesController.create(req, res, next));
router.put('/:id', (req, res, next) => expensesController.update(req, res, next));
router.delete('/:id', (req, res, next) => expensesController.delete(req, res, next));

export default router;
