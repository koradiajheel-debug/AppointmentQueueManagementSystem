import { PrismaClient, UserRole, OrgType, CounterStatus, AppointmentStatus, TicketType, PriorityTier, TicketStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Starting idempotent seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Organizations (2)
  const org1 = await prisma.organization.upsert({
    where: { code: 'ALHC' },
    update: {},
    create: {
      id: 'org-1',
      name: 'Apollo Lifeline Healthcare & Clinics',
      code: 'ALHC',
      type: OrgType.CLINIC,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { code: 'SPB' },
    update: {},
    create: {
      id: 'org-2',
      name: 'State Premier Banking Corporation',
      code: 'SPB',
      type: OrgType.BANK,
    },
  });

  // 2. Branches (3)
  const branch1 = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: {
      id: 'branch-1',
      organizationId: org1.id,
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
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-2' },
    update: {},
    create: {
      id: 'branch-2',
      organizationId: org1.id,
      name: 'Apollo Diagnostics & Day Surgery',
      address: 'Plot 18, Western Express Highway',
      city: 'Mumbai',
      phone: '+91 22 2650 2000',
      latitude: 19.1136,
      longitude: 72.8697,
      operatingHours: {
        open: '08:00',
        close: '20:00',
        workingDays: [1, 2, 3, 4, 5, 6, 0],
      },
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { id: 'branch-3' },
    update: {},
    create: {
      id: 'branch-3',
      organizationId: org2.id,
      name: 'State Premier Bank - Financial District',
      address: '108 Dalal Street, Fort',
      city: 'Mumbai',
      phone: '+91 22 6650 3000',
      latitude: 18.9322,
      longitude: 72.8335,
      operatingHours: {
        open: '09:30',
        close: '16:30',
        lunchStart: '13:30',
        lunchEnd: '14:15',
        workingDays: [1, 2, 3, 4, 5],
      },
    },
  });

  // 3. Services (5)
  const service1 = await prisma.service.upsert({
    where: { id: 'srv-1' },
    update: {},
    create: {
      id: 'srv-1',
      branchId: branch1.id,
      name: 'General Physician OPD',
      description: 'Primary consultation, diagnostics evaluation and medical prescriptions',
      avgDurationMin: 12,
      priorityAllowed: true,
      slaMinutes: 20,
      category: 'General OPD',
      isActive: true,
    },
  });

  const service2 = await prisma.service.upsert({
    where: { id: 'srv-2' },
    update: {},
    create: {
      id: 'srv-2',
      branchId: branch1.id,
      name: 'Pediatrics & Infant Care',
      description: 'Specialist consultations for newborn care and child development',
      avgDurationMin: 18,
      priorityAllowed: true,
      slaMinutes: 25,
      category: 'Pediatrics',
      isActive: true,
    },
  });

  const service3 = await prisma.service.upsert({
    where: { id: 'srv-3' },
    update: {},
    create: {
      id: 'srv-3',
      branchId: branch1.id,
      name: 'Diagnostic Blood & Sample Lab',
      description: 'Fasting blood tests, biochemistry and rapid diagnostic collection',
      avgDurationMin: 8,
      priorityAllowed: true,
      slaMinutes: 15,
      category: 'Diagnostics',
      isActive: true,
    },
  });

  const service4 = await prisma.service.upsert({
    where: { id: 'srv-4' },
    update: {},
    create: {
      id: 'srv-4',
      branchId: branch1.id,
      name: 'Pharmacy Dispensary',
      description: 'Prescription dispensing and medicine verification',
      avgDurationMin: 5,
      priorityAllowed: true,
      slaMinutes: 10,
      category: 'Pharmacy',
      isActive: true,
    },
  });

  const service5 = await prisma.service.upsert({
    where: { id: 'srv-5' },
    update: {},
    create: {
      id: 'srv-5',
      branchId: branch3.id,
      name: 'Cash & Forex Teller Desk',
      description: 'Deposit, cash withdrawal, currency exchange and draft issuance',
      avgDurationMin: 7,
      priorityAllowed: true,
      slaMinutes: 12,
      category: 'Teller',
      isActive: true,
    },
  });

  // 4. Counters (6)
  const counter1 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch1.id, counterNumber: '01' } },
    update: {},
    create: {
      id: 'counter-1',
      branchId: branch1.id,
      counterNumber: '01',
      name: 'Dr. Rajesh Sharma OPD Desk',
      status: CounterStatus.OPEN,
      servicesOffered: [service1.id],
      staffUserId: 'staff-1',
    },
  });

  const counter2 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch1.id, counterNumber: '02' } },
    update: {},
    create: {
      id: 'counter-2',
      branchId: branch1.id,
      counterNumber: '02',
      name: 'Dr. Ananya Roy Child Clinic',
      status: CounterStatus.OPEN,
      servicesOffered: [service2.id],
      staffUserId: 'staff-2',
    },
  });

  const counter3 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch1.id, counterNumber: '03' } },
    update: {},
    create: {
      id: 'counter-3',
      branchId: branch1.id,
      counterNumber: '03',
      name: 'Pathology Sample Station A',
      status: CounterStatus.BREAK,
      servicesOffered: [service3.id],
      staffUserId: 'staff-3',
    },
  });

  const counter4 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch1.id, counterNumber: '04' } },
    update: {},
    create: {
      id: 'counter-4',
      branchId: branch1.id,
      counterNumber: '04',
      name: 'Express Dispensary Counter',
      status: CounterStatus.CLOSED,
      servicesOffered: [service4.id],
    },
  });

  const counter5 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch2.id, counterNumber: '01' } },
    update: {},
    create: {
      id: 'counter-5',
      branchId: branch2.id,
      counterNumber: '01',
      name: 'Day Surgery Intake Desk',
      status: CounterStatus.OPEN,
      servicesOffered: [service1.id, service3.id],
    },
  });

  const counter6 = await prisma.counter.upsert({
    where: { branchId_counterNumber: { branchId: branch3.id, counterNumber: '01' } },
    update: {},
    create: {
      id: 'counter-6',
      branchId: branch3.id,
      counterNumber: '01',
      name: 'High-Value Cash Teller',
      status: CounterStatus.OPEN,
      servicesOffered: [service5.id],
    },
  });

  // 5. Users (30 demo users: 1 Admin, 5 Staff, 24 Citizens)
  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@queuesmart.dev' },
    update: {},
    create: {
      id: 'admin-demo',
      email: 'admin@queuesmart.dev',
      passwordHash,
      name: 'Priya Mehra (Facility Admin)',
      phone: '+91 98111 22233',
      role: UserRole.ADMIN,
      organizationId: org1.id,
      branchId: branch1.id,
    },
  });

  // Staff (5)
  const staffData = [
    { id: 'staff-1', name: 'Dr. Rajesh Sharma', email: 'staff@queuesmart.dev', phone: '+91 98200 12345', branchId: branch1.id },
    { id: 'staff-2', name: 'Dr. Ananya Roy', email: 'ananya@queuesmart.dev', phone: '+91 98200 23456', branchId: branch1.id },
    { id: 'staff-3', name: 'Vikas Kadam (Lab)', email: 'vikas@queuesmart.dev', phone: '+91 98200 34567', branchId: branch1.id },
    { id: 'staff-4', name: 'Preeti Deshmukh', email: 'preeti@queuesmart.dev', phone: '+91 98200 45678', branchId: branch2.id },
    { id: 'staff-5', name: 'Sanjay Verma (Teller)', email: 'sanjay@queuesmart.dev', phone: '+91 98200 56789', branchId: branch3.id },
  ];

  for (const st of staffData) {
    await prisma.user.upsert({
      where: { email: st.email },
      update: {},
      create: {
        id: st.id,
        email: st.email,
        passwordHash,
        name: st.name,
        phone: st.phone,
        role: UserRole.STAFF,
        organizationId: org1.id,
        branchId: st.branchId,
      },
    });
  }

  // Citizens (24 demo citizens)
  const citizenNames = [
    'Rahul Patel', 'Sneha Kulkarni', 'Amitabh Joshi', 'Rohan Gupta',
    'Neha Verma', 'Vikram Malhotra', 'Sunita Rao', 'Kavita Deshmukh',
    'Suresh Chandra', 'Meera Iyer', 'Deepak Mehta', 'Anjali Nair',
    'Pooja Shetty', 'Arjun Saxena', 'Karan Singhania', 'Ritu Bhatia',
    'Aditya Chopra', 'Divya Menon', 'Harish Tiwari', 'Gaurav Kapoor',
    'Manoj Pandey', 'Swati Das', 'Varun Aggarwal', 'Tanvi Shinde'
  ];

  const createdCitizenIds: string[] = [];

  for (let i = 0; i < citizenNames.length; i++) {
    const email = i === 0 ? 'citizen@queuesmart.dev' : `citizen${i + 1}@queuesmart.dev`;
    const phone = `+91 98765 ${43210 + i}`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: i === 0 ? 'citizen-demo' : `citizen-${i + 1}`,
        email,
        passwordHash,
        name: citizenNames[i],
        phone,
        role: UserRole.CITIZEN,
      },
    });
    createdCitizenIds.push(user.id);
  }

  // 6. Sample Active Tickets and Serving Ticket
  const ticket1 = await prisma.queueTicket.upsert({
    where: { id: 'ticket-1' },
    update: {},
    create: {
      id: 'ticket-1',
      tokenNo: 'A-101',
      type: TicketType.APPOINTMENT,
      priorityTier: PriorityTier.NORMAL,
      status: TicketStatus.SERVING,
      etaMinutes: 0,
      joinedAt: new Date(Date.now() - 20 * 60000),
      calledAt: new Date(Date.now() - 4 * 60000),
      servingAt: new Date(Date.now() - 4 * 60000),
      userId: createdCitizenIds[7], // Kavita Deshmukh
      userName: 'Kavita Deshmukh',
      userPhone: '+91 99223 34455',
      serviceId: service1.id,
      branchId: branch1.id,
      counterId: counter1.id,
      counterNumber: '01',
      peopleAhead: 0,
    },
  });

  await prisma.counter.update({
    where: { id: counter1.id },
    data: { currentTicketId: ticket1.id, servingStartedAt: new Date(Date.now() - 4 * 60000) },
  });

  const waitingSample = [
    { id: 'ticket-2', tokenNo: 'A-102', userIdx: 8, tier: PriorityTier.SENIOR, reason: 'Senior Citizen Age 68', eta: 8, ahead: 1 },
    { id: 'ticket-3', tokenNo: 'A-103', userIdx: 9, tier: PriorityTier.PREGNANT, reason: 'Second Trimester Checkup', eta: 18, ahead: 2 },
    { id: 'ticket-4', tokenNo: 'A-104', userIdx: 0, tier: PriorityTier.NORMAL, reason: undefined, eta: 26, ahead: 3 },
  ];

  for (const t of waitingSample) {
    await prisma.queueTicket.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        tokenNo: t.tokenNo,
        type: t.tokenNo === 'A-104' ? TicketType.APPOINTMENT : TicketType.WALKIN,
        priorityTier: t.tier,
        status: TicketStatus.WAITING,
        etaMinutes: t.eta,
        joinedAt: new Date(Date.now() - 12 * 60000),
        userId: createdCitizenIds[t.userIdx],
        userName: citizenNames[t.userIdx],
        userPhone: `+91 98765 ${43210 + t.userIdx}`,
        serviceId: service1.id,
        branchId: branch1.id,
        peopleAhead: t.ahead,
        priorityReason: t.reason,
      },
    });
  }

  // 7. Sample Appointments
  await prisma.appointment.upsert({
    where: { id: 'apt-1' },
    update: {},
    create: {
      id: 'apt-1',
      userId: 'citizen-demo',
      userName: 'Rahul Patel',
      userPhone: '+91 98765 43210',
      serviceId: service1.id,
      branchId: branch1.id,
      slotStart: new Date(Date.now() + 60 * 60000),
      slotEnd: new Date(Date.now() + 75 * 60000),
      status: AppointmentStatus.BOOKED,
      notes: 'General health checkup and seasonal flu consultation',
      ticketId: 'ticket-4',
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'apt-2' },
    update: {},
    create: {
      id: 'apt-2',
      userId: 'citizen-demo',
      userName: 'Rahul Patel',
      userPhone: '+91 98765 43210',
      serviceId: service3.id,
      branchId: branch1.id,
      slotStart: new Date(Date.now() + 24 * 3600 * 1000),
      slotEnd: new Date(Date.now() + 24 * 3600 * 1000 + 15 * 60000),
      status: AppointmentStatus.BOOKED,
      notes: 'Fasting lipid and HbA1c tests',
    },
  });

  // 8. Sample ServiceLogs for Analytics
  for (let i = 1; i <= 20; i++) {
    const started = new Date(Date.now() - (600 - i * 25) * 60000);
    const duration = 8 + (i % 7) * 1.5;
    const ended = new Date(started.getTime() + duration * 60000);

    await prisma.serviceLog.upsert({
      where: { id: `log-${i}` },
      update: {},
      create: {
        id: `log-${i}`,
        ticketId: ticket1.id,
        tokenNo: `A-${100 - i}`,
        counterId: counter1.id,
        counterNumber: '01',
        serviceId: service1.id,
        startedAt: started,
        endedAt: ended,
        durationMinutes: duration,
        status: 'COMPLETED',
      },
    });
  }

  console.log('✅ Seed completed successfully! (2 Orgs, 3 Branches, 5 Services, 6 Counters, 30 Users, Active Tickets & Logs)');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
