import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  UploadCloud,
  FileText,
  User,
  Phone,
  Clock,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  api,
  useToast,
  Branch,
  Service,
  PriorityTier,
  PRIORITY_CONFIG,
} from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const JoinQueuePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setActiveTicket, setShowPushPrompt } = useCustomerStore();
  const { showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState(searchParams.get('branchId') || '');
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('serviceId') || '');

  const [userName, setUserName] = useState(user?.name || 'Priya Sharma');
  const [userPhone, setUserPhone] = useState(user?.phone || '+91 98765 43210');
  const [priorityTier, setPriorityTier] = useState<PriorityTier>('NORMAL');
  const [priorityReason, setPriorityReason] = useState('');
  const [uploadedProofName, setUploadedProofName] = useState<string | null>(null);

  const [isGroup, setIsGroup] = useState(false);
  const [groupSize, setGroupSize] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [bRes, sRes] = await Promise.all([api.getBranches(), api.getServices()]);
      if (bRes.data) {
        setBranches(bRes.data);
        if (!selectedBranchId && bRes.data.length > 0) setSelectedBranchId(bRes.data[0].id);
      }
      if (sRes.data) {
        setServices(sRes.data);
        if (!selectedServiceId && sRes.data.length > 0) setSelectedServiceId(sRes.data[0].id);
      }
    };
    load();
  }, []);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const branchServices = services.filter((s) => s.branchId === selectedBranchId);
  const activeService = branchServices.find((s) => s.id === selectedServiceId) || branchServices[0];

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedServiceId) {
      showToast('error', 'Please select a facility and service', 'Missing Selection');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.joinQueue({
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        userName,
        userPhone,
        priorityTier,
        priorityReason: priorityReason || (uploadedProofName ? `Proof: ${uploadedProofName}` : undefined),
        isGroup,
        groupSize: isGroup ? groupSize : 1,
      });

      if (res.success && res.data) {
        setActiveTicket(res.data);
        showToast('success', `Issued Token ${res.data.tokenNo}! Live queue activated.`, 'Token Active');
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          setTimeout(() => setShowPushPrompt(true), 1200);
        }
        navigate(`/ticket/${res.data.id || 'ticket-102'}`);
      } else {
        showToast('error', res.error?.message || 'Could not join queue', 'Error');
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-sans">
      {/* Title */}
      <div>
        <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
          On-Demand Triage
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-1">
          Join Virtual Queue
        </h1>
        <p className="mt-1 text-sm text-[#4B5563] dark:text-slate-400">
          Get a digital ticket without physically waiting in the lobby. We will alert you when you are 2 positions away.
        </p>
      </div>

      <form onSubmit={handleJoinQueue} className="space-y-6">
        {/* Step 1: Branch & Service */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
              1
            </span>
            Choose Facility & Department
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Facility / Branch
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
                Service Required
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              >
                {branchServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (~{s.avgDurationMin} min)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Citizen Contact */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
              2
            </span>
            Notification & Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Mobile Number (SMS & Transit ETA alerts)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Priority & Group */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-white font-newsreader flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white text-xs flex items-center justify-center font-sans font-bold">
              3
            </span>
            Priority Tier & Group Size
          </h2>

          {/* Group Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F7F5] dark:bg-slate-800/40 border border-[#E5E7EB] dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#0F4C5C] dark:text-teal-400" />
              <div>
                <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                  Family / Group Token
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  Call consecutive members under one token
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

          {isGroup && (
            <div className="p-3.5 rounded-xl bg-[#F7F7F5] dark:bg-slate-800/40 border border-[#E5E7EB] dark:border-slate-800">
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Number of Persons (2 - 10)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                className="w-32 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-[#111827] dark:text-white"
              />
            </div>
          )}

          {/* Priority Tiers */}
          <div>
            <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-2">
              Priority Lane (Optional)
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

          {priorityTier !== 'NORMAL' && (
            <div className="p-4 rounded-xl border border-dashed border-[#D1D5DB] dark:border-slate-700 bg-[#F7F7F5]/50 dark:bg-slate-800/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#111827] dark:text-white block">
                  Verification Document (Optional)
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  Attach senior citizen ID, disability pass, or doctor note.
                </span>
              </div>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white dark:bg-slate-800 text-xs font-medium text-[#374151] dark:text-slate-200 hover:bg-[#F3F4F6] transition">
                <span>Choose File</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-medium text-xs shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Generating Live Ticket...' : 'Get Live Queue Token'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
