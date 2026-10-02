import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import {
  CreateServiceSchema,
  CreateStaffSchema,
  ScheduleConfigSchema,
  BulkRescheduleSchema,
} from '@queuesmart/shared';
import { UserRole, AppointmentStatus } from '@prisma/client';

export const createService = async (req: Request, res: Response) => {
  const input = CreateServiceSchema.parse(req.body);
  const adminUserId = req.user?.userId;

  const service = await prisma.service.create({
    data: {
      branchId: input.branchId,
      name: input.name,
      description: input.description,
      avgDurationMin: input.avgDurationMin,
      priorityAllowed: input.priorityAllowed,
      slaMinutes: input.slaMinutes,
    },
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'CREATE_SERVICE',
        entity: 'Service',
        entityId: service.id,
        details: { name: service.name, avgDurationMin: service.avgDurationMin },
        ipAddress: req.ip,
      },
    });
  }

  return res.status(201).json({
    success: true,
    data: service,
  });
};

export const updateService = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const adminUserId = req.user?.userId;

  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: req.body,
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'UPDATE_SERVICE',
        entity: 'Service',
        entityId: serviceId,
        details: req.body,
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: updated,
  });
};

export const deleteService = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const adminUserId = req.user?.userId;

  // Soft delete by marking isActive false
  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'DEACTIVATE_SERVICE',
        entity: 'Service',
        entityId: serviceId,
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: { message: 'Service deactivated successfully', service: updated },
  });
};

export const createCounter = async (req: Request, res: Response) => {
  const { branchId, counterNumber, name, servicesOffered } = req.body;
  const adminUserId = req.user?.userId;

  if (!branchId || !counterNumber || !name) {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId, counterNumber, and name are required', code: 'MISSING_FIELDS' },
    });
  }

  const counter = await prisma.counter.create({
    data: {
      branchId,
      counterNumber: String(counterNumber),
      name,
      servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : [],
    },
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'CREATE_COUNTER',
        entity: 'Counter',
        entityId: counter.id,
        details: { counterNumber: counter.counterNumber, name: counter.name },
        ipAddress: req.ip,
      },
    });
  }

  return res.status(201).json({
    success: true,
    data: counter,
  });
};

export const deleteCounter = async (req: Request, res: Response) => {
  const { counterId } = req.params;
  const adminUserId = req.user?.userId;

  await prisma.counter.delete({
    where: { id: counterId },
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'DELETE_COUNTER',
        entity: 'Counter',
        entityId: counterId,
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: { message: 'Counter deleted successfully' },
  });
};

export const createStaff = async (req: Request, res: Response) => {
  const input = CreateStaffSchema.parse(req.body);
  const adminUserId = req.user?.userId;

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: { message: 'User with this email already exists', code: 'EMAIL_EXISTS' },
    });
  }

  // Temporary password
  const defaultPassword = 'StaffPassword123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const staff = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone,
      passwordHash,
      role: input.role as UserRole,
      branchId: input.branchId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      branchId: true,
      createdAt: true,
    },
  });

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'CREATE_STAFF',
        entity: 'User',
        entityId: staff.id,
        details: { email: staff.email, role: staff.role },
        ipAddress: req.ip,
      },
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      staff,
      temporaryPassword: defaultPassword,
      message: 'Staff account created. Please provide credentials to the staff member.',
    },
  });
};

