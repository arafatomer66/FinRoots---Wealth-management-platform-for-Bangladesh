import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { liabilitiesService } from './liabilities.service';
import { parsePagination } from '../../utils/pagination';

export class LiabilitiesController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await liabilitiesService.getAll(req.userId!, parsePagination(req))); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await liabilitiesService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await liabilitiesService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await liabilitiesService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await liabilitiesService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const liabilitiesController = new LiabilitiesController();
