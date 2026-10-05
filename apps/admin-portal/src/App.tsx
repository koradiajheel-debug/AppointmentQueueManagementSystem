import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ToastProvider,
  OfflineBanner,
  ServerWakingUp,
  ErrorBoundary,
  NotFoundPage,
  api,
} from '@queuesmart/shared';
import { AdminSidebar, AdminHeader } from './components/AdminNavigation';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { OperationsConsolePage } from './pages/OperationsConsolePage';
import { QueueBoardPage } from './pages/QueueBoardPage';
import { CalendarSchedulePage } from './pages/CalendarSchedulePage';
import { ManagementPage } from './pages/ManagementPage';
import { AnalyticsSimulatorPage } from './pages/AnalyticsSimulatorPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { LobbyTvDisplayPage } from './pages/LobbyTvDisplayPage';
import { SelfKioskPage } from './pages/SelfKioskPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { useAdminStore } from './store/useAdminStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { currentUser, setBranches, setServices, setCounters } = useAdminStore();

  const isStandalone =
    location.pathname === '/login' ||
    location.pathname === '/display' ||
    location.pathname === '/kiosk';

  useEffect(() => {
    api.getBranches().then((res) => {
      if (res.data) setBranches(res.data);
    });
    api.getServices().then((res) => {
      if (res.data) setServices(res.data);
    });
    api.getCounters().then((res) => {
      if (res.data) setCounters(res.data);
    });
  }, [setBranches, setServices, setCounters]);

  if (isStandalone) {
    return <>{children}</>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5] dark:bg-[#081412] text-[#1F2937] dark:text-[#E2E8F0]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F7F7F5] dark:bg-[#081412]">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#081412] text-[#1F2937] dark:text-[#E2E8F0] transition-colors duration-200">
              <OfflineBanner />
              <ServerWakingUp />
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/operations" element={<OperationsConsolePage />} />
                  <Route path="/login" element={<AdminLoginPage />} />
                  <Route path="/queue" element={<QueueBoardPage />} />
                  <Route path="/calendar" element={<CalendarSchedulePage />} />
                  <Route path="/manage" element={<ManagementPage />} />
                  <Route path="/analytics" element={<AnalyticsSimulatorPage />} />
                  <Route path="/profile" element={<AdminProfilePage />} />
                  <Route path="/health" element={<SystemHealthPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/display" element={<LobbyTvDisplayPage />} />
                  <Route path="/kiosk" element={<SelfKioskPage />} />
                  <Route path="*" element={<NotFoundPage homePath="/" />} />
                </Routes>
              </AdminLayout>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
