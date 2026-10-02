import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Users,
  UploadCloud,
  CheckCircle2,
  FileText,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  api,
  useToast,
  Branch,
  Service,
  ForecastData,
  PriorityTier,
  PRIORITY_CONFIG,
} from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const SlotBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, addAppointment } = useCustomerStore();
  const { showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState(searchParams.get('branchId') || '');
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('serviceId') || '');
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
  );

  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  // Group & Priority
  const [isGroup, setIsGroup] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  const [priorityTier, setPriorityTier] = useState<PriorityTier>('NORMAL');
  const [notes, setNotes] = useState('');
  const [uploadedProofName, setUploadedProofName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any | null>(null);

  // Load initial branches and services
  useEffect(() => {
    const init = async () => {
      const [bRes, sRes] = await Promise.all([api.getBranches(), api.getServices()]);
      if (bRes.data) {
        setBranches(bRes.data);
        if (!selectedBranchId && bRes.data.length > 0) {
          setSelectedBranchId(bRes.data[0].id);
        }
      }
      if (sRes.data) {
        setServices(sRes.data);
        if (!selectedServiceId && sRes.data.length > 0) {
          setSelectedServiceId(sRes.data[0].id);
        }
      }
    };
    init();
  }, []);

  // Fetch slots and forecast
  useEffect(() => {
    if (!selectedServiceId) return;

    const fetchSlotsAndForecast = async () => {
      const [slotRes, foreRes] = await Promise.all([
        api.getSlots(selectedServiceId, selectedDate),
        api.getForecast(selectedServiceId),
      ]);
      if (slotRes.data) setSlots(slotRes.data);
      if (foreRes.data) setForecast(foreRes.data);
    };

    fetchSlotsAndForecast();
  }, [selectedServiceId, selectedDate]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeService = services.find((s) => s.id === selectedServiceId);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      showToast('error', 'Please select a preferred time slot', 'Slot Required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.createAppointment({
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        slotStart: selectedSlot.startTime,
        slotEnd: selectedSlot.endTime,
        notes,
        isGroup,
        groupSize: isGroup ? groupSize : 1,
        priorityTier,
      });

      if (res.success && res.data) {
        addAppointment(res.data);
        setCreatedAppointment(res.data);
        setIsBooked(true);
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch {
          // confetti optional
        }
        showToast('success', 'Appointment booked successfully!', 'Confirmed');
      } else {
        showToast('error', res.error?.message || 'Booking failed', 'Error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedProofName(e.target.files[0].name);
      showToast('info', `Attached proof: ${e.target.files[0].name}`, 'File Attached');
    }
  };

  if (isBooked && createdAppointment) {
    return (
      <div className="max-w-lg mx-auto pt-8 pb-16 px-4 text-center font-sans">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF3F1] text-[#0F4C5C] flex items-center justify-center mb-5 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[#111827] dark:text-white font-newsreader">
          Appointment Confirmed
        </h1>
        <p className="mt-1.5 text-sm text-[#4B5563] dark:text-slate-400">
          Your slot has been reserved. You can view it in your schedule anytime.
        </p>

        <div className="mt-6 text-left rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F3F4F6] dark:border-slate-800">
            <span className="text-xs text-[#6B7280]">Booking Reference</span>
            <span className="font-mono text-sm font-bold text-[#0F4C5C] dark:text-teal-400">
              {createdAppointment.id}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Service</span>
            <span className="font-semibold text-[#111827] dark:text-slate-200">
              {createdAppointment.serviceName}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Branch</span>
            <span className="font-semibold text-[#111827] dark:text-slate-200">
              {createdAppointment.branchName}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Date & Time</span>
            <span className="font-semibold text-[#111827] dark:text-slate-200">
              {new Date(createdAppointment.slotStart).toLocaleDateString()} at{' '}
              {new Date(createdAppointment.slotStart).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {isGroup && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280]">Group Size</span>
              <span className="font-semibold text-[#111827] dark:text-slate-200">
                {groupSize} visitors
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/my-appointments')}
            className="px-6 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-sm transition"
          >
            View in Appointments
          </button>
          <button
            type="button"
            onClick={() => setIsBooked(false)}
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-white text-xs font-semibold hover:bg-[#F7F7F5] transition"
          >
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-sans">
      <div>
        <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
          Schedule & Reservations
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-1">
          Book Appointment Slot
        </h1>
        <p className="mt-1 text-sm text-[#4B5563] dark:text-slate-400">
          Check historical counter velocity, view recommended low-crowd hours, and select your preferred slot.
        </p>
      </div>

      <form onSubmit={handleBooking} className="space-y-6">
        {/* Step 1: Branch & Service */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
              1
            </span>
            Facility & Department
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Branch Location
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Consultation Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              >
                {services
                  .filter((s) => s.branchId === selectedBranchId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (~{s.avgDurationMin} min)
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Date & Slots */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
                2
              </span>
              Select Date & Preferred Time
            </h2>

            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
            />
          </div>

          {/* Forecast Hint */}
          {forecast && (
            <div className="p-4 rounded-xl bg-[#F7F7F5] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700/80 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium text-[#0F4C5C] dark:text-teal-400">
                <TrendingDown className="w-4 h-4" />
                <span>Pacing Forecast for {activeService?.name}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4B5563] dark:text-slate-300">
                <p>
                  <strong className="text-[#10B981]">Recommended slots:</strong>{' '}
                  {forecast.bestHours.join(', ')}
                </p>
                <p>
                  <strong className="text-[#F59E0B]">Peak arrival hours:</strong>{' '}
                  {forecast.busiestHours.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Slots Grid */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const timeLabel = slot.startTime.split('T')[1].slice(0, 5);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      !slot.available
                        ? 'opacity-30 bg-[#F7F7F5] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white shadow-sm ring-2 ring-[#0F4C5C]/20'
                        : 'border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0F4C5C]/50'
                    }`}
                  >
                    <span className={`block font-mono font-semibold text-sm ${isSelected ? 'text-white' : 'text-[#111827] dark:text-slate-200'}`}>
                      {timeLabel}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : slot.crowdLevel === 'LOW'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : slot.crowdLevel === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {slot.crowdLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Priority & Notes */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
              3
            </span>
            Priority & Details (Optional)
          </h2>

          {/* Group Booking Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F7F5] dark:bg-slate-800/40 border border-[#E5E7EB] dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#0F4C5C] dark:text-teal-400" />
              <div>
                <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                  Family / Group Visit
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  Reserve consecutive tokens together
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
            </label>
          </div>

          {/* Priority Tiers */}
          <div>
            <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-2">
              Priority Triage Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY'] as PriorityTier[]).map((tier) => {
                const isSelected = priorityTier === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPriorityTier(tier)}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white shadow-sm'
                        : 'border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#4B5563] dark:text-slate-300 hover:border-[#D1D5DB]'
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
              Visit Purpose or Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Routine consultation, bringing previous lab reports..."
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !selectedSlot}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-medium text-xs shadow-md transition disabled:opacity-40"
          >
            {isLoading ? 'Reserving...' : 'Confirm Appointment Slot'}
          </button>
        </div>
      </form>
    </div>
  );
};
