import { create } from 'zustand';
import {
  User,
  Counter,
  QueueTicket,
  Service,
  Branch,
  Appointment,
  QueueAlertEvent,
} from '@queuesmart/shared';

interface AdminState {
  currentUser: User | null;
  selectedBranchId: string;
  branches: Branch[];
  counters: Counter[];
  tickets: QueueTicket[];
  services: Service[];
  appointments: Appointment[];
  activeAlerts: QueueAlertEvent[];
  selectedCounterId: string | null;

  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  setCurrentUser: (user: User | null) => void;
  setSelectedBranchId: (branchId: string) => void;
  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Branch) => void;
  updateBranchInStore: (branch: Branch) => void;
  deleteBranchFromStore: (id: string) => void;
  setCounters: (counters: Counter[]) => void;
  updateCounter: (counter: Counter) => void;
  setTickets: (tickets: QueueTicket[]) => void;
  updateTicket: (ticket: QueueTicket) => void;
  setServices: (services: Service[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  addAlert: (alert: QueueAlertEvent) => void;
  dismissAlert: (index: number) => void;
  setSelectedCounterId: (counterId: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  currentUser: null,
  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  selectedBranchId: 'branch-1',
  branches: [],
  counters: [],
  tickets: [],
  services: [],
  appointments: [],
  activeAlerts: [
    {
      branchId: 'branch-1',
      serviceId: 'srv-1',
      type: 'SLA_WARNING',
      message: 'General OPD queue wait time is exceeding 22 mins. Consider opening Counter 04.',
      suggestedAction: 'Open Counter 04',
      timestamp: new Date().toISOString(),
    },
  ],
  selectedCounterId: 'counter-1',

  setCurrentUser: (user) => {
    if (user?.branchId) {
      set({ currentUser: user, selectedBranchId: user.branchId });
    } else {
      set({ currentUser: user });
    }
  },
  setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),
  setBranches: (branches) => set({ branches }),
  addBranch: (branch) => set((state) => ({ branches: [...state.branches, branch] })),
  updateBranchInStore: (branch) =>
    set((state) => ({
      branches: state.branches.map((b) => (b.id === branch.id ? branch : b)),
    })),
  deleteBranchFromStore: (id) =>
    set((state) => ({
      branches: state.branches.filter((b) => b.id !== id),
    })),
  setCounters: (counters) => set({ counters }),
  updateCounter: (counter) =>
    set((state) => ({
      counters: state.counters.map((c) => (c.id === counter.id ? counter : c)),
    })),
  setTickets: (tickets) => set({ tickets }),
  updateTicket: (ticket) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
    })),
  setServices: (services) => set({ services }),
  setAppointments: (appointments) => set({ appointments }),
  addAlert: (alert) => set((state) => ({ activeAlerts: [alert, ...state.activeAlerts] })),
  dismissAlert: (index) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((_, i) => i !== index),
    })),
  setSelectedCounterId: (counterId) => set({ selectedCounterId: counterId }),
}));
