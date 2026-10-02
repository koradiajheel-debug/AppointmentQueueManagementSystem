import React, { useState, useEffect } from 'react';
import { Server, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { env } from '../utils/env';

export const ServerWakingUp: React.FC = () => {
  const [isSlow, setIsSlow] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (env.VITE_USE_MOCKS) {
      // In mock mode, server is always considered immediate
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const checkHealth = async () => {
      timer = setTimeout(() => {
        setIsSlow(true);
        setIsAwake(false);
      }, 2500);

      try {
        const res = await fetch(`${env.VITE_API_URL.replace('/api/v1', '')}/health`, {
          method: 'GET',
          cache: 'no-store',
        });
        clearTimeout(timer);
        if (res.ok) {
          if (isSlow) {
            setIsAwake(true);
            setTimeout(() => setIsSlow(false), 3000);
          }
        }
      } catch {
        // server might still be waking up
      }
    };

    checkHealth();
    return () => clearTimeout(timer);
  }, [isSlow]);

  if (!isSlow) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 text-white text-xs border border-slate-700 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 max-w-md"
    >
      {isAwake ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
      )}
      <div>
        <p className="font-semibold flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          {isAwake ? 'Server Connected' : 'Server is Waking Up'}
        </p>
        <p className="text-slate-300 text-[11px] mt-0.5">
          {isAwake
            ? 'Backend services are now fully initialized and active.'
            : t('common.server_waking')}
        </p>
      </div>
    </div>
  );
};
