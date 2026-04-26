import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getFull(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await dashboardService.getFullDashboard(req.userId!);
      res.json(dashboard);
    } catch (err) {
      next(err);
    }
  }

  async getNetWorth(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getNetWorth(req.userId!)); } catch (err) { next(err); }
  }

  async getAllocation(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getAssetAllocation(req.userId!)); } catch (err) { next(err); }
  }

  async getMaturities(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getUpcomingMaturities(req.userId!)); } catch (err) { next(err); }
  }

  async getHealthScore(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getHealthScore(req.userId!)); } catch (err) { next(err); }
  }

  async getIncomeVsExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 6;
      res.json(await dashboardService.getIncomeVsExpense(req.userId!, months));
    } catch (err) { next(err); }
  }
}

export const dashboardController = new DashboardController();
