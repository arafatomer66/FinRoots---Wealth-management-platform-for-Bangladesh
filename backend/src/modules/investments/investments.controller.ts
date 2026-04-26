import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { investmentsService } from './investments.service';

export class InvestmentsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investmentsService.getAll(req.userId!)); } catch (err) { next(err); }
  }
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investmentsService.getSummary(req.userId!)); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investmentsService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await investmentsService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investmentsService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async updatePrice(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investmentsService.updatePrice(req.userId!, Number(req.params.id), Number(req.body.current_price))); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await investmentsService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
}

export const investmentsController = new InvestmentsController();
