import React, { useState } from 'react';
import { BellRing, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { Modal, Button, api, useToast } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const WebPushPermissionModal: React.FC = () => {
  const { showPushPrompt, setShowPushPrompt, setPushPermission } = useCustomerStore();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      showToast('warning', 'Push notifications are not supported in this browser.', 'Not Supported');
      setPushPermission('unsupported');
      setShowPushPrompt(false);
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        const dummyToken = `fcm-token-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
        await api.registerDeviceToken(dummyToken);
        showToast('success', 'Turn notifications activated! You will receive alerts when your token is called.', 'Alerts On');
      } else if (permission === 'denied') {
        showToast('info', 'Notifications are blocked. You can still see your live position on screen.', 'Permission Blocked');
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    } finally {
      setIsLoading(false);
      setShowPushPrompt(false);
    }
  };

  return (
    <Modal
      isOpen={showPushPrompt}
      onClose={() => setShowPushPrompt(false)}
      size="sm"
      showCloseButton={true}
    >
      <div className="text-center pt-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4 animate-bounce-subtle">
          <BellRing className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Never Miss Your Turn
        </h3>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          QueueSmart can notify you as soon as your token is 2 people away and when your counter is ready, even if your phone screen is locked.
        </p>

        <div className="mt-5 space-y-2.5 text-left bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Gentle vibration alert when 2 persons ahead</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Counter number announcement straight to your lock screen</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Zero spam: only alerts for your active queue token</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onClick={handleRequestPermission}
            className="w-full"
          >
            Enable Turn Notifications
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPushPrompt(false)}
            className="text-slate-500"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
};
