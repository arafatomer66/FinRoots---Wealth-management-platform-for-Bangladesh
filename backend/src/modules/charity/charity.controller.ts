import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { charityService } from './charity.service';

export class CharityController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      res.json(await charityService.getAll(req.userId!, year));
    } catch (err) { next(err); }
  }
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      res.json(await charityService.getSummary(req.userId!, year));
    } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await charityService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await charityService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await charityService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await charityService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const charityController = new CharityController();
