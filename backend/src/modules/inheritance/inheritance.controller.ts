import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { inheritanceService } from './inheritance.service';

export class InheritanceController {
  async calculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inheritanceService.calculate(req.userId!, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getEstateValue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const total = await inheritanceService.getEstateValue(req.userId!);
      res.json({ estateValue: total });
    } catch (err) {
      next(err);
    }
  }

  async getPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await inheritanceService.getPlans(req.userId!)); } catch (err) { next(err); }
  }

  async getPlanById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await inheritanceService.getPlanById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }

  async savePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await inheritanceService.savePlan(req.userId!, req.body)); } catch (err) { next(err); }
  }

  async deletePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try { await inheritanceService.deletePlan(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const inheritanceController = new InheritanceController();
