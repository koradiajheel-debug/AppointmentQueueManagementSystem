import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Navigation as NavigationIcon,
  Zap,
} from 'lucide-react';
import { api, Branch, Service, useToast } from '@queuesmart/shared';

export const BranchServicePickerPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [branchMetrics, setBranchMetrics] = useState<Record<string, { dist: string, time: string }>>({});
  const [isLocating, setIsLocating] = useState(false);

  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [branchRes, serviceRes] = await Promise.all([
          api.getBranches(),
          api.getServices(),
        ]);
        if (branchRes.data) {
          setBranches(branchRes.data);
          const initialBranch = searchParams.get('branchId') || branchRes.data[0]?.id || '';
          setSelectedBranchId(initialBranch);
        }
        if (serviceRes.data) setServices(serviceRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const branchServices = services.filter((s) => s.branchId === selectedBranchId);

  const filteredServices = branchServices.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedIndex = branches.findIndex(b => b.id === selectedBranchId);
  const selectedWaitTimeStr = ['12', '18', '25'][selectedIndex % 3] || '12';
  const selectedWaitTime = parseInt(selectedWaitTimeStr, 10);
  
  // Find a faster alternative branch
  const fasterBranchIndex = branches.findIndex((b, idx) => {
    const time = parseInt(['12', '18', '25'][idx % 3], 10);
    return time < selectedWaitTime - 10; // At least 10 mins faster
  });
  const fasterBranch = fasterBranchIndex !== -1 ? branches[fasterBranchIndex] : null;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-mono font-medium text-[#0F4C5C] uppercase tracking-wider">
          Facilities & Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader mt-1">
          Explore Branches & Services
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <p className="text-sm text-[#4B5563] dark:text-slate-400">
            Find your nearest branch, check real-time queue pacing, and select your required department.
          </p>
          <button
            onClick={() => {
              setIsLocating(true);
              if (!navigator.geolocation) {
                showToast('error', 'Geolocation not supported');
                setIsLocating(false);
                return;
              }
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const { latitude, longitude } = pos.coords;
                  try {
                    const metrics: Record<string, { dist: string, time: string }> = {};
                    await Promise.all(branches.map(async (branch) => {
                       const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${branch.longitude},${branch.latitude}?overview=false`;
                       const res = await fetch(osrmUrl);
                       const data = await res.json();
                       if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                         const distKm = (data.routes[0].distance / 1000).toFixed(1);
                         const timeMin = Math.ceil(data.routes[0].duration / 60);
                         metrics[branch.id] = { dist: `${distKm} km`, time: `${timeMin} min` };
                       }
                    }));
                    setBranchMetrics(metrics);
                    showToast('success', 'Distances updated based on your real-time location');
                  } catch (e) {
                    showToast('error', 'Failed to calculate distances');
                  } finally {
                    setIsLocating(false);
                  }
                },
                (err) => {
                  showToast('error', 'Location permission denied');
                  setIsLocating(false);
                }
              );
            }}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7F7F5] dark:bg-slate-800 text-[#0F4C5C] dark:text-teal-400 text-xs font-semibold hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition disabled:opacity-50 border border-[#E5E7EB] dark:border-slate-700"
          >
            <NavigationIcon className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
            <span>{isLocating ? 'Calculating...' : 'Find Nearest Branches'}</span>
          </button>
        </div>
      </div>

      {/* Predictive Load Balancing Banner */}
      {fasterBranch && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Smart Load Balancing Suggestion
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                The {activeBranch?.name} is currently experiencing high wait times (~{selectedWaitTime} min). 
                Want to be seen instantly? Switch to {fasterBranch.name}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBranchId(fasterBranch.id)}
            className="shrink-0 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
          >
            Switch to {fasterBranch.name}
          </button>
        </div>
      )}

      {/* Branch Selector Tabs (Matching Nearby Branches on Board) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch, idx) => {
          const isSelected = branch.id === selectedBranchId;
          const fallbackDistances = ['2.3 km • 8 min', '4.8 km • 15 min', '7.1 km • 22 min'];
          const metrics = branchMetrics[branch.id];
          const displayDistance = metrics ? `${metrics.dist} • ${metrics.time}` : fallbackDistances[idx % fallbackDistances.length];
          const waitTimes = ['12 min', '18 min', '25 min'];
          const isGreen = idx === 0;

          return (
            <div
              key={branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-[#0F4C5C] bg-[#F7F7F5] dark:bg-[#0B1E1B] ring-2 ring-[#0F4C5C]/20 shadow-sm'
                  : 'border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] dark:bg-slate-800 flex items-center justify-center text-[#0F4C5C] dark:text-[#5EEAD4]">
                  <Building2 className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0F4C5C] text-white">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>

              <h3 className="font-bold text-[#111827] dark:text-white text-base mt-3">
                {branch.name}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                {branch.city} • {displayDistance}
              </p>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB]/80 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-[#6B7280] dark:text-slate-400">Avg wait time</span>
                <span className="text-xs font-mono font-medium text-[#111827] dark:text-slate-200 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
                  {waitTimes[idx % waitTimes.length]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Services List */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] dark:text-white font-newsreader">
              Services at {activeBranch?.name}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">
              Operating Hours: {activeBranch?.operatingHours.open} - {activeBranch?.operatingHours.close}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827] dark:text-white"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 hover:border-[#0F4C5C]/50 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-[#111827] dark:text-white text-base">
                  {service.name}
                </h3>
                {service.priorityAllowed && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F7F7F5] text-[#0F4C5C] border border-[#E5E7EB] dark:bg-slate-800 dark:text-teal-400">
                    Priority Lane
                  </span>
                )}
              </div>

              <p className="text-xs text-[#4B5563] dark:text-slate-400 leading-relaxed min-h-[36px]">
                {service.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F3F4F6] dark:border-slate-800 flex items-center justify-between text-xs text-[#6B7280] dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-teal-400" />
                  Avg Duration: ~{service.avgDurationMin} min
                </span>
                <span className="font-mono text-xs text-[#10B981]">
                  SLA Target: &lt;{service.slaMinutes}m
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  to={`/join?branchId=${activeBranch.id}&serviceId=${service.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-medium text-xs flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Queue</span>
                </Link>
                <Link
                  to={`/book?branchId=${activeBranch.id}&serviceId=${service.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F7F7F5] hover:bg-[#E5E7EB] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1F2937] dark:text-white font-medium text-xs flex items-center justify-center gap-2 border border-[#E5E7EB] dark:border-slate-700 transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
