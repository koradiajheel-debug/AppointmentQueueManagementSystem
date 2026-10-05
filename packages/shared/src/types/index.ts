// ==========================================
// QueueSmart Shared Types & Enums
// ==========================================

export type UserRole = 'CITIZEN' | 'STAFF' | 'ADMIN' | 'DOCTOR';

export type CounterStatus = 'OPEN' | 'BREAK' | 'CLOSED';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export type TicketType = 'WALKIN' | 'APPOINTMENT';

export type PriorityTier =
  | 'NORMAL'
  | 'SENIOR'
  | 'DISABLED'
  | 'PREGNANT'
  | 'EMERGENCY';

export type TicketStatus =
  | 'WAITING'
  | 'CALLED'
  | 'SERVING'
  | 'DONE'
  | 'SKIPPED';

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'CLINIC' | 'BANK' | 'SERVICE_CENTER' | 'COLLEGE';
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  operatingHours: {
    open: string; // e.g. "09:00"
    close: string; // e.g. "17:00"
    lunchStart?: string;
    lunchEnd?: string;
    workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  holidays?: string[]; // YYYY-MM-DD
}

export interface Service {
  id: string;
  branchId: string;
  name: string;
  description: string;
  avgDurationMin: number;
  priorityAllowed: boolean;
  category?: string;
  slaMinutes?: number;
  isActive: boolean;
}

export interface Counter {
  id: string;
  branchId: string;
  counterNumber: string;
  name: string;
  status: CounterStatus;
  servicesOffered: string[]; // Service IDs
  currentTicketId?: string | null;
  currentTicket?: QueueTicket | null;
  staffUserId?: string | null;
  staffName?: string | null;
  servingStartedAt?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  organizationId?: string;
  branchId?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  slotStart: string; // ISO 8601
  slotEnd: string;   // ISO 8601
  status: AppointmentStatus;
  notes?: string;
  qrCode?: string;
  ticketId?: string;
  createdAt: string;
}

export interface QueueTicket {
  id: string;
  tokenNo: string; // e.g. "A-102"
  type: TicketType;
  priorityTier: PriorityTier;
  status: TicketStatus;
  etaMinutes: number;
  joinedAt: string; // ISO 8601
  calledAt?: string | null;
  servingAt?: string | null;
  completedAt?: string | null;
  userId?: string | null;
  userName: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  counterId?: string | null;
  counterNumber?: string | null;
  peopleAhead: number;
  priorityReason?: string;
  priorityProofUrl?: string;
  isGroup?: boolean;
  groupSize?: number;
  reorderReason?: string;
}

export interface ServiceLog {
  id: string;
  ticketId: string;
  tokenNo: string;
  counterId: string;
  counterNumber: string;
  serviceId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  status: 'COMPLETED' | 'CANCELLED' | 'SKIPPED';
}

export interface Notification {
  id: string;
  userId?: string;
  ticketId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface DeviceToken {
  id: string;
  token: string;
  userId?: string;
  deviceType?: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  serviceId: string;
  startTime: string; // e.g. "2026-10-02T10:00:00"
  endTime: string;   // e.g. "2026-10-02T10:15:00"
  available: boolean;
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  bookingCount?: number;
  capacity?: number;
}

export interface ForecastSlot {
  hour: string; // "09:00", "10:00", etc.
  day: string;  // "Mon", "Tue", etc.
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  avgWaitMinutes: number;
  recommendation: 'BEST_TIME' | 'MODERATE' | 'BUSY' | 'AVOID';
}

export interface ForecastData {
  serviceId: string;
  serviceName: string;
  bestHours: string[];
  busiestHours: string[];
  slots: ForecastSlot[];
}

export interface TravelTimeEstimate {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceKm: number;
  travelMinutes: number;
  trafficLevel: 'LIGHT' | 'MODERATE' | 'HEAVY';
  leaveByTime: string; // ISO string
  recommendedAction: 'LEAVE_NOW' | 'PREPARE_TO_LEAVE' | 'PLENTY_OF_TIME';
}

export interface AdminAnalytics {
  totalServedToday: number;
  avgWaitMinutes: number;
  slaBreachPercentage: number;
  noShowRatePercentage: number;
  activeCountersCount: number;
  openCountersCount: number;
  totalTokensIssuedToday: number;
  hourlyCrowd: {
    hour: string;
    ticketsIssued: number;
    ticketsServed: number;
    avgWaitMin: number;
    slaTargetMin: number;
  }[];
  counterUtilization: {
    counterNumber: string;
    staffName: string;
    utilizationPercent: number;
    servedCount: number;
    avgServeMin: number;
  }[];
  serviceBreakdown: {
    serviceName: string;
    count: number;
    avgDurationMin: number;
  }[];
  priorityDistribution: {
    tier: PriorityTier;
    count: number;
  }[];
}

export interface SimulateRequest {
  additionalCounters: number;
  arrivalRateMultiplier: number; // e.g. 1.0 = normal, 1.3 = +30%
  avgServiceTimeChangeMin: number; // e.g. -2, 0, +5
  serviceId?: string;
}

export interface SimulateResult {
  projectedAvgWaitMin: number;
  projectedSlaBreachRate: number;
  projectedMaxQueueLength: number;
  recommendations: string[];
  hourlyComparison: {
    hour: string;
    currentWaitMin: number;
    simulatedWaitMin: number;
  }[];
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  apiLatencyMs: number;
  database: {
    status: 'UP' | 'DOWN';
    poolActive: number;
    poolIdle: number;
  };
  redis: {
    status: 'UP' | 'DOWN';
    memoryUsedMb: number;
  };
  socket: {
    connectedClients: number;
    activeRooms: number;
  };
  lastCheckedAt: string;
}

// Standard API Envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Socket Events Payloads
export interface QueueUpdateEvent {
  serviceId?: string;
  branchId: string;
  totalWaiting: number;
  lastUpdated: string;
}

export interface TicketCalledEvent {
  ticketId: string;
  tokenNo: string;
  counterId: string;
  counterNumber: string;
  serviceName: string;
  userName: string;
  timestamp: string;
}

export interface EtaUpdatedEvent {
  ticketId: string;
  etaMinutes: number;
  peopleAhead: number;
  timestamp: string;
}

export interface CounterStatusEvent {
  counterId: string;
  counterNumber: string;
  status: CounterStatus;
  currentTicketId?: string | null;
}

export interface QueueAlertEvent {
  branchId: string;
  serviceId?: string;
  type: 'SLA_WARNING' | 'OVERCROWDED' | 'COUNTER_IDLE';
  message: string;
  suggestedAction?: string;
  timestamp: string;
}

export interface DisplayAnnounceEvent {
  tokenNo: string;
  counterNumber: string;
  serviceName: string;
  timestamp: string;
  speechText: string;
}
