import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export const NotFoundPage: React.FC<{ homePath?: string }> = ({ homePath = '/' }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <span className="text-9xl font-black text-slate-100 dark:text-slate-800 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-200 dark:border-indigo-800">
            Page Not Found
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Looking for a queue or appointment?
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
        The link you followed may be expired or the route does not exist. Your active tickets and appointments remain safe.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => (window.location.href = homePath)}
        >
          Return to Portal
        </Button>
      </div>
    </div>
  );
};
