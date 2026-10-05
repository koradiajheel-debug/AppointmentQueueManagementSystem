import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ToastProvider,
  OfflineBanner,
  ServerWakingUp,
  ErrorBoundary,
  NotFoundPage,
  useToast,
} from '@queuesmart/shared';
import { Navbar, BottomNav } from './components/Navigation';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { WebPushPermissionModal } from './components/WebPushPermissionModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { BranchServicePickerPage } from './pages/BranchServicePickerPage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { JoinQueuePage } from './pages/JoinQueuePage';
import { LiveTicketPage } from './pages/LiveTicketPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { ProfilePage } from './pages/ProfilePage';
import { GuidedTour } from './components/GuidedTour';
import { SplashLoader } from './components/SplashLoader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const ServiceWorkerWatcher: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showToast(
                    'info',
                    'A new version of QueueSmart is available. Refresh to update.',
                    'Update Available',
                    8000
                  );
                }
              });
            }
          });
        })
        .catch((err) => console.warn('PWA ServiceWorker registration failed:', err));
    }
  }, [showToast]);

  return null;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <SplashLoader />
              <OfflineBanner />
              <ServerWakingUp />
              <PwaInstallBanner />
              <Navbar />

              <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/explore" element={<BranchServicePickerPage />} />
                  <Route path="/book" element={<SlotBookingPage />} />
                  <Route path="/join" element={<JoinQueuePage />} />
                  <Route path="/live-ticket" element={<LiveTicketPage />} />
                  <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                  <Route path="/notifications" element={<NotificationCenterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage homePath="/" />} />
                </Routes>
              </main>

              <BottomNav />
              <WebPushPermissionModal />
              <ServiceWorkerWatcher />
              <GuidedTour />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
