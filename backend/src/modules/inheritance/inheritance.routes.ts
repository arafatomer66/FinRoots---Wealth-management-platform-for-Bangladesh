import { Router } from 'express';
import { inheritanceController } from './inheritance.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/calculate', (req, res, next) => inheritanceController.calculate(req, res, next));
router.get('/estate-value', (req, res, next) => inheritanceController.getEstateValue(req, res, next));
router.get('/plans', (req, res, next) => inheritanceController.getPlans(req, res, next));
router.get('/plans/:id', (req, res, next) => inheritanceController.getPlanById(req, res, next));
router.post('/plans', (req, res, next) => inheritanceController.savePlan(req, res, next));
router.delete('/plans/:id', (req, res, next) => inheritanceController.deletePlan(req, res, next));

export default router;
