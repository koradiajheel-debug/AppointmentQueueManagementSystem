import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Plus,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
} from 'lucide-react';
import {
  api,
  useToast,
  QueueTicket,
  PriorityTier,
  SEED_TICKETS,
} from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';
import { PrintableTokenSlip } from '../components/PrintableTokenSlip';

export const QueueBoardPage: React.FC = () => {
  const { selectedBranchId, services } = useAdminStore();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<QueueTicket[]>(SEED_TICKETS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Walk-in modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState('');
  const [walkinTier, setWalkinTier] = useState<PriorityTier>('NORMAL');
  const [createdWalkinTicket, setCreatedWalkinTicket] = useState<QueueTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubUpdate = api.onSocketEvent('queue:update', () => {
      import('@queuesmart/shared').then(({ mockStore }) => {
        setTickets([...(mockStore as any).tickets]);
      });
    });

    const unsubCalled = api.onSocketEvent('ticket:called', () => {
      import('@queuesmart/shared').then(({ mockStore }) => {
        setTickets([...(mockStore as any).tickets]);
      });
    });

    return () => {
      unsubUpdate();
      unsubCalled();
    };
  }, [selectedBranchId]);

  const waitingTickets = tickets.filter((t) => t.status === 'WAITING');
  const servingTickets = tickets.filter((t) => t.status === 'SERVING' || t.status === 'CALLED');

  const filteredWaiting = waitingTickets.filter((t) => {
    const matchesService = selectedServiceId === 'ALL' || t.serviceId === selectedServiceId;
    const matchesTier = selectedTier === 'ALL' || t.priorityTier === selectedTier;
    const matchesSearch =
      t.tokenNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesTier && matchesSearch;
  });

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) {
      showToast('error', 'Please fill name and phone', 'Required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerWalkin({
        branchId: selectedBranchId,
        serviceId: walkinServiceId || 'srv-1',
        userName: walkinName,
        userPhone: walkinPhone,
        priorityTier: walkinTier,
        isGroup: false,
        groupSize: 1,
      });

      if (res.success && res.data) {
        setTickets([...tickets, res.data]);
        setCreatedWalkinTicket(res.data);
        showToast('success', `Issued token ${res.data.tokenNo}!`, 'Registered');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const newArr = [...filteredWaiting];
    const temp = newArr[idx];
    newArr[idx] = newArr[idx - 1];
    newArr[idx - 1] = temp;
    showToast('info', `Moved ${temp.tokenNo} up in queue sequence`, 'Order Updated');
  };

  const handleMoveDown = (idx: number) => {
    if (idx === filteredWaiting.length - 1) return;
    const newArr = [...filteredWaiting];
    const temp = newArr[idx];
    newArr[idx] = newArr[idx + 1];
    newArr[idx + 1] = temp;
    showToast('info', `Moved ${temp.tokenNo} down in queue sequence`, 'Order Updated');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Live Queue Stream
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7C9A92] mt-0.5 font-mono">
            {waitingTickets.length} Citizens in Waiting Queue • {servingTickets.length} Actively in Service
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreatedWalkinTicket(null);
            setShowWalkinModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Walk-in Citizen</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Service Filter */}
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F9FAFB] dark:bg-[#061210] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#374151] dark:text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F9FAFB] dark:bg-[#061210] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#374151] dark:text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Standard Lane</option>
            <option value="SENIOR">Senior Citizen (60+)</option>
            <option value="PREGNANT">Expectant Mother</option>
            <option value="DISABLED">Differently Abled</option>
            <option value="EMERGENCY">Emergency Fast-Track</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search token or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F9FAFB] dark:bg-[#061210] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          />
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] dark:bg-white/5 border-b border-[#E5E7EB] dark:border-white/10 text-[#6B7280] dark:text-[#8EAAA2] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority Lane</th>
                <th className="py-3 px-4">Est. Wait</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reorder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/5 font-mono">
              {filteredWaiting.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#9CA3AF] font-sans text-xs">
                    No waiting tickets match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredWaiting.map((ticket, idx) => (
                  <tr key={ticket.id} className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 text-[#9CA3AF] font-semibold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-[#111827] dark:text-white text-sm">
                      {ticket.tokenNo}
                    </td>
                    <td className="py-3 px-4 text-[#374151] dark:text-stone-200 font-sans font-medium">
                      {ticket.userName}
                    </td>
                    <td className="py-3 px-4 text-[#4B5563] dark:text-[#8EAAA2] font-sans">
                      {ticket.serviceName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] border border-[#A7D7C5] dark:border-white/10">
                        {ticket.priorityTier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] dark:text-[#8EAAA2]">
                      ~{ticket.etaMinutes} min
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Waiting
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 rounded hover:bg-[#E5E7EB] dark:hover:bg-white/10 disabled:opacity-20 text-[#6B7280] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white transition"
                          title="Prioritize ticket"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredWaiting.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 rounded hover:bg-[#E5E7EB] dark:hover:bg-white/10 disabled:opacity-20 text-[#6B7280] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white transition"
                          title="Delay ticket"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-[#111827] dark:text-white font-newsreader">
              Walk-in Citizen Registration
            </h3>

            {createdWalkinTicket ? (
              <div className="text-center space-y-4 py-2">
                <PrintableTokenSlip ticket={createdWalkinTicket} onDone={() => setShowWalkinModal(false)} />
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="w-full py-2.5 rounded-full bg-[#0F4C5C] text-white text-xs font-semibold shadow-xs"
                >
                  Close & Return
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateWalkin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-[#8EAAA2] mb-1">Citizen Full Name</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-[#8EAAA2] mb-1">Mobile (SMS updates)</label>
                  <input
                    type="tel"
                    required
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="+91 99999 00000"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-[#8EAAA2] mb-1">Department</label>
                  <select
                    value={walkinServiceId}
                    onChange={(e) => setWalkinServiceId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  >
                    <option value="">Select Service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] dark:text-[#8EAAA2] mb-1">Priority Lane</label>
                  <select
                    value={walkinTier}
                    onChange={(e) => setWalkinTier(e.target.value as PriorityTier)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  >
                    <option value="NORMAL">Standard Lane</option>
                    <option value="SENIOR">Senior Citizen (60+)</option>
                    <option value="PREGNANT">Expectant Mother</option>
                    <option value="DISABLED">Differently Abled</option>
                    <option value="EMERGENCY">Emergency Fast-Track</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWalkinModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-[#D1D5DB] bg-white text-[#4B5563] text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs"
                  >
                    {isLoading ? 'Issuing...' : 'Generate Token'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
