import React, { useState } from 'react';
import {
  Stethoscope,
  Baby,
  Smile,
  TestTube2,
  Pill,
  MoreHorizontal,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Globe,
  Users,
  Award,
  Heart,
  Accessibility,
} from 'lucide-react';
import {
  api,
  useToast,
  PriorityTier,
  QueueTicket,
  SEED_SERVICES,
} from '@queuesmart/shared';
import { PrintableTokenSlip } from '../components/PrintableTokenSlip';

interface ServiceOption {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const KIOSK_SERVICES: ServiceOption[] = [
  {
    id: 'srv-1',
    name: 'General Consultation',
    category: 'Consultation',
    icon: Stethoscope,
    description: 'Routine checkups, general medical inquiries & physician consultations.',
  },
  {
    id: 'srv-2',
    name: 'Pediatrics',
    category: 'Specialty',
    icon: Baby,
    description: 'Child care, pediatric immunizations & infant wellness exams.',
  },
  {
    id: 'srv-dental',
    name: 'Dental',
    category: 'Dental',
    icon: Smile,
    description: 'Oral hygiene, dental checkups, cleaning & orthodontic screenings.',
  },
  {
    id: 'srv-3',
    name: 'Lab Tests',
    category: 'Diagnostics',
    icon: TestTube2,
    description: 'Blood work, specimen collection & pathology diagnostics.',
  },
  {
    id: 'srv-pharmacy',
    name: 'Pharmacy',
    category: 'Medication',
    icon: Pill,
    description: 'Prescription dispensing, medication counseling & refills.',
  },
  {
    id: 'srv-other',
    name: 'Other Services',
    category: 'General',
    icon: MoreHorizontal,
    description: 'Administrative requests, billing assistance & records pickup.',
  },
];

export const SelfKioskPage: React.FC = () => {
  const [step, setStep] = useState<'service' | 'priority' | 'confirmed'>('service');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedTier, setSelectedTier] = useState<PriorityTier>('NORMAL');
  const [issuedTicket, setIssuedTicket] = useState<QueueTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSelectService = (service: ServiceOption) => {
    setSelectedService(service);
    // Proceed to priority step or allow quick print
    setStep('priority');
  };

  const handlePrintKioskToken = async () => {
    if (!selectedService) return;

    setIsLoading(true);
    try {
      const res = await api.registerWalkin({
        branchId: 'branch-1',
        serviceId: selectedService.id.startsWith('srv-') ? selectedService.id : 'srv-1',
        userName: 'Kiosk Visitor',
        userPhone: '+91 99999 00000',
        priorityTier: selectedTier,
        isGroup: false,
        groupSize: 1,
      });

      if (res.data) {
        setIssuedTicket(res.data);
        setStep('confirmed');
        showToast('success', `Token ${res.data.tokenNo} issued!`, 'Printed');
      }
    } catch (e: any) {
      showToast('error', 'Unable to issue kiosk token. Please contact reception.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedService(null);
    setSelectedTier('NORMAL');
    setIssuedTicket(null);
    setStep('service');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937] flex flex-col justify-between select-none relative overflow-hidden font-sans">
      
      {/* Subtle Botanical Leaf Silhouette (Matches bottom-right on board) */}
      <div className="absolute -bottom-10 -right-10 pointer-events-none opacity-20 text-[#0F4C5C]">
        <svg width="240" height="240" viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 20 C120 50 160 70 180 110 C160 115 130 100 115 80 C105 110 130 140 150 170 C120 165 105 140 100 120 C95 140 80 165 50 170 C70 140 95 110 85 80 C70 100 40 115 20 110 C40 70 80 50 100 20 Z" />
        </svg>
      </div>

      {/* TOP KIOSK HEADER */}
      <header className="px-8 sm:px-14 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] flex items-center justify-center text-white">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-[3px] rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1F2937] font-newsreader">
            QueueSmart
          </span>
        </div>

        {/* Language selector pill */}
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#4B5563] shadow-sm hover:border-[#D1D5DB]"
        >
          <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>EN</span>
        </button>
      </header>

      {/* MAIN KIOSK BODY */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 sm:px-14 py-4 flex flex-col justify-center z-10">
        
        {step === 'service' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight font-newsreader">
                Select a Service
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] mt-1.5">
                Choose the service you need to access
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {KIOSK_SERVICES.map((srv) => {
                const Icon = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleSelectService(srv)}
                    className="p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#0F4C5C] hover:shadow-lg transition-all duration-200 text-left group flex items-start gap-4 active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] group-hover:bg-[#EAF3F1] text-[#0F4C5C] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-[#111827] group-hover:text-[#0F4C5C] transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'priority' && selectedService && (
          <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#6B9E7A] font-bold">
                Step 2 of 2
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight font-newsreader mt-1">
                Priority & Fast-Track Triage
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Selected: <strong className="text-[#111827]">{selectedService.name}</strong>. Let us know if you qualify for priority handling.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { tier: 'NORMAL', label: 'Standard', icon: Users, sub: 'Regular queue' },
                { tier: 'SENIOR', label: 'Senior (60+)', icon: Award, sub: 'Express triage' },
                { tier: 'PREGNANT', label: 'Expectant', icon: Heart, sub: 'Comfort priority' },
                { tier: 'DISABLED', label: 'Special Care', icon: Accessibility, sub: 'Assisted lane' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedTier === item.tier;

                return (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setSelectedTier(item.tier as PriorityTier)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white shadow-md'
                        : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#C5DDD7]' : 'text-[#9CA3AF]'}`}>
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handlePrintKioskToken}
                className="w-full py-4 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-semibold text-base shadow-md flex items-center justify-center gap-3 transition"
              >
                <Printer className="w-5 h-5" />
                <span>{isLoading ? 'Printing Ticket...' : 'Confirm & Print Queue Ticket'}</span>
              </button>
            </div>
          </div>
        )}

        {step === 'confirmed' && issuedTicket && (
          <div className="max-w-md mx-auto w-full bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EAF3F1] text-[#0F4C5C] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#111827] font-newsreader">
                Your Ticket is Ready
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Please collect your thermal slip below and proceed to Waiting Area A.
              </p>
            </div>

            <PrintableTokenSlip ticket={issuedTicket} onDone={handleReset} />

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 rounded-xl bg-[#F7F7F5] hover:bg-[#E5E7EB] text-[#1F2937] font-semibold text-sm transition"
            >
              Touch Screen to Return Home
            </button>
          </div>
        )}

      </main>

      {/* BOTTOM CONTROLS & STEP INDICATOR */}
      <footer className="px-8 sm:px-14 py-6 flex items-center justify-between z-10 border-t border-[#E5E7EB]/60">
        <div>
          {step !== 'service' ? (
            <button
              type="button"
              onClick={() => (step === 'priority' ? setStep('service') : handleReset())}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#4B5563] shadow-sm hover:border-[#D1D5DB]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#4B5563] shadow-sm hover:border-[#D1D5DB]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Step Indicator dots (Matches board: line pill + two dots) */}
        <div className="flex items-center gap-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'service' ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-[#D1D5DB]'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'priority' ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-[#D1D5DB]'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'confirmed' ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-[#D1D5DB]'
            }`}
          />
        </div>

        {/* Placeholder to balance layout */}
        <div className="w-16" />
      </footer>
    </div>
  );
};
