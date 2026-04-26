import app from './app';
import db from './config/database';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.raw('SELECT 1');
    console.log('Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`FinRoots API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await db.destroy();
        console.log('Database pool closed');
        process.exit(0);
      });
      // Force exit after 10s if graceful shutdown fails
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
