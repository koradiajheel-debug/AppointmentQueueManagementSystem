import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  UpdateCounterSchema,
  CallNextSchema,
  SkipTicketSchema,
  RecallTicketSchema,
  TransferTicketSchema,
  ReorderQueueSchema,
  WalkinRegistrationSchema,
} from '@queuesmart/shared';
import { CounterStatus, TicketStatus, PriorityTier, TicketType } from '@prisma/client';
import { socketEvents } from '../socket/socketHandler';

export const getCounters = async (req: Request, res: Response) => {
  const { branchId } = req.query;

  if (!branchId || typeof branchId !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId query parameter is required', code: 'MISSING_BRANCH_ID' },
    });
  }

  const counters = await prisma.counter.findMany({
    where: { branchId },
    orderBy: { counterNumber: 'asc' },
  });

  // Enrich counters with currently serving ticket data if any
  const enriched = await Promise.all(
    counters.map(async (c) => {
      let currentTicket = null;
      if (c.currentTicketId) {
        currentTicket = await prisma.queueTicket.findUnique({
          where: { id: c.currentTicketId },
          include: { service: { select: { id: true, name: true } } },
        });
      }

      // Count tickets waiting for services this counter offers
      const waitingCount = await prisma.queueTicket.count({
        where: {
          branchId,
          status: 'WAITING',
          ...(c.servicesOffered.length > 0 ? { serviceId: { in: c.servicesOffered } } : {}),
        },
      });

      return {
        ...c,
        currentTicket,
        waitingCount,
      };
    })
  );

  return res.json({
    success: true,
    data: enriched,
  });
};

export const updateCounter = async (req: Request, res: Response) => {
  const { counterId } = req.params;
  const input = UpdateCounterSchema.parse(req.body);
  const adminUserId = req.user?.userId;

  const existing = await prisma.counter.findUnique({
    where: { id: counterId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { message: 'Counter not found', code: 'COUNTER_NOT_FOUND' },
    });
  }

  const updated = await prisma.counter.update({
    where: { id: counterId },
    data: {
      ...(input.status ? { status: input.status as CounterStatus } : {}),
      ...(input.servicesOffered ? { servicesOffered: input.servicesOffered } : {}),
      ...(input.staffUserId !== undefined ? { staffUserId: input.staffUserId } : {}),
      ...(input.name ? { name: input.name } : {}),
    },
  });

  // Emit counter status update
  socketEvents.emitCounterStatus(existing.branchId, {
    counterId: updated.id,
    counterNumber: updated.counterNumber,
    status: updated.status,
    staffUserId: updated.staffUserId,
  });

  // Audit log
  if (adminUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        userName: req.user.email,
        action: 'UPDATE_COUNTER',
        entity: 'Counter',
        entityId: counterId,
        details: { previousStatus: existing.status, newStatus: updated.status },
        ipAddress: req.ip,
      },
    });
  }

  return res.json({
    success: true,
    data: updated,
  });
};

