import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { ShieldAlert, Play, Sliders, KeyRound, CheckSquare, Sparkles } from 'lucide-react';

const NAV_ITEMS: { id: NavigationTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'attack-lab', label: 'Attack Lab' },
  { id: 'traces', label: 'Execution Traces' },
  { id: 'attack-paths', label: 'Attack Paths' },
  { id: 'blast-radius', label: 'Blast Radius' },
  { id: 'remediation', label: 'Remediation' },
  { id: 'reports', label: 'Reports' },
];

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsConfigModalOpen,
    setIsPermsModalOpen,
    setIsTestModalOpen,
    loadDemoData,
    isRunningExperiment,
    experiments,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-tight text-white">
              AGENT<span className="text-cyan-400">X</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              / lab-v1.4
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400 font-mono">
            <span>ENV: SANDBOX</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ENGINE READY
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {experiments.length === 0 && (
            <button
              onClick={() => loadDemoData()}
              disabled={isRunningExperiment}
              className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition-colors disabled:opacity-50"
              title="Run real deterministic scenarios to generate benchmark data"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load Demo Lab</span>
            </button>
          )}

          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            title="Run Invariant Test Suite"
          >
            <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Test Suite</span>
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            title="Configure Agent Objective & Controls"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Agent Config</span>
          </button>

          <button
            onClick={() => setIsPermsModalOpen(true)}
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            title="View & Edit Tool Permissions"
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden lg:inline">Permissions</span>
          </button>
        </div>
      </div>

      {/* Mobile nav subrow */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-[#090d16]">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap rounded ${
              activeTab === item.id
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
