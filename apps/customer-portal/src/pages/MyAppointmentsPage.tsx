import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  QrCode,
  XCircle,
  CalendarDays,
} from 'lucide-react';
import {
  api,
  useToast,
  Appointment,
  APPOINTMENT_STATUS_CONFIG,
} from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const MyAppointmentsPage: React.FC = () => {
  const { user, appointments, setAppointments, activeTicket } = useCustomerStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.getAppointments();
        if (res.data) setAppointments(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter(
    (a) => a.status === 'BOOKED' || a.status === 'CHECKED_IN' || a.status === 'IN_SERVICE'
  );
  const history = appointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW'
  );

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await api.cancelAppointment(selectedAppointment.id, cancelReason);
      if (res.success) {
        setAppointments(
          appointments.map((a) =>
            a.id === selectedAppointment.id ? { ...a, status: 'CANCELLED' } : a
          )
        );
        showToast('info', 'Appointment cancelled', 'Cancelled');
        setShowCancelModal(false);
      }
    } catch {
      showToast('error', 'Failed to cancel appointment', 'Error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
            Schedule & Records
          </span>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-0.5">
            Appointments & Tickets
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563] dark:text-slate-400">
            View confirmed consultations, check-in barcodes, and past medical visits.
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-medium transition shadow-sm"
        >
          Book New Slot
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className={`py-3 px-5 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'UPCOMING'
              ? 'border-[#0F4C5C] text-[#0F4C5C] dark:border-teal-400 dark:text-teal-400 font-semibold'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] dark:hover:text-slate-200'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`py-3 px-5 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'HISTORY'
              ? 'border-[#0F4C5C] text-[#0F4C5C] dark:border-teal-400 dark:text-teal-400 font-semibold'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] dark:hover:text-slate-200'
          }`}
        >
          Past History ({history.length})
        </button>
      </div>

      {/* Active Live Ticket Callout (Modern Transit styling) */}
      {activeTicket && (
        <div className="p-5 rounded-2xl bg-[#081c18] border border-[#163b34] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0F4C5C] text-[#5EEAD4] flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-white">
                  Live Token {activeTicket.tokenNo}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Active In Queue
                </span>
              </div>
              <p className="text-xs text-[#7C9A92] mt-0.5">
                {activeTicket.serviceName} at {activeTicket.branchName} • ~{activeTicket.etaMinutes}m wait
              </p>
            </div>
          </div>

          <Link
            to="/live-ticket"
            className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#042017] font-semibold text-xs shadow-sm transition"
          >
            Open Live Ticket
          </Link>
        </div>
      )}

      {/* Appointments List (Quiet Editorial card styling) */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-8 space-y-3">
              <CalendarDays className="w-10 h-10 text-[#9CA3AF] mx-auto" />
              <h3 className="font-semibold text-sm text-[#111827] dark:text-white">
                No Upcoming Appointments
              </h3>
              <p className="text-xs text-[#6B7280]">
                You have no scheduled visits. Reserve a slot at your convenience.
              </p>
              <Link
                to="/book"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#0F4C5C] text-white text-xs font-medium"
              >
                Book Appointment
              </Link>
            </div>
          ) : (
            upcoming.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3F1] text-[#0F4C5C] border border-[#C5DDD7] dark:bg-teal-950 dark:text-teal-300">
                      Confirmed
                    </span>
                    <span className="text-[11px] font-mono text-[#9CA3AF]">
                      Ref: {apt.id}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#111827] dark:text-white text-base">
                    {apt.serviceName}
                  </h3>

                  <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    {apt.branchName}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#374151] dark:text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0F4C5C]" />
                      {new Date(apt.slotStart).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#0F4C5C]" />
                      {new Date(apt.slotStart).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowQrModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#F7F7F5] dark:bg-slate-800 text-xs font-medium text-[#1F2937] dark:text-white hover:bg-[#E5E7EB] transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#0F4C5C]" />
                    <span>View QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowCancelModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#6B7280]">
              No archived or past appointments.
            </div>
          ) : (
            history.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between text-xs text-[#6B7280]"
              >
                <div>
                  <h4 className="font-semibold text-[#111827] dark:text-white text-sm">
                    {apt.serviceName}
                  </h4>
                  <p>{apt.branchName} • {new Date(apt.slotStart).toLocaleDateString()}</p>
                </div>
                <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800">
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-[#111827] dark:text-white font-newsreader">
              Check-in Pass
            </h3>
            <p className="text-xs text-[#6B7280]">
              Show this code to the receptionist or kiosk scanner on arrival.
            </p>
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] inline-block mx-auto">
              <QRCodeSVG
                value={`https://queuesmart.app/checkin/${selectedAppointment.id}`}
                size={180}
              />
            </div>
            <div className="text-xs font-mono text-[#0F4C5C] font-semibold">
              {selectedAppointment.serviceName}
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0F4C5C] text-white text-xs font-medium"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-[#111827] dark:text-white font-newsreader">
              Cancel Appointment?
            </h3>
            <p className="text-xs text-[#6B7280]">
              This slot will immediately be made available to waiting citizens.
            </p>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)..."
              className="w-full p-2.5 text-xs rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F5] dark:bg-slate-800 text-xs font-medium"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="flex-1 py-2 rounded-xl bg-[#EF4444] text-white text-xs font-medium"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
