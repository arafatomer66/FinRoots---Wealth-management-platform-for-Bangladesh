import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { incomeService } from './income.service';
import { parsePagination } from '../../utils/pagination';

export class IncomeController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await incomeService.getAll(req.userId!, parsePagination(req))); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await incomeService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await incomeService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await incomeService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await incomeService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const incomeController = new IncomeController();
