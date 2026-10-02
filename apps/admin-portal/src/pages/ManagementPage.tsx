import React, { useState } from 'react';
import {
  Settings2,
  Plus,
  Building,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Shield,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import {
  api,
  useToast,
  Service,
  Counter,
  Branch,
} from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const ManagementPage: React.FC = () => {
  const {
    services,
    setServices,
    counters,
    setCounters,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    addBranch,
    updateBranchInStore,
    deleteBranchFromStore,
  } = useAdminStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'SERVICES' | 'COUNTERS' | 'STAFF' | 'PLACES'>('SERVICES');

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);

  // Forms
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvDuration, setSrvDuration] = useState(15);
  const [srvPriorityAllowed, setSrvPriorityAllowed] = useState(true);
  const [srvSla, setSrvSla] = useState(25);

  const [counterNum, setCounterNum] = useState('06');
  const [counterName, setCounterName] = useState('Express Triage Desk');

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  // Place / Branch CRUD Form State
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeCity, setPlaceCity] = useState('Mumbai');
  const [placePhone, setPlacePhone] = useState('+91 22 2618 0000');
  const [placeOpenTime, setPlaceOpenTime] = useState('08:30');
  const [placeCloseTime, setPlaceCloseTime] = useState('18:00');

  const [staffList, setStaffList] = useState<any[]>([
    { id: 'stf-1', name: 'Dr. Rajesh Sharma', email: 'sharma@queuesmart.dev', phone: '+91 98200 12345', role: 'STAFF', counter: '01' },
    { id: 'stf-2', name: 'Dr. Ananya Roy', email: 'ananya@queuesmart.dev', phone: '+91 98300 23456', role: 'STAFF', counter: '02' },
    { id: 'stf-3', name: 'Priya Mehra', email: 'admin@queuesmart.dev', phone: '+91 98111 22233', role: 'ADMIN', counter: 'Lead' },
  ]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createService({
        branchId: selectedBranchId,
        name: srvName,
        description: srvDesc,
        avgDurationMin: Number(srvDuration),
        priorityAllowed: srvPriorityAllowed,
        slaMinutes: Number(srvSla),
      });

      if (res.data) {
        setServices([...services, res.data]);
        showToast('success', `Created department: ${res.data.name}`, 'Created');
        setShowServiceModal(false);
        setSrvName('');
        setSrvDesc('');
      }
    } catch {
      showToast('error', 'Failed to create department', 'Error');
    }
  };

  const handleCreateCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const newCounter: Counter = {
      id: `counter-${Date.now()}`,
      branchId: selectedBranchId,
      counterNumber: counterNum,
      name: counterName,
      status: 'OPEN',
      servicesOffered: ['srv-1'],
    };
    setCounters([...counters, newCounter]);
    showToast('success', `Added Counter 0${counterNum}`, 'Created');
    setShowCounterModal(false);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff = {
      id: `stf-${Date.now()}`,
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: 'STAFF',
      counter: '03',
    };
    setStaffList([...staffList, newStaff]);
    showToast('success', `Added staff operator: ${staffName}`, 'Created');
    setShowStaffModal(false);
    setStaffName('');
    setStaffEmail('');
  };

  // Place CRUD Handlers
  const handleOpenCreatePlace = () => {
    setEditingPlaceId(null);
    setPlaceName('');
    setPlaceAddress('');
    setPlaceCity('Mumbai');
    setPlacePhone('+91 22 2618 0000');
    setPlaceOpenTime('08:30');
    setPlaceCloseTime('18:00');
    setShowPlaceModal(true);
  };

  const handleOpenEditPlace = (branch: Branch) => {
    setEditingPlaceId(branch.id);
    setPlaceName(branch.name);
    setPlaceAddress(branch.address);
    setPlaceCity(branch.city);
    setPlacePhone(branch.phone);
    const hours = (branch.operatingHours as any) || {};
    setPlaceOpenTime(hours.open || '08:30');
    setPlaceCloseTime(hours.close || '18:00');
    setShowPlaceModal(true);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Branch> = {
      name: placeName,
      address: placeAddress,
      city: placeCity,
      phone: placePhone,
      operatingHours: {
        open: placeOpenTime,
        close: placeCloseTime,
        lunchStart: '13:00',
        lunchEnd: '14:00',
        workingDays: [1, 2, 3, 4, 5, 6],
      } as any,
    };

    try {
      if (editingPlaceId) {
        const res = await api.updateBranch(editingPlaceId, payload);
        if (res.data) {
          updateBranchInStore(res.data);
          showToast('success', `Updated facility: ${res.data.name}`, 'Place Saved');
        }
      } else {
        const res = await api.createBranch(payload);
        if (res.data) {
          addBranch(res.data);
          showToast('success', `Signed up new facility: ${res.data.name}`, 'Place Registered');
        }
      }
      setShowPlaceModal(false);
    } catch {
      showToast('error', 'Failed to save place record', 'Error');
    }
  };

  const handleDeletePlace = async (branchId: string, name: string) => {
    if (branches.length <= 1) {
      showToast('error', 'Cannot delete the only remaining active facility', 'Action Prohibited');
      return;
    }
    if (confirm(`Are you sure you want to remove and archive ${name}?`)) {
      try {
        await api.deleteBranch(branchId);
        deleteBranchFromStore(branchId);
        if (selectedBranchId === branchId) {
          const remaining = branches.filter((b) => b.id !== branchId);
          if (remaining.length > 0) setSelectedBranchId(remaining[0].id);
        }
        showToast('info', `Removed ${name}`, 'Archived');
      } catch {
        showToast('error', 'Failed to remove facility', 'Error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1F2937] dark:text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight font-newsreader">
            Facility Resource Configuration
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7C9A92] mt-0.5 font-mono">
            Departments • Consultation Counters • Staff Allocation • Places & Branches (CRUD)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'PLACES' && (
            <button
              type="button"
              onClick={handleOpenCreatePlace}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sign Up New Place</span>
            </button>
          )}

          {activeTab === 'SERVICES' && (
            <button
              type="button"
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          )}

          {activeTab === 'COUNTERS' && (
            <button
              type="button"
              onClick={() => setShowCounterModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Counter</span>
            </button>
          )}

          {activeTab === 'STAFF' && (
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Operator</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E5E7EB] dark:border-white/10">
        {[
          { key: 'PLACES', label: 'Places & Branches' },
          { key: 'SERVICES', label: 'Departments & Services' },
          { key: 'COUNTERS', label: 'Consultation Counters' },
          { key: 'STAFF', label: 'Staff & Operators' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-5 text-xs font-mono transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#0F4C5C] dark:border-[#5EEAD4] text-[#0F4C5C] dark:text-white font-bold'
                : 'border-transparent text-[#6B7280] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Places & Branches CRUD Grid */}
      {activeTab === 'PLACES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-stone-400">
            <span>Registered Operational Facilities ({branches.length})</span>
            <span className="font-mono">Active Focus: {branches.find((b) => b.id === selectedBranchId)?.name || 'Vile Parle'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((b) => {
              const isSelected = b.id === selectedBranchId;
              const hours = (b.operatingHours as any) || {};
              return (
                <div
                  key={b.id}
                  className={`p-6 rounded-2xl bg-white dark:bg-[#0B1312] border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0F4C5C] ring-2 ring-[#0F4C5C]/20 dark:border-[#5EEAD4]'
                      : 'border-[#E5E7EB] dark:border-white/10 hover:border-[#D1D5DB]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF3F1] dark:bg-white/10 flex items-center justify-center text-[#0F4C5C] dark:text-[#5EEAD4]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#111827] dark:text-white text-base font-newsreader leading-tight">
                            {b.name}
                          </h3>
                          <span className="text-[11px] font-mono text-[#6B7280] dark:text-stone-400">
                            {b.city}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F4C5C] text-white">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-[#4B5563] dark:text-stone-300 pt-2 border-t border-[#E5E7EB] dark:border-white/5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{b.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4] shrink-0" />
                        <span className="font-mono">{b.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#5EEAD4] shrink-0" />
                        <span className="font-mono text-[11px]">
                          {hours.open || '08:30'} - {hours.close || '18:00'} (Mon-Sat)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranchId(b.id);
                        showToast('info', `Switched active branch to ${b.name}`, 'Branch Focus');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold'
                          : 'text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {isSelected ? '✓ In View' : 'Select Branch'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPlace(b)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
                        title="Edit place"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(b.id, b.name)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-rose-600 hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
                        title="Delete place"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services Grid */}
      {activeTab === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#111827] dark:text-white text-base font-newsreader">{srv.name}</h3>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold border border-[#A7D7C5] dark:border-white/10">
                  SLA: &lt;{srv.slaMinutes}m
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#8EAAA2] line-clamp-2 leading-relaxed">
                {srv.description}
              </p>
              <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/5 flex items-center justify-between text-xs font-mono text-[#4B5563] dark:text-[#63847C]">
                <span>Avg Duration: ~{srv.avgDurationMin} min</span>
                <span className="text-[#0F4C5C] dark:text-[#5EEAD4] font-medium">{srv.priorityAllowed ? '✓ Priority Fast-Track' : 'Standard Only'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counters Grid */}
      {activeTab === 'COUNTERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {counters.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-[#111827] dark:text-white">
                  Counter 0{c.counterNumber}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#8EAAA2] font-medium">{c.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Staff Grid */}
      {activeTab === 'STAFF' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {staffList.map((stf) => (
            <div
              key={stf.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#111827] dark:text-white text-sm font-newsreader">{stf.name}</h4>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold border border-[#A7D7C5]">
                  {stf.role}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#8EAAA2]">{stf.email}</p>
              <p className="text-[11px] font-mono text-[#9CA3AF] dark:text-[#63847C]">{stf.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Place / Branch Modal (CRUD) */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div>
              <span className="text-[11px] font-mono text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold uppercase">
                Facility Directory
              </span>
              <h3 className="font-bold text-lg text-[#111827] dark:text-white font-newsreader mt-0.5">
                {editingPlaceId ? 'Edit Place / Branch' : 'Sign Up New Place / Facility'}
              </h3>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                  Place / Facility Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health & Transit Hub"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building 4B, Central Avenue"
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                    City / Zone
                  </label>
                  <input
                    type="text"
                    required
                    value={placeCity}
                    onChange={(e) => setPlaceCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                    Phone Hotwire
                  </label>
                  <input
                    type="tel"
                    required
                    value={placePhone}
                    onChange={(e) => setPlacePhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    required
                    value={placeOpenTime}
                    onChange={(e) => setPlaceOpenTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] dark:text-[#8EAAA2] block mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    required
                    value={placeCloseTime}
                    onChange={(e) => setPlaceCloseTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9FAFB] dark:bg-stone-900 border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D1D5DB] dark:border-white/10 text-xs font-medium text-[#4B5563] dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-xs text-white font-semibold shadow-xs transition"
                >
                  {editingPlaceId ? 'Update Place' : 'Register Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#111827] dark:text-white font-newsreader">Create Department</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#4B5563]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-xs text-white font-semibold shadow-xs"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#111827] dark:text-white font-newsreader">Deploy New Counter</h3>
            <form onSubmit={handleCreateCounter} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Counter Number</label>
                <input
                  type="text"
                  value={counterNum}
                  onChange={(e) => setCounterNum(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Display Label</label>
                <input
                  type="text"
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="flex-1 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#4B5563]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-xs text-white font-semibold shadow-xs"
                >
                  Deploy Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#0B1312] border border-[#E5E7EB] dark:border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#111827] dark:text-white font-newsreader">Assign Operator</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#4B5563] dark:text-[#8EAAA2] block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-[#061210] border border-[#D1D5DB] dark:border-white/10 text-xs text-[#111827] dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2 rounded-full border border-[#D1D5DB] text-xs text-[#4B5563]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-xs text-white font-semibold shadow-xs"
                >
                  Save Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
