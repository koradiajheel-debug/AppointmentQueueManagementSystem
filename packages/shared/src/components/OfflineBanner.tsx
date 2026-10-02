import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="alert"
      className={`fixed top-0 inset-x-0 z-50 py-2.5 px-4 text-xs font-medium text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
        isOnline
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-600 text-white animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Connection restored! You are back online.</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>{t('common.offline_warning')}</span>
        </>
      )}
    </div>
  );
};
