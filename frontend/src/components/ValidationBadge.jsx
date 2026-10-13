import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

export default function ValidationBadge({ status, flagsCount = 0, size = 'sm' }) {
  const isLarge = size === 'lg';

  switch (status) {
    case 'VALID':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
            isLarge ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
          } bg-emerald-950/70 text-emerald-300 border-emerald-800/80 shadow-sm shadow-emerald-950/50`}
        >
          <CheckCircle2 className={isLarge ? 'w-3.5 h-3.5 text-emerald-400' : 'w-3 h-3 text-emerald-400'} />
          Verified
        </span>
      );

    case 'WARNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
            isLarge ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
          } bg-amber-950/70 text-amber-300 border-amber-800/80 shadow-sm shadow-amber-950/50`}
        >
          <AlertTriangle className={isLarge ? 'w-3.5 h-3.5 text-amber-400' : 'w-3 h-3 text-amber-400'} />
          {flagsCount > 0 ? `${flagsCount} Warning${flagsCount > 1 ? 's' : ''}` : 'Warning'}
        </span>
      );

    case 'INVALID':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
            isLarge ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
          } bg-rose-950/80 text-rose-300 border-rose-800/80 shadow-sm shadow-rose-950/50 animate-pulse`}
        >
          <AlertOctagon className={isLarge ? 'w-3.5 h-3.5 text-rose-400' : 'w-3 h-3 text-rose-400'} />
          {flagsCount > 0 ? `${flagsCount} Anomaly Detected` : 'Anomaly Detected'}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
            isLarge ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
          } bg-slate-800 text-slate-300 border-slate-700`}
        >
          <Clock className={isLarge ? 'w-3.5 h-3.5 text-slate-400' : 'w-3 h-3 text-slate-400'} />
          Pending
        </span>
      );
  }
}
