import { Router } from 'express';
import { investmentsController } from './investments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => investmentsController.getAll(req, res, next));
router.get('/summary', (req, res, next) => investmentsController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => investmentsController.getById(req, res, next));
router.post('/', (req, res, next) => investmentsController.create(req, res, next));
router.put('/:id', (req, res, next) => investmentsController.update(req, res, next));
router.put('/:id/price', (req, res, next) => investmentsController.updatePrice(req, res, next));
router.delete('/:id', (req, res, next) => investmentsController.delete(req, res, next));

export default router;
