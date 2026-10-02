import { create } from 'zustand';
import { QueueTicket, Appointment, User } from '@queuesmart/shared';
import type { Notification as QueueNotification } from '@queuesmart/shared';

interface NotificationPreferences {
  sms: boolean;
  whatsapp: boolean;
  webPush: boolean;
  voiceAnnounce: boolean;
  vibrate: boolean;
}

interface CustomerState {
  user: User | null;
  activeTicket: QueueTicket | null;
  appointments: Appointment[];
  notifications: QueueNotification[];
  preferences: NotificationPreferences;
  userLocation: { lat: number; lng: number } | null;
  isLocationLoading: boolean;
  pushPermission: NotificationPermission | 'unsupported';
  deferredInstallPrompt: any | null;
  showPushPrompt: boolean;
  isNavHidden: boolean;
  isDrawerOpen: boolean;

  setUser: (user: User | null) => void;
  setActiveTicket: (ticket: QueueTicket | null) => void;
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  setNotifications: (notifications: QueueNotification[]) => void;
  addNotification: (notification: QueueNotification) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  setUserLocation: (coords: { lat: number; lng: number } | null) => void;
  setIsLocationLoading: (loading: boolean) => void;
  setPushPermission: (status: NotificationPermission | 'unsupported') => void;
  setDeferredInstallPrompt: (prompt: any) => void;
  setShowPushPrompt: (show: boolean) => void;
  setIsNavHidden: (hidden: boolean) => void;
  toggleNavHidden: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  sms: true,
  whatsapp: true,
  webPush: true,
  voiceAnnounce: true,
  vibrate: true,
};

export const useCustomerStore = create<CustomerState>((set) => ({
  user: null,
  activeTicket: null,
  appointments: [],
  isNavHidden: false,
  isDrawerOpen: false,
  notifications: [
    {
      id: 'notif-1',
      title: 'Welcome to QueueSmart',
      message: 'You can join virtual queues remotely or book convenient appointment slots.',
      type: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ],
  preferences: DEFAULT_PREFERENCES,
  userLocation: null,
  isLocationLoading: false,
  pushPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  deferredInstallPrompt: null,
  showPushPrompt: false,

  setUser: (user) => set({ user }),
  setActiveTicket: (ticket) => {
    if (ticket) {
      localStorage.setItem('queuesmart_active_ticket_id', ticket.id);
    } else {
      localStorage.removeItem('queuesmart_active_ticket_id');
    }
    set({ activeTicket: ticket });
  },
  setAppointments: (appointments) => set({ appointments }),
  addAppointment: (appointment) =>
    set((state) => ({ appointments: [appointment, ...state.appointments] })),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  updatePreferences: (prefs) =>
    set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
  setUserLocation: (coords) => set({ userLocation: coords }),
  setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),
  setPushPermission: (status) => set({ pushPermission: status }),
  setDeferredInstallPrompt: (prompt) => set({ deferredInstallPrompt: prompt }),
  setShowPushPrompt: (show) => set({ showPushPrompt: show }),
  setIsNavHidden: (hidden) => set({ isNavHidden: hidden }),
  toggleNavHidden: () => set((state) => ({ isNavHidden: !state.isNavHidden })),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
