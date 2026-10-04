import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_AGENT } from '../data/defaultAgent';
import { DEFAULT_TOOL_PERMISSIONS } from '../data/defaultPermissions';
import { seedDemoEnvironment } from '../data/demoSeed';
import { ATTACK_SCENARIOS } from '../engine/attacks/scenarios';
import { ExperimentRunner } from '../engine/experiments/ExperimentRunner';
import { RemediationEngine } from '../engine/remediation/RemediationEngine';
import { EngineTestSuite } from '../engine/tests/testSuite';
import {
  AgentConfiguration,
  AttackScenario,
  Experiment,
  ExperimentComparison,
  RemediationRecommendation,
  TestSuiteSummary,
  ToolPermission,
} from '../types';

export type NavigationTab =
  | 'overview'
  | 'experiments'
  | 'attack-lab'
  | 'traces'
  | 'attack-paths'
  | 'blast-radius'
  | 'remediation'
  | 'reports';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  agentConfig: AgentConfiguration;
  setAgentConfig: (config: AgentConfiguration) => void;
  permissions: Record<string, ToolPermission>;
  setPermissions: (perms: Record<string, ToolPermission>) => void;
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  setActiveExperimentId: (id: string | null) => void;
  isRunningExperiment: boolean;
  executeScenario: (scenarioId: string, customPayload?: string) => Promise<Experiment>;
  applyRemediation: (remediation: RemediationRecommendation) => void;
  rerunWithRemediation: (parentExperimentId: string) => Promise<{
    newExperiment: Experiment;
    comparison: ExperimentComparison;
  }>;
  loadDemoData: () => Promise<void>;
  clearData: () => void;
  activeComparison: ExperimentComparison | null;
  setActiveComparison: (comp: ExperimentComparison | null) => void;
  isTestModalOpen: boolean;
  setIsTestModalOpen: (open: boolean) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  isPermsModalOpen: boolean;
  setIsPermsModalOpen: (open: boolean) => void;
  testSuiteResults: TestSuiteSummary | null;
  isRunningTestSuite: boolean;
  runTestSuite: () => Promise<TestSuiteSummary>;
  selectedScenarioForPayloadModal: AttackScenario | null;
  setSelectedScenarioForPayloadModal: (s: AttackScenario | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXPERIMENTS: 'agentx_experiments_v1',
  AGENT_CONFIG: 'agentx_agent_config_v1',
  PERMISSIONS: 'agentx_permissions_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [agentConfig, setAgentConfigState] = useState<AgentConfiguration>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AGENT_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_AGENT;
    } catch {
      return DEFAULT_AGENT;
    }
  });

  const [permissions, setPermissionsState] = useState<Record<string, ToolPermission>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      return saved ? JSON.parse(saved) : DEFAULT_TOOL_PERMISSIONS;
    } catch {
      return DEFAULT_TOOL_PERMISSIONS;
    }
  });

  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(null);
  const [isRunningExperiment, setIsRunningExperiment] = useState(false);
  const [activeComparison, setActiveComparison] = useState<ExperimentComparison | null>(null);

  // Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [selectedScenarioForPayloadModal, setSelectedScenarioForPayloadModal] = useState<AttackScenario | null>(null);

  // Test Suite
  const [testSuiteResults, setTestSuiteResults] = useState<TestSuiteSummary | null>(null);
  const [isRunningTestSuite, setIsRunningTestSuite] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(experiments));
    } catch (e) {
      console.error('Failed to persist experiments to localStorage', e);
    }
  }, [experiments]);

  const setAgentConfig = (config: AgentConfiguration) => {
    setAgentConfigState(config);
    try {
      localStorage.setItem(STORAGE_KEYS.AGENT_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to persist agent config', e);
    }
  };

  const setPermissions = (perms: Record<string, ToolPermission>) => {
    setPermissionsState(perms);
    try {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(perms));
    } catch (e) {
      console.error('Failed to persist permissions', e);
    }
  };

  // Find active experiment
  const activeExperiment =
    experiments.find(e => e.id === activeExperimentId) || (experiments.length > 0 ? experiments[0] : null);

  // Set initial active experiment when list changes
  useEffect(() => {
    if (!activeExperimentId && experiments.length > 0) {
      setActiveExperimentId(experiments[0].id);
    }
  }, [experiments, activeExperimentId]);

  const executeScenario = async (scenarioId: string, customPayload?: string): Promise<Experiment> => {
    setIsRunningExperiment(true);
    try {
      const scenario = ATTACK_SCENARIOS.find(s => s.id === scenarioId || s.code === scenarioId);
      if (!scenario) {
        throw new Error(`Scenario not found with ID: ${scenarioId}`);
      }

      const experiment = await ExperimentRunner.runExperiment({
        scenario,
        payload: customPayload,
        agentConfig,
        permissions,
      });

      setExperiments(prev => [experiment, ...prev]);
      setActiveExperimentId(experiment.id);
      return experiment;
    } finally {
      setIsRunningExperiment(false);
    }
  };

  const applyRemediation = (remediation: RemediationRecommendation) => {
    const patched = RemediationEngine.applyRemediation(agentConfig, permissions, remediation);
    setAgentConfig(patched.updatedAgentConfig);
    setPermissions(patched.updatedPermissions);

    // Update remediation applied flag in state
    setExperiments(prev =>
      prev.map(exp => ({
        ...exp,
        remediations: exp.remediations.map(r =>
          r.id === remediation.id ? { ...r, applied: true } : r
        ),
      }))
    );
  };

  const rerunWithRemediation = async (
    parentExperimentId: string
  ): Promise<{ newExperiment: Experiment; comparison: ExperimentComparison }> => {
    setIsRunningExperiment(true);
    try {
      const parentExp = experiments.find(e => e.id === parentExperimentId);
      if (!parentExp) {
        throw new Error(`Parent experiment not found: ${parentExperimentId}`);
      }

      const scenario = ATTACK_SCENARIOS.find(s => s.id === parentExp.scenarioId);
      if (!scenario) {
        throw new Error(`Scenario not found: ${parentExp.scenarioId}`);
      }

      // Rerun using the CURRENT (patched) agent configuration and permissions
      const newExperiment = await ExperimentRunner.runExperiment({
        scenario,
        payload: parentExp.attackPayload,
        agentConfig,
        permissions,
        isRemediatedRun: true,
        parentExperimentId: parentExp.id,
      });

      const comparison = ExperimentRunner.compareExperiments(parentExp, newExperiment);

      setExperiments(prev => [newExperiment, ...prev]);
      setActiveExperimentId(newExperiment.id);
      setActiveComparison(comparison);

      return { newExperiment, comparison };
    } finally {
      setIsRunningExperiment(false);
    }
  };

  const loadDemoData = async () => {
    setIsRunningExperiment(true);
    try {
      const { experiments: demoExperiments } = await seedDemoEnvironment();
      setExperiments(demoExperiments);
      if (demoExperiments.length > 0) {
        setActiveExperimentId(demoExperiments[0].id);
      }
    } finally {
      setIsRunningExperiment(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENTS);
    localStorage.removeItem(STORAGE_KEYS.AGENT_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    setExperiments([]);
    setActiveExperimentId(null);
    setAgentConfigState(DEFAULT_AGENT);
    setPermissionsState(DEFAULT_TOOL_PERMISSIONS);
    setActiveComparison(null);
    setTestSuiteResults(null);
  };

  const runTestSuite = async (): Promise<TestSuiteSummary> => {
    setIsRunningTestSuite(true);
    try {
      const summary = await EngineTestSuite.runAllTests();
      setTestSuiteResults(summary);
      return summary;
    } finally {
      setIsRunningTestSuite(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        agentConfig,
        setAgentConfig,
        permissions,
        setPermissions,
        experiments,
        activeExperiment,
        setActiveExperimentId,
        isRunningExperiment,
        executeScenario,
        applyRemediation,
        rerunWithRemediation,
        loadDemoData,
        clearData,
        activeComparison,
        setActiveComparison,
        isTestModalOpen,
        setIsTestModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        isPermsModalOpen,
        setIsPermsModalOpen,
        testSuiteResults,
        isRunningTestSuite,
        runTestSuite,
        selectedScenarioForPayloadModal,
        setSelectedScenarioForPayloadModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
