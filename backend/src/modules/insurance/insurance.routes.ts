import { Router } from 'express';
import { insuranceController } from './insurance.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => insuranceController.getAll(req, res, next));
router.get('/summary', (req, res, next) => insuranceController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => insuranceController.getById(req, res, next));
router.post('/', (req, res, next) => insuranceController.create(req, res, next));
router.put('/:id', (req, res, next) => insuranceController.update(req, res, next));
router.delete('/:id', (req, res, next) => insuranceController.delete(req, res, next));

export default router;
