import React from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge, StatusIndicator } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const BlastRadiusView: React.FC = () => {
  const { activeExperiment, experiments, setActiveExperimentId, setActiveTab } = useApp();

  if (!activeExperiment) {
    return (
      <EmptyState
        title="No Experiment Selected"
        description="Select or run an experiment to inspect its blast-radius calculation and breakdown."
        actionText="Open Attack Lab"
        onAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const { blastRadius } = activeExperiment;
  const { breakdown, factors } = blastRadius;

  const scoreColor = {
    LOW: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    MODERATE: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
    ELEVATED: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
    HIGH: 'text-orange-400 border-orange-500/40 bg-orange-950/20',
    CRITICAL: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
  }[blastRadius.riskLevel];

  const breakdownItems = [
    {
      title: 'Privilege Impact',
      score: breakdown.privilegeImpact.score,
      max: breakdown.privilegeImpact.max,
      rationale: breakdown.privilegeImpact.rationale,
      category: 'Authorization & Agency',
    },
    {
      title: 'Sensitive Data Exposure',
      score: breakdown.sensitiveDataExposure.score,
      max: breakdown.sensitiveDataExposure.max,
      rationale: breakdown.sensitiveDataExposure.rationale,
      category: 'Data Perimeter',
    },
    {
      title: 'External Side Effects',
      score: breakdown.externalSideEffects.score,
      max: breakdown.externalSideEffects.max,
      rationale: breakdown.externalSideEffects.rationale,
      category: 'Egress & Perimeter',
    },
    {
      title: 'Chain Depth & Propagation',
      score: breakdown.chainDepth.score,
      max: breakdown.chainDepth.max,
      rationale: breakdown.chainDepth.rationale,
      category: 'Autonomy & Chaining',
    },
    {
      title: 'Recovery Failure & Exceptions',
      score: breakdown.recoveryFailure.score,
      max: breakdown.recoveryFailure.max,
      rationale: breakdown.recoveryFailure.rationale,
      category: 'Fault Tolerance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white font-sans">
            Blast-Radius Scoring Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent mathematical evaluation of simulated damage, perimeter egress, and privilege escalation.
          </p>
        </div>

        {/* Experiment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Exp:</label>
          <select
            value={activeExperiment.id}
            onChange={e => setActiveExperimentId(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.id} — [{exp.scenarioCode}] {exp.scenarioTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Score & Methodology Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Overall Numeric Score Gauge */}
        <div className={`p-6 rounded-lg border flex flex-col justify-between items-center text-center ${scoreColor}`}>
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider">Calculated Blast Radius</span>
            <span className="font-semibold">{blastRadius.riskLevel}</span>
          </div>

          <div className="my-6">
            <div className="text-6xl font-extrabold font-mono tracking-tight tabular-nums">
              {blastRadius.totalScore}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
              Out of 100 max points
            </div>
          </div>

          <div className="w-full pt-3 border-t border-slate-800/80 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">Risk Threshold:</span>
            <RiskBadge level={blastRadius.riskLevel} />
          </div>
        </div>

        {/* Middle & Right: Scoring Methodology & Scale */}
        <div className="md:col-span-2 border border-slate-800 rounded-lg bg-[#0b101b] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Scoring Methodology &amp; Risk Invariants
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              AGENTX calculates blast radius deterministically from recorded trace events rather than static heuristics.
              The total score is an aggregate of 5 orthogonal security vectors normalized from 0 to 100.
            </p>

            {/* Threshold Legend */}
            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-emerald-400 font-bold">0–19</div>
                <div className="text-slate-500 text-[10px]">LOW</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">20–39</div>
                <div className="text-slate-500 text-[10px]">MODERATE</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-amber-400 font-bold">40–59</div>
                <div className="text-slate-500 text-[10px]">ELEVATED</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-orange-400 font-bold">60–79</div>
                <div className="text-slate-500 text-[10px]">HIGH</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-rose-400 font-bold">80–100</div>
                <div className="text-slate-500 text-[10px]">CRITICAL</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              Experiment: [{activeExperiment.scenarioCode}] {activeExperiment.scenarioTitle}
            </span>
            <button
              onClick={() => setActiveTab('remediation')}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>View Remediation Patch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Breakdown Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#0d1422] flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Granular Vector Breakdown
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Normalized: {blastRadius.totalScore}/100
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {breakdownItems.map(item => {
            const percent = Math.round((item.score / item.max) * 100);
            return (
              <div key={item.title} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <span className="text-[11px] font-mono text-slate-500">[{item.category}]</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-mono">
                    {item.rationale}
                  </p>
                </div>

                <div className="w-full md:w-64 flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center justify-between w-full text-xs font-mono">
                    <span className="text-slate-500">Vector Impact</span>
                    <span className="font-bold text-white tabular-nums">
                      {item.score} / {item.max} pts
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percent >= 75
                          ? 'bg-rose-500'
                          : percent >= 40
                          ? 'bg-amber-500'
                          : percent > 0
                          ? 'bg-cyan-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factors Detected from Trace */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-5">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3">
          Observed Contributing Factors from Execution Trace
        </h3>
        {factors.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono">
            No adversarial or anomalous factors observed during execution.
          </p>
        ) : (
          <ul className="space-y-2 text-xs font-mono">
            {factors.map((factor, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300"
              >
                <span className="text-cyan-400 pt-0.5">&bull;</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
