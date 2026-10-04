import React from 'react';
import { RiskLevel, ExperimentStatus } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showDot = true }) => {
  const config = {
    LOW: { color: 'text-emerald-400', dot: 'bg-emerald-400' },
    MODERATE: { color: 'text-cyan-400', dot: 'bg-cyan-400' },
    ELEVATED: { color: 'text-amber-400', dot: 'bg-amber-400' },
    HIGH: { color: 'text-orange-400', dot: 'bg-orange-400' },
    CRITICAL: { color: 'text-rose-400', dot: 'bg-rose-400' },
  }[level] || { color: 'text-slate-400', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${config.color}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {level}
    </span>
  );
};

export const StatusIndicator: React.FC<{ status: ExperimentStatus }> = ({ status }) => {
  const config = {
    SUCCESS: { label: 'SUCCESS', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    CONTAINED: { label: 'CONTAINED', color: 'text-cyan-400', dot: 'bg-cyan-400' },
    BREACHED: { label: 'BREACHED', color: 'text-rose-400', dot: 'bg-rose-400' },
    FAILED: { label: 'FAULT/ERROR', color: 'text-amber-400', dot: 'bg-amber-400' },
    RUNNING: { label: 'EXECUTING', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  }[status] || { label: status, color: 'text-slate-400', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider ${config.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
