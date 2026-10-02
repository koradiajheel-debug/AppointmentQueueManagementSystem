import 'express-async-errors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { pinoHttpMiddleware } from './lib/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';
import { isRedisReady } from './lib/redis';
import routes from './routes';
import { swaggerDocument } from './docs/swagger';

export const app = express();

// Trust reverse proxy (Railway, Render, Nginx)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local development
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - limited to the two portal URLs
const allowedOrigins = [
  env.CUSTOMER_URL,
  env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed))) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured logging with Pino and unique request IDs
app.use(pinoHttpMiddleware);

// Global API rate limiter
app.use('/api', apiLimiter);

// Liveness probe (/health)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

// Readiness probe (/ready)
app.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check DB readiness
    await prisma.$queryRaw`SELECT 1`;
    const isReady = isRedisReady();

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      redis: isReady ? 'CONNECTED' : 'FALLBACK_READY',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'NOT_READY',
      error: error.message || 'Service dependency check failed',
    });
  }
});

// Swagger OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API v1
app.use('/api/v1', routes);

// 404 Route handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.baseUrl || req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Global Error Handler
app.use(errorHandler);
