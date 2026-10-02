import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { DeviceTokenSchema } from '@queuesmart/shared';

// Helper: Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const getBranches = async (req: Request, res: Response) => {
  const { city, search } = req.query;

  const whereClause: any = {};
  if (city && typeof city === 'string') {
    whereClause.city = { equals: city, mode: 'insensitive' };
  }
  if (search && typeof search === 'string') {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  const branches = await prisma.branch.findMany({
    where: whereClause,
    include: {
      organization: { select: { id: true, name: true, code: true, type: true } },
      services: { where: { isActive: true }, select: { id: true, name: true, avgDurationMin: true } },
      counters: { select: { id: true, status: true, counterNumber: true } },
      _count: {
        select: {
          queueTickets: { where: { status: { in: ['WAITING', 'CALLED', 'SERVING'] } } },
        },
      },
    },
  });

  const formatted = branches.map((b) => {
    const openCounters = b.counters.filter((c) => c.status === 'OPEN').length;
    const activeTickets = b._count.queueTickets;
    const avgWaitEstimate = openCounters > 0 ? Math.ceil((activeTickets * 12) / openCounters) : activeTickets * 15;

    return {
      id: b.id,
      organizationId: b.organizationId,
      organizationName: b.organization.name,
      orgType: b.organization.type,
      name: b.name,
      address: b.address,
      city: b.city,
      phone: b.phone,
      latitude: b.latitude,
      longitude: b.longitude,
      operatingHours: b.operatingHours,
      totalServices: b.services.length,
      openCounters,
      totalCounters: b.counters.length,
      currentQueueDepth: activeTickets,
      estimatedWaitMin: avgWaitEstimate,
    };
  });

  return res.json({
    success: true,
    data: formatted,
  });
};

export const getBranchById = async (req: Request, res: Response) => {
  const { branchId } = req.params;

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      organization: true,
      services: { where: { isActive: true } },
      counters: true,
      holidays: { orderBy: { date: 'asc' } },
    },
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      error: { message: 'Branch not found', code: 'BRANCH_NOT_FOUND' },
    });
  }

  return res.json({
    success: true,
    data: branch,
  });
};

export const getServices = async (req: Request, res: Response) => {
  const { branchId } = req.query;

  if (!branchId || typeof branchId !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId query parameter is required', code: 'MISSING_BRANCH_ID' },
    });
  }

  const services = await prisma.service.findMany({
    where: { branchId, isActive: true },
    include: {
      _count: {
        select: {
          queueTickets: { where: { status: 'WAITING' } },
        },
      },
    },
  });

  const formatted = services.map((s) => ({
    id: s.id,
    branchId: s.branchId,
    name: s.name,
    description: s.description,
    avgDurationMin: s.avgDurationMin,
    slaMinutes: s.slaMinutes,
    priorityAllowed: s.priorityAllowed,
    waitingCount: s._count.queueTickets,
    estimatedWaitMin: s._count.queueTickets * s.avgDurationMin,
  }));

  return res.json({
    success: true,
    data: formatted,
  });
};

export const getCrowdForecast = async (req: Request, res: Response) => {
  const { branchId, date } = req.query;

  if (!branchId || typeof branchId !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId query parameter is required', code: 'MISSING_BRANCH_ID' },
    });
  }

  // Generate hourly forecast for standard hours (08:00 to 19:00)
  const hours = [
    { hour: '08:00', load: 'LOW', busyFactor: 0.3, predictedWaitMin: 8 },
    { hour: '09:00', load: 'MODERATE', busyFactor: 0.6, predictedWaitMin: 18 },
    { hour: '10:00', load: 'PEAK', busyFactor: 0.95, predictedWaitMin: 35 },
    { hour: '11:00', load: 'PEAK', busyFactor: 0.9, predictedWaitMin: 30 },
    { hour: '12:00', load: 'MODERATE', busyFactor: 0.65, predictedWaitMin: 20 },
    { hour: '13:00', load: 'LOW', busyFactor: 0.4, predictedWaitMin: 10 },
    { hour: '14:00', load: 'MODERATE', busyFactor: 0.55, predictedWaitMin: 15 },
    { hour: '15:00', load: 'PEAK', busyFactor: 0.85, predictedWaitMin: 28 },
    { hour: '16:00', load: 'MODERATE', busyFactor: 0.7, predictedWaitMin: 22 },
    { hour: '17:00', load: 'LOW', busyFactor: 0.35, predictedWaitMin: 10 },
    { hour: '18:00', load: 'LOW', busyFactor: 0.2, predictedWaitMin: 5 },
  ];

  return res.json({
    success: true,
    data: {
      branchId,
      date: date || new Date().toISOString().split('T')[0],
      hourlyForecast: hours,
      recommendedVisitingHours: ['08:00 - 09:30', '13:00 - 14:30', '17:00 - 18:30'],
    },
  });
};

