import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  CreateAppointmentSchema,
  CancelAppointmentSchema,
  SwapAppointmentSchema,
} from '@queuesmart/shared';
import { PriorityTier, AppointmentStatus } from '@prisma/client';

/**
 * Generate available time slots dynamically for a service at a branch on a given date.
 * Takes into account:
 * - Branch operating hours (open, close, lunch break)
 * - Service duration (avgDurationMin)
 * - Number of active/open counters offering this service
 * - Buffer time (5 minutes between slots)
 * - Blocked slots and already booked appointments
 */
export const getAvailableSlots = async (req: Request, res: Response) => {
  const { serviceId, date } = req.query;

  if (!serviceId || !date || typeof serviceId !== 'string' || typeof date !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'serviceId and date query parameters are required', code: 'MISSING_PARAMS' },
    });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      branch: {
        include: {
          counters: { where: { status: { in: ['OPEN', 'BREAK'] } } },
          blockedSlots: true,
          holidays: true,
        },
      },
    },
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' },
    });
  }

  const branch = service.branch;

  // Check if date is a declared holiday
  const isHoliday = branch.holidays.some((h) => h.date === date);
  if (isHoliday) {
    return res.json({
      success: true,
      data: {
        date,
        serviceId,
        serviceName: service.name,
        slots: [],
        message: 'Branch is closed on this date (Public Holiday).',
      },
    });
  }

  const opHours: any = branch.operatingHours || {
    open: '09:00',
    close: '17:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workingDays: [1, 2, 3, 4, 5, 6],
  };

  // Check day of week (0 = Sunday, 6 = Saturday)
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getUTCDay();
  if (Array.isArray(opHours.workingDays) && !opHours.workingDays.includes(dayOfWeek)) {
    return res.json({
      success: true,
      data: {
        date,
        serviceId,
        serviceName: service.name,
        slots: [],
        message: 'Branch is closed on this day of the week.',
      },
    });
  }

  // Count counters that support this service
  const matchingCounters = branch.counters.filter(
    (c) => c.servicesOffered.length === 0 || c.servicesOffered.includes(serviceId)
  );
  const capacityPerSlot = Math.max(1, matchingCounters.length);

  // Parse hours
  const [openHour, openMin] = (opHours.open || '09:00').split(':').map(Number);
  const [closeHour, closeMin] = (opHours.close || '17:00').split(':').map(Number);
  const [lunchStartH, lunchStartM] = (opHours.lunchStart || '13:00').split(':').map(Number);
  const [lunchEndH, lunchEndM] = (opHours.lunchEnd || '14:00').split(':').map(Number);

  const durationMin = service.avgDurationMin || 15;
  const bufferMin = 5;
  const slotIntervalMin = durationMin + bufferMin;

  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  // Fetch already booked appointments for this service on this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      serviceId,
      branchId: branch.id,
      slotStart: { gte: startOfDay, lte: endOfDay },
      status: { in: ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'] },
    },
    select: { slotStart: true, slotEnd: true },
  });

  // Fetch blocked slots for this date
  const blockedOnDate = branch.blockedSlots.filter((b) => {
    const bStart = new Date(b.startTime);
    return bStart >= startOfDay && bStart <= endOfDay;
  });

  const slots = [];
  let currentSlotStart = new Date(targetDate);
  currentSlotStart.setUTCHours(openHour, openMin, 0, 0);

  const dayClose = new Date(targetDate);
  dayClose.setUTCHours(closeHour, closeMin, 0, 0);

  const lunchStart = new Date(targetDate);
  lunchStart.setUTCHours(lunchStartH, lunchStartM, 0, 0);

  const lunchEnd = new Date(targetDate);
  lunchEnd.setUTCHours(lunchEndH, lunchEndM, 0, 0);

  const now = new Date();

  while (currentSlotStart.getTime() + durationMin * 60000 <= dayClose.getTime()) {
    const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMin * 60000);

    // Skip lunch break overlap
    const overlapsLunch =
      (currentSlotStart >= lunchStart && currentSlotStart < lunchEnd) ||
      (currentSlotEnd > lunchStart && currentSlotEnd <= lunchEnd);

    // Skip past slots if target date is today
    const isPast = currentSlotStart < now;

    // Check if slot falls in a blocked slot range
    const isBlocked = blockedOnDate.some(
      (b) => currentSlotStart < new Date(b.endTime) && currentSlotEnd > new Date(b.startTime)
    );

    // Count how many bookings exist for this exact slot
    const bookingsCount = bookedAppointments.filter(
      (a) =>
        new Date(a.slotStart).getTime() === currentSlotStart.getTime() &&
        new Date(a.slotEnd).getTime() === currentSlotEnd.getTime()
    ).length;

    const availableCapacity = capacityPerSlot - bookingsCount;
    const isAvailable = !overlapsLunch && !isPast && !isBlocked && availableCapacity > 0;

    slots.push({
      slotStart: currentSlotStart.toISOString(),
      slotEnd: currentSlotEnd.toISOString(),
      timeFormatted: `${currentSlotStart.toISOString().substring(11, 16)} - ${currentSlotEnd.toISOString().substring(11, 16)}`,
      capacity: capacityPerSlot,
      booked: bookingsCount,
      availableCapacity: Math.max(0, availableCapacity),
      isAvailable,
      reason: overlapsLunch ? 'Lunch Break' : isPast ? 'Past Slot' : isBlocked ? 'Blocked Slot' : availableCapacity <= 0 ? 'Full' : 'Available',
    });

    currentSlotStart = new Date(currentSlotStart.getTime() + slotIntervalMin * 60000);
  }

  return res.json({
    success: true,
    data: {
      date,
      serviceId,
      serviceName: service.name,
      branchId: branch.id,
      branchName: branch.name,
      durationMin,
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      slots,
    },
  });
};

