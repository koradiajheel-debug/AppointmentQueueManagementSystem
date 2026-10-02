import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Download,
  Users,
  Clock,
  Activity,
  Sliders,
} from 'lucide-react';
import {
  api,
  useToast,
  AdminAnalytics,
  SimulateResult,
} from '@queuesmart/shared';

export const AnalyticsSimulatorPage: React.FC = () => {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  // What-If Simulator state
  const [additionalCounters, setAdditionalCounters] = useState(1);
  const [arrivalRate, setArrivalRate] = useState(1.0);
  const [serviceTimeDelta, setServiceTimeDelta] = useState(0);
  const [simulation, setSimulation] = useState<SimulateResult | null>(null);

  useEffect(() => {
    api.getAnalytics().then((res) => {
      if (res.data) setAnalytics(res.data);
    });

    api.simulate({
      additionalCounters: 1,
      arrivalRateMultiplier: 1.0,
      avgServiceTimeChangeMin: 0,
    }).then((res) => {
      if (res.data) setSimulation(res.data);
    });
  }, []);

  const handleRunSimulation = async () => {
    const res = await api.simulate({
      additionalCounters,
      arrivalRateMultiplier: arrivalRate,
      avgServiceTimeChangeMin: serviceTimeDelta,
    });
    if (res.data) {
      setSimulation(res.data);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [additionalCounters, arrivalRate, serviceTimeDelta]);

  const exportCsv = () => {
    if (!analytics) return;
    const rows = [
      ['Hour', 'Tickets Issued', 'Tickets Served', 'Avg Wait (min)', 'SLA Target (min)'],
      ...analytics.hourlyCrowd.map((h) => [h.hour, h.ticketsIssued, h.ticketsServed, h.avgWaitMin, h.slaTargetMin]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `queuesmart_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Exported hourly telemetry CSV', 'Downloaded');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Analytics & Forecasting Simulator
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7C9A92] mt-0.5 font-mono">
            Queue Velocity • SLA Compliance • Machine Learning What-If Modeling
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D1D5DB] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#0F4C5C] text-[#374151] dark:text-white text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Telemetry CSV</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Served Today', val: analytics ? analytics.totalServedToday : 142, icon: Users, delta: '+12%' },
          { label: 'Average Wait Time', val: `${analytics ? analytics.avgWaitMinutes : 12} min`, icon: Clock, delta: '-18%' },
          { label: 'SLA Breach Rate', val: `${analytics ? analytics.slaBreachPercentage : 6}%`, icon: Activity, delta: '-3%' },
          { label: 'No-Show Rate', val: `${analytics ? analytics.noShowRatePercentage : 4}%`, icon: TrendingDown, delta: '-1.5%' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8EAAA2]">
                <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                <div className="w-7 h-7 rounded-lg bg-[#EAF3F1] dark:bg-white/5 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4]" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-mono text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
                  {kpi.val}
                </span>
                <span className="text-xs font-mono font-medium text-emerald-700 dark:text-[#10B981] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/20">{kpi.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Flow Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/10">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white font-newsreader uppercase tracking-wider">
            Hourly Citizen Throughput Pacing
          </h2>
          <span className="text-xs font-mono font-medium text-[#0F4C5C] dark:text-[#5EEAD4] bg-[#EAF3F1] dark:bg-white/5 px-2.5 py-1 rounded-full">
            Peak Pacing: 11:00 AM
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={
                analytics?.hourlyCrowd || [
                  { hour: '09:00', ticketsIssued: 14, ticketsServed: 12 },
                  { hour: '10:00', ticketsIssued: 28, ticketsServed: 24 },
                  { hour: '11:00', ticketsIssued: 38, ticketsServed: 32 },
                  { hour: '12:00', ticketsIssued: 30, ticketsServed: 28 },
                  { hour: '13:00', ticketsIssued: 16, ticketsServed: 16 },
                  { hour: '14:00', ticketsIssued: 24, ticketsServed: 22 },
                  { hour: '15:00', ticketsIssued: 32, ticketsServed: 30 },
                  { hour: '16:00', ticketsIssued: 20, ticketsServed: 19 },
                ]
              }
            >
              <defs>
                <linearGradient id="issuedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F4C5C" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0F4C5C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="servedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#111827',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area type="monotone" dataKey="ticketsIssued" name="Tokens Issued" stroke="#0F4C5C" fill="url(#issuedGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="ticketsServed" name="Tokens Served" stroke="#10B981" fill="url(#servedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB] dark:border-white/10">
          <Sliders className="w-4 h-4 text-[#0F4C5C] dark:text-[#5EEAD4]" />
          <h2 className="text-sm font-bold text-[#111827] dark:text-white font-newsreader uppercase tracking-wider">
            Machine Learning What-If Capacity Modeler
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#6B7280] dark:text-[#8EAAA2]">Deploy Extra Counters</span>
              <span className="text-[#111827] dark:text-white font-bold">+{additionalCounters} Stations</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              value={additionalCounters}
              onChange={(e) => setAdditionalCounters(parseInt(e.target.value) || 0)}
              className="w-full accent-[#0F4C5C]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#6B7280] dark:text-[#8EAAA2]">Arrival Rush Surge</span>
              <span className="text-[#111827] dark:text-white font-bold">{Math.round(arrivalRate * 100)}% Flow</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={arrivalRate}
              onChange={(e) => setArrivalRate(parseFloat(e.target.value) || 1)}
              className="w-full accent-[#0F4C5C]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#6B7280] dark:text-[#8EAAA2]">Consultation Time Shift</span>
              <span className="text-[#111827] dark:text-white font-bold">{serviceTimeDelta > 0 ? `+${serviceTimeDelta}` : serviceTimeDelta} min</span>
            </div>
            <input
              type="range"
              min={-5}
              max={10}
              value={serviceTimeDelta}
              onChange={(e) => setServiceTimeDelta(parseInt(e.target.value) || 0)}
              className="w-full accent-[#0F4C5C]"
            />
          </div>
        </div>

        {/* Prediction Results Banner */}
        {simulation && (
          <div className="p-5 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#8EAAA2] block uppercase">Projected Wait Time</span>
              <span className="font-mono text-2xl font-bold text-[#111827] dark:text-white">
                {simulation.projectedAvgWaitMin} min
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#8EAAA2] block uppercase">Projected SLA Breach</span>
              <span className="font-mono text-2xl font-bold text-[#10B981]">
                {simulation.projectedSlaBreachRate}%
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#8EAAA2] block uppercase">Recommended Capacity</span>
              <span className="font-mono text-xs font-semibold text-[#0F4C5C] dark:text-[#5EEAD4] block mt-1">
                {simulation.recommendations?.[0] || 'Maintain current staffing'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
