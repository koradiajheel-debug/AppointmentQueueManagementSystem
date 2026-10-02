import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Ban,
  CalendarCheck,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  api,
  useToast,
  Appointment,
  APPOINTMENT_STATUS_CONFIG,
} from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const CalendarSchedulePage: React.FC = () => {
  const { services, appointments, setAppointments, selectedBranchId } = useAdminStore();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedServiceId, setSelectedServiceId] = useState('ALL');

  // Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBulkRescheduleModal, setShowBulkRescheduleModal] = useState(false);

  // Forms
  const [blockStartTime, setBlockStartTime] = useState('13:00');
  const [blockEndTime, setBlockEndTime] = useState('14:00');
  const [blockReason, setBlockReason] = useState('Specialist Training Seminar');

  const [rescheduleTargetDate, setRescheduleTargetDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [rescheduleReason, setRescheduleReason] = useState('Facility power maintenance');

  const [blockedSlots, setBlockedSlots] = useState<{ id: string; date: string; start: string; end: string; reason: string }[]>([
    {
      id: 'blk-1',
      date: new Date().toISOString().split('T')[0],
      start: '13:00',
      end: '14:00',
      reason: 'Scheduled Staff Lunch & Disinfection',
    },
  ]);

  useEffect(() => {
    api.getAppointments().then((res) => {
      if (res.data) setAppointments(res.data);
    });
  }, []);

  const handleBlockSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock = {
      id: `blk-${Date.now()}`,
      date: selectedDate,
      start: blockStartTime,
      end: blockEndTime,
      reason: blockReason,
    };
    setBlockedSlots([...blockedSlots, newBlock]);
    showToast('info', `Blocked slots from ${blockStartTime} to ${blockEndTime}`, 'Slot Blocked');
    setShowBlockModal(false);
  };

  const handleBulkReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.bulkReschedule({
        serviceId: services[0]?.id || 'srv-1',
        currentDate: selectedDate,
        targetDate: rescheduleTargetDate,
        delayMinutes: 0,
        reason: rescheduleReason,
      });

      if (res.data) {
        showToast('success', `Bulk rescheduled ${res.data.count} appointments to ${rescheduleTargetDate}!`, 'Rescheduled');
        setShowBulkRescheduleModal(false);
        const aptRes = await api.getAppointments();
        if (aptRes.data) setAppointments(aptRes.data);
      }
    } catch {
      showToast('error', 'Failed to execute bulk reschedule', 'Error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Schedule & Capacity Grid
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7C9A92] mt-0.5 font-mono">
            Slot Generation • Emergency Blocked Hours • Bulk Citizen Rescheduling
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D1D5DB] dark:border-white/10 bg-white dark:bg-white/5 hover:border-rose-300 text-[#374151] dark:text-white text-xs font-medium transition shadow-xs"
          >
            <Ban className="w-3.5 h-3.5 text-rose-500" />
            <span>Block Slots</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBulkRescheduleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bulk Reschedule</span>
          </button>
        </div>
      </div>

      {/* Date & Service Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F9FAFB] dark:bg-[#061210] border border-[#E5E7EB] dark:border-white/10 text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          />

          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F9FAFB] dark:bg-[#061210] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#374151] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-[#6B7280] dark:text-[#8EAAA2]">
          Viewing appointments for {new Date(selectedDate).toDateString()}
        </span>
      </div>

      {/* Grid Table of Slots */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white font-newsreader uppercase tracking-wider">
            Consultation Slots Timeline
          </h2>
          <span className="text-xs font-mono font-medium text-[#0F4C5C] dark:text-[#5EEAD4] bg-[#EAF3F1] dark:bg-white/5 px-2.5 py-1 rounded-full">
            {appointments.length} Booked
          </span>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] py-8 text-center">No slots booked for this date.</p>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D1D5DB] transition"
              >
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-lg bg-[#EAF3F1] dark:bg-[#0F4C5C]/30 text-[#0F4C5C] dark:text-[#5EEAD4] font-mono text-xs font-bold border border-[#A7D7C5] dark:border-[#0F4C5C]/40">
                    {new Date(apt.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#111827] dark:text-white text-xs">
                      {apt.userName} • <span className="text-[#6B7280] dark:text-[#8EAAA2]">{apt.serviceName}</span>
                    </h3>
                    <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#63847C]">
                      Ref: {apt.id} • {apt.userPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {apt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Block Slot Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#111827] dark:text-white font-newsreader">
              Block Capacity Time-Window
            </h3>
            <form onSubmit={handleBlockSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">End Time</label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Reason</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#4B5563]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-rose-600 text-xs text-white font-semibold shadow-xs"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Reschedule Modal */}
      {showBulkRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#111827] dark:text-white font-newsreader">
              Bulk Reschedule Citizens
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#8EAAA2]">
              Notify all affected citizens via automated SMS and assign consecutive slots on a new target date.
            </p>
            <form onSubmit={handleBulkReschedule} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">New Target Date</label>
                <input
                  type="date"
                  value={rescheduleTargetDate}
                  onChange={(e) => setRescheduleTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Notice Message</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkRescheduleModal(false)}
                  className="flex-1 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#4B5563]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-xs text-white font-semibold shadow-xs"
                >
                  Dispatch Notifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