export const callNext = async (req: Request, res: Response) => {
  const input = CallNextSchema.parse(req.body);
  const staffUserId = req.user?.userId;

  const counter = await prisma.counter.findUnique({
    where: { id: input.counterId },
    include: { branch: true },
  });

  if (!counter) {
    return res.status(404).json({
      success: false,
      error: { message: 'Counter not found', code: 'COUNTER_NOT_FOUND' },
    });
  }

  // 1. If counter was already serving a ticket, finish it and log service completion
  if (counter.currentTicketId && counter.servingStartedAt) {
    const prevTicket = await prisma.queueTicket.findUnique({
      where: { id: counter.currentTicketId },
    });

    if (prevTicket && (prevTicket.status === 'SERVING' || prevTicket.status === 'CALLED')) {
      const endedAt = new Date();
      const durationMin = Math.max(
        0.5,
        Math.round(((endedAt.getTime() - new Date(counter.servingStartedAt).getTime()) / 60000) * 10) / 10
      );

      await prisma.queueTicket.update({
        where: { id: prevTicket.id },
        data: {
          status: TicketStatus.DONE,
          completedAt: endedAt,
        },
      });

      await prisma.serviceLog.create({
        data: {
          ticketId: prevTicket.id,
          tokenNo: prevTicket.tokenNo,
          counterId: counter.id,
          counterNumber: counter.counterNumber,
          serviceId: prevTicket.serviceId,
          startedAt: counter.servingStartedAt,
          endedAt,
          durationMinutes: durationMin,
          status: 'COMPLETED',
        },
      });
    }
  }

  // 2. Query next eligible ticket:
  // Priority: EMERGENCY > SENIOR/DISABLED/PREGNANT > NORMAL, then FIFO by joinedAt
  const serviceFilter = input.serviceId
    ? { serviceId: input.serviceId }
    : counter.servicesOffered.length > 0
    ? { serviceId: { in: counter.servicesOffered } }
    : {};

  const candidates = await prisma.queueTicket.findMany({
    where: {
      branchId: counter.branchId,
      status: 'WAITING',
      ...serviceFilter,
    },
    include: { service: true, user: true },
    orderBy: [{ joinedAt: 'asc' }],
  });

  if (candidates.length === 0) {
    // Clear counter's current ticket
    await prisma.counter.update({
      where: { id: counter.id },
      data: { currentTicketId: null, servingStartedAt: null },
    });

    return res.json({
      success: true,
      data: {
        message: 'No tickets waiting for this counter.',
        ticket: null,
      },
    });
  }

  // Priority sorting helper
  const priorityRank: Record<string, number> = {
    EMERGENCY: 1,
    DISABLED: 2,
    PREGNANT: 2,
    SENIOR: 2,
    NORMAL: 3,
  };

  candidates.sort((a, b) => {
    const rankA = priorityRank[a.priorityTier] || 3;
    const rankB = priorityRank[b.priorityTier] || 3;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  const nextTicket = candidates[0];
  const now = new Date();

  // 3. Update ticket to CALLED/SERVING
  const updatedTicket = await prisma.queueTicket.update({
    where: { id: nextTicket.id },
    data: {
      status: TicketStatus.SERVING,
      calledAt: now,
      servingAt: now,
      counterId: counter.id,
      counterNumber: counter.counterNumber,
      peopleAhead: 0,
      etaMinutes: 0,
    },
    include: { service: true },
  });

  // 4. Update counter with active ticket
  await prisma.counter.update({
    where: { id: counter.id },
    data: {
      currentTicketId: updatedTicket.id,
      servingStartedAt: now,
      status: CounterStatus.OPEN,
    },
  });

  // 5. Broadcast to real-time audio chime/display board and ticket room
  socketEvents.emitTicketCalled(counter.branchId, {
    ticketId: updatedTicket.id,
    tokenNo: updatedTicket.tokenNo,
    counterNumber: counter.counterNumber,
    counterName: counter.name,
    serviceName: updatedTicket.service.name,
    userName: updatedTicket.userName,
  });

  socketEvents.emitDisplayAnnounce(counter.branchId, {
    tokenNo: updatedTicket.tokenNo,
    counterNumber: counter.counterNumber,
    serviceName: updatedTicket.service.name,
    message: `Token ${updatedTicket.tokenNo}, please proceed to Counter ${counter.counterNumber}`,
  });

  // 6. Notify citizen if user account exists
  if (updatedTicket.userId) {
    await prisma.notification.create({
      data: {
        userId: updatedTicket.userId,
        ticketId: updatedTicket.id,
        title: `Your Turn! Counter ${counter.counterNumber}`,
        message: `Token ${updatedTicket.tokenNo}: Please proceed to Counter ${counter.counterNumber} now for ${updatedTicket.service.name}.`,
        type: 'ALERT',
      },
    });
  }

  return res.json({
    success: true,
    data: {
      message: `Token ${updatedTicket.tokenNo} called to Counter ${counter.counterNumber}`,
      ticket: updatedTicket,
      counterNumber: counter.counterNumber,
    },
  });
};

export const skipTicket = async (req: Request, res: Response) => {
  const input = SkipTicketSchema.parse(req.body);
  const staffUserId = req.user?.userId;

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: input.ticketId },
    include: { branch: true },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: input.ticketId },
    data: {
      status: TicketStatus.SKIPPED,
      reorderReason: `Skipped by staff: ${input.reason}`,
      completedAt: new Date(),
    },
  });

  // Clear counter if this ticket was the current active one
  await prisma.counter.updateMany({
    where: { currentTicketId: input.ticketId },
    data: { currentTicketId: null, servingStartedAt: null },
  });

  // Log audit
  if (staffUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        userName: req.user.email,
        action: 'SKIP_TICKET',
        entity: 'QueueTicket',
        entityId: input.ticketId,
        details: { tokenNo: ticket.tokenNo, reason: input.reason },
        ipAddress: req.ip,
      },
    });
  }

  // Broadcast queue update
  socketEvents.emitQueueUpdate(ticket.branchId, {
    action: 'TICKET_SKIPPED',
    ticketId: ticket.id,
    tokenNo: ticket.tokenNo,
    reason: input.reason,
  });

  return res.json({
    success: true,
    data: {
      message: `Ticket ${ticket.tokenNo} marked as skipped.`,
      ticket: updatedTicket,
    },
  });
};

export const recallTicket = async (req: Request, res: Response) => {
  const input = RecallTicketSchema.parse(req.body);

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: input.ticketId },
    include: { service: true, branch: true },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  const counterNumber = ticket.counterNumber || '1';

  // Re-broadcast display board announcement
  socketEvents.emitDisplayAnnounce(ticket.branchId, {
    tokenNo: ticket.tokenNo,
    counterNumber,
    serviceName: ticket.service.name,
    message: `RECALL: Token ${ticket.tokenNo}, please proceed immediately to Counter ${counterNumber}`,
  });

  return res.json({
    success: true,
    data: {
      message: `Announcement re-broadcast for token ${ticket.tokenNo} at Counter ${counterNumber}`,
    },
  });
};

