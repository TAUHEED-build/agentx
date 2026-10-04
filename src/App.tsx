import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { OverviewView } from './components/views/OverviewView';
import { ExperimentsView } from './components/views/ExperimentsView';
import { AttackLabView } from './components/views/AttackLabView';
import { ExecutionTracesView } from './components/views/ExecutionTracesView';
import { AttackPathsView } from './components/views/AttackPathsView';
import { BlastRadiusView } from './components/views/BlastRadiusView';
import { RemediationView } from './components/views/RemediationView';
import { ReportsView } from './components/views/ReportsView';
import { AgentConfigModal } from './components/modals/AgentConfigModal';
import { PermissionsModal } from './components/modals/PermissionsModal';
import { TestSuiteModal } from './components/modals/TestSuiteModal';
import { PayloadModal } from './components/modals/PayloadModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'experiments':
        return <ExperimentsView />;
      case 'attack-lab':
        return <AttackLabView />;
      case 'traces':
        return <ExecutionTracesView />;
      case 'attack-paths':
        return <AttackPathsView />;
      case 'blast-radius':
        return <BlastRadiusView />;
      case 'remediation':
        return <RemediationView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Global Modals */}
      <AgentConfigModal />
      <PermissionsModal />
      <TestSuiteModal />
      <PayloadModal />

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AGENTX Security &amp; Reliability Laboratory · Deterministic Simulation Environment</span>
          <span className="text-slate-600">Strict Sandboxed Execution — No Real Credentials Connected</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
