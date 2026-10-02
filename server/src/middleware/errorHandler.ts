import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(
    {
      err,
      url: req.url,
      method: req.method,
      requestId: req.id,
      body: req.body,
    },
    'Global Error Handler caught an exception'
  );

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed for input data',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A resource with this unique identifier already exists.',
          code: 'CONFLICT',
          details: err.meta,
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Requested record was not found.',
          code: 'NOT_FOUND',
        },
      });
    }
  }

  // Fallback 500
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_SERVER_ERROR',
    },
  });
}
