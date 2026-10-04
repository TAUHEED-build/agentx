import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ATTACK_SCENARIOS } from '../../engine/attacks/scenarios';
import { AttackScenario, ScenarioCategory } from '../../types';
import { RiskBadge, StatusIndicator } from '../common/RiskBadge';
import { Play, Terminal, Edit3, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const AttackLabView: React.FC = () => {
  const {
    experiments,
    executeScenario,
    isRunningExperiment,
    setActiveExperimentId,
    setActiveTab,
    setSelectedScenarioForPayloadModal,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ScenarioCategory>('ALL');
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);

  const filteredScenarios = ATTACK_SCENARIOS.filter(s => {
    if (categoryFilter === 'ALL') return true;
    return s.category === categoryFilter;
  });

  const handleRun = async (scenario: AttackScenario) => {
    setRunningScenarioId(scenario.id);
    try {
      const exp = await executeScenario(scenario.id);
      setActiveExperimentId(exp.id);
      setActiveTab('traces');
    } finally {
      setRunningScenarioId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Attack &amp; Fault Injection Laboratory
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Deliberately expose the agent to adversarial prompt overrides, privilege escalations, and upstream infrastructure faults.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Scenarios ({ATTACK_SCENARIOS.length})
          </button>
          <button
            onClick={() => setCategoryFilter('SECURITY')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              categoryFilter === 'SECURITY'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security (6)
          </button>
          <button
            onClick={() => setCategoryFilter('RELIABILITY')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              categoryFilter === 'RELIABILITY'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reliability (6)
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map(scenario => {
          // Find latest experiment for this scenario
          const lastExp = experiments.find(e => e.scenarioId === scenario.id || e.scenarioCode === scenario.code);
          const isCurrentlyRunning = isRunningExperiment && runningScenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className="border border-slate-800/90 rounded-lg bg-[#0b101b] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header row with unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">[{scenario.code}]</span>
                    <span>{scenario.category}</span>
                  </div>
                  <RiskBadge level={scenario.standardRiskLevel} />
                </div>

                {/* Scenario Title */}
                <h3 className="mt-2 text-sm font-semibold text-white tracking-tight">
                  {scenario.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Threat Model info */}
                <div className="mt-3 p-2 rounded bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-500 font-sans block mb-0.5">Threat Model:</span>
                  {scenario.threatModel}
                </div>

                {/* Last Result */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Last Experiment:</span>
                  {lastExp ? (
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={lastExp.status} />
                      <span className="text-slate-400 tabular-nums">
                        ({lastExp.blastRadius.totalScore}/100)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-600">Not executed yet</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleRun(scenario)}
                  disabled={isRunningExperiment}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded bg-cyan-500/90 py-1.5 px-3 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 fill-current ${isCurrentlyRunning ? 'animate-spin' : ''}`} />
                  <span>{isCurrentlyRunning ? 'Executing...' : 'Run Experiment'}</span>
                </button>

                <button
                  onClick={() => setSelectedScenarioForPayloadModal(scenario)}
                  disabled={isRunningExperiment}
                  className="rounded border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Configure custom attack payload before running"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
