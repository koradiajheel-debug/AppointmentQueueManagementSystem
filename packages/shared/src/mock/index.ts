import {
  Organization,
  Branch,
  Service,
  Counter,
  User,
  Appointment,
  QueueTicket,
  AdminAnalytics,
  ForecastData,
  SystemHealth,
  SimulateRequest,
  SimulateResult,
  TravelTimeEstimate,
} from '../types';

// ============================================================================
// Seed Data
// ============================================================================

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Apollo Lifeline Hospital & Clinics',
    code: 'ALHC',
    type: 'CLINIC',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'org-2',
    name: 'State Premier Bank',
    code: 'SPB',
    type: 'BANK',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'org-3',
    name: 'National Civic Citizen Center',
    code: 'NCCC',
    type: 'SERVICE_CENTER',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    organizationId: 'org-1',
    name: 'Apollo Metro Care - Central Wing',
    address: '42 Health Boulevard, Downtown Metro',
    city: 'Mumbai',
    phone: '+91 22 2490 1000',
    latitude: 19.076,
    longitude: 72.8777,
    operatingHours: {
      open: '08:30',
      close: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    holidays: ['2026-10-02', '2026-12-25'],
  },
  {
    id: 'branch-2',
    organizationId: 'org-2',
    name: 'Premier Bank - Financial District',
    address: '108 Dalal Street, Fort',
    city: 'Mumbai',
    phone: '+91 22 6650 2000',
    latitude: 18.9322,
    longitude: 72.8335,
    operatingHours: {
      open: '09:30',
      close: '16:30',
      workingDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'branch-3',
    organizationId: 'org-3',
    name: 'Citizen Civic Center - Sector 9',
    address: 'Plot 15, Administrative Complex',
    city: 'Navi Mumbai',
    phone: '+91 22 2780 3000',
    latitude: 19.033,
    longitude: 73.0297,
    operatingHours: {
      open: '09:00',
      close: '17:00',
      workingDays: [1, 2, 3, 4, 5, 6],
    },
  },
];

export const SEED_SERVICES: Service[] = [
  {
    id: 'srv-1',
    branchId: 'branch-1',
    name: 'General Physician OPD',
    description: 'General doctor consultation, prescription refills, primary diagnosis',
    avgDurationMin: 12,
    priorityAllowed: true,
    category: 'Consultation',
    slaMinutes: 20,
    isActive: true,
  },
  {
    id: 'srv-2',
    branchId: 'branch-1',
    name: 'Pediatrics & Child Care',
    description: 'Specialist consultation for infants and children up to 14 years',
    avgDurationMin: 18,
    priorityAllowed: true,
    category: 'Specialist',
    slaMinutes: 25,
    isActive: true,
  },
  {
    id: 'srv-3',
    branchId: 'branch-1',
    name: 'Diagnostic Blood & Sample Lab',
    description: 'Pathology testing, blood draws, quick reports collection',
    avgDurationMin: 8,
    priorityAllowed: true,
    category: 'Diagnostics',
    slaMinutes: 15,
    isActive: true,
  },
  {
    id: 'srv-4',
    branchId: 'branch-1',
    name: 'Pharmacy & Medical Dispensary',
    description: 'Prescription medicine dispensing, medical equipment',
    avgDurationMin: 5,
    priorityAllowed: true,
    category: 'Dispensary',
    slaMinutes: 10,
    isActive: true,
  },
  {
    id: 'srv-5',
    branchId: 'branch-2',
    name: 'Cash Deposits & Withdrawals',
    description: 'Teller cash transactions, DD issuance, currency exchange',
    avgDurationMin: 6,
    priorityAllowed: true,
    category: 'Teller',
    slaMinutes: 12,
    isActive: true,
  },
  {
    id: 'srv-6',
    branchId: 'branch-2',
    name: 'Account Opening & KYC Renewal',
    description: 'Savings, current account onboarding, biometric KYC',
    avgDurationMin: 22,
    priorityAllowed: false,
    category: 'Customer Desk',
    slaMinutes: 30,
    isActive: true,
  },
  {
    id: 'srv-7',
    branchId: 'branch-3',
    name: 'Aadhaar Biometric & Demographic Update',
    description: 'Address, photo, fingerprint, mobile link updates for Aadhaar',
    avgDurationMin: 10,
    priorityAllowed: true,
    category: 'Identity',
    slaMinutes: 15,
    isActive: true,
  },
];

