import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.middleware';
import { exportService } from './export.service';

const router = Router();
router.use(authMiddleware);

function sendCsv(res: Response, csv: string, filename: string) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

router.get('/assets', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { sendCsv(res, await exportService.getAssetsCsv(req.userId!), 'finroots-assets.csv'); }
  catch (err) { next(err); }
});

router.get('/income', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { sendCsv(res, await exportService.getIncomeCsv(req.userId!), 'finroots-income.csv'); }
  catch (err) { next(err); }
});

router.get('/expenses', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { sendCsv(res, await exportService.getExpensesCsv(req.userId!), 'finroots-expenses.csv'); }
  catch (err) { next(err); }
});

router.get('/liabilities', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { sendCsv(res, await exportService.getLiabilitiesCsv(req.userId!), 'finroots-liabilities.csv'); }
  catch (err) { next(err); }
});

router.get('/full-report', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { sendCsv(res, await exportService.getFullReportCsv(req.userId!), 'finroots-full-report.csv'); }
  catch (err) { next(err); }
});

export default router;
