import React from 'react';
import { Bell, CheckCheck, Trash2, ShieldCheck } from 'lucide-react';
import { useToast } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const NotificationCenterPage: React.FC = () => {
  const { notifications, setNotifications, addNotification } = useCustomerStore();
  const { showToast } = useToast();

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    showToast('info', 'All notifications marked as read', 'Updated');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('info', 'Notification history cleared', 'Cleared');
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
            Alerts & Dispatches
          </span>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-0.5">
            Notification Center
          </h1>
            Real-time delivery log for browser notifications and alerts.
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllRead}
              className="px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-[#374151] dark:text-slate-200 hover:bg-[#F7F7F5] transition"
            >
              Mark Read
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              Clear
            </button>
          </div>
        )}
      </div>



      {/* Notification Stream */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-8 space-y-2">
            <Bell className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="font-semibold text-sm text-[#111827] dark:text-white">
              No Unread Notifications
            </h3>
            <p className="text-xs text-[#6B7280]">
              You will receive live sound chimes and pings as queue progress advances.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all ${
                notif.read
                  ? 'bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800 text-[#6B7280]'
                  : 'bg-white dark:bg-slate-900 border-[#0F4C5C]/40 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#0F4C5C] shrink-0" />
                    )}
                    <h4 className="font-semibold text-xs text-[#111827] dark:text-white">
                      {notif.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#374151] dark:text-slate-300">
                    {notif.message}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
