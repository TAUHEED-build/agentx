import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttackPathNode, TraceEvent } from '../../types';
import { EmptyState } from '../common/EmptyState';
import {
  ShieldAlert,
  Bot,
  Terminal,
  Database,
  Mail,
  User,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AttackPathsView: React.FC = () => {
  const { activeExperiment, experiments, setActiveExperimentId, setActiveTab } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!activeExperiment) {
    return (
      <EmptyState
        title="No Experiment Selected"
        description="Select an experiment to reconstruct its execution and attack path graph."
        actionText="Open Attack Lab"
        onAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const { nodes, edges, summary } = activeExperiment.attackPath;

  // Selected node details
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;

  // Find trace events attached to selected node
  const attachedTraceEvents: TraceEvent[] = selectedNode
    ? activeExperiment.trace.filter(e => selectedNode.traceEventIds.includes(e.id))
    : [];

  const getNodeIcon = (category: string) => {
    switch (category) {
      case 'attack':
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case 'user_input':
        return <User className="h-4 w-4 text-slate-300" />;
      case 'agent':
        return <Bot className="h-4 w-4 text-cyan-400" />;
      case 'tool':
        return <Terminal className="h-4 w-4 text-amber-400" />;
      case 'resource':
        return <Database className="h-4 w-4 text-purple-400" />;
      case 'external_sink':
        return <Mail className="h-4 w-4 text-orange-400" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBorder = (status: string, isSelected: boolean) => {
    let base = 'border-slate-800 bg-[#0d1422]';
    if (status === 'compromised' || status === 'adversarial') {
      base = 'border-rose-500/80 bg-rose-950/20';
    } else if (status === 'blocked' || status === 'intercepted') {
      base = 'border-emerald-500/80 bg-emerald-950/20';
    }
    if (isSelected) {
      base += ' ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090d16]';
    }
    return base;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Attack-Path Dynamic Reconstruction
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({nodes.length} nodes · {edges.length} edges)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directed causal graph generated directly from trace events to expose attack propagation.
          </p>
        </div>

        {/* Experiment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Exp:</label>
          <select
            value={activeExperiment.id}
            onChange={e => {
              setActiveExperimentId(e.target.value);
              setSelectedNodeId(null);
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

      {/* Path Summary Ribbon */}
      <div className="p-3 rounded-lg border border-slate-800 bg-[#0b101b] text-xs font-mono">
        <span className="text-slate-500 uppercase tracking-wider block mb-1">
          Observed Execution / Propagation Chain:
        </span>
        <div className="text-cyan-300 flex flex-wrap items-center gap-2 font-semibold">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <span
                onClick={() => setSelectedNodeId(node.id)}
                className={`cursor-pointer hover:underline ${
                  node.status === 'adversarial' || node.status === 'compromised'
                    ? 'text-rose-400'
                    : node.status === 'blocked' || node.status === 'intercepted'
                    ? 'text-emerald-400'
                    : 'text-slate-200'
                }`}
              >
                {node.label}
              </span>
              {index < nodes.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Interactive Visual Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Node Flow Diagram */}
        <div className="lg:col-span-2 border border-slate-800 rounded-lg bg-[#070b13] p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-4 border-b border-slate-800/80 pb-2">
            <span>GRAPH VISUALIZER (CLICK ANY NODE TO INSPECT)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Vulnerable / Compromised
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Contained / Gated
              </span>
            </div>
          </div>

          {/* Sequential Graph Nodes */}
          <div className="space-y-4 py-2">
            {nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              const outgoingEdge = edges.find(e => e.source === node.id);

              return (
                <div key={node.id} className="relative">
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`cursor-pointer p-3.5 rounded-lg border transition-all ${getStatusBorder(
                      node.status,
                      isSelected
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          {getNodeIcon(node.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              {node.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              [{node.category}]
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {node.details}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                        {node.status === 'compromised' || node.status === 'adversarial' ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Compromised
                          </span>
                        ) : node.status === 'blocked' || node.status === 'intercepted' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Gated / Blocked
                          </span>
                        ) : (
                          <span className="text-slate-400">Normal</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edge Down Indicator */}
                  {outgoingEdge && idx < nodes.length - 1 && (
                    <div className="flex items-center justify-center my-1.5">
                      <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <ArrowRight className="h-3 w-3 text-cyan-400 rotate-90" />
                        <span className={outgoingEdge.isVulnerablePath ? 'text-rose-400' : 'text-slate-400'}>
                          {outgoingEdge.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Deterministic graph synthesis complete.</span>
            <span>Scenario: {activeExperiment.scenarioId}</span>
          </div>
        </div>

        {/* Right: Selected Node Trace Inspector */}
        <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Node Inspector
                </h3>
                <h4 className="text-sm font-semibold text-white mt-1">
                  {selectedNode?.label || 'Select a node'}
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-500 uppercase">
                {selectedNode?.category}
              </span>
            </div>

            {selectedNode && (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">
                    Details:
                  </span>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
                    {selectedNode.details}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">
                    Underlying Trace Events ({attachedTraceEvents.length}):
                  </span>
                  <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
                    {attachedTraceEvents.map(evt => (
                      <div
                        key={evt.id}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-cyan-300 font-semibold">#{evt.sequence} {evt.eventType}</span>
                          <span className="text-slate-500">{evt.actor}</span>
                        </div>
                        {evt.tool && (
                          <div className="text-amber-400">tool: {evt.tool}</div>
                        )}
                        {evt.metadata?.explanation && (
                          <div className="text-slate-400 font-sans text-[11px]">
                            {evt.metadata.explanation}
                          </div>
                        )}
                        {evt.input != null && (
                          <div className="text-slate-500 truncate">
                            input: {JSON.stringify(evt.input)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Status: {selectedNode?.status}</span>
            <button
              onClick={() => setActiveTab('traces')}
              className="text-cyan-400 hover:underline font-sans"
            >
              View in Execution Trace &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