export const calculateTravelTime = async (req: Request, res: Response) => {
  const { branchId, lat, lon } = req.query;

  if (!branchId || !lat || !lon) {
    return res.status(400).json({
      success: false,
      error: { message: 'branchId, lat, and lon query parameters are required', code: 'MISSING_PARAMS' },
    });
  }

  const branch = await prisma.branch.findUnique({
    where: { id: String(branchId) },
    select: { id: true, name: true, latitude: true, longitude: true },
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      error: { message: 'Branch not found', code: 'BRANCH_NOT_FOUND' },
    });
  }

  const userLat = parseFloat(String(lat));
  const userLon = parseFloat(String(lon));
  const distanceKm = calculateDistanceKm(userLat, userLon, branch.latitude, branch.longitude);

  // Estimate transit time: assume 25 km/h urban speed + 5 min buffer
  const drivingMinutes = Math.round((distanceKm / 25) * 60) + 5;
  const transitMinutes = Math.round((distanceKm / 18) * 60) + 10;
  const walkingMinutes = Math.round((distanceKm / 4.5) * 60);

  return res.json({
    success: true,
    data: {
      distanceKm,
      drivingMinutes,
      transitMinutes,
      walkingMinutes,
      recommendation:
        distanceKm > 10
          ? `Estimated driving time is ${drivingMinutes} mins. Depart at least 45 mins prior to slot.`
          : `Only ${distanceKm} km away (~${drivingMinutes} mins drive).`,
    },
  });
};

export const registerDeviceToken = async (req: Request, res: Response) => {
  const input = DeviceTokenSchema.parse(req.body);
  const userId = req.user?.userId;

  const token = await prisma.deviceToken.upsert({
    where: { token: input.token },
    update: {
      userId: userId || null,
      deviceType: input.deviceType,
      updatedAt: new Date(),
    },
    create: {
      token: input.token,
      userId: userId || null,
      deviceType: input.deviceType,
    },
  });

  return res.json({
    success: true,
    data: { message: 'Device token registered successfully', tokenId: token.id },
  });
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, address, city, phone, organizationId, operatingHours, latitude, longitude } = req.body;

    // Fallback organization if not provided
    let orgId = organizationId;
    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      orgId = firstOrg?.id;
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address: address || 'Main Road',
        city: city || 'Mumbai',
        phone: phone || '+91 98200 00000',
        latitude: latitude ? parseFloat(latitude) : 19.076,
        longitude: longitude ? parseFloat(longitude) : 72.8777,
        operatingHours: operatingHours || { open: '08:30', close: '18:00', workingDays: [1, 2, 3, 4, 5, 6] },
        organizationId: orgId,
      },
      include: {
        organization: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: branch,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to create branch' },
    });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.params;
    const { name, address, city, phone, operatingHours } = req.body;

    const branch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(phone && { phone }),
        ...(operatingHours && { operatingHours }),
      },
    });

    return res.json({
      success: true,
      data: branch,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to update branch' },
    });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.params;
    await prisma.branch.delete({
      where: { id: branchId },
    });

    return res.json({
      success: true,
      data: { deleted: true, branchId },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to delete branch' },
    });
  }
};
