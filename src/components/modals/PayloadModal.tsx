import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Play } from 'lucide-react';

export const PayloadModal: React.FC = () => {
  const {
    selectedScenarioForPayloadModal,
    setSelectedScenarioForPayloadModal,
    executeScenario,
    setActiveExperimentId,
    setActiveTab,
    isRunningExperiment,
  } = useApp();

  const [payloadText, setPayloadText] = useState('');

  React.useEffect(() => {
    if (selectedScenarioForPayloadModal) {
      setPayloadText(selectedScenarioForPayloadModal.defaultPayload);
    }
  }, [selectedScenarioForPayloadModal]);

  if (!selectedScenarioForPayloadModal) return null;

  const handleRun = async () => {
    const scenario = selectedScenarioForPayloadModal;
    setSelectedScenarioForPayloadModal(null);
    const exp = await executeScenario(scenario.id, payloadText);
    setActiveExperimentId(exp.id);
    setActiveTab('traces');
  };

  return (
    <Modal
      isOpen={!!selectedScenarioForPayloadModal}
      onClose={() => setSelectedScenarioForPayloadModal(null)}
      title={`Configure Attack Payload: [${selectedScenarioForPayloadModal.code}] ${selectedScenarioForPayloadModal.title}`}
      subtitle="Edit the adversary instruction or fault condition before dispatching to the sandbox."
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs font-sans">
        <div>
          <label className="text-slate-400 font-mono block mb-1">
            Threat Model &amp; Propagation Objective:
          </label>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
            {selectedScenarioForPayloadModal.threatModel}
          </div>
        </div>

        <div>
          <label className="text-slate-400 font-mono block mb-1">
            Injected Attack Payload:
          </label>
          <textarea
            rows={5}
            value={payloadText}
            onChange={e => setPayloadText(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setPayloadText(selectedScenarioForPayloadModal.defaultPayload)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Reset to Default Payload
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedScenarioForPayloadModal(null)}
              className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRun}
              disabled={isRunningExperiment}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-500 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Execute in Sandbox</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
