import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Bell,
  MessageSquare,
  Smartphone,
  Volume2,
  Shield,
  Save,
} from 'lucide-react';
import { useToast } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const ProfilePage: React.FC = () => {
  const { user, setUser, preferences, updatePreferences } = useCustomerStore();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email, setEmail] = useState(user?.email || 'priya@queuesmart.app');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, name, email, phone });
      }
      setIsSaving(false);
      showToast('success', 'Profile and transit preferences saved', 'Saved');
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 font-sans">
      <div>
        <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
          Account & Notifications
        </span>
        <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-0.5">
          Profile & Preferences
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#4B5563] dark:text-slate-400">
          Manage your contact credentials, turn alert channels, and transit travel notifications.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Account Security
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-[#F7F7F5] dark:bg-slate-800/40 text-xs font-medium text-[#4B5563] dark:text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0F4C5C]" />
                <span>Verified Citizen Role</span>
              </div>
            </div>
          </div>
        </div>

        {/* Turn Alert Channels */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader">
            Transit Pacing Alerts
          </h2>
          <p className="text-xs text-[#6B7280]">
            Configure how you wish to receive notifications as your turn approaches.
          </p>

          <div className="space-y-3">
            {[
              {
                id: 'sms',
                label: 'SMS Text Message',
                sub: 'Alert when 2 people are ahead of you in line',
                icon: Smartphone,
                active: preferences.sms,
                toggle: () => updatePreferences({ sms: !preferences.sms }),
              },
              {
                id: 'wa',
                label: 'WhatsApp Delivery',
                sub: 'Instant ticket dispatch and arrival time pings',
                icon: MessageSquare,
                active: preferences.whatsapp,
                toggle: () => updatePreferences({ whatsapp: !preferences.whatsapp }),
              },
              {
                id: 'audio',
                label: 'Audible Voice Chime',
                sub: 'Soft spoken announcement when your token is called',
                icon: Volume2,
                active: preferences.voiceAnnounce,
                toggle: () => updatePreferences({ voiceAnnounce: !preferences.voiceAnnounce }),
              },
            ].map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F7F5] dark:bg-slate-800/40 border border-[#E5E7EB] dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#0F4C5C] dark:text-teal-400" />
                    <div>
                      <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                        {channel.label}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">{channel.sub}</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channel.active}
                      onChange={channel.toggle}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
