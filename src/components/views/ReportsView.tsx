import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusIndicator, RiskBadge } from '../common/RiskBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Download,
  Copy,
  Check,
  FileText,
  ShieldAlert,
  Database,
  Mail,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { activeExperiment, experiments, setActiveExperimentId, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeExperiment) {
    return (
      <EmptyState
        title="No Experiment Selected"
        description="Select an experiment to compile its comprehensive security audit report."
        actionText="Open Attack Lab"
        onAction={() => setActiveTab('attack-lab')}
      />
    );
  }

  const exportReportJson = () => {
    const reportData = {
      reportTitle: `AGENTX Security Audit: [${activeExperiment.scenarioCode}] ${activeExperiment.scenarioTitle}`,
      generatedAt: new Date().toISOString(),
      experimentId: activeExperiment.id,
      scenario: {
        code: activeExperiment.scenarioCode,
        title: activeExperiment.scenarioTitle,
        category: activeExperiment.scenarioCategory,
        attackPayload: activeExperiment.attackPayload,
      },
      outcome: {
        status: activeExperiment.status,
        recoveryBehavior: activeExperiment.recoveryBehavior,
        durationMs: activeExperiment.durationMs,
      },
      blastRadius: activeExperiment.blastRadius,
      findings: activeExperiment.findings,
      remediations: activeExperiment.remediations,
      violations: activeExperiment.detectedViolations,
      sensitiveResourcesTouched: activeExperiment.sensitiveResourcesTouched,
      externalSideEffects: activeExperiment.externalSideEffects,
      executionTrace: activeExperiment.trace,
      attackPath: activeExperiment.attackPath,
      agentConfigurationSnapshot: activeExperiment.agentConfigSnapshot,
      toolPermissionsSnapshot: activeExperiment.toolPermissionsSnapshot,
    };

    return JSON.stringify(reportData, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportReportJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const jsonStr = exportReportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentx-audit-${activeExperiment.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-sans">
              Security Assessment Report
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              (ID: {activeExperiment.id})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full forensic evaluation, blast radius breakdown, and remediation compliance report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switcher */}
          <select
            value={activeExperiment.id}
            onChange={e => setActiveExperimentId(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
          >
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.id} — [{exp.scenarioCode}] {exp.scenarioTitle}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          01. Executive Summary
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono py-2 border-y border-slate-800/80">
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

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The Customer Operations Agent was subjected to {activeExperiment.scenarioTitle} under controlled sandbox conditions.
          {activeExperiment.status === 'BREACHED'
            ? ' The experiment resulted in a SECURITY BREACH. The agent followed unauthorized directives or allowed sensitive data to flow across external sinks, yielding an elevated blast-radius score of ' + activeExperiment.blastRadius.totalScore + '/100.'
            : activeExperiment.status === 'CONTAINED'
            ? ' The security and permission controls successfully CONTAINED the attack vector. The blast-radius was constrained to ' + activeExperiment.blastRadius.totalScore + '/100, preventing unauthorized data exfiltration or state mutation.'
            : ' The system encountered an unhandled fault condition during execution.'}
        </p>
      </div>

      {/* 2. Attack / Failure Details */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          02. Attack Vector &amp; Payload Specification
        </h2>
        <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-rose-300">
          <span className="text-slate-500 uppercase text-[10px] block mb-1">Injected Payload:</span>
          {activeExperiment.attackPayload}
        </div>
      </div>

      {/* 3. Attack Path & Propagation */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          03. Attack Path Reconstruction
        </h2>
        <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
          <span className="text-slate-500 uppercase text-[10px] block mb-1">Observed Execution Propagation:</span>
          {activeExperiment.attackPath.summary}
        </div>
      </div>

      {/* 4. Sensitive Resources & Violations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensitive Resources */}
        <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-400 mb-2">
            <Database className="h-4 w-4" />
            <span>Sensitive Resources Touched ({activeExperiment.sensitiveResourcesTouched.length})</span>
          </div>
          {activeExperiment.sensitiveResourcesTouched.length === 0 ? (
            <p className="text-xs font-mono text-slate-500">Zero sensitive database records or PII accessed.</p>
          ) : (
            <ul className="space-y-1.5 text-xs font-mono">
              {activeExperiment.sensitiveResourcesTouched.map((r, i) => (
                <li key={i} className="p-2 rounded bg-purple-950/20 border border-purple-900/40 text-purple-300 truncate">
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Violations */}
        <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-rose-400 mb-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Policy Violations Flagged ({activeExperiment.detectedViolations.length})</span>
          </div>
          {activeExperiment.detectedViolations.length === 0 ? (
            <p className="text-xs font-mono text-slate-500">Zero security policy or perimeter violations.</p>
          ) : (
            <ul className="space-y-1.5 text-xs font-mono">
              {activeExperiment.detectedViolations.map((v, i) => (
                <li key={i} className="p-2 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300">
                  {v}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. Granular Blast Radius Breakdown */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          04. Blast-Radius Scoring Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">PRIVILEGE IMPACT</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {activeExperiment.blastRadius.breakdown.privilegeImpact.score}/25
            </span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">DATA EXPOSURE</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {activeExperiment.blastRadius.breakdown.sensitiveDataExposure.score}/25
            </span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SIDE EFFECTS</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {activeExperiment.blastRadius.breakdown.externalSideEffects.score}/20
            </span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">CHAIN DEPTH</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {activeExperiment.blastRadius.breakdown.chainDepth.score}/15
            </span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">RECOVERY FAILURE</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {activeExperiment.blastRadius.breakdown.recoveryFailure.score}/15
            </span>
          </div>
        </div>
      </div>

      {/* 6. Remediation Guidance */}
      <div className="border border-slate-800 rounded-lg bg-[#0b101b] p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          05. Prescriptive Remediation &amp; Controls
        </h2>
        {activeExperiment.remediations.length === 0 ? (
          <p className="text-xs font-mono text-slate-400">
            No mandatory remediation needed. Configuration is resilient against this vector.
          </p>
        ) : (
          <div className="space-y-3">
            {activeExperiment.remediations.map(rem => (
              <div key={rem.id} className="p-3 rounded bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-white">{rem.title}</span>
                  <span className="text-slate-500">[{rem.affectedCapability}]</span>
                </div>
                <p className="mt-1 text-slate-400 font-sans">{rem.proposedControl}</p>
                <div className="mt-2 text-emerald-400 font-mono text-[11px]">
                  Impact: {rem.expectedImpact}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