export const getBranchStaff = async (req: Request, res: Response) => {
  const { branchId } = req.query;

  if (!branchId || typeof branchId !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId is required', code: 'MISSING_BRANCH_ID' },
    });
  }

  const staff = await prisma.user.findMany({
    where: {
      branchId,
      role: { in: ['STAFF', 'ADMIN'] },
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

  return res.json({
    success: true,
    data: staff,
  });
};

export const updateScheduleConfig = async (req: Request, res: Response) => {
  const input = ScheduleConfigSchema.parse(req.body);
  const adminUserId = req.user?.userId;

  const branch = await prisma.branch.findUnique({
    where: { id: input.branchId },
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      error: { message: 'Branch not found', code: 'BRANCH_NOT_FOUND' },
    });
  }

  // Update branch operating hours
  const updatedHours = {
    open: input.openTime,
    close: input.closeTime,
    lunchStart: input.lunchStart || '13:00',
    lunchEnd: input.lunchEnd || '14:00',
    workingDays: input.workingDays,
  };

  await prisma.branch.update({
    where: { id: input.branchId },
    data: { operatingHours: updatedHours },
  });

  // Upsert holidays
  for (const hDate of input.holidays) {
    await prisma.holiday.upsert({
      where: {
        branchId_date: {
          branchId: input.branchId,
          date: hDate,
        },
      },
      update: { name: 'Public Holiday / Branch Closed' },
      create: {
        branchId: input.branchId,
        date: hDate,
        name: 'Public Holiday / Branch Closed',
      },
    });
  }

  // Insert blocked slots
  for (const block of input.blockedSlots) {
    const startTime = new Date(`${block.date}T${block.startTime}:00.000Z`);
    const endTime = new Date(`${block.date}T${block.endTime}:00.000Z`);

    await prisma.blockedSlot.create({
      data: {
        branchId: input.branchId,
        startTime,
        endTime,
        reason: block.reason,
      },
    });
  }

  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'UPDATE_SCHEDULE_CONFIG',
        entity: 'Branch',
        entityId: input.branchId,
        details: { operatingHours: updatedHours, holidays: input.holidays.length, blockedSlots: input.blockedSlots.length },
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: {
      message: 'Schedule configuration updated successfully.',
      operatingHours: updatedHours,
    },
  });
};

export const bulkReschedule = async (req: Request, res: Response) => {
  const input = BulkRescheduleSchema.parse(req.body);
  const adminUserId = req.user?.userId;

  const startCurrent = new Date(`${input.currentDate}T00:00:00.000Z`);
  const endCurrent = new Date(`${input.currentDate}T23:59:59.999Z`);

  const affectedAppointments = await prisma.appointment.findMany({
    where: {
      serviceId: input.serviceId,
      slotStart: { gte: startCurrent, lte: endCurrent },
      status: { in: ['BOOKED', 'CHECKED_IN'] },
    },
    include: { user: true, service: true, branch: true },
  });

  if (affectedAppointments.length === 0) {
    return res.json({
      success: true,
      data: {
        message: 'No active appointments found on that date to reschedule.',
        count: 0,
      },
    });
  }

  // Calculate day difference in milliseconds
  const currentD = new Date(input.currentDate);
  const targetD = new Date(input.targetDate);
  const dayShiftMs = targetD.getTime() - currentD.getTime();
  const delayMs = (input.delayMinutes || 0) * 60000;
  const totalShiftMs = dayShiftMs + delayMs;

  const updatedIds: string[] = [];

  for (const appt of affectedAppointments) {
    const newStart = new Date(new Date(appt.slotStart).getTime() + totalShiftMs);
    const newEnd = new Date(new Date(appt.slotEnd).getTime() + totalShiftMs);

    await prisma.appointment.update({
      where: { id: appt.id },
      data: {
        slotStart: newStart,
        slotEnd: newEnd,
        status: AppointmentStatus.BOOKED,
        notes: appt.notes
          ? `${appt.notes} | Bulk Rescheduled: ${input.reason}`
          : `Bulk Rescheduled: ${input.reason}`,
      },
    });

    updatedIds.push(appt.id);

    // Notify affected user
    if (appt.userId) {
      const formattedNewDate = newStart.toLocaleDateString();
      const formattedNewTime = newStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await prisma.notification.create({
        data: {
          userId: appt.userId,
          title: 'Schedule Change Notice',
          message: `Your appointment for ${appt.service.name} has been rescheduled to ${formattedNewDate} at ${formattedNewTime} due to: ${input.reason}. We apologize for any inconvenience.`,
          type: 'WARNING',
        },
      });
    }
  }

  // Audit log
  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'BULK_RESCHEDULE',
        entity: 'Service',
        entityId: input.serviceId,
        details: {
          affectedCount: updatedIds.length,
          currentDate: input.currentDate,
          targetDate: input.targetDate,
          delayMinutes: input.delayMinutes,
          reason: input.reason,
        },
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: {
      message: `Successfully rescheduled ${updatedIds.length} appointments to ${input.targetDate}.`,
      rescheduledCount: updatedIds.length,
      appointments: updatedIds,
    },
  });
};
