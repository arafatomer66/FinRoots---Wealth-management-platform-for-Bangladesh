import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { budgetsService } from './budgets.service';

class BudgetsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
      const result = await budgetsService.getAll(req.userId!, year, month);
      res.json({ data: result });
    } catch (err) { next(err); }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
      const result = await budgetsService.getSummary(req.userId!, year, month);
      res.json(result);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await budgetsService.create(req.userId!, req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await budgetsService.update(req.userId!, Number(req.params.id), req.body);
      res.json(result);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await budgetsService.delete(req.userId!, Number(req.params.id));
      res.json({ message: 'Budget deleted' });
    } catch (err) { next(err); }
  }
}

export const budgetsController = new BudgetsController();
