/**
 * Core type definitions for AGENTX Security & Reliability Lab
 */

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ToolActionType = 'READ' | 'WRITE' | 'EXECUTE';
export type SideEffectType = 'NONE' | 'INTERNAL_STATE' | 'EXTERNAL_SINK';
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type ExperimentStatus = 'SUCCESS' | 'CONTAINED' | 'BREACHED' | 'FAILED' | 'RUNNING';
export type RecoveryBehavior = 'RECOVERED' | 'CONTAINED' | 'FAILED' | 'DEGRADED' | 'NOT_APPLICABLE';

export interface ToolPermission {
  toolId: string;
  toolName: string;
  description: string;
  sensitivity: SensitivityLevel;
  actionType: ToolActionType;
  sideEffect: SideEffectType;
  isAllowed: boolean;
  requiresApproval: boolean;
  rateLimitPerSession: number;
}

export interface AgentConfiguration {
  id: string;
  name: string;
  objective: string;
  availableTools: string[];
  maxSteps: number;
  retryLimit: number;
  requireHumanApproval: boolean;
  sensitiveResources: string[];
  allowedExternalDestinations: string[];
  isolateUntrustedContent?: boolean;
  strictSchemaValidation?: boolean;
}

export type TraceEventType =
  | 'user_input'
  | 'system_instruction'
  | 'agent_decision'
  | 'tool_call'
  | 'tool_response'
  | 'permission_check'
  | 'permission_denied'
  | 'attack_injected'
  | 'sensitive_data_access'
  | 'external_side_effect'
  | 'error'
  | 'retry'
  | 'recovery'
  | 'experiment_complete';

export interface TraceEvent {
  id: string;
  timestamp: number;
  sequence: number;
  actor: 'user' | 'agent' | 'sandbox' | 'tool' | 'adversary';
  eventType: TraceEventType;
  tool?: string;
  input?: unknown;
  output?: unknown;
  metadata?: {
    resource?: string;
    violation?: string;
    ruleId?: string;
    step?: number;
    destination?: string;
    severity?: RiskLevel;
    retryCount?: number;
    explanation?: string;
  };
}

export interface AttackPathNode {
  id: string;
  label: string;
  category: 'user_input' | 'agent' | 'tool' | 'resource' | 'attack' | 'external_sink';
  status: 'benign' | 'adversarial' | 'compromised' | 'blocked' | 'intercepted';
  details: string;
  timestamp: number;
  traceEventIds: string[];
}

export interface AttackPathEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'invokes' | 'propagates' | 'accesses' | 'exfiltrates' | 'blocked_by';
  isVulnerablePath: boolean;
}

export interface AttackPath {
  nodes: AttackPathNode[];
  edges: AttackPathEdge[];
  summary: string;
}

export interface BlastRadiusBreakdown {
  privilegeImpact: { score: number; max: number; rationale: string };
  sensitiveDataExposure: { score: number; max: number; rationale: string };
  externalSideEffects: { score: number; max: number; rationale: string };
  chainDepth: { score: number; max: number; rationale: string };
  recoveryFailure: { score: number; max: number; rationale: string };
}

export interface BlastRadiusScore {
  totalScore: number; // 0 - 100
  riskLevel: RiskLevel;
  breakdown: BlastRadiusBreakdown;
  factors: string[];
}

export interface Finding {
  id: string;
  title: string;
  severity: RiskLevel;
  category: 'PROMPT_INJECTION' | 'AUTHORIZATION' | 'DATA_EXFILTRATION' | 'TOOL_MISUSE' | 'RELIABILITY';
  description: string;
  evidence: string;
  cweOrOwaspRef?: string;
}

export interface RemediationRecommendation {
  id: string;
  findingId: string;
  title: string;
  affectedCapability: string;
  proposedControl: string;
  expectedImpact: string;
  applied: boolean;
  suggestedPatch: {
    agentConfigUpdates?: Partial<AgentConfiguration>;
    toolPermissionUpdates?: { toolId: string; updates: Partial<ToolPermission> }[];
  };
}

export type ScenarioCategory = 'SECURITY' | 'RELIABILITY';

export interface AttackScenario {
  id: string;
  code: string; // e.g. "01", "02"
  title: string;
  category: ScenarioCategory;
  description: string;
  threatModel: string;
  defaultPayload: string;
  expectedVector: string;
  standardRiskLevel: RiskLevel;
  recommendedRemediationSummary: string;
}

export interface Experiment {
  id: string;
  scenarioId: string;
  scenarioCode: string;
  scenarioTitle: string;
  scenarioCategory: ScenarioCategory;
  agentConfigSnapshot: AgentConfiguration;
  toolPermissionsSnapshot: Record<string, ToolPermission>;
  attackPayload: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  status: ExperimentStatus;
  trace: TraceEvent[];
  attackPath: AttackPath;
  detectedViolations: string[];
  sensitiveResourcesTouched: string[];
  externalSideEffects: string[];
  recoveryBehavior: RecoveryBehavior;
  blastRadius: BlastRadiusScore;
  findings: Finding[];
  remediations: RemediationRecommendation[];
  isRemediatedRun?: boolean;
  parentExperimentId?: string;
}

export interface ExperimentComparison {
  beforeRun: Experiment;
  afterRun: Experiment;
  riskReductionPercentage: number;
  blastRadiusDelta: number;
  sensitiveResourcesDelta: number;
  unauthorizedActionsDelta: number;
  externalSideEffectsDelta: number;
  attackSuccessChanged: boolean;
  summary: string;
}

export interface TestCaseResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: number;
  results: TestCaseResult[];
}
