import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { changeLanguage } from '../i18n';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
      <select
        aria-label="Select language"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'hi' | 'gu' | 'mr')}
        className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
      >
        <option value="en">English (EN)</option>
        <option value="hi">हिंदी (HI)</option>
        <option value="gu">ગુજરાતી (GU)</option>
        <option value="mr">मराठी (MR)</option>
      </select>
    </div>
  );
};
