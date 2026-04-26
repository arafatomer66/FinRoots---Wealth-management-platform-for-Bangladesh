import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { zakatService } from './zakat.service';

export class ZakatController {
  async calculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { goldPricePerGram, silverPricePerGram } = req.body;

      if (!goldPricePerGram || !silverPricePerGram) {
        res.status(400).json({ error: 'Gold and silver prices per gram (BDT) are required' });
        return;
      }

      const result = await zakatService.calculate(req.userId!, goldPricePerGram, silverPricePerGram);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const zakatController = new ZakatController();
