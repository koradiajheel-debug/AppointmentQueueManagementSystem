import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-slate-200 dark:bg-slate-800/80',
          variant === 'circular' && 'rounded-full',
          variant === 'text' && 'h-4 w-full rounded',
          variant === 'rectangular' && 'rounded-xl',
          className
        )
      )}
      {...props}
    />
  );
};
