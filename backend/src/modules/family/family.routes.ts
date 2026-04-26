import { Router } from 'express';
import { familyController } from './family.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { familyMemberValidation } from '../../utils/validators';
import { validate } from '../../middleware/validation.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => familyController.getAll(req, res, next));
router.get('/nominees', (req, res, next) => familyController.getNominees(req, res, next));
router.get('/minors', (req, res, next) => familyController.getMinors(req, res, next));
router.get('/:id', (req, res, next) => familyController.getById(req, res, next));
router.post('/', familyMemberValidation, validate, (req, res, next) => familyController.create(req, res, next));
router.put('/:id', (req, res, next) => familyController.update(req, res, next));
router.delete('/:id', (req, res, next) => familyController.delete(req, res, next));

export default router;
