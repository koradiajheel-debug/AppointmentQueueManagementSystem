import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcrypt';
import { generateTokens } from '../src/middleware/auth';
import { UserRole } from '@prisma/client';

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

describe('Health and System Probes', () => {
  it('GET /health should return 200 with UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.uptime).toBeDefined();
  });
});

describe('Authentication & Role Separation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects access to admin endpoints when no authorization token is provided', async () => {
    const res = await request(app).get('/api/v1/admin/counters?branchId=b1');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('CRITICAL: strictly rejects CITIZEN role tokens on /api/v1/admin routes with 403 Forbidden', async () => {
    const citizenTokens = generateTokens({
      userId: 'citizen-uuid-1',
      email: 'citizen@example.com',
      role: UserRole.CITIZEN,
    });

    const res = await request(app)
      .get('/api/v1/admin/counters?branchId=b1')
      .set('Authorization', `Bearer ${citizenTokens.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('allows STAFF role tokens on general admin routes', async () => {
    const staffTokens = generateTokens({
      userId: 'staff-uuid-1',
      email: 'staff@example.com',
      role: UserRole.STAFF,
      branchId: 'b1',
    });

    // Mock counter list
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'staff-uuid-1',
      role: UserRole.STAFF,
    });

    const res = await request(app)
      .get('/api/v1/admin/system-health')
      .set('Authorization', `Bearer ${staffTokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('citizen registration returns access and refresh tokens with user payload', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No email conflict
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'new-user-id',
      name: 'Diya Gosalia',
      email: 'diya@test.com',
      phone: '+919876543210',
      role: UserRole.CITIZEN,
      createdAt: new Date(),
    });
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Diya Gosalia',
        email: 'diya@test.com',
        phone: '+919876543210',
        password: 'SecurePassword123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe('diya@test.com');
  });

  it('rejects registration with invalid email or short password via Zod validation', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'D',
        email: 'not-an-email',
        phone: '123',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
