import { Router } from 'express';
import { taxController } from './tax.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/calculate', (req, res, next) => taxController.calculate(req, res, next));
router.get('/rebate-investment', (req, res, next) => taxController.getRebateInvestment(req, res, next));
router.get('/filings', (req, res, next) => taxController.getFilings(req, res, next));
router.post('/filings', (req, res, next) => taxController.saveFilings(req, res, next));

export default router;
