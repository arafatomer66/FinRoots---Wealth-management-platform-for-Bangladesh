import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { taxService } from './tax.service';

export class TaxController {
  async calculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { totalIncome, taxpayer, totalInvestment } = req.body;
      const result = taxService.calculateTax(totalIncome, taxpayer, totalInvestment);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getRebateInvestment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const total = await taxService.getRebateEligibleInvestment(req.userId!);
      res.json({ rebateEligibleInvestment: total });
    } catch (err) {
      next(err);
    }
  }

  async saveFilings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filing = await taxService.saveTaxFiling(req.userId!, req.body);
      res.status(201).json(filing);
    } catch (err) {
      next(err);
    }
  }

  async getFilings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filings = await taxService.getTaxFilings(req.userId!);
      res.json(filings);
    } catch (err) {
      next(err);
    }
  }
}

export const taxController = new TaxController();
