import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import assetRoutes from './modules/assets/assets.routes';
import liabilityRoutes from './modules/liabilities/liabilities.routes';
import incomeRoutes from './modules/income/income.routes';
import expenseRoutes from './modules/expenses/expenses.routes';
import familyRoutes from './modules/family/family.routes';
import inheritanceRoutes from './modules/inheritance/inheritance.routes';
import taxRoutes from './modules/tax/tax.routes';
import zakatRoutes from './modules/zakat/zakat.routes';
import goalRoutes from './modules/goals/goals.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import budgetRoutes from './modules/budgets/budgets.routes';
import documentRoutes from './modules/documents/documents.routes';
import exportRoutes from './modules/export/export.routes';
import recurringRoutes from './modules/recurring/recurring.routes';

dotenv.config({ path: '../.env' });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Rate limiting - general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply rate limiters
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api', apiLimiter);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/inheritance', inheritanceRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/zakat', zakatRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/recurring', recurringRoutes);

// Health check (no rate limit)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'finroots-api', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

export default app;
