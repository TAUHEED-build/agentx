import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { DEFAULT_AGENT } from '../../data/defaultAgent';
import { AgentConfiguration } from '../../types';
import { RotateCcw, Save } from 'lucide-react';

export const AgentConfigModal: React.FC = () => {
  const { isConfigModalOpen, setIsConfigModalOpen, agentConfig, setAgentConfig } = useApp();
  const [formData, setFormData] = useState<AgentConfiguration>({ ...agentConfig });

  // Sync with context on open
  React.useEffect(() => {
    if (isConfigModalOpen) {
      setFormData({ ...agentConfig });
    }
  }, [isConfigModalOpen, agentConfig]);

  const handleSave = () => {
    setAgentConfig(formData);
    setIsConfigModalOpen(false);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_AGENT });
  };

  const allAvailableTools = ['web.search', 'crm.read', 'crm.write', 'email.send', 'database.query'];

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      availableTools: prev.availableTools.includes(tool)
        ? prev.availableTools.filter(t => t !== tool)
        : [...prev.availableTools, tool],
    }));
  };

  return (
    <Modal
      isOpen={isConfigModalOpen}
      onClose={() => setIsConfigModalOpen(false)}
      title="Agent Configuration & Security Controls"
      subtitle="Define operational objectives, available capabilities, execution budgets, and trust boundaries."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs font-sans">
        {/* Name & ID */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 font-mono block mb-1">Agent Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-mono block mb-1">Agent Identifier:</label>
            <input
              type="text"
              disabled
              value={formData.id}
              className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-500 font-mono"
            />
          </div>
        </div>

        {/* Objective */}
        <div>
          <label className="text-slate-400 font-mono block mb-1">System Objective / Baseline Policy:</label>
          <textarea
            rows={2}
            value={formData.objective}
            onChange={e => setFormData({ ...formData, objective: e.target.value })}
            className="w-full rounded border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        {/* Available Tools */}
        <div>
          <label className="text-slate-400 font-mono block mb-1.5">Registered Tool Capabilities:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allAvailableTools.map(tool => {
              const isEnabled = formData.availableTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`p-2 rounded border text-left text-xs font-mono transition-colors flex items-center justify-between ${
                    isEnabled
                      ? 'border-cyan-500/60 bg-cyan-950/20 text-cyan-300'
                      : 'border-slate-800 bg-slate-900 text-slate-500'
                  }`}
                >
                  <span>{tool}</span>
                  <span className="text-[10px] font-bold">{isEnabled ? 'ON' : 'OFF'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Execution Budgets: Max Steps & Retry Limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 font-mono block mb-1">Max Steps Limit:</label>
            <input
              type="number"
              min={1}
              max={20}
              value={formData.maxSteps}
              onChange={e => setFormData({ ...formData, maxSteps: parseInt(e.target.value) || 6 })}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 font-mono block mb-1">Max Retry Budget:</label>
            <input
              type="number"
              min={0}
              max={5}
              value={formData.retryLimit}
              onChange={e => setFormData({ ...formData, retryLimit: parseInt(e.target.value) || 1 })}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Security Gates & Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-slate-400 font-mono uppercase tracking-wider text-[11px] block">
            Automated Defensive Gates:
          </span>

          <label className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-white font-medium block">Human Approval Required</span>
              <span className="text-slate-500 text-[11px]">Gate state-modifying and external sink operations</span>
            </div>
            <input
              type="checkbox"
              checked={formData.requireHumanApproval}
              onChange={e => setFormData({ ...formData, requireHumanApproval: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-white font-medium block">Untrusted Content Isolation</span>
              <span className="text-slate-500 text-[11px]">Quarantine web search / RAG content to strip directives</span>
            </div>
            <input
              type="checkbox"
              checked={!!formData.isolateUntrustedContent}
              onChange={e => setFormData({ ...formData, isolateUntrustedContent: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-white font-medium block">Strict Tool Schema Validation</span>
              <span className="text-slate-500 text-[11px]">Reject malformed tool responses before model ingestion</span>
            </div>
            <input
              type="checkbox"
              checked={!!formData.strictSchemaValidation}
              onChange={e => setFormData({ ...formData, strictSchemaValidation: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-500"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Vulnerable Baseline</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-500 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Apply Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
