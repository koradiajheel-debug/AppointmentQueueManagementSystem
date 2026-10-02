import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Prisma Query');
  });
}
