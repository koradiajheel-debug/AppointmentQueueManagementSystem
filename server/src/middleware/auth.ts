import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string | null;
  branchId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateTokens(payload: AuthUserPayload) {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. No token provided.', code: 'UNAUTHORIZED' },
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired access token.', code: 'TOKEN_EXPIRED' },
    });
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.', code: 'UNAUTHORIZED' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden: role '${req.user.role}' is not authorized for this resource.`,
          code: 'FORBIDDEN_ROLE',
        },
      });
    }

    next();
  };
};
