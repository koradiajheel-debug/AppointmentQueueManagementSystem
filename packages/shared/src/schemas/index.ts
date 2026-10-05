import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Please enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const AdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STAFF', 'ADMIN', 'DOCTOR']).default('STAFF'),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const CreateAppointmentSchema = z.object({
  branchId: z.string().min(1, 'Branch selection is required'),
  serviceId: z.string().min(1, 'Service selection is required'),
  slotStart: z.string().min(1, 'Slot start time is required'),
  slotEnd: z.string().min(1, 'Slot end time is required'),
  notes: z.string().optional(),
  isGroup: z.boolean().default(false),
  groupSize: z.number().int().min(1).max(10).default(1),
  priorityTier: z.enum(['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY']).default('NORMAL'),
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const CancelAppointmentSchema = z.object({
  reason: z.string().min(3, 'Please provide a reason for cancellation'),
});
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;

export const SwapAppointmentSchema = z.object({
  newSlotStart: z.string().min(1, 'New slot start time is required'),
  newSlotEnd: z.string().min(1, 'New slot end time is required'),
});
export type SwapAppointmentInput = z.infer<typeof SwapAppointmentSchema>;

export const JoinQueueSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  serviceId: z.string().min(1, 'Service is required'),
  userName: z.string().min(2, 'Name is required'),
  userPhone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Valid phone number is required'),
  priorityTier: z.enum(['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY']).default('NORMAL'),
  priorityReason: z.string().optional(),
  isGroup: z.boolean().default(false),
  groupSize: z.number().int().min(1).max(10).default(1),
});
export type JoinQueueInput = z.infer<typeof JoinQueueSchema>;

export const LeaveQueueSchema = z.object({
  reason: z.string().optional(),
});
export type LeaveQueueInput = z.infer<typeof LeaveQueueSchema>;

export const CallNextSchema = z.object({
  counterId: z.string().min(1, 'Counter ID is required'),
  serviceId: z.string().optional(),
});
export type CallNextInput = z.infer<typeof CallNextSchema>;

export const SkipTicketSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  reason: z.string().min(3, 'Reason for skip is required (e.g. No Show, Unresponsive)'),
});
export type SkipTicketInput = z.infer<typeof SkipTicketSchema>;

export const RecallTicketSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  counterId: z.string().optional(),
});
export type RecallTicketInput = z.infer<typeof RecallTicketSchema>;

export const TransferTicketSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  targetCounterId: z.string().optional(),
  targetServiceId: z.string().optional(),
  reason: z.string().min(3, 'Transfer reason is required'),
});
export type TransferTicketInput = z.infer<typeof TransferTicketSchema>;

export const ReorderQueueSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  newPosition: z.number().int().min(0, 'Position must be 0 or greater'),
  reason: z.string().min(5, 'Mandatory audit reason required for manual queue reordering'),
});
export type ReorderQueueInput = z.infer<typeof ReorderQueueSchema>;

export const WalkinRegistrationSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  serviceId: z.string().min(1, 'Service is required'),
  userName: z.string().min(2, 'Citizen name is required'),
  userPhone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Valid 10-digit mobile number required'),
  priorityTier: z.enum(['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY']).default('NORMAL'),
  priorityReason: z.string().optional(),
  isGroup: z.boolean().default(false),
  groupSize: z.number().int().min(1).max(10).default(1),
  counterId: z.string().optional(),
});
export type WalkinRegistrationInput = z.infer<typeof WalkinRegistrationSchema>;

export const UpdateCounterSchema = z.object({
  status: z.enum(['OPEN', 'BREAK', 'CLOSED']).optional(),
  servicesOffered: z.array(z.string()).optional(),
  staffUserId: z.string().nullable().optional(),
  name: z.string().optional(),
});
export type UpdateCounterInput = z.infer<typeof UpdateCounterSchema>;

export const CreateServiceSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  avgDurationMin: z.number().int().min(1).max(180, 'Duration between 1 and 180 min'),
  priorityAllowed: z.boolean().default(true),
  slaMinutes: z.number().int().min(5).max(300).default(20),
});
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;

export const CreateStaffSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Valid phone required'),
  role: z.enum(['STAFF', 'ADMIN']).default('STAFF'),
});
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;

export const ScheduleConfigSchema = z.object({
  branchId: z.string().min(1),
  openTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM'),
  lunchStart: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional(),
  lunchEnd: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional(),
  workingDays: z.array(z.number().min(0).max(6)),
  holidays: z.array(z.string()),
  blockedSlots: z.array(z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string(),
  })),
});
export type ScheduleConfigInput = z.infer<typeof ScheduleConfigSchema>;

export const BulkRescheduleSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  currentDate: z.string().min(1, 'Date is required'),
  targetDate: z.string().min(1, 'Target date is required'),
  delayMinutes: z.number().int().default(0),
  reason: z.string().min(5, 'Reason for bulk reschedule is required'),
});
export type BulkRescheduleInput = z.infer<typeof BulkRescheduleSchema>;

export const SimulateSchema = z.object({
  additionalCounters: z.number().int().min(-2).max(10).default(1),
  arrivalRateMultiplier: z.number().min(0.5).max(3.0).default(1.0),
  avgServiceTimeChangeMin: z.number().int().min(-10).max(20).default(0),
  serviceId: z.string().optional(),
});
export type SimulateInput = z.infer<typeof SimulateSchema>;

export const DeviceTokenSchema = z.object({
  token: z.string().min(10, 'Device token is required'),
  deviceType: z.string().default('web'),
});
export type DeviceTokenInput = z.infer<typeof DeviceTokenSchema>;
