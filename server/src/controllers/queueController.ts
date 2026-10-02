import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { JoinQueueSchema, LeaveQueueSchema } from '@queuesmart/shared';
import { TicketType, PriorityTier, TicketStatus } from '@prisma/client';
import { socketEvents } from '../socket/socketHandler';

export const joinQueue = async (req: Request, res: Response) => {
  const input = JoinQueueSchema.parse(req.body);
  const userId = req.user?.userId;

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: {
      branch: {
        include: {
          counters: { where: { status: 'OPEN' } },
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

  // Generate sequential token number for today (e.g., A-101, B-102)
  const prefix = service.name.substring(0, 1).toUpperCase() || 'Q';
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.queueTicket.count({
    where: {
      branchId: input.branchId,
      createdAt: { gte: startOfDay },
    },
  });

  const tokenNumber = `${prefix}-${101 + todayCount}`;

  // Count active tickets currently ahead in this service/branch
  const peopleAhead = await prisma.queueTicket.count({
    where: {
      branchId: input.branchId,
      serviceId: input.serviceId,
      status: { in: ['WAITING', 'CALLED'] },
    },
  });

  // Calculate ETA based on duration and number of active counters
  const openCounters = Math.max(1, service.branch.counters.length);
  const priorityWeight = input.priorityTier !== 'NORMAL' ? 0.6 : 1.0;
  const etaMinutes = Math.max(3, Math.round((peopleAhead * service.avgDurationMin * priorityWeight) / openCounters));

  const ticket = await prisma.queueTicket.create({
    data: {
      tokenNo: tokenNumber,
      type: TicketType.WALKIN,
      priorityTier: (input.priorityTier as PriorityTier) || PriorityTier.NORMAL,
      status: TicketStatus.WAITING,
      etaMinutes,
      peopleAhead,
      userId: userId || null,
      userName: input.userName,
      userPhone: input.userPhone,
      serviceId: input.serviceId,
      branchId: input.branchId,
      priorityReason: input.priorityReason,
      isGroup: input.isGroup || false,
      groupSize: input.groupSize || 1,
    },
    include: {
      service: { select: { id: true, name: true, avgDurationMin: true } },
      branch: { select: { id: true, name: true } },
    },
  });

  // Broadcast real-time queue update to branch room
  socketEvents.emitQueueUpdate(input.branchId, {
    action: 'TICKET_JOINED',
    ticketId: ticket.id,
    tokenNo: ticket.tokenNo,
    serviceId: input.serviceId,
    peopleAhead,
    etaMinutes,
  });

  // Create citizen in-app notification if registered user
  if (userId) {
    await prisma.notification.create({
      data: {
        userId,
        ticketId: ticket.id,
        title: `Ticket Issued: ${ticket.tokenNo}`,
        message: `You joined the queue for ${service.name}. Your estimated wait time is ${etaMinutes} minutes.`,
        type: 'SUCCESS',
      },
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      ticket,
      trackingUrl: `/ticket/${ticket.id}`,
    },
  });
};

export const getTicketStatus = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    include: {
      service: { select: { id: true, name: true, avgDurationMin: true, slaMinutes: true } },
      branch: { select: { id: true, name: true, address: true, city: true, phone: true } },
    },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  // Dynamically recalculate people ahead if still waiting
  let currentPeopleAhead = ticket.peopleAhead;
  let currentEta = ticket.etaMinutes;

  if (ticket.status === 'WAITING') {
    currentPeopleAhead = await prisma.queueTicket.count({
      where: {
        branchId: ticket.branchId,
        serviceId: ticket.serviceId,
        status: 'WAITING',
        joinedAt: { lt: ticket.joinedAt },
      },
    });

    const activeCounters = await prisma.counter.count({
      where: { branchId: ticket.branchId, status: 'OPEN' },
    });
    const counters = Math.max(1, activeCounters);
    currentEta = Math.max(2, Math.round((currentPeopleAhead * ticket.service.avgDurationMin) / counters));
  } else if (ticket.status === 'CALLED' || ticket.status === 'SERVING') {
    currentPeopleAhead = 0;
    currentEta = 0;
  }

  return res.json({
    success: true,
    data: {
      ...ticket,
      peopleAhead: currentPeopleAhead,
      etaMinutes: currentEta,
    },
  });
};

export const leaveQueue = async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const input = LeaveQueueSchema.parse(req.body || {});
  const userId = req.user?.userId;

  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { message: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
    });
  }

  if (req.user?.role === 'CITIZEN' && ticket.userId && ticket.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'You are not authorized to cancel this ticket', code: 'FORBIDDEN' },
    });
  }

  if (ticket.status === 'DONE' || ticket.status === 'SKIPPED') {
    return res.status(400).json({
      success: false,
      error: { message: 'Ticket has already ended', code: 'TICKET_ENDED' },
    });
  }

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: ticketId },
    data: {
      status: TicketStatus.SKIPPED,
      reorderReason: input.reason || 'Citizen voluntarily left queue',
      completedAt: new Date(),
    },
  });

  // Broadcast queue update
  socketEvents.emitQueueUpdate(ticket.branchId, {
    action: 'TICKET_LEFT',
    ticketId: ticket.id,
    tokenNo: ticket.tokenNo,
    serviceId: ticket.serviceId,
  });

  return res.json({
    success: true,
    data: {
      message: 'You have successfully left the queue.',
      ticket: updatedTicket,
    },
  });
};
