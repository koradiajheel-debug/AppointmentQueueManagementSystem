import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateTokens } from '../src/middleware/auth';
import { UserRole, AppointmentStatus, PriorityTier } from '@prisma/client';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    queueTicket: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Appointment & Double-Booking Prevention', () => {
  const citizenTokens = generateTokens({
    userId: 'user-1',
    email: 'citizen@example.com',
    role: UserRole.CITIZEN,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/slots returns calculated slots with availability', async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: 'srv-1',
      name: 'General Consultation',
      avgDurationMin: 15,
      branch: {
        id: 'branch-1',
        name: 'City Care Hospital',
        counters: [{ id: 'c1', servicesOffered: [] }],
        blockedSlots: [],
        holidays: [],
        operatingHours: {
          open: '09:00',
          close: '10:00',
          lunchStart: '13:00',
          lunchEnd: '14:00',
          workingDays: [0, 1, 2, 3, 4, 5, 6],
        },
      },
    });

    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/v1/slots?serviceId=srv-1&date=2026-11-01');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slots).toBeDefined();
    expect(res.body.data.slots.length).toBeGreaterThan(0);
    expect(res.body.data.slots[0].capacity).toBe(1);
  });

  it('rejects duplicate booking if user already has an appointment for this service on the date', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      name: 'Diya',
      phone: '+919876543210',
      email: 'citizen@example.com',
    });

    (prisma.appointment.findFirst as jest.Mock).mockResolvedValue({
      id: 'existing-appt-id',
      status: AppointmentStatus.BOOKED,
    });

    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${citizenTokens.accessToken}`)
      .send({
        branchId: 'branch-1',
        serviceId: 'srv-1',
        slotStart: '2026-11-01T10:00:00.000Z',
        slotEnd: '2026-11-01T10:15:00.000Z',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_BOOKING');
  });

  it('cancels appointment and creates notification for waiting citizens', async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      id: 'appt-123',
      userId: 'user-1',
      serviceId: 'srv-1',
      branchId: 'branch-1',
      slotStart: new Date('2026-11-01T10:00:00.000Z'),
      status: AppointmentStatus.BOOKED,
      service: { name: 'General Consultation' },
      branch: { name: 'Central Branch' },
    });

    (prisma.appointment.update as jest.Mock).mockResolvedValue({
      id: 'appt-123',
      status: AppointmentStatus.CANCELLED,
    });

    (prisma.queueTicket.findMany as jest.Mock).mockResolvedValue([
      { id: 't-1', userId: 'user-waiting-1' },
      { id: 't-2', userId: 'user-waiting-2' },
    ]);

    (prisma.notification.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/appointments/appt-123/cancel')
      .set('Authorization', `Bearer ${citizenTokens.accessToken}`)
      .send({ reason: 'Feeling better, no longer needed.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.notification.create).toHaveBeenCalled();
  });
});
