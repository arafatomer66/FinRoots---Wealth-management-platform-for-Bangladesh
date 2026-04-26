import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { assetsService } from './assets.service';
import { parsePagination } from '../../utils/pagination';

export class AssetsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req);
      const result = await assetsService.getAll(req.userId!, {
        asset_type: req.query.asset_type as string,
        status: req.query.status as string,
      }, pagination);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetsService.getById(req.userId!, Number(req.params.id));
      res.json(asset);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetsService.create(req.userId!, req.body);
      res.status(201).json(asset);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetsService.update(req.userId!, Number(req.params.id), req.body);
      res.json(asset);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assetsService.delete(req.userId!, Number(req.params.id));
      res.json({ message: 'Asset deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await assetsService.getSummary(req.userId!);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }
}

export const assetsController = new AssetsController();
