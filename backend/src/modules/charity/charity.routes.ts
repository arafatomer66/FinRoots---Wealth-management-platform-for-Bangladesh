import { Router } from 'express';
import { charityController } from './charity.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => charityController.getAll(req, res, next));
router.get('/summary', (req, res, next) => charityController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => charityController.getById(req, res, next));
router.post('/', (req, res, next) => charityController.create(req, res, next));
router.put('/:id', (req, res, next) => charityController.update(req, res, next));
router.delete('/:id', (req, res, next) => charityController.delete(req, res, next));

export default router;
