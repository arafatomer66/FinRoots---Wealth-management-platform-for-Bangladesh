import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentsController } from './documents.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const uploadDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Allowed: PDF, JPG, PNG, DOC, XLS'));
    }
  },
});

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => documentsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => documentsController.getById(req, res, next));
router.get('/:id/download', (req, res, next) => documentsController.download(req, res, next));
router.post('/', upload.single('file'), (req, res, next) => documentsController.upload(req, res, next));
router.put('/:id', (req, res, next) => documentsController.update(req, res, next));
router.delete('/:id', (req, res, next) => documentsController.delete(req, res, next));

export default router;
