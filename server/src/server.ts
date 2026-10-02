import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { connectRedis, disconnectRedis } from './lib/redis';
import { initSocketServer } from './socket/socketHandler';

const server = http.createServer(app);

// Initialize Socket.IO server
initSocketServer(server);

// Start server
async function startServer() {
  try {
    // Attempt Redis connection
    await connectRedis();

    // Verify Prisma connection
    try {
      await prisma.$connect();
      logger.info('Connected to PostgreSQL via Prisma');
    } catch (dbErr: any) {
      if (env.NODE_ENV === 'production') {
        throw dbErr;
      }
      logger.warn(
        '⚠️ [Prisma] Could not connect to PostgreSQL. Endpoints requiring database will fail until DATABASE_URL is configured. Server is continuing in local development mode.'
      );
    }

    const PORT = env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`QueueSmart Backend Server running in [${env.NODE_ENV}] mode on port ${PORT}`);
      logger.info(`REST API base URL: http://localhost:${PORT}/api/v1`);
      logger.info(`Swagger API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Readiness probe: http://localhost:${PORT}/ready`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful Shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await disconnectRedis();
      logger.info('Redis disconnected.');

      await prisma.$disconnect();
      logger.info('Prisma disconnected.');

      logger.info('Graceful shutdown completed.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forcefully terminating server after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
