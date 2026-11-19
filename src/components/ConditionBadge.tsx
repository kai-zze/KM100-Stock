import React from 'react';
import { ItemCondition } from '../types/inventory';

interface Props {
  condition: ItemCondition | string;
}

export const ConditionBadge: React.FC<Props> = ({ condition }) => {
  const styles: Record<string, string> = {
    // Official KM100 Statuses
    'Working': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/80',
    'Used': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80',
    'Deffective': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80',
    'Empty': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    'Incomplete': 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-700/80',

    // Standard Fallbacks
    'Good': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/80',
    'Fair': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80',
    'Needs Repair': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80',
    'Condemned': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80'
  };

  const dotColors: Record<string, string> = {
    'Working': 'bg-emerald-500',
    'Used': 'bg-amber-500',
    'Deffective': 'bg-rose-500',
    'Empty': 'bg-slate-400',
    'Incomplete': 'bg-orange-500',
    'Good': 'bg-emerald-500',
    'Fair': 'bg-amber-500',
    'Needs Repair': 'bg-rose-500',
    'Condemned': 'bg-rose-500'
  };

  const baseClass = styles[condition] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const dotClass = dotColors[condition] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${baseClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`}></span>
      {condition || 'Unknown'}
    </span>
  );
};