export const SEED_COUNTERS: Counter[] = [
  {
    id: 'counter-1',
    branchId: 'branch-1',
    counterNumber: '01',
    name: 'Dr. Sharma OPD Desk',
    status: 'OPEN',
    servicesOffered: ['srv-1'],
    currentTicketId: 'ticket-1',
    staffUserId: 'staff-1',
    staffName: 'Dr. Rajesh Sharma',
    servingStartedAt: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'counter-2',
    branchId: 'branch-1',
    counterNumber: '02',
    name: 'Dr. Ananya Child Care',
    status: 'OPEN',
    servicesOffered: ['srv-2'],
    currentTicketId: null,
    staffUserId: 'staff-2',
    staffName: 'Dr. Ananya Roy',
  },
  {
    id: 'counter-3',
    branchId: 'branch-1',
    counterNumber: '03',
    name: 'Pathology Sample Station A',
    status: 'BREAK',
    servicesOffered: ['srv-3'],
    currentTicketId: null,
    staffUserId: 'staff-3',
    staffName: 'Vikas Kadam (Lab Tech)',
  },
  {
    id: 'counter-4',
    branchId: 'branch-1',
    counterNumber: '04',
    name: 'Express Pharmacy Counter',
    status: 'CLOSED',
    servicesOffered: ['srv-4'],
    currentTicketId: null,
    staffUserId: null,
  },
];

export const SEED_USERS: User[] = [
  {
    id: 'citizen-demo',
    email: 'citizen@queuesmart.dev',
    name: 'Rahul Patel',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'staff-1',
    email: 'staff@queuesmart.dev',
    name: 'Dr. Rajesh Sharma',
    phone: '+91 98200 12345',
    role: 'STAFF',
    branchId: 'branch-1',
    organizationId: 'org-1',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'admin-demo',
    email: 'admin@queuesmart.dev',
    name: 'Priya Mehra (Branch Lead)',
    phone: '+91 98111 22233',
    role: 'ADMIN',
    branchId: 'branch-1',
    organizationId: 'org-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_TICKETS: QueueTicket[] = [
  {
    id: 'ticket-1',
    tokenNo: 'A-101',
    type: 'APPOINTMENT',
    priorityTier: 'NORMAL',
    status: 'SERVING',
    etaMinutes: 0,
    joinedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 5 * 60000).toISOString(),
    servingAt: new Date(Date.now() - 4 * 60000).toISOString(),
    userId: 'user-guest-1',
    userName: 'Kavita Deshmukh',
    userPhone: '+91 99223 34455',
    serviceId: 'srv-1',
    serviceName: 'General Physician OPD',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    counterId: 'counter-1',
    counterNumber: '01',
    peopleAhead: 0,
  },
  {
    id: 'ticket-2',
    tokenNo: 'A-102',
    type: 'WALKIN',
    priorityTier: 'SENIOR',
    status: 'WAITING',
    etaMinutes: 8,
    joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    userId: 'user-guest-2',
    userName: 'Suresh Chandra (Senior 68y)',
    userPhone: '+91 98444 55667',
    serviceId: 'srv-1',
    serviceName: 'General Physician OPD',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    peopleAhead: 1,
    priorityReason: 'Age 68, arthritis checkup',
  },
  {
    id: 'ticket-3',
    tokenNo: 'A-103',
    type: 'WALKIN',
    priorityTier: 'PREGNANT',
    status: 'WAITING',
    etaMinutes: 19,
    joinedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    userId: 'user-guest-3',
    userName: 'Meera Iyer',
    userPhone: '+91 97333 44556',
    serviceId: 'srv-1',
    serviceName: 'General Physician OPD',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    peopleAhead: 2,
    priorityReason: 'Second trimester routine review',
  },
  {
    id: 'ticket-4',
    tokenNo: 'A-104',
    type: 'APPOINTMENT',
    priorityTier: 'NORMAL',
    status: 'WAITING',
    etaMinutes: 28,
    joinedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    userId: 'citizen-demo',
    userName: 'Rahul Patel',
    userPhone: '+91 98765 43210',
    serviceId: 'srv-1',
    serviceName: 'General Physician OPD',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    peopleAhead: 3,
  },
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    userId: 'citizen-demo',
    userName: 'Rahul Patel',
    userPhone: '+91 98765 43210',
    serviceId: 'srv-1',
    serviceName: 'General Physician OPD',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    slotStart: new Date(Date.now() + 60 * 60000).toISOString(),
    slotEnd: new Date(Date.now() + 75 * 60000).toISOString(),
    status: 'BOOKED',
    notes: 'Mild fever and cough for 2 days',
    ticketId: 'ticket-4',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'apt-2',
    userId: 'citizen-demo',
    userName: 'Rahul Patel',
    userPhone: '+91 98765 43210',
    serviceId: 'srv-3',
    serviceName: 'Diagnostic Blood & Sample Lab',
    branchId: 'branch-1',
    branchName: 'Apollo Metro Care - Central Wing',
    slotStart: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    slotEnd: new Date(Date.now() + 24 * 3600 * 1000 + 15 * 60000).toISOString(),
    status: 'BOOKED',
    notes: 'Fasting lipid profile & HbA1c',
    createdAt: '2026-10-01T08:30:00.000Z',
  },
];

