import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface Step {
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li
              key={step.title}
              className={clsx(
                'relative flex items-center',
                index !== steps.length - 1 ? 'flex-1' : ''
              )}
            >
              <div
                className={clsx(
                  'flex items-center gap-3',
                  onStepClick && isCompleted ? 'cursor-pointer' : ''
                )}
                onClick={() => onStepClick && isCompleted && onStepClick(index)}
              >
                <span
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 shadow-sm',
                    isCompleted && 'bg-emerald-600 text-white shadow-emerald-500/20',
                    isCurrent && 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60 shadow-indigo-500/30',
                    isUpcoming && 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : index + 1}
                </span>

                <div className="hidden sm:block text-left">
                  <p
                    className={clsx(
                      'text-xs font-semibold leading-tight',
                      isCurrent && 'text-indigo-600 dark:text-indigo-400',
                      isCompleted && 'text-slate-800 dark:text-slate-200',
                      isUpcoming && 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{step.description}</p>
                  )}
                </div>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-3 transition-colors duration-200',
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
