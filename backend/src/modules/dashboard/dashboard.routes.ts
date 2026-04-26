import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => dashboardController.getFull(req, res, next));
router.get('/net-worth', (req, res, next) => dashboardController.getNetWorth(req, res, next));
router.get('/allocation', (req, res, next) => dashboardController.getAllocation(req, res, next));
router.get('/maturities', (req, res, next) => dashboardController.getMaturities(req, res, next));
router.get('/health-score', (req, res, next) => dashboardController.getHealthScore(req, res, next));
router.get('/income-vs-expense', (req, res, next) => dashboardController.getIncomeVsExpense(req, res, next));

export default router;
