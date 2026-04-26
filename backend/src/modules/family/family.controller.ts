import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { familyService } from './family.service';

export class FamilyController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await familyService.getAll(req.userId!)); } catch (err) { next(err); }
  }
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await familyService.getById(req.userId!, Number(req.params.id))); } catch (err) { next(err); }
  }
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await familyService.create(req.userId!, req.body)); } catch (err) { next(err); }
  }
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await familyService.update(req.userId!, Number(req.params.id), req.body)); } catch (err) { next(err); }
  }
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { await familyService.delete(req.userId!, Number(req.params.id)); res.json({ message: 'Deleted' }); } catch (err) { next(err); }
  }
  async getNominees(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await familyService.getNominees(req.userId!)); } catch (err) { next(err); }
  }
  async getMinors(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await familyService.getMinors(req.userId!)); } catch (err) { next(err); }
  }
}

export const familyController = new FamilyController();