/**
 * Book an appointment with robust double-booking prevention via DB transactions.
 */
export const createAppointment = async (req: Request, res: Response) => {
  const input = CreateAppointmentSchema.parse(req.body);
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required to book an appointment', code: 'UNAUTHORIZED' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, email: true },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User record not found', code: 'USER_NOT_FOUND' },
    });
  }

  const slotStartDate = new Date(input.slotStart);
  const slotEndDate = new Date(input.slotEnd);

  // Prevent booking in the past
  if (slotStartDate < new Date()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Cannot book appointments in the past.', code: 'INVALID_SLOT_TIME' },
    });
  }

  // Prevent duplicate appointment for same user on same day
  const startOfDay = new Date(slotStartDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(slotStartDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingUserAppointment = await prisma.appointment.findFirst({
    where: {
      userId,
      serviceId: input.serviceId,
      slotStart: { gte: startOfDay, lte: endOfDay },
      status: { in: ['BOOKED', 'CHECKED_IN'] },
    },
  });

  if (existingUserAppointment) {
    return res.status(409).json({
      success: false,
      error: {
        message: 'You already have an active appointment for this service on this day.',
        code: 'DUPLICATE_BOOKING',
      },
    });
  }

  // Double-booking check & atomic creation inside a transaction
  try {
    const appointment = await prisma.$transaction(async (tx) => {
      // Check service & branch capacity
      const service = await tx.service.findUnique({
        where: { id: input.serviceId },
        include: {
          branch: {
            include: {
              counters: { where: { status: { in: ['OPEN', 'BREAK'] } } },
            },
          },
        },
      });

      if (!service) {
        throw new Error('SERVICE_NOT_FOUND');
      }

      const matchingCounters = service.branch.counters.filter(
        (c) => c.servicesOffered.length === 0 || c.servicesOffered.includes(input.serviceId)
      );
      const capacity = Math.max(1, matchingCounters.length);

      // Check current bookings for this slot
      const existingBookingsCount = await tx.appointment.count({
        where: {
          serviceId: input.serviceId,
          branchId: input.branchId,
          slotStart: slotStartDate,
          slotEnd: slotEndDate,
          status: { in: ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'] },
        },
      });

      if (existingBookingsCount >= capacity) {
        throw new Error('SLOT_FULL');
      }

      const qrCodePayload = JSON.stringify({
        type: 'APPOINTMENT_CHECKIN',
        userId: user.id,
        serviceId: input.serviceId,
        branchId: input.branchId,
        slotStart: input.slotStart,
      });

      return await tx.appointment.create({
        data: {
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          serviceId: input.serviceId,
          branchId: input.branchId,
          slotStart: slotStartDate,
          slotEnd: slotEndDate,
          status: AppointmentStatus.BOOKED,
          notes: input.notes,
          qrCode: qrCodePayload,
          isGroup: input.isGroup || false,
          groupSize: input.groupSize || 1,
          priorityTier: (input.priorityTier as PriorityTier) || PriorityTier.NORMAL,
        },
        include: {
          service: { select: { id: true, name: true, avgDurationMin: true } },
          branch: { select: { id: true, name: true, address: true, city: true } },
        },
      });
    });

    // Create confirmation notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Appointment Confirmed',
        message: `Your appointment for ${appointment.service.name} at ${appointment.branch.name} on ${new Date(
          appointment.slotStart
        ).toLocaleDateString()} has been confirmed.`,
        type: 'SUCCESS',
      },
    });

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (err: any) {
    if (err.message === 'SLOT_FULL') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'The selected slot was just booked by another citizen. Please choose another slot.',
          code: 'SLOT_UNAVAILABLE',
        },
      });
    }
    if (err.message === 'SERVICE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' },
      });
    }
    throw err;
  }
};

