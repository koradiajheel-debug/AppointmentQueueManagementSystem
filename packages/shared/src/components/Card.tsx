import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glass = false, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl border transition-all duration-200',
          glass
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-800/80 shadow-xl'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={twMerge('text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-white', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={twMerge('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('p-6 pt-0', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('flex items-center p-6 pt-0', className)} {...props} />
);
