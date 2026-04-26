import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.middleware';
import { recurringService } from './recurring.service';

const router = Router();
router.use(authMiddleware);

router.get('/upcoming', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await recurringService.getUpcoming(req.userId!)); }
  catch (err) { next(err); }
});

router.post('/process', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await recurringService.processdue(req.userId!)); }
  catch (err) { next(err); }
});

router.put('/income/:id/toggle', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.toggleRecurring('income', req.userId!, Number(req.params.id), req.body.is_recurring);
    res.json(result);
  } catch (err) { next(err); }
});

router.put('/expense/:id/toggle', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.toggleRecurring('expenses', req.userId!, Number(req.params.id), req.body.is_recurring);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
