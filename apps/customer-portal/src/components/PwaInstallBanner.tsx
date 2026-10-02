import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const PwaInstallBanner: React.FC = () => {
  const { deferredInstallPrompt, setDeferredInstallPrompt } = useCustomerStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [setDeferredInstallPrompt]);

  if (!deferredInstallPrompt || dismissed) return null;

  const handleInstallClick = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  return (
    <aside
      aria-label="Install App"
      className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3 shadow-md transition-all animate-in slide-in-from-top-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold">Install QueueSmart App</p>
            <p className="text-white/80 text-[11px] hidden sm:block">
              Add to your home screen for instant offline ticket access & real-time buzz alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-white text-indigo-700 hover:bg-slate-100 shadow-sm"
          >
            Install
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