export const transferTicket = async (req: Request, res: Response) => {
  const input = TransferTicketSchema.parse(req.body);
  const staffUserId = req.user?.userId;

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: input.ticketId },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: input.ticketId },
    data: {
      ...(input.targetServiceId ? { serviceId: input.targetServiceId } : {}),
      status: TicketStatus.WAITING,
      counterId: input.targetCounterId || null,
      counterNumber: null,
      reorderReason: `Transferred: ${input.reason}`,
    },
  });

  // Free current counter if ticket was in serving state
  await prisma.counter.updateMany({
    where: { currentTicketId: input.ticketId },
    data: { currentTicketId: null, servingStartedAt: null },
  });

  if (staffUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        userName: req.user.email,
        action: 'TRANSFER_TICKET',
        entity: 'QueueTicket',
        entityId: input.ticketId,
        details: { reason: input.reason, targetServiceId: input.targetServiceId, targetCounterId: input.targetCounterId },
        ipAddress: req.ip,
      },
    });
  }

  socketEvents.emitQueueUpdate(ticket.branchId, {
    action: 'TICKET_TRANSFERRED',
    ticketId: ticket.id,
    tokenNo: ticket.tokenNo,
  });

  return res.json({
    success: true,
    data: {
      message: `Ticket ${ticket.tokenNo} successfully transferred.`,
      ticket: updatedTicket,
    },
  });
};

export const reorderQueue = async (req: Request, res: Response) => {
  const input = ReorderQueueSchema.parse(req.body);
  const staffUserId = req.user?.userId;

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: input.ticketId },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  // Adjust joinedAt to mathematically reflect new desired position in FIFO queue
  const newJoinedAt = new Date(Date.now() - input.newPosition * 10 * 60000);

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: input.ticketId },
    data: {
      joinedAt: newJoinedAt,
      peopleAhead: input.newPosition,
      reorderReason: input.reason,
    },
  });

  // Audit log with mandatory reason
  if (staffUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        userName: req.user.email,
        action: 'REORDER_QUEUE',
        entity: 'QueueTicket',
        entityId: input.ticketId,
        details: { tokenNo: ticket.tokenNo, newPosition: input.newPosition, reason: input.reason },
        ipAddress: req.ip,
      },
    });
  }

  socketEvents.emitQueueUpdate(ticket.branchId, {
    action: 'QUEUE_REORDERED',
    ticketId: ticket.id,
    newPosition: input.newPosition,
  });

  return res.json({
    success: true,
    data: {
      message: `Ticket ${ticket.tokenNo} position reordered to index ${input.newPosition}.`,
      ticket: updatedTicket,
    },
  });
};

export const walkinRegistration = async (req: Request, res: Response) => {
  const input = WalkinRegistrationSchema.parse(req.body);
  const staffUserId = req.user?.userId;

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { branch: true },
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' },
    });
  }

  // Count today's tickets
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.queueTicket.count({
    where: {
      branchId: input.branchId,
      createdAt: { gte: startOfDay },
    },
  });

  const prefix = service.name.substring(0, 1).toUpperCase() || 'W';
  const tokenNumber = `${prefix}-${201 + todayCount}`;

  const peopleAhead = await prisma.queueTicket.count({
    where: {
      branchId: input.branchId,
      serviceId: input.serviceId,
      status: { in: ['WAITING', 'CALLED'] },
    },
  });

  const etaMinutes = Math.max(3, peopleAhead * service.avgDurationMin);

  const ticket = await prisma.queueTicket.create({
    data: {
      tokenNo: tokenNumber,
      type: TicketType.WALKIN,
      priorityTier: (input.priorityTier as PriorityTier) || PriorityTier.NORMAL,
      status: TicketStatus.WAITING,
      etaMinutes,
      peopleAhead,
      userName: input.userName,
      userPhone: input.userPhone,
      serviceId: input.serviceId,
      branchId: input.branchId,
      priorityReason: input.priorityReason,
      isGroup: input.isGroup || false,
      groupSize: input.groupSize || 1,
      counterId: input.counterId || null,
    },
  });

  // Printable thermal slip formatted data
  const printableSlip = {
    organizationName: 'QueueSmart Service Network',
    branchName: service.branch.name,
    branchPhone: service.branch.phone,
    tokenNo: ticket.tokenNo,
    serviceName: service.name,
    customerName: ticket.userName,
    priorityTier: ticket.priorityTier,
    peopleAhead,
    estimatedWaitMin: etaMinutes,
    issuedAt: ticket.createdAt.toISOString(),
    qrCodeUrl: `https://queuesmart.app/ticket/${ticket.id}`,
    instructions: 'Please watch the central overhead display or listen for audio announcements.',
  };

  // Broadcast
  socketEvents.emitQueueUpdate(input.branchId, {
    action: 'WALKIN_REGISTERED',
    ticketId: ticket.id,
    tokenNo: ticket.tokenNo,
  });

  // Audit log
  if (staffUserId && req.user) {
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        userName: req.user.email,
        action: 'WALKIN_REGISTRATION',
        entity: 'QueueTicket',
        entityId: ticket.id,
        details: { tokenNo: ticket.tokenNo, userName: ticket.userName },
        ipAddress: req.ip,
      },
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      ticket,
      printableSlip,
    },
  });
};
