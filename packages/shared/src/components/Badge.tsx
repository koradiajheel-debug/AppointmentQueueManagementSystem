import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PriorityTier } from '../types';
import { PRIORITY_CONFIG } from '../tokens';
import { AlertTriangle, Heart, Accessibility, Award, User } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  priority?: PriorityTier;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  priority,
  dot = false,
  children,
  ...props
}) => {
  if (priority) {
    const config = PRIORITY_CONFIG[priority];
    const Icon =
      priority === 'EMERGENCY'
        ? AlertTriangle
        : priority === 'PREGNANT'
        ? Heart
        : priority === 'DISABLED'
        ? Accessibility
        : priority === 'SENIOR'
        ? Award
        : User;

    return (
      <span
        className={twMerge(
          clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
            config.bg,
            config.text,
            config.border,
            className
          )
        )}
        {...props}
      >
        <Icon className="w-3.5 h-3.5" />
        {children || config.label}
      </span>
    );
  }

  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};
