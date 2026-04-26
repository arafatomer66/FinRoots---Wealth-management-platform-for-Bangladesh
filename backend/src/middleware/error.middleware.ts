import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'APP_ERROR',
    });
    return;
  }

  // Handle JSON parsing errors and payload too large
  const errWithType = err as Error & { type?: string; status?: number };
  if (errWithType.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON in request body', code: 'INVALID_JSON' });
    return;
  }
  if (errWithType.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' });
    return;
  }

  // Log unexpected errors with request context
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}
