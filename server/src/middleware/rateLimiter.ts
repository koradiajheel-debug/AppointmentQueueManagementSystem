import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/register requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please slow down.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const authLimiter = authRateLimiter;
export const apiLimiter = apiRateLimiter;