// ============================================================================
// In-Memory Reactive Mock Engine
// ============================================================================

type SocketListener = (payload: unknown) => void;

class MockStore {
  private branches = [...SEED_BRANCHES];
  private services = [...SEED_SERVICES];
  private counters = [...SEED_COUNTERS];
  private tickets = [...SEED_TICKETS];
  private appointments = [...SEED_APPOINTMENTS];
  private listeners: Record<string, SocketListener[]> = {};
  private nextTokenSeq = 105;

  constructor() {
    this.recalculateEta();
  }

  // Socket subscription mechanism
  public on(event: string, fn: SocketListener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public off(event: string, fn: SocketListener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }

  public emit(event: string, payload: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Socket listener error on ${event}:`, e);
        }
      });
    }
  }

  private recalculateEta() {
    const waiting = this.tickets.filter((t) => t.status === 'WAITING');
    let cumulative = 0;
    waiting.forEach((ticket, idx) => {
      ticket.peopleAhead = idx;
      const srv = this.services.find((s) => s.id === ticket.serviceId);
      const duration = srv ? srv.avgDurationMin : 12;
      ticket.etaMinutes = cumulative + Math.round(duration * 0.8);
      cumulative += duration;
    });
  }

  // Branches & Services
  public getBranches() {
    return [...this.branches];
  }

  public createBranch(data: Partial<Branch>) {
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      organizationId: data.organizationId || 'org-1',
      name: data.name || 'New Facility',
      address: data.address || 'Street Address',
      city: data.city || 'Mumbai',
      phone: data.phone || '+91 22 2618 0000',
      latitude: data.latitude || 19.1025,
      longitude: data.longitude || 72.8450,
      operatingHours: data.operatingHours || { open: '08:30', close: '18:00', lunchStart: '13:00', lunchEnd: '14:00', workingDays: [1, 2, 3, 4, 5, 6] },
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  public updateBranch(id: string, data: Partial<Branch>) {
    const idx = this.branches.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.branches[idx] = { ...this.branches[idx], ...data };
      return this.branches[idx];
    }
    return null;
  }

  public deleteBranch(id: string) {
    const initialLen = this.branches.length;
    this.branches = this.branches.filter((b) => b.id !== id);
    return this.branches.length < initialLen;
  }

  public getServices(branchId?: string) {
    if (!branchId) return [...this.services];
    return this.services.filter((s) => s.branchId === branchId);
  }

  public createService(data: Partial<Service>) {
    const newService: Service = {
      id: `srv-${Date.now()}`,
      branchId: data.branchId || 'branch-1',
      name: data.name || 'New Service',
      description: data.description || '',
      avgDurationMin: data.avgDurationMin || 15,
      priorityAllowed: data.priorityAllowed ?? true,
      slaMinutes: data.slaMinutes || 25,
      isActive: true,
    };
    this.services.push(newService);
    return newService;
  }

  // Slots & Forecast
  public getSlots(serviceId: string, date: string) {
    const hours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    return hours.map((h, i) => {
      const isMorning = i < 6;
      return {
        id: `slot-${serviceId}-${date}-${h}`,
        serviceId,
        startTime: `${date}T${h}:00`,
        endTime: `${date}T${h.replace(':00', ':20').replace(':30', ':50')}:00`,
        available: i !== 2 && i !== 5, // simulate a few booked slots
        crowdLevel: isMorning ? (i === 1 || i === 2 ? 'HIGH' : 'MEDIUM') : 'LOW',
        bookingCount: i === 2 ? 5 : i === 1 ? 4 : 1,
        capacity: 5,
      };
    });
  }

  public getForecast(serviceId: string): ForecastData {
    const srv = this.services.find((s) => s.id === serviceId) || this.services[0];
    const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const slots = [];
    for (const day of days) {
      for (const h of hours) {
        const isPeak = h === '10:00' || h === '11:00';
        const isLow = h === '14:00' || h === '15:00' || h === '16:00';
        slots.push({
          hour: h,
          day,
          crowdLevel: isPeak ? 'HIGH' : isLow ? 'LOW' : 'MEDIUM',
          avgWaitMinutes: isPeak ? 34 : isLow ? 8 : 18,
          recommendation: isLow ? 'BEST_TIME' : isPeak ? 'AVOID' : 'MODERATE',
        } as const);
      }
    }

    return {
      serviceId,
      serviceName: srv.name,
      bestHours: ['14:00 - 16:30 (Afternoon lull: avg 8m wait)', '09:00 - 09:30 (Early morning opening)'],
      busiestHours: ['10:00 - 12:30 (Peak rush: 30m+ wait)', '16:30 - 17:30 (Evening close rush)'],
      slots,
    };
  }

  public getTravelTime(originLat: number, originLng: number, branchId: string): TravelTimeEstimate {
    const branch = this.branches.find((b) => b.id === branchId) || this.branches[0];
    // Calculate approximate distance
    const dLat = (branch.latitude - originLat) * 111;
    const dLng = (branch.longitude - originLng) * 111;
    const distanceKm = Math.max(1.2, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10);
    const travelMinutes = Math.max(5, Math.round(distanceKm * 3.5));

    const leaveByDate = new Date(Date.now() - (travelMinutes > 20 ? 5 : 0) * 60000);

    return {
      originLat,
      originLng,
      destLat: branch.latitude,
      destLng: branch.longitude,
      distanceKm,
      travelMinutes,
      trafficLevel: travelMinutes > 25 ? 'HEAVY' : travelMinutes > 15 ? 'MODERATE' : 'LIGHT',
      leaveByTime: leaveByDate.toISOString(),
      recommendedAction: travelMinutes <= 15 ? 'PREPARE_TO_LEAVE' : 'LEAVE_NOW',
    };
  }

  // Queue Operations
  public joinQueue(data: {
    branchId: string;
    serviceId: string;
    userName: string;
    userPhone: string;
    priorityTier?: string;
    priorityReason?: string;
    isGroup?: boolean;
    groupSize?: number;
    userId?: string;
  }): QueueTicket {
    const branch = this.branches.find((b) => b.id === data.branchId) || this.branches[0];
    const service = this.services.find((s) => s.id === data.serviceId) || this.services[0];
    const tokenNo = `A-${this.nextTokenSeq++}`;

    const newTicket: QueueTicket = {
      id: `ticket-${Date.now()}`,
      tokenNo,
      type: 'WALKIN',
      priorityTier: (data.priorityTier as any) || 'NORMAL',
      status: 'WAITING',
      etaMinutes: 15,
      joinedAt: new Date().toISOString(),
      userId: data.userId || 'citizen-demo',
      userName: data.userName,
      userPhone: data.userPhone,
      serviceId: service.id,
      serviceName: service.name,
      branchId: branch.id,
      branchName: branch.name,
      peopleAhead: 0,
      priorityReason: data.priorityReason,
      isGroup: data.isGroup,
      groupSize: data.groupSize,
    };

    // If priority tier is EMERGENCY, place at the front of waiting queue
    if (newTicket.priorityTier === 'EMERGENCY') {
      const firstWaitingIdx = this.tickets.findIndex((t) => t.status === 'WAITING');
      if (firstWaitingIdx !== -1) {
        this.tickets.splice(firstWaitingIdx, 0, newTicket);
      } else {
        this.tickets.push(newTicket);
      }
    } else {
      this.tickets.push(newTicket);
    }

    this.recalculateEta();

    this.emit('queue:update', {
      branchId: branch.id,
      serviceId: service.id,
      totalWaiting: this.tickets.filter((t) => t.status === 'WAITING').length,
      lastUpdated: new Date().toISOString(),
    });

    return newTicket;
  }

  public getTicketStatus(ticketId: string): QueueTicket | undefined {
    return this.tickets.find((t) => t.id === ticketId || t.tokenNo === ticketId);
  }

  public leaveQueue(ticketId: string, reason?: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'SKIPPED';
    ticket.reorderReason = reason || 'User voluntarily left queue';
    this.recalculateEta();
    this.emit('queue:update', {
      branchId: ticket.branchId,
      totalWaiting: this.tickets.filter((t) => t.status === 'WAITING').length,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  }

  // Admin Queue Operations
  public callNext(counterId: string): QueueTicket | null {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter) return null;

    // Complete current ticket if any
    if (counter.currentTicketId) {
      const current = this.tickets.find((t) => t.id === counter.currentTicketId);
      if (current && current.status === 'SERVING') {
        current.status = 'DONE';
        current.completedAt = new Date().toISOString();
      }
    }

    // Find next eligible waiting ticket
    const nextTicket = this.tickets.find(
      (t) => t.status === 'WAITING' && counter.servicesOffered.includes(t.serviceId)
    );

    if (!nextTicket) {
      counter.currentTicketId = null;
      counter.currentTicket = null;
      return null;
    }

    nextTicket.status = 'CALLED';
    nextTicket.calledAt = new Date().toISOString();
    nextTicket.servingAt = new Date().toISOString();
    nextTicket.counterId = counter.id;
    nextTicket.counterNumber = counter.counterNumber;

    counter.currentTicketId = nextTicket.id;
    counter.currentTicket = nextTicket;
    counter.servingStartedAt = new Date().toISOString();

    this.recalculateEta();

    // Emit Socket events
    this.emit('ticket:called', {
      ticketId: nextTicket.id,
      tokenNo: nextTicket.tokenNo,
      counterId: counter.id,
      counterNumber: counter.counterNumber,
      serviceName: nextTicket.serviceName,
      userName: nextTicket.userName,
      timestamp: new Date().toISOString(),
    });

    this.emit('display:announce', {
      tokenNo: nextTicket.tokenNo,
      counterNumber: counter.counterNumber,
      serviceName: nextTicket.serviceName,
      timestamp: new Date().toISOString(),
      speechText: `Token ${nextTicket.tokenNo}, please proceed to Counter ${counter.counterNumber}`,
    });

    this.emit('counter:status', {
      counterId: counter.id,
      counterNumber: counter.counterNumber,
      status: counter.status,
      currentTicketId: nextTicket.id,
    });

    return nextTicket;
  }

  public skipTicket(ticketId: string, reason: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'SKIPPED';
    ticket.reorderReason = reason;

    // Clear from counter if it was currently assigned
    const counter = this.counters.find((c) => c.currentTicketId === ticketId);
    if (counter) {
      counter.currentTicketId = null;
      counter.currentTicket = null;
    }

    this.recalculateEta();
    this.emit('queue:update', {
      branchId: ticket.branchId,
      totalWaiting: this.tickets.filter((t) => t.status === 'WAITING').length,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  }

  public recallTicket(ticketId: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'CALLED';
    ticket.calledAt = new Date().toISOString();

    this.emit('ticket:called', {
      ticketId: ticket.id,
      tokenNo: ticket.tokenNo,
      counterId: ticket.counterId || 'counter-1',
      counterNumber: ticket.counterNumber || '01',
      serviceName: ticket.serviceName,
      userName: ticket.userName,
      timestamp: new Date().toISOString(),
    });

    this.emit('display:announce', {
      tokenNo: ticket.tokenNo,
      counterNumber: ticket.counterNumber || '01',
      serviceName: ticket.serviceName,
      timestamp: new Date().toISOString(),
      speechText: `Recall: Token ${ticket.tokenNo}, please proceed to Counter ${ticket.counterNumber || '01'}`,
    });

    return true;
  }

  public transferTicket(ticketId: string, targetCounterId?: string, targetServiceId?: string, reason?: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    // Free up old counter
    if (ticket.counterId) {
      const oldCounter = this.counters.find((c) => c.id === ticket.counterId);
      if (oldCounter && oldCounter.currentTicketId === ticketId) {
        oldCounter.currentTicketId = null;
        oldCounter.currentTicket = null;
      }
    }

    if (targetServiceId) {
      const newSrv = this.services.find((s) => s.id === targetServiceId);
      if (newSrv) {
        ticket.serviceId = newSrv.id;
        ticket.serviceName = newSrv.name;
      }
    }

    ticket.status = 'WAITING';
    ticket.counterId = null;
    ticket.counterNumber = null;
    ticket.reorderReason = `Transferred: ${reason || 'Operational re-route'}`;

    this.recalculateEta();
    this.emit('queue:update', {
      branchId: ticket.branchId,
      totalWaiting: this.tickets.filter((t) => t.status === 'WAITING').length,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  }

  public reorderQueue(ticketId: string, newPosition: number, reason: string): boolean {
    const ticketIdx = this.tickets.findIndex((t) => t.id === ticketId);
    if (ticketIdx === -1) return false;

    const [moved] = this.tickets.splice(ticketIdx, 1);
    moved.reorderReason = reason;

    // Only reorder among waiting tickets
    const waitingIndices: number[] = [];
    this.tickets.forEach((t, i) => {
      if (t.status === 'WAITING') waitingIndices.push(i);
    });

    const targetIndex = waitingIndices[Math.min(newPosition, waitingIndices.length - 1)] ?? this.tickets.length;
    this.tickets.splice(targetIndex, 0, moved);

    this.recalculateEta();
    this.emit('queue:update', {
      branchId: moved.branchId,
      totalWaiting: this.tickets.filter((t) => t.status === 'WAITING').length,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  }

  // Counters
  public getCounters(branchId?: string) {
    const list = branchId ? this.counters.filter((c) => c.branchId === branchId) : this.counters;
    return list.map((c) => {
      const currentTicket = c.currentTicketId ? this.tickets.find((t) => t.id === c.currentTicketId) : null;
      return {
        ...c,
        currentTicket,
      };
    });
  }

  public updateCounter(id: string, data: Partial<Counter>) {
    const counter = this.counters.find((c) => c.id === id);
    if (!counter) return null;
    if (data.status) counter.status = data.status;
    if (data.servicesOffered) counter.servicesOffered = data.servicesOffered;
    if (data.staffUserId !== undefined) counter.staffUserId = data.staffUserId;
    if (data.name) counter.name = data.name;

    this.emit('counter:status', {
      counterId: counter.id,
      counterNumber: counter.counterNumber,
      status: counter.status,
      currentTicketId: counter.currentTicketId,
    });

    return counter;
  }

  // Appointments
  public getAppointments(userId?: string) {
    if (userId) return this.appointments.filter((a) => a.userId === userId);
    return [...this.appointments];
  }

  public createAppointment(data: Partial<Appointment>) {
    const branch = this.branches.find((b) => b.id === data.branchId) || this.branches[0];
    const service = this.services.find((s) => s.id === data.serviceId) || this.services[0];
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      userId: data.userId || 'citizen-demo',
      userName: data.userName || 'Rahul Patel',
      userPhone: data.userPhone || '+91 98765 43210',
      userEmail: data.userEmail,
      serviceId: service.id,
      serviceName: service.name,
      branchId: branch.id,
      branchName: branch.name,
      slotStart: data.slotStart || new Date(Date.now() + 3600000).toISOString(),
      slotEnd: data.slotEnd || new Date(Date.now() + 5400000).toISOString(),
      status: 'BOOKED',
      notes: data.notes,
      qrCode: `QS-APT-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.appointments.unshift(newApt);
    return newApt;
  }

  public cancelAppointment(id: string, reason?: string) {
    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) return null;
    apt.status = 'CANCELLED';
    apt.notes = apt.notes ? `${apt.notes} | Cancel reason: ${reason}` : reason;
    return apt;
  }

