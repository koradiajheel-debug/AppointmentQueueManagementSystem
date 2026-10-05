import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Calendar,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Navigation as NavigationIcon,
  Sparkles,
  Radio,
  Activity,
  Users,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { api, Branch, Modal, useToast } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, activeTicket, appointments } = useCustomerStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    facilityName: '',
    registrationNo: '',
    doctorCount: '',
    services: ''
  });
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.getBranches();
        if (res.data) setBranches(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const displayName = user ? user.name.split(' ')[0] : 'Priya';

  return (
    <div className="space-y-12 pb-20 font-sans select-none">
      
      {/* ============================================================== */}
      {/* 1. QUIET EDITORIAL HERO (OPTION A)                             */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#0B1816] p-6 sm:p-12 rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#111827] dark:text-white leading-[1.12] tracking-tight font-newsreader">
              Less waiting.<br />
              <span className="italic text-[#0F4C5C] dark:text-[#5EEAD4]">More doing.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#4B5563] dark:text-stone-300 max-w-xl leading-relaxed">
              Book appointments, join queues, and get real-time updates — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/join"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold transition shadow-sm"
              >
                <span>Join Virtual Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F7F7F5] dark:bg-stone-800 text-[#1F2937] dark:text-stone-100 border border-[#D1D5DB] dark:border-white/15 text-xs font-medium hover:bg-[#EBECE8] dark:hover:bg-stone-700 transition"
              >
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>

          {/* Environmental Architecture Pavilion Photograph from Board */}
          <div className="lg:col-span-5 relative">
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden shadow-md border border-[#E5E7EB] dark:border-white/10 relative group">
              <img
                src="/hero_pavilion.jpg"
                alt="Modern architectural waiting pavilion with calm lighting and serene landscaping"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3 Pills Below Hero matching Board */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 text-[#0F4C5C] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#111827] dark:text-white">Real-time updates</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-stone-400">Know your wait time</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 text-[#0F4C5C] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#111827] dark:text-white">Multiple branches</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-stone-400">Find the nearest</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 text-[#0F4C5C] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#111827] dark:text-white">Secure & trusted</h4>
              <p className="text-[11px] text-[#6B7280] dark:text-stone-400">Your data is safe</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CUSTOMER PORTAL - HOME SECTION                              */}
      {/* ============================================================== */}
      <section className="space-y-6 pt-4 border-t border-[#E5E7EB] dark:border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Good morning, {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-stone-400 mt-1">
            What would you like to do today?
          </p>
        </div>

        {/* Two Large Action Cards: Join Virtual Queue & Book Appointment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Join Virtual Queue (Deep Forest Teal) */}
          <Link
            to="/join"
            className="group p-8 rounded-3xl bg-[#0F4C5C] text-white shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#A5E3D8] uppercase tracking-wider">
                  Need service today?
                </span>
                <ArrowRight className="w-5 h-5 text-[#5EEAD4] transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white font-newsreader">
                Join Virtual Queue
              </h3>
              <p className="text-xs text-[#D8EFEB] mt-2 max-w-xs leading-relaxed">
                Get a token and wait at your convenience.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/90">
                <Clock className="w-6 h-6 stroke-[1.5]" />
              </div>
            </div>
          </Link>

          {/* Card 2: Book Appointment (Warm Alabaster Light) */}
          <Link
            to="/book"
            className="group p-8 rounded-3xl bg-white dark:bg-[#0B1816] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6B7280] dark:text-stone-400 uppercase tracking-wider">
                  Planning ahead?
                </span>
                <ArrowRight className="w-5 h-5 text-[#374151] dark:text-stone-300 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white font-newsreader">
                Book Appointment
              </h3>
              <p className="text-xs text-[#4B5563] dark:text-stone-400 mt-2 max-w-xs leading-relaxed">
                Choose your service, date and time.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-12 h-12 rounded-full border border-[#E5E7EB] dark:border-white/15 flex items-center justify-center text-[#4B5563] dark:text-stone-300">
                <Calendar className="w-6 h-6 stroke-[1.5]" />
              </div>
            </div>
          </Link>
        </div>

        {/* Lower Row: Upcoming Appointment & Nearby Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          {/* Upcoming Appointment Card (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-stone-400">
                Your upcoming appointment
              </h4>
              <Link to="/my-appointments" className="text-xs text-[#0F4C5C] dark:text-[#5EEAD4] font-medium hover:underline">
                View all →
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-base text-[#111827] dark:text-white">General Consultation</h5>
                  <p className="text-xs text-[#6B7280] dark:text-stone-400 mt-0.5">
                    12 Apr 2026 • 10:30 AM
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-stone-400">
                    Main Branch, Vile Parle
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Nearby Branches Card (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-stone-400">
                Nearby Branches
              </h4>
              <Link to="/explore" className="text-xs text-[#0F4C5C] dark:text-[#5EEAD4] font-medium hover:underline">
                View all →
              </Link>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 divide-y divide-[#F3F4F6] dark:divide-white/5 shadow-xs overflow-hidden">
              <div className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 flex items-center justify-center text-[#4B5563] dark:text-stone-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#111827] dark:text-white">Vile Parle</h5>
                    <p className="text-[11px] text-[#6B7280]">2.3 km • 8 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-[#111827] dark:text-stone-300">Avg wait 12 min</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 flex items-center justify-center text-[#4B5563] dark:text-stone-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#111827] dark:text-white">Andheri</h5>
                    <p className="text-[11px] text-[#6B7280]">4.8 km • 15 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-[#111827] dark:text-stone-300">Avg wait 18 min</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F7F7F5] dark:bg-stone-800 flex items-center justify-center text-[#4B5563] dark:text-stone-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#111827] dark:text-white">Bandra</h5>
                    <p className="text-[11px] text-[#6B7280]">7.1 km • 22 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-[#111827] dark:text-stone-300">Avg wait 25 min</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Lounge Photo Banner */}
        <div className="relative rounded-3xl overflow-hidden h-44 sm:h-52 shadow-md border border-[#E5E7EB] dark:border-white/10 group mt-4">
          <img
            src="/lounge_interior.jpg"
            alt="QueueSmart waiting lounge interior with warm natural lighting and Scandinavian chairs"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/45 to-transparent flex flex-col justify-center px-8 sm:px-12 text-white">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight font-newsreader">
              A better<br />way to wait.
            </h3>
            <span className="text-[11px] font-mono text-stone-300 uppercase tracking-widest mt-2">
              QueueSmart
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LIVE TRANSIT PACING & FACILITY TELEMETRY (DOWN BELOW)        */}
      {/* ============================================================== */}
      <section className="space-y-6 pt-6 border-t border-[#E5E7EB] dark:border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#0F4C5C] dark:text-[#5EEAD4] font-bold">
            Live Movement & Operations Pacing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-0.5">
            Real-Time Pacing & Facility Transparency
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-stone-400 mt-1">
            Live velocity metrics, upcoming queue movement, and travel-time advisory directly from central dispatch.
          </p>
        </div>

        {/* Modern Transit Movement Card (from Option B) */}
        <div className="bg-[#081c18] rounded-3xl p-6 sm:p-8 border border-[#163b34] text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#5EEAD4] font-mono text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Transit Flow
              </span>
              <span className="text-xs text-[#7C9A92]">
                Main Branch - Vile Parle • General OPD
              </span>
            </div>

            <Link
              to="/live-ticket"
              className="text-xs font-semibold text-[#5EEAD4] hover:underline flex items-center gap-1"
            >
              <span>View Interactive Ticket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Movement Flow Graphic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="p-4 rounded-2xl bg-[#0B2520] border border-[#1E5247]">
              <span className="text-[11px] font-mono text-[#7C9A92] uppercase block">Currently Serving</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-bold text-white">A-101</span>
                <span className="text-xs font-mono text-[#5EEAD4]">Counter 02</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F4C5C]/40 border border-[#20697B] ring-2 ring-[#5EEAD4]/20">
              <span className="text-[11px] font-mono text-[#5EEAD4] uppercase block font-semibold">Next In Sequence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-bold text-white">A-102</span>
                <span className="text-xs font-mono text-emerald-300">~8 min wait</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B2520] border border-[#1E5247]">
              <span className="text-[11px] font-mono text-[#7C9A92] uppercase block">Transit Advisory</span>
              <p className="text-xs text-[#D8EFEB] mt-1">
                Leave when you're ~10 min away • Live travel time: 6 min
              </p>
            </div>
          </div>
        </div>

        {/* Facility Telemetry Grid (from Option C) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold uppercase tracking-wider">Queue Depth</span>
              <Users className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-[#111827] dark:text-white">24</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-[#10B981] flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> 6%
              </span>
            </div>
            <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">Across 5 active counters</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Wait</span>
              <Clock className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-[#111827] dark:text-white">12 min</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-[#10B981] flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> 18%
              </span>
            </div>
            <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">Under 15 min SLA goal</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold uppercase tracking-wider">SLA Rating</span>
              <Activity className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-[#111827] dark:text-white">94%</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-[#10B981] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 4%
              </span>
            </div>
            <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">On-time consultation rate</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1816] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold uppercase tracking-wider">Station Status</span>
              <Radio className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-[#111827] dark:text-white">5 / 5</span>
              <span className="text-xs font-mono text-[#10B981]">ONLINE</span>
            </div>
            <span className="text-[11px] text-[#6B7280] dark:text-stone-400 block">All consultation counters open</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. FACILITY STAFF & OPERATIONS GATEWAY (PORTALS CONNECTED)     */}
      {/* ============================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#081c18] border border-[#163b34] text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#5EEAD4] font-mono text-[11px] font-bold w-fit mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              FACILITY OPERATIONS GATEWAY
            </span>
            <h2 className="text-2xl font-bold font-newsreader tracking-tight">
              Hospital Staff & Administration
            </h2>
            <p className="text-xs sm:text-sm text-[#8EAAA2] max-w-xl mt-1">
              Serving citizens, calling tokens, managing consultation counters, or administering branch schedules? Launch the operations portal or public terminals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5EEAD4] hover:bg-[#34D399] text-[#081c18] text-xs font-bold transition shadow-md"
            >
              <span>Launch Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="http://localhost:3001/display"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-medium transition"
            >
              <span>Lobby Display</span>
            </a>

            <a
              href="http://localhost:3001/kiosk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-medium transition"
            >
              <span>Self-Checkin Kiosk</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. BECOME A PARTNER / ONBOARD YOUR FACILITY                    */}
      {/* ============================================================== */}
      <section className="mt-8 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#F0FDF4] to-[#CCFBF1] dark:from-[#042F2E] dark:to-[#064E3B] border border-[#A7F3D0] dark:border-[#059669] shadow-sm relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/40 dark:bg-black/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#34D399]/20 dark:bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-[#A7F3D0]/10 border border-[#059669]/20 dark:border-[#A7F3D0]/20 text-[#065F46] dark:text-[#6EE7B7] font-mono text-[11px] font-bold w-fit mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              FOR BUSINESSES & HOSPITALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-newsreader text-[#064E3B] dark:text-[#ECFDF5] tracking-tight leading-tight">
              Bring your queue online. <br className="hidden sm:block" />
              Upgrade your patient experience.
            </h2>
            <p className="text-sm sm:text-base text-[#065F46] dark:text-[#A7F3D0] mt-4 leading-relaxed">
              Are you a hospital administrator, clinic owner, or service provider? Partner with QueueSmart to eliminate crowded waiting rooms. Get a dedicated operations portal, predictive analytics, and let your customers wait from the comfort of their homes.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={() => setShowPartnerModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-semibold shadow-md transition transform hover:-translate-y-0.5"
              >
                <span>Register Your Facility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert("Contacting sales team...")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 text-[#064E3B] dark:text-[#6EE7B7] border border-[#059669]/20 dark:border-[#6EE7B7]/20 font-medium transition"
              >
                <span>Contact Sales</span>
              </button>
            </div>
          </div>

          <div className="hidden md:flex shrink-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-white/50 dark:border-black/20 bg-gradient-to-tr from-[#34D399] to-[#059669] shadow-inner flex items-center justify-center relative">
               <Building2 className="w-20 h-20 text-white" />
               
               {/* Floating Badges */}
               <div className="absolute -top-2 -right-4 bg-white dark:bg-[#064E3B] p-3 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-800 animate-bounce-slight">
                 <Activity className="w-6 h-6 text-emerald-500" />
               </div>
               <div className="absolute bottom-4 -left-6 bg-white dark:bg-[#064E3B] p-3 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-800 animate-bounce-slight" style={{ animationDelay: '1s' }}>
                 <Users className="w-6 h-6 text-emerald-500" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Registration Modal */}
      {showPartnerModal && (
        <Modal isOpen={showPartnerModal} onClose={() => setShowPartnerModal(false)} title="Register Your Facility">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setShowPartnerModal(false);
              showToast('success', 'Your facility registration request has been submitted for legal verification.', 'Request Sent');
              setPartnerForm({ facilityName: '', registrationNo: '', doctorCount: '', services: '' });
            }} 
            className="space-y-4 py-2"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 inline-block mr-1.5" />
              For security, all facilities must provide legal registration details for manual verification before their dashboard goes live.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facility / Hospital Name *</label>
              <input 
                type="text" required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#059669] outline-none"
                placeholder="E.g., Citycare General Hospital"
                value={partnerForm.facilityName}
                onChange={e => setPartnerForm({...partnerForm, facilityName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Legal Business / Medical Registration Number *</label>
              <input 
                type="text" required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#059669] outline-none font-mono"
                placeholder="E.g., MED-REG-12345"
                value={partnerForm.registrationNo}
                onChange={e => setPartnerForm({...partnerForm, registrationNo: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Doctors/Counters *</label>
                <input 
                  type="number" min="1" required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#059669] outline-none"
                  placeholder="e.g. 5"
                  value={partnerForm.doctorCount}
                  onChange={e => setPartnerForm({...partnerForm, doctorCount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Services</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#059669] outline-none"
                  placeholder="OPD, Pathology..."
                  value={partnerForm.services}
                  onChange={e => setPartnerForm({...partnerForm, services: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPartnerModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-xl shadow-sm transition"
              >
                Submit for Verification
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
