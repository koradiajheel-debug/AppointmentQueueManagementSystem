import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Clock,
  Printer,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRightLeft,
  FileText,
  Activity,
} from 'lucide-react';
import {
  api,
  audio,
  useToast,
  Counter,
  QueueTicket,
  Modal,
} from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const OperationsConsolePage: React.FC = () => {
  const {
    counters,
    setCounters,
    selectedBranchId,
    selectedCounterId,
    setSelectedCounterId,
  } = useAdminStore();

  const { showToast } = useToast();

  const [activeTicket, setActiveTicket] = useState<QueueTicket>({
    id: 'ticket-102',
    tokenNo: 'A-102',
    type: 'APPOINTMENT',
    priorityTier: 'NORMAL',
    status: 'SERVING',
    etaMinutes: 0,
    joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 4 * 60000).toISOString(),
    servingAt: new Date(Date.now() - 4 * 60000).toISOString(),
    userName: 'Kavita Deshmukh',
    userPhone: '+91 99223 34455',
    serviceId: 'srv-1',
    serviceName: 'General Consultation',
    branchId: 'branch-1',
    branchName: 'Main Branch - Vile Parle',
    counterNumber: '02',
    peopleAhead: 0,
  });

  const [queuePreview, setQueuePreview] = useState<Array<{ tokenNo: string; service: string; eta: string }>>([
    { tokenNo: 'A-103', service: 'General Consultation', eta: '3 min' },
    { tokenNo: 'A-104', service: 'Follow Up', eta: '7 min' },
    { tokenNo: 'A-105', service: 'General Consultation', eta: '12 min' },
  ]);

  const [servingSeconds, setServingSeconds] = useState(252); // 4 min 12 sec
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('30');
  const [delayReason, setDelayReason] = useState('Medical Emergency - Doctor attending critical patient');
  const [transferTarget, setTransferTarget] = useState('03');
  const [transferReason, setTransferReason] = useState('Requires diagnostic sample test');

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinService, setWalkinService] = useState('srv-1');

  // Timer tick for active serving duration
  useEffect(() => {
    const timer = setInterval(() => {
      setServingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Keyboard shortcut listeners (Space/Enter: Call Next, S: Skip, R: Recall, T: Transfer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleCallNext();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSkipModal(true);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRecall();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowTransferModal(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShowDelayModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTicket]);

  const handleCallNext = async () => {
    try {
      audio.playChime();
      const currentNo = activeTicket.tokenNo;
      const nextNum = parseInt(currentNo.split('-')[1] || '102') + 1;
      const newActive: QueueTicket = {
        ...activeTicket,
        tokenNo: `A-${nextNum}`,
        status: 'SERVING',
        servingAt: new Date().toISOString(),
      };
      setActiveTicket(newActive);
      setServingSeconds(0);

      // Shift preview queue
      setQueuePreview((prev) => [
        ...prev.slice(1),
        { tokenNo: `A-${nextNum + 3}`, service: 'General Consultation', eta: '18 min' },
      ]);

      audio.announceToken(newActive.tokenNo, '02', 'General Consultation');
      showToast('success', `Token ${newActive.tokenNo} called to Counter 02`, 'Next Customer');
    } catch {
      showToast('error', 'Failed to call next token');
    }
  };

  const handleSkip = () => {
    setShowSkipModal(false);
    showToast('info', `Token ${activeTicket.tokenNo} skipped (${skipReason || 'No Show'})`, 'Customer Skipped');
    handleCallNext();
  };

  const handleRecall = () => {
    audio.playChime();
    audio.announceToken(activeTicket.tokenNo, '02', 'General Consultation');
    showToast('info', `Announcement repeated for Token ${activeTicket.tokenNo}`, 'Recalled');
  };

  const handleTransfer = () => {
    setShowTransferModal(false);
    showToast(
      'success',
      `Token ${activeTicket.tokenNo} transferred to Counter ${transferTarget}`,
      'Transfer Complete'
    );
    handleCallNext();
  };

  const handleDelayBroadcast = () => {
    setShowDelayModal(false);
    showToast(
      'success',
      `Push notification sent to all waiting citizens: ETA delayed by ${delayMinutes} mins.`,
      'Broadcast Sent'
    );
  };

  const handleWalkinRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) {
      showToast('error', 'Please enter customer name and phone');
      return;
    }
    const tokenNo = `W-${Math.floor(200 + Math.random() * 50)}`;
    setShowWalkinModal(false);
    showToast('success', `Issued walk-in token ${tokenNo} for ${walkinName}`, 'Walk-in Registered');
    setWalkinName('');
    setWalkinPhone('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12 font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* 2-Column Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER COLUMN: Current Customer + Queue Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Current Customer Card */}
          <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6B7280] dark:text-[#8EAAA2]">
                Current Active Session
              </span>
              <button
                type="button"
                onClick={handleCallNext}
                className="text-xs font-semibold text-[#0F4C5C] dark:text-[#5EEAD4] hover:underline flex items-center gap-1"
              >
                <span>Call Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Token, Service, Counter, Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#111827] dark:text-white">
                  {activeTicket.tokenNo}
                </div>
                <p className="text-sm font-semibold text-[#374151] dark:text-stone-300 mt-1">
                  General Consultation
                </p>
                <div className="mt-1">
                  <span className="text-xs font-mono font-medium text-[#0F4C5C] dark:text-[#5EEAD4] bg-[#EAF3F1] dark:bg-white/5 px-2.5 py-0.5 rounded-full inline-block">
                    Counter 02 • Station Active
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2">
                <div className="font-mono text-3xl sm:text-4xl font-semibold text-[#111827] dark:text-white">
                  {formatTimer(servingSeconds)}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#7C9A92] uppercase tracking-wider font-medium">
                  Active Consultation Duration
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#10B981] text-xs font-semibold border border-emerald-200 dark:border-[#10B981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Serving Now
                </span>
              </div>
            </div>

            {/* Giant Call Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCallNext}
                className="w-full py-4 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] active:scale-[0.99] text-white font-semibold text-base transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>Call Next Citizen</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Auto-Fetched Patient History Panel */}
            {activeTicket.status === 'SERVING' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    AI Auto-Fetched History
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Last Visit</span>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">12 Oct 2025 • Dr. Sharma</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Past Reports</span>
                    <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3" /> View Blood Test.pdf
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Row: Skip (S) | Recall (R) | Transfer (T) | Delay (D) */}
            <div className="grid grid-cols-4 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowSkipModal(true)}
                className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/5 hover:bg-[#F3F4F6] dark:hover:bg-white/10 text-[#374151] dark:text-stone-300 text-xs font-medium transition text-center shadow-xs"
              >
                <div className="font-semibold">Skip Citizen</div>
                <div className="text-[10px] text-[#6B7280] dark:text-stone-400 font-mono mt-0.5">Press S</div>
              </button>

              <button
                type="button"
                onClick={handleRecall}
                className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/5 hover:bg-[#F3F4F6] dark:hover:bg-white/10 text-[#374151] dark:text-stone-300 text-xs font-medium transition text-center shadow-xs"
              >
                <div className="font-semibold">Recall Chime</div>
                <div className="text-[10px] text-[#6B7280] dark:text-stone-400 font-mono mt-0.5">Press R</div>
              </button>

              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/5 hover:bg-[#F3F4F6] dark:hover:bg-white/10 text-[#374151] dark:text-stone-300 text-xs font-medium transition text-center shadow-xs"
              >
                <div className="font-semibold">Smart Auto-Route</div>
                <div className="text-[10px] text-[#6B7280] dark:text-stone-400 font-mono mt-0.5">Press T</div>
              </button>

              <button
                type="button"
                onClick={() => setShowDelayModal(true)}
                className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium transition text-center shadow-xs"
              >
                <div className="font-semibold">Delay Alert</div>
                <div className="text-[10px] text-rose-500/80 font-mono mt-0.5">Press D</div>
              </button>
            </div>
          </div>

          {/* Queue Preview Card */}
          <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6B7280] dark:text-[#8EAAA2]">
                Upcoming Queue Stream
              </h4>
              <span className="text-xs font-medium text-[#0F4C5C] dark:text-[#5EEAD4] flex items-center gap-1">
                View full board <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div className="divide-y divide-[#E5E7EB] dark:divide-white/5">
              {queuePreview.map((item) => (
                <div key={item.tokenNo} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#111827] dark:text-white bg-[#F9FAFB] dark:bg-white/5 px-2.5 py-1 rounded-md border border-[#E5E7EB] dark:border-white/10">
                      {item.tokenNo}
                    </span>
                    <span className="text-xs font-medium text-[#4B5563] dark:text-stone-300">
                      {item.service}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#6B7280] dark:text-stone-400 font-medium">
                    in ~{item.eta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Counter Status + Walkin + Keyboard Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Counter Status */}
          <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6B7280] dark:text-[#8EAAA2]">
                Active Counters
              </h4>
              <span className="text-xs font-mono text-[#0F4C5C] dark:text-[#5EEAD4]">
                Branch OPD
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#111827] dark:text-stone-200">Counter 01</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#111827] dark:text-stone-200">Counter 02</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Serving A-102
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#111827] dark:text-stone-200">Counter 03</span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Break
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#111827] dark:text-stone-200">Counter 04</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[#111827] dark:text-stone-200">Counter 05</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open
                </span>
              </div>
            </div>
          </div>

          {/* Walk-in Registration */}
          <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6B7280] dark:text-[#8EAAA2]">
              Walk-in Citizen Desk
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-stone-400 leading-relaxed">
              Immediate registration and priority token issuance for arriving citizens.
            </p>
            <button
              type="button"
              onClick={() => setShowWalkinModal(true)}
              className="w-full py-2.5 rounded-full border border-[#D1D5DB] dark:border-white/15 bg-[#F9FAFB] dark:bg-stone-800 hover:border-[#0F4C5C] hover:text-[#0F4C5C] text-[#111827] dark:text-stone-200 text-xs font-semibold transition shadow-xs"
            >
              Issue Walk-in Slip
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6B7280] dark:text-[#8EAAA2]">
              Keyboard Shortcuts
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400">Call Next</span>
                <kbd className="px-2 py-0.5 rounded bg-[#F3F4F6] dark:bg-stone-800 border border-[#E5E7EB] dark:border-stone-700 font-mono text-[10px] text-[#374151] dark:text-stone-300">Space / Enter</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400">Skip</span>
                <kbd className="px-2 py-0.5 rounded bg-[#F3F4F6] dark:bg-stone-800 border border-[#E5E7EB] dark:border-stone-700 font-mono text-[10px] text-[#374151] dark:text-stone-300">S</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400">Recall</span>
                <kbd className="px-2 py-0.5 rounded bg-[#F3F4F6] dark:bg-stone-800 border border-[#E5E7EB] dark:border-stone-700 font-mono text-[10px] text-[#374151] dark:text-stone-300">R</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-stone-400">Transfer</span>
                <kbd className="px-2 py-0.5 rounded bg-[#F3F4F6] dark:bg-stone-800 border border-[#E5E7EB] dark:border-stone-700 font-mono text-[10px] text-[#374151] dark:text-stone-300">T</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Modal */}
      {showSkipModal && (
        <Modal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)} title={`Skip Token ${activeTicket.tokenNo}?`}>
          <div className="space-y-4 py-2 font-sans">
            <p className="text-xs text-[#6B7280]">
              Please specify a reason for marking this token as skipped.
            </p>
            <select
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-[#0F4C5C]"
            >
              <option value="No Show">No Show (Called 3 times)</option>
              <option value="Unresponsive">Unresponsive in waiting lobby</option>
              <option value="Requested Later">Customer requested later turn</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 rounded-full border border-[#D1D5DB] text-xs font-medium text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 shadow-xs"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Smart Auto-Routing Modal */}
      {showTransferModal && (
        <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title={`Auto-Route ${activeTicket.userName}`}>
          <div className="space-y-4 py-2 font-sans">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs">
              <strong>Multi-Queue Triage:</strong> Seamlessly inject this patient into another department's virtual queue without sending them back to the reception.
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Target Department / Queue</label>
              <select
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-[#0F4C5C]"
              >
                <option value="Pathology">Pathology / Blood Test</option>
                <option value="Pharmacy">Pharmacy Dispensing</option>
                <option value="X-Ray">X-Ray / Imaging</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Doctor's Internal Note</label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-[#0F4C5C]"
                placeholder="E.g., Requires fasting blood sugar test..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 rounded-full border border-[#D1D5DB] text-xs font-medium text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                className="px-4 py-2 rounded-full bg-[#0F4C5C] text-white text-xs font-medium hover:bg-[#0B3A46] shadow-xs flex items-center gap-2"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Inject into Queue
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delay Broadcast Modal */}
      {showDelayModal && (
        <Modal isOpen={showDelayModal} onClose={() => setShowDelayModal(false)} title="Broadcast Delay Alert">
          <div className="space-y-4 py-2 font-sans">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
              <strong>Warning:</strong> This will instantly notify all waiting citizens via push notification and update their live ETAs.
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Estimated Delay (Minutes)</label>
              <input
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Reason for Broadcast</label>
              <textarea
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-rose-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="px-4 py-2 rounded-full border border-[#D1D5DB] text-xs font-medium text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelayBroadcast}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 shadow-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Broadcast Alert
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Walk-in Registration Modal */}
      {showWalkinModal && (
        <Modal isOpen={showWalkinModal} onClose={() => setShowWalkinModal(false)} title="Register Walk-in Citizen">
          <form onSubmit={handleWalkinRegister} className="space-y-4 py-2 font-sans">
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Full Name</label>
              <input
                type="text"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-[#0F4C5C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] block mb-1">Mobile Number</label>
              <input
                type="tel"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full p-2.5 rounded-xl border border-[#D1D5DB] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-[#111827] dark:text-white focus:ring-1 focus:ring-[#0F4C5C]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                className="px-4 py-2 rounded-full border border-[#D1D5DB] text-xs font-medium text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#0F4C5C] text-white text-xs font-medium hover:bg-[#0B3A46] shadow-xs"
              >
                Print Slip & Issue Token
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
