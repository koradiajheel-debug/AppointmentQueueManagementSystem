import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import {
  QueueUpdateEvent,
  TicketCalledEvent,
  EtaUpdatedEvent,
  CounterStatusEvent,
  QueueAlertEvent,
  DisplayAnnounceEvent,
} from '@queuesmart/shared';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: [env.CUSTOMER_URL, env.ADMIN_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Attach Redis adapter in production or when REDIS_URL is provided
  if (env.REDIS_URL && env.REDIS_URL.trim() !== '') {
    try {
      const pubClient = new Redis(env.REDIS_URL);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('✅ [Socket.IO] Redis adapter attached for horizontal scaling.');
    } catch (err) {
      logger.warn({ err }, 'Failed to attach Redis adapter to Socket.IO. Running standalone.');
    }
  }

  io.on('connection', (socket: Socket) => {
    logger.debug({ socketId: socket.id }, 'Socket client connected');

    socket.on('join:branch', (branchId: string) => {
      socket.join(`branch:${branchId}`);
      logger.debug({ socketId: socket.id, branchId }, 'Client joined branch room');
    });

    socket.on('join:ticket', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      logger.debug({ socketId: socket.id, ticketId }, 'Client joined ticket room');
    });

    socket.on('join:display', (branchId: string) => {
      socket.join(`display:${branchId}`);
      logger.debug({ socketId: socket.id, branchId }, 'Client joined display TV room');
    });

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket client disconnected');
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return io;
}

// Typed broadcaster helpers
export const socketBroadcaster = {
  queueUpdate: (branchId: string, payload: QueueUpdateEvent) => {
    if (!io) return;
    io.to(`branch:${branchId}`).emit('queue:update', payload);
  },

  ticketCalled: (ticketId: string, branchId: string, payload: TicketCalledEvent) => {
    if (!io) return;
    io.to(`ticket:${ticketId}`).to(`branch:${branchId}`).emit('ticket:called', payload);
  },

  etaUpdated: (ticketId: string, payload: EtaUpdatedEvent) => {
    if (!io) return;
    io.to(`ticket:${ticketId}`).emit('eta:updated', payload);
  },

  counterStatus: (branchId: string, payload: CounterStatusEvent) => {
    if (!io) return;
    io.to(`branch:${branchId}`).emit('counter:status', payload);
  },

  queueAlert: (branchId: string, payload: QueueAlertEvent) => {
    if (!io) return;
    io.to(`branch:${branchId}`).emit('queue:alert', payload);
  },

  displayAnnounce: (branchId: string, payload: DisplayAnnounceEvent) => {
    if (!io) return;
    io.to(`display:${branchId}`).to(`branch:${branchId}`).emit('display:announce', payload);
  },
};

export const socketEvents = {
  emitQueueUpdate: (branchId: string, payload: any) => socketBroadcaster.queueUpdate(branchId, payload),
  emitTicketCalled: (branchId: string, payload: any) =>
    socketBroadcaster.ticketCalled(payload.ticketId, branchId, payload),
  emitEtaUpdated: (ticketId: string, payload: any) => socketBroadcaster.etaUpdated(ticketId, payload),
  emitCounterStatus: (branchId: string, payload: any) => socketBroadcaster.counterStatus(branchId, payload),
  emitQueueAlert: (branchId: string, payload: any) => socketBroadcaster.queueAlert(branchId, payload),
  emitDisplayAnnounce: (branchId: string, payload: any) => socketBroadcaster.displayAnnounce(branchId, payload),
};

