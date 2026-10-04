import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RemediationRecommendation } from '../../types';
import { RiskBadge, StatusIndicator } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sliders,
  AlertTriangle,
  Play,
  FileCheck,
} from 'lucide-react';

export const RemediationView: React.FC = () => {
  const {
    activeExperiment,
    experiments,
    setActiveExperimentId,
    applyRemediation,
    rerunWithRemediation,
    isRunningExperiment,
    activeComparison,
    setActiveComparison,
    setActiveTab,
  } = useApp();

  const [appliedRemediations, setAppliedRemediations] = useState<Record<string, boolean>>({});
  const [isRerunning, setIsRerunning] = useState(false);

  if (!activeExperiment) {
    return (
      <EmptyState
        title="No Active Experiment"
        description="Run an attack scenario first to diagnose vulnerabilities and generate policy remediation recommendations."
        actionText="Open Attack Lab"
        onAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const { findings, remediations } = activeExperiment;

  const handleApplyControl = (rem: RemediationRecommendation) => {
    applyRemediation(rem);
    setAppliedRemediations(prev => ({ ...prev, [rem.id]: true }));
  };

  const handleRerun = async () => {
    setIsRerunning(true);
    try {
      await rerunWithRemediation(activeExperiment.id);
    } finally {
      setIsRerunning(false);
    }
  };

  // Find if there is an existing comparison for this experiment
  const existingRerun = experiments.find(
    e => e.parentExperimentId === activeExperiment.id || (e.id === activeExperiment.parentExperimentId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Remediation &amp; Policy Patching
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({findings.length} findings · {remediations.length} recommended controls)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescriptive security mitigations generated from observed trace violations and perimeter leaks.
          </p>
        </div>

        {/* Experiment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Target Exp:</label>
          <select
            value={activeExperiment.id}
            onChange={e => {
              setActiveExperimentId(e.target.value);
              setActiveComparison(null);
            }}
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

      {/* Active Experiment Summary Strip */}
      <div className="p-4 rounded-lg border border-slate-800 bg-[#0d1422] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-cyan-400">[{activeExperiment.scenarioCode}] {activeExperiment.scenarioTitle}</span>
          <span className="text-slate-600">·</span>
          <span>Status: <StatusIndicator status={activeExperiment.status} /></span>
          <span className="text-slate-600">·</span>
          <span>Blast Radius: <strong className="text-white">{activeExperiment.blastRadius.totalScore}/100</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRerun}
            disabled={isRerunning || isRunningExperiment}
            className="flex items-center gap-1.5 rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRerunning ? 'animate-spin' : ''}`} />
            <span>Rerun Same Experiment to Verify</span>
          </button>
        </div>
      </div>

      {/* LIVE BEFORE VS AFTER COMPARISON (If comparison exists or active) */}
      {activeComparison && (
        <div className="border border-cyan-500/50 rounded-lg bg-[#071322] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-800/60 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span>Comparative Verification Result (Before vs After Rerun)</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              RISK REDUCTION: {activeComparison.riskReductionPercentage}%
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {activeComparison.summary}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono text-center">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">ATTACK SUCCESS</span>
              <div className="text-rose-400 font-bold">
                {activeComparison.beforeRun.status}
              </div>
              <div className="text-slate-500 my-0.5">&darr;</div>
              <div className="text-emerald-400 font-bold">
                {activeComparison.afterRun.status}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">BLAST RADIUS</span>
              <div className="text-rose-400 font-bold">
                {activeComparison.beforeRun.blastRadius.totalScore}/100
              </div>
              <div className="text-slate-500 my-0.5">&darr;</div>
              <div className="text-emerald-400 font-bold">
                {activeComparison.afterRun.blastRadius.totalScore}/100
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">SENSITIVE ASSETS</span>
              <div className="text-slate-300 font-bold">
                {activeComparison.beforeRun.sensitiveResourcesTouched.length}
              </div>
              <div className="text-slate-500 my-0.5">&darr;</div>
              <div className="text-emerald-400 font-bold">
                {activeComparison.afterRun.sensitiveResourcesTouched.length}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">POLICY VIOLATIONS</span>
              <div className="text-slate-300 font-bold">
                {activeComparison.beforeRun.detectedViolations.length}
              </div>
              <div className="text-slate-500 my-0.5">&darr;</div>
              <div className="text-emerald-400 font-bold">
                {activeComparison.afterRun.detectedViolations.length}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] block mb-1">SIDE EFFECTS</span>
              <div className="text-slate-300 font-bold">
                {activeComparison.beforeRun.externalSideEffects.length}
              </div>
              <div className="text-slate-500 my-0.5">&darr;</div>
              <div className="text-emerald-400 font-bold">
                {activeComparison.afterRun.externalSideEffects.length}
              </div>
            </div>

            <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-center">
              <span className="text-emerald-400 text-[10px] block mb-1 font-semibold">DELTA REDUCTION</span>
              <div className="text-emerald-300 font-extrabold text-lg tabular-nums">
                -{activeComparison.riskReductionPercentage}%
              </div>
              <span className="text-[10px] text-emerald-400/80 font-sans">verified drop</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Controls Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Identified Vulnerabilities &amp; Proposed Remediations
        </h2>

        {remediations.length === 0 ? (
          <div className="p-6 rounded-lg border border-slate-800 bg-[#0b101b] text-center text-xs font-mono text-slate-400">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            No remediation required. The agent successfully contained this scenario without perimeter breach.
          </div>
        ) : (
          remediations.map(rem => {
            const isApplied = rem.applied || appliedRemediations[rem.id];
            const matchingFinding = findings.find(f => f.id === rem.findingId);

            return (
              <div
                key={rem.id}
                className="border border-slate-800 rounded-lg bg-[#0b101b] p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{rem.title}</h3>
                        {matchingFinding && (
                          <RiskBadge level={matchingFinding.severity} />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-sans">
                        {rem.proposedControl}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          CONTROL APPLIED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyControl(rem)}
                          className="flex items-center gap-1.5 rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Apply Control to Sandbox</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Impact Grid */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] block mb-1">
                        Affected Capability:
                      </span>
                      <span className="text-slate-300 font-semibold">{rem.affectedCapability}</span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 sm:col-span-2">
                      <span className="text-slate-500 uppercase text-[10px] block mb-1">
                        Expected Impact:
                      </span>
                      <span className="text-emerald-400">{rem.expectedImpact}</span>
                    </div>
                  </div>

                  {/* Proposed Patch Preview */}
                  <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500 block mb-1">Proposed Sandbox Policy Patch:</span>
                    <pre className="text-cyan-300 overflow-x-auto">
                      {JSON.stringify(rem.suggestedPatch, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
