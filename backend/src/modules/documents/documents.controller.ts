import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { documentsService } from './documents.service';
import { AppError } from '../../middleware/error.middleware';

class DocumentsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const docs = await documentsService.getAll(req.userId!);
      res.json({ data: docs });
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.getById(req.userId!, Number(req.params.id));
      res.json(doc);
    } catch (err) { next(err); }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) throw new AppError(400, 'No file uploaded');

      const doc = await documentsService.create(req.userId!, {
        title: req.body.title || file.originalname,
        file_path: file.path,
        file_type: file.mimetype,
        file_size: file.size,
        category: req.body.category || 'other',
        related_asset_id: req.body.related_asset_id || null,
        notes: req.body.notes || null,
      });

      res.status(201).json(doc);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, category, notes, related_asset_id } = req.body;
      const doc = await documentsService.update(req.userId!, Number(req.params.id), {
        title, category, notes, related_asset_id,
      });
      res.json(doc);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentsService.delete(req.userId!, Number(req.params.id));
      res.json({ message: 'Document deleted' });
    } catch (err) { next(err); }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.getById(req.userId!, Number(req.params.id));
      res.download(doc.file_path, doc.title);
    } catch (err) { next(err); }
  }
}

export const documentsController = new DocumentsController();
