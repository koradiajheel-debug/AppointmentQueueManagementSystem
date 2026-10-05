import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../store/useCustomerStore';
import { Modal } from '@queuesmart/shared';
import { ArrowRight, Clock, Calendar, Ticket, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOUR_STEPS = [
  {
    title: 'Welcome to QueueSmart! 🎉',
    description: "We're here to save your time. Let us give you a quick 3-step tour of how to use the portal.",
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    actionText: "Start Tour",
  },
  {
    title: '1. Join a Virtual Queue',
    description: "Need to visit today? Click 'Join Virtual Queue' to get a live token instantly. You can wait comfortably at home and we'll tell you exactly when to leave.",
    icon: <Clock className="w-8 h-8 text-[#0F4C5C] dark:text-[#5EEAD4]" />,
    actionText: "Next",
  },
  {
    title: '2. Book an Appointment',
    description: "Planning ahead? Use 'Book Appointment' to schedule a specific date and time slot for your future visits.",
    icon: <Calendar className="w-8 h-8 text-[#0F4C5C] dark:text-[#5EEAD4]" />,
    actionText: "Next",
  },
  {
    title: '3. Your Live Ticket',
    description: "Once you join a queue or book an appointment, your 'Live Ticket' will track your wait time in real-time. It even calculates your driving time to the branch!",
    icon: <Ticket className="w-8 h-8 text-[#0F4C5C] dark:text-[#5EEAD4]" />,
    actionText: "Got it! Let's Go",
  }
];

export const GuidedTour: React.FC = () => {
  const { user } = useCustomerStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user is logged in and hasn't seen the tour
    const hasSeenTour = localStorage.getItem('queuesmart_has_seen_tour');
    if (user && !hasSeenTour) {
      // Delay showing the tour slightly for a better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('queuesmart_has_seen_tour', 'true');
  };

  if (!isOpen) return null;

  const stepData = TOUR_STEPS[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={currentStep === 0 ? "Welcome" : `Step ${currentStep} of 3`}>
      <div className="flex flex-col items-center text-center py-4 sm:py-8 px-2 sm:px-6 space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#081c18] border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0 shadow-sm animate-bounce-slight">
          {stepData.icon}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white font-newsreader">
            {stepData.title}
          </h3>
          <p className="text-sm sm:text-base text-[#4B5563] dark:text-stone-300 max-w-sm leading-relaxed">
            {stepData.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 pt-4">
          {TOUR_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-[#0F4C5C] dark:bg-[#5EEAD4]' : 'w-2 bg-stone-200 dark:bg-stone-700'
              }`}
            />
          ))}
        </div>

        <div className="w-full pt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-[#111827] dark:text-stone-400 dark:hover:text-white transition order-2 sm:order-1"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-sm font-semibold transition shadow-md order-1 sm:order-2"
          >
            <span>{stepData.actionText}</span>
            {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};
