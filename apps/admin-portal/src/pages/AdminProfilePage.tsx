import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Building2,
  Clock,
  Key,
  Bell,
  CheckCircle2,
  Lock,
  Save,
  Radio,
  Sliders,
  AlertTriangle,
  MonitorCheck,
  Calendar,
} from 'lucide-react';
import { useToast } from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const AdminProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, branches, selectedBranchId, setSelectedBranchId } = useAdminStore();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || 'Dr. Rajesh Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'sharma@queuesmart.dev');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98200 12345');
  const [role, setRole] = useState(currentUser?.role || 'STAFF');
  const [assignedStation, setAssignedStation] = useState('Counter 01 - OPD Clinical Desk');
  const [shiftHours, setShiftHours] = useState('08:30 AM - 04:30 PM (IST)');
  const [isAvailable, setIsAvailable] = useState(true);

  // Operator Alert Toggles
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [smsUrgent, setSmsUrgent] = useState(false);

  // Password / Security modal / state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name,
          email,
          phone,
          role: role as any,
        });
      }
      setIsSaving(false);
      showToast('success', 'Staff operator profile updated successfully', 'Saved');
    }, 300);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      showToast('error', 'New security PIN must be at least 4 digits', 'Security');
      return;
    }
    showToast('success', 'Operator authorization credentials updated', 'PIN Changed');
    setCurrentPin('');
    setNewPin('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#0F4C5C] dark:text-[#5EEAD4] uppercase tracking-wider bg-[#EAF3F1] dark:bg-white/10 px-2.5 py-0.5 rounded-full">
            Staff Operations Portal
          </span>
          <span className="text-xs text-[#6B7280] dark:text-stone-400 font-mono">
            ID: OP-7729-IN
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-1.5">
          Operator & Administrator Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#4B5563] dark:text-stone-400">
          Configure clinical or administrative desk identity, assigned physical counter station, shift telemetry, and emergency dispatch alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Operator Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081412] border border-[#E5E7EB] dark:border-white/10 shadow-xs flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center text-2xl font-bold shadow-md border-2 border-[#20697B]">
                {name.charAt(0)}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#081412] ${
                  isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={isAvailable ? 'Station Active' : 'Break Mode'}
              />
            </div>

            <h2 className="text-lg font-bold text-[#111827] dark:text-white font-newsreader">
              {name}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-stone-400 font-mono mt-0.5">
              {email}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] border border-[#0F4C5C]/20">
                {role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                LEVEL 3 CLEARANCE
              </span>
            </div>

            <div className="w-full border-t border-[#E5E7EB] dark:border-white/10 mt-5 pt-4 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                  Facility
                </span>
                <span className="font-semibold text-[#111827] dark:text-white truncate max-w-[150px]">
                  {branches.find((b) => b.id === selectedBranchId)?.name || 'Vile Parle'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400 flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                  Counter Desk
                </span>
                <span className="font-mono font-semibold text-[#111827] dark:text-white">
                  Counter 01
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                  Shift Pacing
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Active Duty
                </span>
              </div>
            </div>

            <div className="w-full mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsAvailable(!isAvailable);
                  showToast(
                    isAvailable ? 'info' : 'success',
                    isAvailable ? 'Station paused for meal / relief' : 'Station resumed serving live queue',
                    'Station Status'
                  );
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  isAvailable
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isAvailable ? 'Pause Station (Break Mode)' : 'Resume Station Duty'}</span>
              </button>
            </div>
          </div>

          {/* Security & Access Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#081412] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white font-newsreader">
                Security PIN & Auth
              </h3>
            </div>
            <form onSubmit={handleUpdatePin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-[#111827] dark:text-white font-mono focus:ring-1 focus:ring-[#0F4C5C] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                  New 4-Digit Operator PIN
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-[#111827] dark:text-white font-mono focus:ring-1 focus:ring-[#0F4C5C] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Update Security PIN</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Station Configuration & Contact Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Personal Details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#081412] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                Operator Contact & Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Operator Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Direct Phone / Hotwire
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'CITIZEN' | 'STAFF' | 'ADMIN')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-stone-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  >
                    <option value="STAFF">Staff Operator (Clinical / Desk)</option>
                    <option value="ADMIN">Facility Administrator (Full CRUD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Station Assignment & Shift Schedule */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#081412] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                Station Assignment & Operational Hours
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Primary Branch / Place
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-stone-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Counter Station Label
                  </label>
                  <input
                    type="text"
                    value={assignedStation}
                    onChange={(e) => setAssignedStation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-stone-400 mb-1">
                    Operating Shift Window
                  </label>
                  <input
                    type="text"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Alert & Dispatch Preferences */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#081412] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                Dispatch & Telemetry Notifications
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                      Audible Bell on Priority / Emergency Tickets
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">
                      Play acoustic chime when an elderly or triage citizen enters the queue.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#0F4C5C] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                      SLA Warning Banners (&gt; 20 Mins Wait)
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">
                      Display real-time telemetry warning if department wait times exceed SLA.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={slaAlerts}
                    onChange={(e) => setSlaAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#0F4C5C] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                      SMS Urgent Surge Alerts
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">
                      Receive SMS alert on your phone if branch queue overflows during shift.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsUrgent}
                    onChange={(e) => setSmsUrgent(e.target.checked)}
                    className="w-4 h-4 accent-[#0F4C5C] rounded"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold transition shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
