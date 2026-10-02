import { PriorityTier, TicketStatus, CounterStatus, AppointmentStatus } from '../types';

export const PRIORITY_CONFIG: Record<
  PriorityTier,
  { label: string; bg: string; text: string; border: string; icon: string; rank: number }
> = {
  EMERGENCY: {
    label: 'Emergency',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    icon: 'AlertTriangle',
    rank: 1,
  },
  PREGNANT: {
    label: 'Expectant Mother',
    bg: 'bg-pink-100 dark:bg-pink-950/60',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-800',
    icon: 'Heart',
    rank: 2,
  },
  DISABLED: {
    label: 'Differently Abled',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    icon: 'Accessibility',
    rank: 3,
  },
  SENIOR: {
    label: 'Senior Citizen',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    icon: 'Award',
    rank: 4,
  },
  NORMAL: {
    label: 'Standard',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: 'User',
    rank: 5,
  },
};

export const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  WAITING: {
    label: 'Waiting in Queue',
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  CALLED: {
    label: 'Now Called',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500 animate-ping',
  },
  SERVING: {
    label: 'In Service',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  DONE: {
    label: 'Completed',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  SKIPPED: {
    label: 'Skipped / No Show',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

export const COUNTER_STATUS_CONFIG: Record<
  CounterStatus,
  { label: string; badge: string; dot: string }
> = {
  OPEN: {
    label: 'Serving / Open',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  BREAK: {
    label: 'On Break',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  CLOSED: {
    label: 'Closed',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; badge: string }
> = {
  BOOKED: {
    label: 'Confirmed',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
  },
  CHECKED_IN: {
    label: 'Checked In',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
  },
  IN_SERVICE: {
    label: 'In Service',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  },
  NO_SHOW: {
    label: 'No Show',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300',
  },
};
