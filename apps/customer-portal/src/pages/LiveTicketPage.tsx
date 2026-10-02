import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Car,
  QrCode,
  X,
  LayoutGrid,
  Volume2,
  VolumeX,
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Modal,
  api,
  audio,
  useToast,
  QueueTicket,
  TravelTimeEstimate,
  Branch,
} from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const LiveTicketPage: React.FC = () => {
  const {
    activeTicket,
    setActiveTicket,
    userLocation,
    setUserLocation,
    isLocationLoading,
    setIsLocationLoading,
    preferences,
    updatePreferences,
  } = useCustomerStore();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [travelEstimate, setTravelEstimate] = useState<TravelTimeEstimate | null>({
    originLat: 19.102,
    originLng: 72.845,
    destLat: 19.105,
    destLng: 72.842,
    distanceKm: 2.3,
    travelMinutes: 6,
    trafficLevel: 'LIGHT',
    leaveByTime: new Date(Date.now() + 600000).toISOString(),
    recommendedAction: 'PREPARE_TO_LEAVE',
  });
  const [branch, setBranch] = useState<Branch | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasAnnouncedRef = useRef(false);

  // Poll or restore ticket from localStorage if missing
  useEffect(() => {
    if (!activeTicket) {
      const savedTicketId = localStorage.getItem('queuesmart_active_ticket_id');
      if (savedTicketId) {
        api.getQueueStatus(savedTicketId).then((res) => {
          if (res.data) setActiveTicket(res.data);
        });
      } else {
        // Fallback demo ticket matching the board if user opens /live-ticket directly
        const demoTicket: QueueTicket = {
          id: 'ticket-demo-102',
          tokenNo: 'A-102',
          type: 'WALKIN',
          priorityTier: 'NORMAL',
          status: 'WAITING',
          etaMinutes: 8,
          peopleAhead: 1,
          joinedAt: new Date(Date.now() - 10 * 60000).toISOString(),
          userName: 'Priya Mehra',
          userPhone: '+91 98765 43210',
          serviceId: 'srv-1',
          serviceName: 'General OPD',
          branchId: 'branch-1',
          branchName: 'Main Branch - Vile Parle',
          counterNumber: '02',
        };
        setActiveTicket(demoTicket);
      }
      return;
    }

    // Socket.IO listeners
    const unsubCalled = api.onSocketEvent('ticket:called', (payload: any) => {
      if (payload.ticketId === activeTicket.id || payload.tokenNo === activeTicket.tokenNo) {
        setActiveTicket({
          ...activeTicket,
          status: 'CALLED',
          counterNumber: payload.counterNumber,
          counterId: payload.counterId,
        });

        if (preferences.voiceAnnounce && !hasAnnouncedRef.current) {
          hasAnnouncedRef.current = true;
          audio.announceToken(activeTicket.tokenNo, payload.counterNumber, activeTicket.serviceName);
        }

        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch {}

        showToast(
          'success',
          `Your token ${activeTicket.tokenNo} has been called at Counter ${payload.counterNumber}!`,
          'Proceed to Counter',
          10000
        );
      }
    });

    const unsubEta = api.onSocketEvent('eta:updated', (payload: any) => {
      if (payload.ticketId === activeTicket.id) {
        setActiveTicket({
          ...activeTicket,
          etaMinutes: payload.etaMinutes,
          peopleAhead: payload.peopleAhead,
        });
      }
    });

    const unsubQueue = api.onSocketEvent('queue:update', () => {
      api.getQueueStatus(activeTicket.id).then((res) => {
        if (res.data) setActiveTicket(res.data);
      });
    });

    return () => {
      unsubCalled();
      unsubEta();
      unsubQueue();
    };
  }, [activeTicket?.id]);

  const handleRefresh = async () => {
    if (!activeTicket) return;
    setIsRefreshing(true);
    try {
      const res = await api.getQueueStatus(activeTicket.id);
      if (res.data) {
        setActiveTicket(res.data);
        showToast('info', 'Queue status refreshed');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!activeTicket) return;
    try {
      await api.leaveQueue(activeTicket.id, leaveReason);
      setActiveTicket(null);
      localStorage.removeItem('queuesmart_active_ticket_id');
      setShowLeaveModal(false);
      showToast('info', 'You have left the queue.');
      navigate('/');
    } catch {
      showToast('error', 'Failed to leave queue. Please try again.');
    }
  };

  const ticket = activeTicket || {
    id: 'demo-102',
    tokenNo: 'A-102',
    status: 'WAITING',
    serviceName: 'General OPD',
    branchName: 'Main Branch - Vile Parle',
    etaMinutes: 8,
    peopleAhead: 1,
    counterNumber: '02',
  };

  const isCalledOrServing = ticket.status === 'CALLED' || ticket.status === 'SERVING';

  return (
    <div className="max-w-md mx-auto py-4 sm:py-6 px-3 sm:px-0 animate-fadeIn">
      {/* CARD SHELL (Option B: Modern Transit Dark Canvas) */}
      <div className="rounded-3xl bg-[#081c18] text-white p-7 sm:p-9 shadow-2xl border border-emerald-950/80 relative overflow-hidden space-y-7">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Department + Live Indicator */}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              {ticket.serviceName || 'General OPD'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {ticket.branchName || 'Main Branch - Vile Parle'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live</span>
          </div>
        </div>

        {/* Center Focal Token Display */}
        <div className="text-center py-4 space-y-2 relative z-10">
          <div className="font-mono text-6xl sm:text-7xl font-bold tracking-wider text-white">
            {ticket.tokenNo}
          </div>

          <div className="pt-2">
            <span className="text-sm text-stone-400 font-normal">
              {isCalledOrServing ? 'Proceed to' : 'Your turn in approximately'}
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
              {isCalledOrServing ? `Counter ${ticket.counterNumber || '02'}` : `${ticket.etaMinutes} min`}
            </div>
          </div>
        </div>

        {/* Transit Timeline Progress Line */}
        <div className="space-y-2.5 relative z-10 px-2">
          <div className="flex items-center justify-between relative">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-900/60 -translate-y-1/2 z-0" />
            
            {/* Transit dots representing position in queue */}
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 z-10 shadow-sm shadow-emerald-400/50" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 z-10 shadow-sm shadow-emerald-400/50" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-950 border border-emerald-700/80 z-10" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-950 border border-emerald-700/80 z-10" />
          </div>

          <div className="text-center text-xs text-stone-300 font-medium pt-1">
            {ticket.peopleAhead === 0 ? 'You are next in line' : `${ticket.peopleAhead} person ahead`}
          </div>
        </div>

        {/* Two Status Boxes Side-by-Side: Currently Serving & Counter */}
        <div className="grid grid-cols-2 gap-3.5 relative z-10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-stone-400">Currently Serving</span>
            <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-300">
              A-101
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-stone-400">Counter</span>
            <div className="text-xl sm:text-2xl font-bold text-white">
              Counter {ticket.counterNumber || '02'}
            </div>
          </div>
        </div>

        {/* Three Action Buttons: View Queue | QR Code | Leave Queue */}
        <div className="grid grid-cols-3 gap-3 relative z-10 pt-1">
          <button
            type="button"
            onClick={() => setShowQueueModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition"
          >
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span>View Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-stone-300 hover:text-rose-300 text-xs font-medium transition"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Leave Queue</span>
          </button>
        </div>

        {/* Ambient Bottom Transit Alert Card */}
        <div className="p-4 rounded-2xl bg-[#0e3933]/90 border border-emerald-600/30 flex items-center gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-emerald-100">Near you? Leave when you're ~10 min away</p>
            <p className="text-stone-300 mt-0.5">Live travel time: 6 min</p>
          </div>
        </div>

        {/* Sound toggle & manual refresh */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-white/10 relative z-10">
          <button
            type="button"
            onClick={() => updatePreferences({ voiceAnnounce: !preferences.voiceAnnounce })}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            {preferences.voiceAnnounce ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice announcement {preferences.voiceAnnounce ? 'on' : 'off'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title={`Token ${ticket.tokenNo}`}>
          <div className="flex flex-col items-center py-6 text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-stone-200">
              <QRCodeSVG
                value={JSON.stringify({
                  tokenNo: ticket.tokenNo,
                  ticketId: ticket.id,
                  service: ticket.serviceName,
                  branch: ticket.branchName,
                })}
                size={200}
                level="H"
              />
            </div>
            <p className="text-xs text-stone-500 max-w-xs">
              Show this code to the receptionist scanner upon arriving at the clinic lobby.
            </p>
          </div>
        </Modal>
      )}

      {/* Leave Queue Modal */}
      {showLeaveModal && (
        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Leave Virtual Queue?">
          <div className="space-y-4 py-2">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Are you sure you want to cancel token <strong className="font-mono text-stone-900 dark:text-white">{ticket.tokenNo}</strong>? You will lose your current spot in line.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-full border border-stone-300 hover:bg-stone-100 transition"
              >
                Stay in Queue
              </button>
              <button
                type="button"
                onClick={handleLeaveQueue}
                className="px-4 py-2 text-sm font-medium rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Yes, Leave Queue
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Queue Modal */}
      {showQueueModal && (
        <Modal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} title="Department Queue Overview">
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">A-101</span>
                <span className="text-xs text-stone-600 dark:text-stone-400">Serving at Counter 02</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700">IN SERVICE</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-stone-900 dark:text-white">A-102 (You)</span>
                <span className="text-xs text-stone-500">Next up</span>
              </div>
              <span className="text-xs font-semibold text-amber-600">~8 MIN</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-stone-600">A-103</span>
                <span className="text-xs text-stone-400">Waiting</span>
              </div>
              <span className="text-xs text-stone-400">~15 MIN</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
