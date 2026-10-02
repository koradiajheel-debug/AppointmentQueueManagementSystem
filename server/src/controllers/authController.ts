import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
import { RegisterSchema, LoginSchema, AdminLoginSchema } from '@queuesmart/shared';

export const registerCustomer = async (req: Request, res: Response) => {
  const input = RegisterSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: { message: 'An account with this email already exists.', code: 'EMAIL_EXISTS' },
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: UserRole.CITIZEN,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token hash
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  return res.status(201).json({
    success: true,
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    },
  });
};

export const loginCustomer = async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.emailOrPhone }, { phone: input.emailOrPhone }],
    },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email/phone or password.', code: 'INVALID_CREDENTIALS' },
    });
  }

  // Reject admin/staff users logging in via citizen endpoint
  if (user.role !== UserRole.CITIZEN) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Staff and Admin accounts must login via the dedicated Admin Console.',
        code: 'ROLE_MISMATCH',
      },
    });
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email/phone or password.', code: 'INVALID_CREDENTIALS' },
    });
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  return res.json({
    success: true,
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
};

export const loginAdmin = async (req: Request, res: Response) => {
  const input = AdminLoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid admin credentials.', code: 'INVALID_CREDENTIALS' },
    });
  }

  // Strictly reject CITIZEN tokens on admin login
  if (user.role === UserRole.CITIZEN) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden: Citizen accounts cannot access the Staff and Admin Console.',
        code: 'FORBIDDEN_PORTAL',
      },
    });
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid admin credentials.', code: 'INVALID_CREDENTIALS' },
    });
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
  });

  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  return res.json({
    success: true,
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
        createdAt: user.createdAt,
      },
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: 'Refresh token is required.', code: 'MISSING_REFRESH_TOKEN' },
    });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found or logged out.', code: 'UNAUTHORIZED' },
    });
  }

  const isMatching = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isMatching) {
    return res.status(401).json({
      success: false,
      error: { message: 'Revoked refresh token.', code: 'TOKEN_REVOKED' },
    });
  }

  const newTokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
  });

  const newHash = await bcrypt.hash(newTokens.refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newHash },
  });

  return res.json({
    success: true,
    data: {
      token: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    },
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      organizationId: true,
      branchId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found', code: 'USER_NOT_FOUND' },
    });
  }

  return res.json({
    success: true,
    data: user,
  });
};

export const logout = async (req: Request, res: Response) => {
  if (req.user?.userId) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshTokenHash: null },
    });
  }
  return res.json({ success: true, data: { loggedOut: true } });
};

export { refreshToken as refreshAccessToken };

