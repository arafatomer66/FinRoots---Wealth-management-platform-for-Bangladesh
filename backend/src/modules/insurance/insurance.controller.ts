import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { insuranceService } from './insurance.service';

export class InsuranceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await insuranceService.getAll(req.userId!)); } catch (err) { next(err); }
  }
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await insuranceService.getSummary(req.userId!)); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await insuranceService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await insuranceService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await insuranceService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await insuranceService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const insuranceController = new InsuranceController();
