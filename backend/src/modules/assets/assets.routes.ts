import { Router } from 'express';
import { assetsController } from './assets.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { assetValidation } from '../../utils/validators';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => assetsController.getAll(req, res, next));
router.get('/summary', (req, res, next) => assetsController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => assetsController.getById(req, res, next));
router.post('/', assetValidation, validate, (req, res, next) => assetsController.create(req, res, next));
router.put('/:id', (req, res, next) => assetsController.update(req, res, next));
router.delete('/:id', (req, res, next) => assetsController.delete(req, res, next));

export default router;
