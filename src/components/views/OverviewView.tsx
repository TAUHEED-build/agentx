import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusIndicator, RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import { Play, Sparkles, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ATTACK_SCENARIOS } from '../../engine/attacks/scenarios';

export const OverviewView: React.FC = () => {
  const {
    experiments,
    setActiveTab,
    setActiveExperimentId,
    loadDemoData,
    executeScenario,
    isRunningExperiment,
    setIsConfigModalOpen,
  } = useApp();

  // If no experiments exist, render empty state with immediate action
  if (experiments.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="Sandbox Ready — No Experiments Recorded"
          description="The AGENTX deterministic simulation engine is primed. Run an attack scenario against the Customer Operations Agent or load the verified benchmark demo suite."
          actionText={isRunningExperiment ? 'Running Scenarios...' : 'Load Demo Lab (Deterministic Benchmarks)'}
          onAction={() => loadDemoData()}
          secondaryActionText="Open Attack Lab"
          onSecondaryAction={() => setActiveTab('attack-lab')}
        />
      </div>
    );
  }

  // Calculate real metrics from stored experiments
  const totalExperiments = experiments.length;
  const breachedAttacks = experiments.filter(e => e.status === 'BREACHED').length;
  const containedAttacks = experiments.filter(e => e.status === 'CONTAINED').length;
  const criticalFindings = experiments.reduce(
    (acc, exp) => acc + exp.findings.filter(f => f.severity === 'CRITICAL').length,
    0
  );

  const avgBlastRadius = Math.round(
    experiments.reduce((acc, exp) => acc + exp.blastRadius.totalScore, 0) / totalExperiments
  );

  // Recovery rate for reliability scenarios
  const reliabilityExps = experiments.filter(e => e.scenarioCategory === 'RELIABILITY');
  const recoveredCount = reliabilityExps.filter(
    e => e.recoveryBehavior === 'RECOVERED' || e.recoveryBehavior === 'CONTAINED'
  ).length;
  const recoveryRate = reliabilityExps.length > 0
    ? Math.round((recoveredCount / reliabilityExps.length) * 100)
    : 100;

  // Remediated comparisons
  const remediatedRuns = experiments.filter(e => e.isRemediatedRun && e.parentExperimentId);
  let totalRiskReduction = 0;
  if (remediatedRuns.length > 0) {
    let reductionSum = 0;
    for (const remRun of remediatedRuns) {
      const parent = experiments.find(e => e.id === remRun.parentExperimentId);
      if (parent && parent.blastRadius.totalScore > 0) {
        const delta = parent.blastRadius.totalScore - remRun.blastRadius.totalScore;
        reductionSum += Math.max(0, (delta / parent.blastRadius.totalScore) * 100);
      }
    }
    totalRiskReduction = Math.round(reductionSum / remediatedRuns.length);
  }

  const recentExperiments = experiments.slice(0, 8);

  const handleRowClick = (expId: string) => {
    setActiveExperimentId(expId);
    setActiveTab('traces');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Sandbox Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            Security &amp; Reliability Posture
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-sans">
            Real execution traces, observed perimeter boundaries, and policy enforcement metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attack-lab')}
            className="flex items-center gap-1.5 rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Launch Attack Lab</span>
          </button>
        </div>
      </div>

      {/* Calculated Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Experiments"
          value={totalExperiments}
          subtext="runs"
        />
        <StatCard
          label="Successful Attacks"
          value={breachedAttacks}
          subtext={`${Math.round((breachedAttacks / totalExperiments) * 100)}% breached`}
          highlight={breachedAttacks > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Contained Attacks"
          value={containedAttacks}
          subtext={`${Math.round((containedAttacks / totalExperiments) * 100)}% contained`}
          highlight={containedAttacks > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="Critical Findings"
          value={criticalFindings}
          subtext="violations"
          highlight={criticalFindings > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Avg Blast Radius"
          value={`${avgBlastRadius}/100`}
          subtext="normalized"
          highlight={avgBlastRadius >= 60 ? 'danger' : avgBlastRadius >= 40 ? 'warning' : 'default'}
        />
        <StatCard
          label="Risk Reduction"
          value={remediatedRuns.length > 0 ? `-${totalRiskReduction}%` : 'N/A'}
          subtext={remediatedRuns.length > 0 ? 'post-remediation' : 'no rerun yet'}
          highlight={remediatedRuns.length > 0 ? 'success' : 'default'}
        />
      </div>

      {/* Recent Experiments Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0d1422]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Recent Experiment Executions
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              ({recentExperiments.length} of {totalExperiments})
            </span>
          </div>

          <button
            onClick={() => setActiveTab('experiments')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 font-mono text-[11px] uppercase bg-slate-900/40">
                <th className="py-2.5 px-4 font-medium">Exp ID</th>
                <th className="py-2.5 px-4 font-medium">Scenario</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Outcome</th>
                <th className="py-2.5 px-4 font-medium text-right">Blast Radius</th>
                <th className="py-2.5 px-4 font-medium text-right">Duration</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentExperiments.map(exp => (
                <tr
                  key={exp.id}
                  onClick={() => handleRowClick(exp.id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-4 font-semibold text-cyan-300">
                    {exp.id}
                    {exp.isRemediatedRun && (
                      <span className="ml-1.5 text-[10px] text-emerald-400">
                        [REMEDIATED]
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-200">
                    <span className="font-mono text-slate-500 mr-1.5">[{exp.scenarioCode}]</span>
                    {exp.scenarioTitle}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {exp.scenarioCategory}
                  </td>
                  <td className="py-2.5 px-4">
                    <StatusIndicator status={exp.status} />
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="font-bold tabular-nums text-white">
                      {exp.blastRadius.totalScore}
                    </span>
                    <span className="text-slate-500">/100 </span>
                    <RiskBadge level={exp.blastRadius.riskLevel} showDot={false} />
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums">
                    {exp.durationMs}ms
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                      Inspect &rarr;
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Launch Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Recommended Vulnerability Stress Test</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-white">
              Indirect Prompt Injection via Poisoned RAG
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Evaluates if web.search content can smuggle adversarial instructions that override the agent's objective to steal customer database records.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => executeScenario('sec-02')}
              disabled={isRunningExperiment}
              className="rounded bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Run Scenario 02
            </button>
            <button
              onClick={() => setActiveTab('attack-lab')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Browse all 12 scenarios
            </button>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Active Agent &amp; Tool Controls</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-white">
              Customer Operations Agent (5 Tools Configured)
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Current policy allows CRM reads &amp; writes, DB queries, and email dispatches. Inspect permissions and security gates.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="rounded bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Modify Policy Gates
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className="text-xs text-cyan-400 hover:underline"
            >
              View active remediation recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
