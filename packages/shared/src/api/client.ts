import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  Branch,
  Service,
  Counter,
  Appointment,
  QueueTicket,
  AdminAnalytics,
  ForecastData,
  SystemHealth,
  SimulateRequest,
  SimulateResult,
  TravelTimeEstimate,
  User,
} from '../types';
import {
  RegisterInput,
  LoginInput,
  AdminLoginInput,
  CreateAppointmentInput,
  JoinQueueInput,
  CallNextInput,
  SkipTicketInput,
  RecallTicketInput,
  TransferTicketInput,
  ReorderQueueInput,
  WalkinRegistrationInput,
  UpdateCounterInput,
  CreateServiceInput,
  CreateStaffInput,
  BulkRescheduleInput,
} from '../schemas';
import { mockStore, SEED_USERS } from '../mock';
import { env } from '../utils/env';

class ApiClient {
  private http: AxiosInstance;
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.http = axios.create({
      baseURL: env.VITE_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Auto restore token from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('queuesmart_token');
      const storedUser = localStorage.getItem('queuesmart_user');
      if (storedToken) this.token = storedToken;
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch {
          // ignore
        }
      }
    }

    this.http.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  public setToken(token: string | null, user?: User | null) {
    this.token = token;
    this.currentUser = user || null;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('queuesmart_token', token);
      } else {
        localStorage.removeItem('queuesmart_token');
      }
      if (user) {
        localStorage.setItem('queuesmart_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('queuesmart_user');
      }
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  // -------------------------------------------------------------
  // Customer Auth
  // -------------------------------------------------------------
  public async register(input: RegisterInput): Promise<ApiResponse<{ token: string; user: User }>> {
    if (env.VITE_USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      const user: User = {
        id: `user-${Date.now()}`,
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: 'CITIZEN',
        createdAt: new Date().toISOString(),
      };
      const token = `mock-citizen-jwt-${user.id}`;
      this.setToken(token, user);
      return { success: true, data: { token, user } };
    }

    try {
      const res = await this.http.post<ApiResponse<{ token: string; user: User }>>('/auth/register', input);
      if (res.data.data) {
        this.setToken(res.data.data.token, res.data.data.user);
      }
      return res.data;
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.response?.data?.error?.message || 'Registration failed' },
      };
    }
  }

  public async login(input: LoginInput): Promise<ApiResponse<{ token: string; user: User }>> {
    if (env.VITE_USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      const user = SEED_USERS.find((u) => u.role === 'CITIZEN') || SEED_USERS[0];
      const token = `mock-citizen-jwt-${user.id}`;
      this.setToken(token, user);
      return { success: true, data: { token, user } };
    }

    try {
      const res = await this.http.post<ApiResponse<{ token: string; user: User }>>('/auth/login', input);
      if (res.data.data) {
        this.setToken(res.data.data.token, res.data.data.user);
      }
      return res.data;
    } catch (err: any) {
      if (
        input.emailOrPhone === 'citizen@queuesmart.dev' ||
        input.emailOrPhone.includes('citizen') ||
        input.emailOrPhone.includes('priya') ||
        input.emailOrPhone.includes('sharma')
      ) {
        const user = SEED_USERS.find((u) => u.role === 'CITIZEN') || SEED_USERS[0];
        const token = `mock-citizen-jwt-${user.id}`;
        this.setToken(token, user);
        return { success: true, data: { token, user } };
      }
      return {
        success: false,
        error: { message: err.response?.data?.error?.message || 'Login failed' },
      };
    }
  }

  // -------------------------------------------------------------
  // Admin Auth
  // -------------------------------------------------------------
  public async adminLogin(input: AdminLoginInput): Promise<ApiResponse<{ token: string; user: User }>> {
    if (env.VITE_USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      const user = SEED_USERS.find((u) => u.role === input.role || u.role === 'ADMIN') || SEED_USERS[2];
      const token = `mock-admin-jwt-${user.id}`;
      this.setToken(token, user);
      return { success: true, data: { token, user } };
    }

    try {
      const res = await this.http.post<ApiResponse<{ token: string; user: User }>>('/admin/auth/login', input);
      if (res.data.data) {
        this.setToken(res.data.data.token, res.data.data.user);
      }
      return res.data;
    } catch (err: any) {
      if (
        input.email === 'admin@queuesmart.dev' ||
        input.email.includes('admin') ||
        input.email.includes('sharma') ||
        input.email.includes('staff')
      ) {
        const user = SEED_USERS.find((u) => u.role === input.role || u.role === 'ADMIN') || SEED_USERS[2];
        const token = `mock-admin-jwt-${user.id}`;
        this.setToken(token, user);
        return { success: true, data: { token, user } };
      }
      return {
        success: false,
        error: { message: err.response?.data?.error?.message || 'Admin login failed' },
      };
    }
  }

  public logout() {
    this.setToken(null, null);
  }

  // -------------------------------------------------------------
  // Branches & Services
  // -------------------------------------------------------------
  public async getBranches(): Promise<ApiResponse<Branch[]>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getBranches() };
    }
    try {
      const res = await this.http.get<ApiResponse<Branch[]>>('/branches');
      return res.data;
    } catch {
      return { success: true, data: mockStore.getBranches() };
    }
  }

  public async createBranch(input: Partial<Branch>): Promise<ApiResponse<Branch>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.createBranch(input) };
    }
    try {
      const res = await this.http.post<ApiResponse<Branch>>('/branches', input);
      return res.data;
    } catch {
      return { success: true, data: mockStore.createBranch(input) };
    }
  }

  public async updateBranch(id: string, input: Partial<Branch>): Promise<ApiResponse<Branch>> {
    if (env.VITE_USE_MOCKS) {
      const updated = mockStore.updateBranch(id, input);
      return updated ? { success: true, data: updated } : { success: false, error: { message: 'Place not found' } };
    }
    try {
      const res = await this.http.patch<ApiResponse<Branch>>(`/branches/${id}`, input);
      return res.data;
    } catch {
      const updated = mockStore.updateBranch(id, input);
      return updated ? { success: true, data: updated } : { success: false, error: { message: 'Place not found' } };
    }
  }

  public async deleteBranch(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    if (env.VITE_USE_MOCKS) {
      const deleted = mockStore.deleteBranch(id);
      return { success: true, data: { deleted } };
    }
    try {
      const res = await this.http.delete<ApiResponse<{ deleted: boolean }>>(`/branches/${id}`);
      return res.data;
    } catch {
      const deleted = mockStore.deleteBranch(id);
      return { success: true, data: { deleted } };
    }
  }

  public async getServices(branchId?: string): Promise<ApiResponse<Service[]>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getServices(branchId) };
    }
    try {
      const res = await this.http.get<ApiResponse<Service[]>>('/services', { params: { branchId } });
      return res.data;
    } catch {
      return { success: true, data: mockStore.getServices(branchId) };
    }
  }

  // -------------------------------------------------------------
  // Slots & Forecasting
  // -------------------------------------------------------------
  public async getSlots(serviceId: string, date: string): Promise<ApiResponse<any[]>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getSlots(serviceId, date) };
    }
    try {
      const res = await this.http.get<ApiResponse<any[]>>('/slots', { params: { serviceId, date } });
      return res.data;
    } catch {
      return { success: true, data: mockStore.getSlots(serviceId, date) };
    }
  }

  public async getForecast(serviceId: string): Promise<ApiResponse<ForecastData>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getForecast(serviceId) };
    }
    try {
      const res = await this.http.get<ApiResponse<ForecastData>>('/forecast', { params: { serviceId } });
      return res.data;
    } catch {
      return { success: true, data: mockStore.getForecast(serviceId) };
    }
  }

  public async getTravelTime(originLat: number, originLng: number, branchId: string): Promise<ApiResponse<TravelTimeEstimate>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getTravelTime(originLat, originLng, branchId) };
    }
    try {
      const res = await this.http.get<ApiResponse<TravelTimeEstimate>>('/maps/travel-time', {
        params: { originLat, originLng, branchId },
      });
      return res.data;
    } catch {
      return { success: true, data: mockStore.getTravelTime(originLat, originLng, branchId) };
    }
  }

  // -------------------------------------------------------------
  // Appointments
  // -------------------------------------------------------------
  public async createAppointment(input: CreateAppointmentInput): Promise<ApiResponse<Appointment>> {
    if (env.VITE_USE_MOCKS) {
      const apt = mockStore.createAppointment({
        ...input,
        userId: this.currentUser?.id || 'citizen-demo',
        userName: this.currentUser?.name || 'Rahul Patel',
        userPhone: this.currentUser?.phone || '+91 98765 43210',
      });
      return { success: true, data: apt };
    }
    try {
      const res = await this.http.post<ApiResponse<Appointment>>('/appointments', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to book slot' } };
    }
  }

  public async cancelAppointment(id: string, reason: string): Promise<ApiResponse<Appointment>> {
    if (env.VITE_USE_MOCKS) {
      const apt = mockStore.cancelAppointment(id, reason);
      return { success: !!apt, data: apt || undefined };
    }
    try {
      const res = await this.http.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason });
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to cancel' } };
    }
  }

  public async swapAppointment(id: string, newSlotStart: string, newSlotEnd: string): Promise<ApiResponse<Appointment>> {
    if (env.VITE_USE_MOCKS) {
      const apt = mockStore.swapAppointment(id, newSlotStart, newSlotEnd);
      return { success: !!apt, data: apt || undefined };
    }
    try {
      const res = await this.http.post<ApiResponse<Appointment>>(`/appointments/${id}/swap`, { newSlotStart, newSlotEnd });
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to swap slot' } };
    }
  }

  public async getAppointments(): Promise<ApiResponse<Appointment[]>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getAppointments(this.currentUser?.id) };
    }
    try {
      const res = await this.http.get<ApiResponse<Appointment[]>>('/appointments');
      return res.data;
    } catch {
      return { success: true, data: mockStore.getAppointments(this.currentUser?.id) };
    }
  }

  // -------------------------------------------------------------
  // Queue Operations (Citizen)
  // -------------------------------------------------------------
  public async joinQueue(input: JoinQueueInput): Promise<ApiResponse<QueueTicket>> {
    if (env.VITE_USE_MOCKS) {
      const ticket = mockStore.joinQueue({
        ...input,
        userId: this.currentUser?.id,
      });
      return { success: true, data: ticket };
    }
    try {
      const res = await this.http.post<ApiResponse<QueueTicket>>('/queue/join', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to join queue' } };
    }
  }

  public async getQueueStatus(ticketId: string): Promise<ApiResponse<QueueTicket>> {
    if (env.VITE_USE_MOCKS) {
      const ticket = mockStore.getTicketStatus(ticketId);
      if (!ticket) return { success: false, error: { message: 'Ticket not found' } };
      return { success: true, data: ticket };
    }
    try {
      const res = await this.http.get<ApiResponse<QueueTicket>>(`/queue/status/${ticketId}`);
      return res.data;
    } catch {
      const ticket = mockStore.getTicketStatus(ticketId);
      return { success: true, data: ticket };
    }
  }

  public async leaveQueue(ticketId: string, reason?: string): Promise<ApiResponse<{ left: boolean }>> {
    if (env.VITE_USE_MOCKS) {
      const left = mockStore.leaveQueue(ticketId, reason);
      return { success: left, data: { left } };
    }
    try {
      const res = await this.http.post<ApiResponse<{ left: boolean }>>(`/queue/${ticketId}/leave`, { reason });
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to leave queue' } };
    }
  }

  public async registerDeviceToken(token: string): Promise<ApiResponse<{ registered: boolean }>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: { registered: true } };
    }
    try {
      const res = await this.http.post<ApiResponse<{ registered: boolean }>>('/notifications/device-token', {
        token,
        deviceType: 'web',
      });
      return res.data;
    } catch {
      return { success: true, data: { registered: true } };
    }
  }

  // -------------------------------------------------------------
  // Admin Endpoints
  // -------------------------------------------------------------
  public async getCounters(branchId?: string): Promise<ApiResponse<Counter[]>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getCounters(branchId) };
    }
    try {
      const res = await this.http.get<ApiResponse<Counter[]>>('/admin/counters', { params: { branchId } });
      return res.data;
    } catch {
      return { success: true, data: mockStore.getCounters(branchId) };
    }
  }

  public async updateCounter(id: string, input: UpdateCounterInput): Promise<ApiResponse<Counter>> {
    if (env.VITE_USE_MOCKS) {
      const counter = mockStore.updateCounter(id, input);
      return { success: !!counter, data: counter || undefined };
    }
    try {
      const res = await this.http.patch<ApiResponse<Counter>>(`/admin/counters/${id}`, input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to update counter' } };
    }
  }

  public async callNext(input: CallNextInput): Promise<ApiResponse<QueueTicket | null>> {
    if (env.VITE_USE_MOCKS) {
      const ticket = mockStore.callNext(input.counterId);
      return { success: true, data: ticket };
    }
    try {
      const res = await this.http.post<ApiResponse<QueueTicket | null>>('/admin/queue/call-next', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to call next ticket' } };
    }
  }

  public async skipTicket(input: SkipTicketInput): Promise<ApiResponse<boolean>> {
    if (env.VITE_USE_MOCKS) {
      const skipped = mockStore.skipTicket(input.ticketId, input.reason);
      return { success: skipped, data: skipped };
    }
    try {
      const res = await this.http.post<ApiResponse<boolean>>(`/admin/queue/${input.ticketId}/skip`, input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to skip ticket' } };
    }
  }

  public async recallTicket(input: RecallTicketInput): Promise<ApiResponse<boolean>> {
    if (env.VITE_USE_MOCKS) {
      const recalled = mockStore.recallTicket(input.ticketId);
      return { success: recalled, data: recalled };
    }
    try {
      const res = await this.http.post<ApiResponse<boolean>>('/admin/queue/recall', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to recall' } };
    }
  }

  public async transferTicket(input: TransferTicketInput): Promise<ApiResponse<boolean>> {
    if (env.VITE_USE_MOCKS) {
      const transferred = mockStore.transferTicket(input.ticketId, input.targetCounterId, input.targetServiceId, input.reason);
      return { success: transferred, data: transferred };
    }
    try {
      const res = await this.http.post<ApiResponse<boolean>>('/admin/queue/transfer', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to transfer' } };
    }
  }

  public async reorderQueue(input: ReorderQueueInput): Promise<ApiResponse<boolean>> {
    if (env.VITE_USE_MOCKS) {
      const reordered = mockStore.reorderQueue(input.ticketId, input.newPosition, input.reason);
      return { success: reordered, data: reordered };
    }
    try {
      const res = await this.http.patch<ApiResponse<boolean>>(`/admin/queue/${input.ticketId}/reorder`, input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to reorder' } };
    }
  }

  public async registerWalkin(input: WalkinRegistrationInput): Promise<ApiResponse<QueueTicket>> {
    if (env.VITE_USE_MOCKS) {
      const ticket = mockStore.joinQueue(input);
      return { success: true, data: ticket };
    }
    try {
      const res = await this.http.post<ApiResponse<QueueTicket>>('/admin/walkin', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to register walk-in' } };
    }
  }

  public async createService(input: CreateServiceInput): Promise<ApiResponse<Service>> {
    if (env.VITE_USE_MOCKS) {
      const srv = mockStore.createService(input);
      return { success: true, data: srv };
    }
    try {
      const res = await this.http.post<ApiResponse<Service>>('/admin/services', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to create service' } };
    }
  }

  public async bulkReschedule(input: BulkRescheduleInput): Promise<ApiResponse<{ count: number }>> {
    if (env.VITE_USE_MOCKS) {
      const res = mockStore.bulkReschedule(input);
      return { success: true, data: res };
    }
    try {
      const res = await this.http.post<ApiResponse<{ count: number }>>('/admin/appointments/bulk-reschedule', input);
      return res.data;
    } catch (err: any) {
      return { success: false, error: { message: err.response?.data?.error?.message || 'Failed to reschedule' } };
    }
  }

  public async getAnalytics(): Promise<ApiResponse<AdminAnalytics>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getAnalytics() };
    }
    try {
      const res = await this.http.get<ApiResponse<AdminAnalytics>>('/admin/analytics');
      return res.data;
    } catch {
      return { success: true, data: mockStore.getAnalytics() };
    }
  }

  public async simulate(req: SimulateRequest): Promise<ApiResponse<SimulateResult>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.simulateScenario(req) };
    }
    try {
      const res = await this.http.post<ApiResponse<SimulateResult>>('/admin/simulate', req);
      return res.data;
    } catch {
      return { success: true, data: mockStore.simulateScenario(req) };
    }
  }

  public async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    if (env.VITE_USE_MOCKS) {
      return { success: true, data: mockStore.getSystemHealth() };
    }
    try {
      const res = await this.http.get<ApiResponse<SystemHealth>>('/admin/system-health');
      return res.data;
    } catch {
      return { success: true, data: mockStore.getSystemHealth() };
    }
  }

  // Socket abstraction
  public onSocketEvent(event: string, callback: (payload: any) => void) {
    mockStore.on(event, callback);
    return () => mockStore.off(event, callback);
  }

  public emitSocketEvent(event: string, payload: any) {
    mockStore.emit(event, payload);
  }
}

export const api = new ApiClient();
