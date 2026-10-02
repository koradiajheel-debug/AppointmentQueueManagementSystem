import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { api, Counter, QueueTicket, SEED_COUNTERS } from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const OverviewPage: React.FC = () => {
  const { selectedBranchId, branches } = useAdminStore();
  const [counters, setCounters] = useState<Counter[]>(SEED_COUNTERS);
  const [servingTime, setServingTime] = useState('04:12');

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || {
    name: 'Metro Care',
    city: 'Vile Parle - Main Branch',
  };

  // Timer simulation for 04:12
  useEffect(() => {
    let seconds = 252; // 4m 12s
    const timer = setInterval(() => {
      seconds += 1;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setServingTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* Facility Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Metro Care
          </h1>
          <p className="text-sm font-medium text-[#6B7280] dark:text-[#7C9A92] mt-0.5">
            Vile Parle - Main Branch • Administrative Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/operations"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Open Operations Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* THREE PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Queue */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8EAAA2]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Queue</span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] dark:bg-white/5 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-4xl sm:text-5xl font-bold text-[#111827] dark:text-white tracking-tight">
              24
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-700 dark:text-[#10B981] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/20">
              <TrendingDown className="w-3 h-3" />
              <span>6%</span>
            </span>
          </div>

          <span className="text-[11px] text-[#6B7280] dark:text-[#63847C] block">
            Across all 5 consultation counters
          </span>
        </div>

        {/* Card 2: Avg Wait */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8EAAA2]">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Wait Time</span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] dark:bg-white/5 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-4xl sm:text-5xl font-bold text-[#111827] dark:text-white tracking-tight">
              12 <span className="text-xl sm:text-2xl font-normal text-[#6B7280] dark:text-[#8EAAA2]">min</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-700 dark:text-[#10B981] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/20">
              <TrendingDown className="w-3 h-3" />
              <span>18%</span>
            </span>
          </div>

          <span className="text-[11px] text-[#6B7280] dark:text-[#63847C] block">
            Within target threshold (&lt;15 min)
          </span>
        </div>

        {/* Card 3: SLA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8EAAA2]">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] dark:bg-white/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-4xl sm:text-5xl font-bold text-[#111827] dark:text-white tracking-tight">
              94%
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-700 dark:text-[#10B981] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/20">
              <TrendingUp className="w-3 h-3" />
              <span>4%</span>
            </span>
          </div>

          <span className="text-[11px] text-[#6B7280] dark:text-[#63847C] block">
            On-time consultation throughput
          </span>
        </div>
      </div>

      {/* TWO OPERATIONAL SUB-CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Current Counter */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8EAAA2] block mb-2">
              Primary Station
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#111827] dark:text-white">
                02
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#10B981] border border-emerald-200 dark:border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Serving
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#63847C] mt-2">
              Staff: Dr. Ananya Sen • General Consultation
            </p>
          </div>

          <Link
            to="/operations"
            className="p-3 rounded-full bg-[#F3F4F6] dark:bg-white/5 hover:bg-[#E5E7EB] dark:hover:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Current Token */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8EAAA2] block mb-2">
              Active Consultation
            </span>
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                A-102
              </span>
              <span className="font-mono text-2xl font-bold text-[#0F4C5C] dark:text-[#5EEAD4]">
                {servingTime}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#63847C] mt-2">
              Citizen: Priya Sharma • General OPD
            </p>
          </div>

          <Link
            to="/operations"
            className="p-3 rounded-full bg-[#F3F4F6] dark:bg-white/5 hover:bg-[#E5E7EB] dark:hover:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* COUNTERS TELEMETRY & LIVE VELOCITY */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
          <h2 className="text-base font-bold text-[#111827] dark:text-white font-newsreader">
            Live Station Velocity & Counter Allocation
          </h2>
          <span className="text-xs font-mono font-medium text-[#0F4C5C] dark:text-[#5EEAD4] bg-[#EAF3F1] dark:bg-white/5 px-2.5 py-1 rounded-full">
            5 / 5 Stations Online
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { num: '01', status: 'OPEN', token: null, label: 'Open' },
            { num: '02', status: 'SERVING', token: 'A-102', label: 'Serving A-102' },
            { num: '03', status: 'BREAK', token: null, label: 'Break' },
            { num: '04', status: 'OPEN', token: null, label: 'Open' },
            { num: '05', status: 'OPEN', token: null, label: 'Open' },
          ].map((c) => (
            <div
              key={c.num}
              className={`p-3.5 rounded-xl border text-center transition ${
                c.status === 'SERVING'
                  ? 'bg-[#EAF3F1] dark:bg-[#0F4C5C]/30 border-[#A7D7C5] dark:border-[#10B981]/50 text-[#0F4C5C] dark:text-white shadow-xs'
                  : c.status === 'BREAK'
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                  : 'bg-[#F9FAFB] dark:bg-white/5 border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-stone-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${c.status === 'SERVING' ? 'bg-[#10B981] animate-pulse' : c.status === 'BREAK' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="font-mono text-sm font-bold">Counter {c.num}</span>
              </div>
              <span className="text-xs font-mono block">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
