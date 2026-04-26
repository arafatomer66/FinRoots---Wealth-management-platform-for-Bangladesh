import { Router } from 'express';
import { liabilitiesController } from './liabilities.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => liabilitiesController.getAll(req, res, next));
router.get('/:id', (req, res, next) => liabilitiesController.getById(req, res, next));
router.post('/', (req, res, next) => liabilitiesController.create(req, res, next));
router.put('/:id', (req, res, next) => liabilitiesController.update(req, res, next));
router.delete('/:id', (req, res, next) => liabilitiesController.delete(req, res, next));

export default router;