/**
 * Cancel an appointment.
 * Automatically triggers slot release and creates a notification record offering
 * the newly available slot to waiting queue users.
 */
export const cancelAppointment = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const input = CancelAppointmentSchema.parse(req.body);
  const userId = req.user?.userId;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, branch: true },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: { message: 'Appointment not found', code: 'APPOINTMENT_NOT_FOUND' },
    });
  }

  // Ensure user owns appointment or is staff/admin
  if (req.user?.role === 'CITIZEN' && appointment.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'You are not authorized to cancel this appointment', code: 'FORBIDDEN' },
    });
  }

  if (appointment.status === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      error: { message: 'Appointment is already cancelled', code: 'ALREADY_CANCELLED' },
    });
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: AppointmentStatus.CANCELLED,
      notes: appointment.notes
        ? `${appointment.notes} | Cancel Reason: ${input.reason}`
        : `Cancel Reason: ${input.reason}`,
    },
  });

  // Slot swap notification logic: Find waiting users in the queue for this service and notify them of the released slot
  const waitingTickets = await prisma.queueTicket.findMany({
    where: {
      serviceId: appointment.serviceId,
      branchId: appointment.branchId,
      status: 'WAITING',
      userId: { not: null },
    },
    take: 3, // Notify the top 3 waiting users
  });

  const formattedSlotTime = new Date(appointment.slotStart).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  for (const ticket of waitingTickets) {
    if (ticket.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          ticketId: ticket.id,
          title: 'Earlier Slot Available!',
          message: `An earlier appointment slot just opened up for ${appointment.service.name} at ${formattedSlotTime}. Book now or swap your token!`,
          type: 'INFO',
        },
      });
    }
  }

  return res.json({
    success: true,
    data: {
      message: 'Appointment cancelled successfully. Released slot has been offered to waiting citizens.',
      appointment: updatedAppointment,
    },
  });
};

/**
 * Reschedule/Swap appointment to a new slot.
 */
export const swapAppointment = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const input = SwapAppointmentSchema.parse(req.body);
  const userId = req.user?.userId;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, branch: true },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: { message: 'Appointment not found', code: 'APPOINTMENT_NOT_FOUND' },
    });
  }

  if (req.user?.role === 'CITIZEN' && appointment.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Forbidden', code: 'FORBIDDEN' },
    });
  }

  const newStart = new Date(input.newSlotStart);
  const newEnd = new Date(input.newSlotEnd);

  // Check capacity for the new slot
  const service = await prisma.service.findUnique({
    where: { id: appointment.serviceId },
    include: {
      branch: {
        include: {
          counters: { where: { status: { in: ['OPEN', 'BREAK'] } } },
        },
      },
    },
  });

  const capacity = Math.max(1, service?.branch.counters.length || 1);
  const existingCount = await prisma.appointment.count({
    where: {
      serviceId: appointment.serviceId,
      branchId: appointment.branchId,
      slotStart: newStart,
      slotEnd: newEnd,
      status: { in: ['BOOKED', 'CHECKED_IN'] },
    },
  });

  if (existingCount >= capacity) {
    return res.status(409).json({
      success: false,
      error: { message: 'The desired new slot is fully booked.', code: 'NEW_SLOT_UNAVAILABLE' },
    });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      slotStart: newStart,
      slotEnd: newEnd,
      status: AppointmentStatus.BOOKED,
    },
  });

  return res.json({
    success: true,
    data: {
      message: 'Appointment successfully rescheduled.',
      appointment: updated,
    },
  });
};

export const getAppointments = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
    });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: {
      service: { select: { id: true, name: true, avgDurationMin: true } },
      branch: { select: { id: true, name: true, address: true, city: true, phone: true } },
    },
    orderBy: { slotStart: 'desc' },
  });

  return res.json({
    success: true,
    data: appointments,
  });
};

export const getAppointmentById = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const userId = req.user?.userId;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: true,
      branch: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: { message: 'Appointment not found', code: 'APPOINTMENT_NOT_FOUND' },
    });
  }

  if (req.user?.role === 'CITIZEN' && appointment.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Forbidden', code: 'FORBIDDEN' },
    });
  }

  return res.json({
    success: true,
    data: appointment,
  });
};
