import React from 'react';

export default function ConfidenceGauge({ score = 0, showLabel = true }) {
  const percentage = Math.round((typeof score === 'number' ? score : 0) * 100);

  let colorClass = 'text-emerald-400 bg-emerald-500';
  let badgeBg = 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300';

  if (percentage < 75) {
    colorClass = 'text-rose-400 bg-rose-500';
    badgeBg = 'bg-rose-950/60 border-rose-800/80 text-rose-300';
  } else if (percentage < 90) {
    colorClass = 'text-amber-400 bg-amber-500';
    badgeBg = 'bg-amber-950/60 border-amber-800/80 text-amber-300';
  }

  return (
    <div className="flex items-center gap-2">
      {/* Progress pill bar */}
      <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[1]}`}
          style={{ width: `${Math.max(5, Math.min(100, percentage))}%` }}
        />
      </div>

      {showLabel && (
        <span
          className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
