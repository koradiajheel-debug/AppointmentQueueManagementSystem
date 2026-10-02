import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Button, api, useToast } from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const SlaAlertBanner: React.FC = () => {
  const { activeAlerts, dismissAlert, counters, updateCounter } = useAdminStore();
  const { showToast } = useToast();

  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  const handleResolveAction = async () => {
    // Look for a closed counter to open
    const closed = counters.find((c) => c.status === 'CLOSED' || c.status === 'BREAK');
    if (closed) {
      const updated = await api.updateCounter(closed.id, { status: 'OPEN' });
      if (updated.data) {
        updateCounter(updated.data);
        showToast('success', `Opened Counter ${closed.counterNumber} to relieve queue pressure!`, 'SLA Relieved');
        dismissAlert(0);
      }
    } else {
      showToast('info', 'All counters are already active.', 'Max Capacity');
      dismissAlert(0);
    }
  };

  return (
    <aside
      aria-label="SLA Alert"
      className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold">⚠️ Queue SLA Warning</p>
          <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5">
            {currentAlert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {currentAlert.suggestedAction && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleResolveAction}
            className="bg-amber-600 hover:bg-amber-700 text-white border-none text-xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {currentAlert.suggestedAction}
          </Button>
        )}
        <button
          type="button"
          onClick={() => dismissAlert(0)}
          aria-label="Dismiss alert"
          className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
