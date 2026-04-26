import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { expensesService } from './expenses.service';
import { parsePagination } from '../../utils/pagination';

export class ExpensesController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await expensesService.getAll(req.userId!, parsePagination(req))); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await expensesService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await expensesService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await expensesService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await expensesService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const expensesController = new ExpensesController();
