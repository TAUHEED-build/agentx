import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { DEFAULT_TOOL_PERMISSIONS } from '../../data/defaultPermissions';
import { SensitivityLevel, ToolActionType, ToolPermission } from '../../types';
import { RotateCcw, Save, Shield } from 'lucide-react';

export const PermissionsModal: React.FC = () => {
  const { isPermsModalOpen, setIsPermsModalOpen, permissions, setPermissions } = useApp();
  const [permsState, setPermsState] = useState<Record<string, ToolPermission>>({ ...permissions });

  React.useEffect(() => {
    if (isPermsModalOpen) {
      setPermsState({ ...permissions });
    }
  }, [isPermsModalOpen, permissions]);

  const handleToggleAllowed = (toolId: string) => {
    setPermsState(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isAllowed: !prev[toolId].isAllowed,
      },
    }));
  };

  const handleToggleApproval = (toolId: string) => {
    setPermsState(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        requiresApproval: !prev[toolId].requiresApproval,
      },
    }));
  };

  const handleChangeSensitivity = (toolId: string, sensitivity: SensitivityLevel) => {
    setPermsState(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        sensitivity,
      },
    }));
  };

  const handleSave = () => {
    setPermissions(permsState);
    setIsPermsModalOpen(false);
  };

  const handleReset = () => {
    setPermsState({ ...DEFAULT_TOOL_PERMISSIONS });
  };

  return (
    <Modal
      isOpen={isPermsModalOpen}
      onClose={() => setIsPermsModalOpen(false)}
      title="Sandbox Tool Permission Layer"
      subtitle="Explicit granular permissions evaluated by the sandbox before granting tool execution."
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs font-mono">
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#070b13]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0d1422] text-slate-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Tool</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Side Effect</th>
                <th className="py-2.5 px-3">Sensitivity</th>
                <th className="py-2.5 px-3 text-center">Execution Status</th>
                <th className="py-2.5 px-3 text-center">Human Gating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {Object.values(permsState).map(perm => (
                <tr key={perm.toolId} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-bold text-white">
                    {perm.toolId}
                    <span className="block text-[10px] text-slate-500 font-sans font-normal truncate max-w-xs">
                      {perm.description}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="text-slate-300 font-semibold">{perm.actionType}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={
                        perm.sideEffect === 'EXTERNAL_SINK'
                          ? 'text-orange-400 font-semibold'
                          : perm.sideEffect === 'INTERNAL_STATE'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }
                    >
                      {perm.sideEffect}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <select
                      value={perm.sensitivity}
                      onChange={e =>
                        handleChangeSensitivity(perm.toolId, e.target.value as SensitivityLevel)
                      }
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleAllowed(perm.toolId)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        perm.isAllowed
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {perm.isAllowed ? 'ALLOWED' : 'BLOCKED'}
                    </button>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleApproval(perm.toolId)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        perm.requiresApproval
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {perm.requiresApproval ? 'GATED' : 'AUTOMATIC'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Permissions to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPermsModalOpen(false)}
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
              <span>Apply Policy Layer</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
