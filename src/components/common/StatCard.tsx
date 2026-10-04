import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: {
    value: string | number;
    isPositiveGood?: boolean;
    text: string;
  };
  highlight?: 'default' | 'danger' | 'warning' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  delta,
  highlight = 'default',
}) => {
  const borderHighlight = {
    default: 'border-slate-800/80',
    danger: 'border-rose-900/60',
    warning: 'border-amber-900/60',
    success: 'border-emerald-900/60',
  }[highlight];

  return (
    <div className={`p-4 rounded-lg border bg-[#0b101b] ${borderHighlight} flex flex-col justify-between`}>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-sans font-medium tracking-tight uppercase text-[11px] text-slate-400">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-slate-500 font-sans">{subtext}</span>
        )}
      </div>
      {delta && (
        <div className="mt-2 text-xs font-mono flex items-center gap-1.5 text-slate-400">
          <span className={delta.isPositiveGood ? 'text-emerald-400' : 'text-rose-400'}>
            {delta.value}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 truncate">{delta.text}</span>
        </div>
      )}
    </div>
  );
};