  public swapAppointment(id: string, newSlotStart: string, newSlotEnd: string) {
    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) return null;
    apt.slotStart = newSlotStart;
    apt.slotEnd = newSlotEnd;
    return apt;
  }

  public bulkReschedule(data: { serviceId: string; currentDate: string; targetDate: string; delayMinutes: number; reason: string }) {
    let count = 0;
    this.appointments.forEach((apt) => {
      if (apt.serviceId === data.serviceId && apt.status === 'BOOKED') {
        const currentStart = new Date(apt.slotStart);
        currentStart.setDate(currentStart.getDate() + 1); // shift to next day
        apt.slotStart = currentStart.toISOString();
        apt.notes = `${apt.notes || ''} [Bulk Rescheduled: ${data.reason}]`;
        count++;
      }
    });
    return { count };
  }

  // Analytics
  public getAnalytics(): AdminAnalytics {
    return {
      totalServedToday: 48,
      avgWaitMinutes: 14.5,
      slaBreachPercentage: 6.2,
      noShowRatePercentage: 4.8,
      activeCountersCount: 3,
      openCountersCount: 2,
      totalTokensIssuedToday: 62,
      hourlyCrowd: [
        { hour: '09:00', ticketsIssued: 8, ticketsServed: 7, avgWaitMin: 10, slaTargetMin: 20 },
        { hour: '10:00', ticketsIssued: 14, ticketsServed: 11, avgWaitMin: 22, slaTargetMin: 20 },
        { hour: '11:00', ticketsIssued: 16, ticketsServed: 13, avgWaitMin: 26, slaTargetMin: 20 },
        { hour: '12:00', ticketsIssued: 10, ticketsServed: 10, avgWaitMin: 18, slaTargetMin: 20 },
        { hour: '13:00', ticketsIssued: 4, ticketsServed: 4, avgWaitMin: 8, slaTargetMin: 20 },
        { hour: '14:00', ticketsIssued: 7, ticketsServed: 6, avgWaitMin: 11, slaTargetMin: 20 },
        { hour: '15:00', ticketsIssued: 9, ticketsServed: 8, avgWaitMin: 14, slaTargetMin: 20 },
        { hour: '16:00', ticketsIssued: 6, ticketsServed: 5, avgWaitMin: 12, slaTargetMin: 20 },
      ],
      counterUtilization: [
        { counterNumber: '01', staffName: 'Dr. Rajesh Sharma', utilizationPercent: 88, servedCount: 22, avgServeMin: 11.8 },
        { counterNumber: '02', staffName: 'Dr. Ananya Roy', utilizationPercent: 74, servedCount: 16, avgServeMin: 17.2 },
        { counterNumber: '03', staffName: 'Vikas Kadam (Lab)', utilizationPercent: 62, servedCount: 10, avgServeMin: 7.9 },
      ],
      serviceBreakdown: [
        { serviceName: 'General Physician OPD', count: 26, avgDurationMin: 12 },
        { serviceName: 'Pediatrics & Child Care', count: 18, avgDurationMin: 18 },
        { serviceName: 'Diagnostic Sample Lab', count: 12, avgDurationMin: 8 },
        { serviceName: 'Pharmacy Dispensary', count: 6, avgDurationMin: 5 },
      ],
      priorityDistribution: [
        { tier: 'NORMAL', count: 42 },
        { tier: 'SENIOR', count: 10 },
        { tier: 'PREGNANT', count: 5 },
        { tier: 'DISABLED', count: 3 },
        { tier: 'EMERGENCY', count: 2 },
      ],
    };
  }

  // Simulator
  public simulateScenario(req: SimulateRequest): SimulateResult {
    const baseWait = 14.5;
    const counterImpact = req.additionalCounters * 3.2;
    const arrivalImpact = (req.arrivalRateMultiplier - 1.0) * 12;
    const serviceImpact = req.avgServiceTimeChangeMin * 0.9;

    const projectedWait = Math.max(3.5, Math.round((baseWait - counterImpact + arrivalImpact + serviceImpact) * 10) / 10);
    const projectedBreach = Math.max(1.0, Math.min(65.0, Math.round((projectedWait / 20) * 8.5 * 10) / 10));
    const projectedQueue = Math.max(2, Math.round(projectedWait * 0.6));

    const recommendations: string[] = [];
    if (projectedWait > 20) {
      recommendations.push('⚠️ High risk of SLA breaches (>20m wait). Open at least 1 additional counter.');
    }
    if (req.arrivalRateMultiplier > 1.3) {
      recommendations.push('📢 Heavy surge expected. Consider enabling triage for walk-ins.');
    }
    if (projectedWait <= 10) {
      recommendations.push('✅ Excellent throughput. Counters have buffer capacity.');
    }

    const hourlyComparison = [
      { hour: '09:00', currentWaitMin: 10, simulatedWaitMin: Math.max(3, Math.round(10 - counterImpact * 0.6 + arrivalImpact * 0.5)) },
      { hour: '10:00', currentWaitMin: 22, simulatedWaitMin: Math.max(5, Math.round(22 - counterImpact * 0.9 + arrivalImpact * 0.9)) },
      { hour: '11:00', currentWaitMin: 26, simulatedWaitMin: Math.max(6, Math.round(26 - counterImpact * 1.1 + arrivalImpact * 1.1)) },
      { hour: '12:00', currentWaitMin: 18, simulatedWaitMin: Math.max(4, Math.round(18 - counterImpact * 0.8 + arrivalImpact * 0.7)) },
      { hour: '14:00', currentWaitMin: 11, simulatedWaitMin: Math.max(3, Math.round(11 - counterImpact * 0.5 + arrivalImpact * 0.4)) },
      { hour: '15:00', currentWaitMin: 14, simulatedWaitMin: Math.max(4, Math.round(14 - counterImpact * 0.7 + arrivalImpact * 0.6)) },
    ];

    return {
      projectedAvgWaitMin: projectedWait,
      projectedSlaBreachRate: projectedBreach,
      projectedMaxQueueLength: projectedQueue,
      recommendations,
      hourlyComparison,
    };
  }

  // System Health
  public getSystemHealth(): SystemHealth {
    return {
      status: 'HEALTHY',
      uptimeSeconds: 84620,
      apiLatencyMs: 24,
      database: {
        status: 'UP',
        poolActive: 4,
        poolIdle: 16,
      },
      redis: {
        status: 'UP',
        memoryUsedMb: 42.8,
      },
      socket: {
        connectedClients: 19,
        activeRooms: 6,
      },
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

export const mockStore = new MockStore();
