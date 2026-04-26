import { Router } from 'express';
import { goalsController } from './goals.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => goalsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => goalsController.getById(req, res, next));
router.post('/', (req, res, next) => goalsController.create(req, res, next));
router.put('/:id', (req, res, next) => goalsController.update(req, res, next));
router.delete('/:id', (req, res, next) => goalsController.delete(req, res, next));

export default router;
