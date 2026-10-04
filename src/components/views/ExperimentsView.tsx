import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment, ExperimentStatus, ScenarioCategory } from '../../types';
import { StatusIndicator, RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import { Search, Filter, Play, Trash2, ArrowRight, RefreshCw, Sparkles, CheckSquare } from 'lucide-react';
import { ExperimentRunner } from '../../engine/experiments/ExperimentRunner';

export const ExperimentsView: React.FC = () => {
  const {
    experiments,
    activeExperiment,
    setActiveExperimentId,
    setActiveTab,
    clearData,
    executeScenario,
    loadDemoData,
    isRunningExperiment,
    setActiveComparison,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | ExperimentStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ScenarioCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (experiments.length === 0) {
    return (
      <EmptyState
        title="No Experiments in Database"
        description="Run attack scenarios or load the verified benchmark demo suite to inspect experiment histories."
        actionText={isRunningExperiment ? 'Running Scenarios...' : 'Load Demo Lab'}
        onAction={() => loadDemoData()}
        secondaryActionText="Open Attack Lab"
        onSecondaryAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const filteredExperiments = experiments.filter(exp => {
    if (statusFilter !== 'ALL' && exp.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && exp.scenarioCategory !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        exp.id.toLowerCase().includes(q) ||
        exp.scenarioTitle.toLowerCase().includes(q) ||
        exp.scenarioCode.includes(q) ||
        exp.attackPayload.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleLaunchComparison = (exp: Experiment) => {
    if (exp.parentExperimentId) {
      const parent = experiments.find(e => e.id === exp.parentExperimentId);
      if (parent) {
        const comp = ExperimentRunner.compareExperiments(parent, exp);
        setActiveComparison(comp);
        setActiveExperimentId(exp.id);
        setActiveTab('remediation');
        return;
      }
    }

    const child = experiments.find(e => e.parentExperimentId === exp.id);
    if (child) {
      const comp = ExperimentRunner.compareExperiments(exp, child);
      setActiveComparison(comp);
      setActiveExperimentId(child.id);
      setActiveTab('remediation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Experiment Run History
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredExperiments.length} of {experiments.length} runs)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit log of all simulated runs, security breaches, and contained attacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => clearData()}
            className="flex items-center gap-1.5 rounded border border-rose-900/60 bg-rose-950/20 px-3 py-1.5 text-xs font-mono text-rose-300 hover:bg-rose-900/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            {(['ALL', 'BREACHED', 'CONTAINED', 'FAILED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            {(['ALL', 'SECURITY', 'RELIABILITY'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Full Experiments Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0d1422] text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4 font-medium">Exp ID</th>
                <th className="py-3 px-4 font-medium">Scenario</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Outcome</th>
                <th className="py-3 px-4 font-medium text-right">Blast Radius</th>
                <th className="py-3 px-4 font-medium text-right">Duration</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredExperiments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No experiments match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExperiments.map(exp => {
                  const isRemediated = exp.isRemediatedRun;
                  const hasComparison = !!exp.parentExperimentId || experiments.some(e => e.parentExperimentId === exp.id);

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setActiveExperimentId(exp.id);
                        setActiveTab('traces');
                      }}
                    >
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {exp.id}
                        {isRemediated && (
                          <span className="block text-[10px] text-emerald-400 font-normal">
                            &larr; Remediated Rerun
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-200">
                        <span className="font-mono text-slate-500 mr-1.5">[{exp.scenarioCode}]</span>
                        {exp.scenarioTitle}
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs mt-0.5">
                          {exp.attackPayload}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {exp.scenarioCategory}
                      </td>

                      <td className="py-3 px-4">
                        <StatusIndicator status={exp.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-white tabular-nums">
                          {exp.blastRadius.totalScore}
                        </span>
                        <span className="text-slate-500">/100 </span>
                        <RiskBadge level={exp.blastRadius.riskLevel} showDot={false} />
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                        {exp.durationMs}ms
                      </td>

                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {hasComparison && (
                            <button
                              onClick={() => handleLaunchComparison(exp)}
                              className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-[11px] text-cyan-300 hover:bg-cyan-900/60"
                              title="Compare Before vs After"
                            >
                              Compare
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveExperimentId(exp.id);
                              setActiveTab('reports');
                            }}
                            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white"
                          >
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
