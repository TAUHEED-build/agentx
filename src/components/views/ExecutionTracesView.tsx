import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TraceEvent, TraceEventType } from '../../types';
import { StatusIndicator, RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Terminal,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Database,
  Mail,
  Search,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export const ExecutionTracesView: React.FC = () => {
  const { experiments, activeExperiment, setActiveExperimentId, setActiveTab } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeExperiment) {
    return (
      <EmptyState
        title="No Active Experiment Trace"
        description="Select an experiment or launch a scenario from the Attack Lab to record and stream chronological trace events."
        actionText="Open Attack Lab"
        onAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    activeExperiment.trace.forEach(e => {
      all[e.id] = true;
    });
    setExpandedEvents(all);
  };

  const collapseAll = () => {
    setExpandedEvents({});
  };

  const filteredTrace = activeExperiment.trace.filter(e => {
    if (filterType !== 'ALL' && e.eventType !== filterType) {
      if (filterType === 'VIOLATIONS' && !e.metadata?.violation && e.eventType !== 'permission_denied') {
        return false;
      }
      if (filterType === 'TOOLS' && e.eventType !== 'tool_call' && e.eventType !== 'tool_response') {
        return false;
      }
      if (filterType !== 'VIOLATIONS' && filterType !== 'TOOLS') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const str = `${e.actor} ${e.eventType} ${e.tool || ''} ${JSON.stringify(e.input || '')} ${JSON.stringify(e.output || '')} ${e.metadata?.explanation || ''}`.toLowerCase();
      if (!str.includes(q)) return false;
    }

    return true;
  });

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'adversary':
        return <span className="text-rose-400 font-mono font-bold">ADVERSARY</span>;
      case 'agent':
        return <span className="text-cyan-400 font-mono font-bold">AGENT</span>;
      case 'sandbox':
        return <span className="text-amber-400 font-mono font-bold">SANDBOX</span>;
      case 'tool':
        return <span className="text-purple-400 font-mono font-bold">TOOL</span>;
      default:
        return <span className="text-slate-400 font-mono">{actor.toUpperCase()}</span>;
    }
  };

  const getEventIcon = (eventType: TraceEventType) => {
    switch (eventType) {
      case 'attack_injected':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />;
      case 'permission_denied':
        return <KeyRound className="h-3.5 w-3.5 text-amber-400" />;
      case 'sensitive_data_access':
        return <Database className="h-3.5 w-3.5 text-rose-400" />;
      case 'external_side_effect':
        return <Mail className="h-3.5 w-3.5 text-orange-400" />;
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
      case 'recovery':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'tool_call':
      case 'tool_response':
        return <Terminal className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <Terminal className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Experiment Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Execution Trace Recorder
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({activeExperiment.trace.length} recorded events)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic step-by-step telemetry captured by the sandbox isolation layer.
          </p>
        </div>

        {/* Experiment Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Target Exp:</label>
          <select
            value={activeExperiment.id}
            onChange={e => setActiveExperimentId(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.id} — [{exp.scenarioCode}] {exp.scenarioTitle} ({exp.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Experiment Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border border-slate-800 bg-[#0d1422] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <div>
            <span className="text-slate-500">Scenario: </span>
            <span className="text-white font-semibold">[{activeExperiment.scenarioCode}] {activeExperiment.scenarioTitle}</span>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-500">Status: </span>
            <StatusIndicator status={activeExperiment.status} />
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-500">Blast Radius: </span>
            <span className="text-white font-bold">{activeExperiment.blastRadius.totalScore}/100</span>
            <span className="ml-1 text-slate-500">({activeExperiment.blastRadius.riskLevel})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attack-paths')}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-sans"
          >
            Reconstruct Attack Path &rarr;
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'TOOLS', label: 'Tool Calls' },
            { id: 'VIOLATIONS', label: 'Violations & Gates' },
            { id: 'sensitive_data_access', label: 'Data Access' },
            { id: 'external_side_effect', label: 'External Sink' },
            { id: 'recovery', label: 'Recovery' },
            { id: 'error', label: 'Errors' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === f.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search trace payload..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={expandAll}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            title="Expand All"
          >
            Expand
          </button>
          <button
            onClick={collapseAll}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            title="Collapse All"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Terminal-Style Trace Stream */}
      <div className="rounded-lg border border-slate-800 bg-[#070b13] font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0c121e] text-slate-400 text-[11px]">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />
            TRACE EVENT STREAM — {filteredTrace.length} events displayed
          </span>
          <span className="text-slate-500">ISO-8601 UTC offsets</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
          {filteredTrace.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">
              No trace events match the specified filter criteria.
            </div>
          ) : (
            filteredTrace.map((event, idx) => {
              const isExpanded = !!expandedEvents[event.id];
              const isViolation = !!event.metadata?.violation || event.eventType === 'permission_denied';
              const isSensitive = event.eventType === 'sensitive_data_access';
              const isSideEffect = event.eventType === 'external_side_effect';

              let rowBg = 'hover:bg-slate-900/60';
              if (isViolation) rowBg = 'bg-rose-950/20 hover:bg-rose-950/30';
              else if (isSensitive) rowBg = 'bg-purple-950/20 hover:bg-purple-950/30';
              else if (isSideEffect) rowBg = 'bg-amber-950/20 hover:bg-amber-950/30';

              return (
                <div key={event.id} className={`p-3 transition-colors ${rowBg}`}>
                  <div
                    onClick={() => toggleExpand(event.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="text-slate-600 font-mono text-[11px] pt-0.5">
                        #{event.sequence.toString().padStart(3, '0')}
                      </span>

                      <div className="pt-0.5">
                        {getEventIcon(event.eventType)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getActorBadge(event.actor)}
                          <span className="text-slate-500">::</span>
                          <span className="font-semibold text-slate-200">
                            {event.eventType}
                          </span>

                          {event.tool && (
                            <span className="text-cyan-400 font-semibold">
                              [{event.tool}]
                            </span>
                          )}

                          {event.metadata?.violation && (
                            <span className="text-rose-400 font-bold">
                              [VIOLATION: {event.metadata.violation}]
                            </span>
                          )}

                          {event.metadata?.resource && (
                            <span className="text-purple-400">
                              (Resource: {event.metadata.resource})
                            </span>
                          )}

                          {event.metadata?.destination && (
                            <span className="text-orange-400">
                              &rarr; {event.metadata.destination}
                            </span>
                          )}
                        </div>

                        {event.metadata?.explanation && (
                          <p className="mt-1 text-slate-400 text-[11px] leading-relaxed font-sans">
                            {event.metadata.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px] shrink-0">
                      <span className="tabular-nums">+{idx * 120}ms</span>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                      {event.input != null && (
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider block mb-1">
                            Input Payload:
                          </span>
                          <pre className="p-2 rounded bg-slate-950 border border-slate-800/80 text-cyan-300 overflow-x-auto">
                            {typeof event.input === 'string'
                              ? event.input
                              : JSON.stringify(event.input, null, 2)}
                          </pre>
                        </div>
                      )}

                      {event.output != null && (
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider block mb-1">
                            Output / Response:
                          </span>
                          <pre className="p-2 rounded bg-slate-950 border border-slate-800/80 text-emerald-300 overflow-x-auto">
                            {typeof event.output === 'string'
                              ? event.output
                              : JSON.stringify(event.output, null, 2)}
                          </pre>
                        </div>
                      )}

                      {event.metadata && (
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider block mb-1">
                            Security Metadata:
                          </span>
                          <pre className="p-2 rounded bg-slate-950 border border-slate-800/80 text-amber-300 overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
