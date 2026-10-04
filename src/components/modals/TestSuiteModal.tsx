import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CheckCircle2, XCircle, Play, RefreshCw, ShieldCheck } from 'lucide-react';

export const TestSuiteModal: React.FC = () => {
  const { isTestModalOpen, setIsTestModalOpen, testSuiteResults, isRunningTestSuite, runTestSuite } = useApp();

  return (
    <Modal
      isOpen={isTestModalOpen}
      onClose={() => setIsTestModalOpen(false)}
      title="Automated Security Invariant Test Suite"
      subtitle="Evaluates real deterministic assertions on sandbox permission boundaries, prompt isolation, and blast radius calculation."
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs font-mono">
        {/* Run CTA & Top Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-800 bg-[#0d1422]">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">PASSED</span>
              <span className="text-xl font-bold text-emerald-400 tabular-nums">
                {testSuiteResults ? testSuiteResults.passed : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">FAILED</span>
              <span className="text-xl font-bold text-rose-400 tabular-nums">
                {testSuiteResults ? testSuiteResults.failed : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">TOTAL TESTS</span>
              <span className="text-xl font-bold text-white tabular-nums">
                {testSuiteResults ? testSuiteResults.total : '9 Core Invariants'}
              </span>
            </div>
            {testSuiteResults && (
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">EXECUTION TIME</span>
                <span className="text-sm font-semibold text-slate-300 tabular-nums">
                  {testSuiteResults.durationMs}ms
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => runTestSuite()}
            disabled={isRunningTestSuite}
            className="flex items-center gap-2 rounded bg-cyan-500 px-4 py-2 font-sans text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            <Play className={`h-4 w-4 fill-current ${isRunningTestSuite ? 'animate-spin' : ''}`} />
            <span>{isRunningTestSuite ? 'Executing Invariants...' : 'Run Test Suite Now'}</span>
          </button>
        </div>

        {/* Tests List */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#070b13]">
          {!testSuiteResults ? (
            <div className="p-8 text-center text-slate-500 font-sans">
              Click &quot;Run Test Suite Now&quot; to execute real end-to-end sandbox verification assertions.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {testSuiteResults.results.map((res, i) => (
                <div key={i} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-900/40">
                  <div className="flex items-start gap-2.5">
                    <div className="pt-0.5">
                      {res.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{res.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">[{res.category}]</span>
                      </div>
                      <p className="mt-1 text-slate-400 font-sans text-xs leading-relaxed">
                        {res.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] font-bold ${
                        res.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {res.passed ? 'PASSED' : 'FAILED'}
                    </span>
                    <span className="block text-[10px] text-slate-500 tabular-nums">
                      {res.durationMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
