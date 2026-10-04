import {
  AgentConfiguration,
  AttackScenario,
  Experiment,
  ExperimentComparison,
  ToolPermission,
} from '../../types';
import { AgentRuntime } from '../agent/AgentRuntime';
import { SandboxEnvironment } from '../sandbox/SandboxEnvironment';
import { BlastRadiusEngine } from '../scoring/BlastRadiusEngine';
import { PathReconstructor } from '../trace/PathReconstructor';
import { TraceRecorder } from '../trace/TraceRecorder';
import { RemediationEngine } from '../remediation/RemediationEngine';

export class ExperimentRunner {
  /**
   * Executes a complete, end-to-end deterministic security/reliability experiment.
   */
  static async runExperiment(params: {
    scenario: AttackScenario;
    payload?: string;
    agentConfig: AgentConfiguration;
    permissions: Record<string, ToolPermission>;
    isRemediatedRun?: boolean;
    parentExperimentId?: string;
  }): Promise<Experiment> {
    const startTime = Date.now();
    const payload = params.payload || params.scenario.defaultPayload;

    // Snapshot configuration and permissions for immutability
    const agentConfigSnapshot: AgentConfiguration = JSON.parse(JSON.stringify(params.agentConfig));
    const toolPermissionsSnapshot: Record<string, ToolPermission> = JSON.parse(
      JSON.stringify(params.permissions)
    );

    // 1. Initialize Trace Recorder & Sandbox
    const traceRecorder = new TraceRecorder(startTime);
    const sandbox = new SandboxEnvironment(agentConfigSnapshot, toolPermissionsSnapshot, traceRecorder);

    // 2. Initialize Agent Runtime
    const agent = new AgentRuntime(agentConfigSnapshot, sandbox, traceRecorder);

    // 3. Initialize & Execute Run
    await agent.initialize(params.scenario, payload);
    await agent.execute();

    const endTime = Date.now();
    const durationMs = Math.max(120, endTime - startTime);

    // 4. Extract Real Trace & Telemetry
    const trace = traceRecorder.getEvents();
    const detectedViolations = traceRecorder.getViolations();
    const sensitiveResourcesTouched = traceRecorder.getSensitiveResourcesTouched();
    const externalSideEffects = traceRecorder.getExternalSideEffects();
    const status = agent.getStatus();
    const recoveryBehavior = agent.getRecovery();

    // 5. Reconstruct Attack Path from actual trace events
    const attackPath = PathReconstructor.reconstruct(trace);

    // 6. Calculate Blast Radius Score from actual trace events
    const blastRadius = BlastRadiusEngine.calculate(trace);

    // 7. Diagnose Findings from actual trace events
    const findings = RemediationEngine.diagnoseFindings({
      trace,
      detectedViolations,
      sensitiveResourcesTouched,
      externalSideEffects,
      scenarioCategory: params.scenario.category,
      scenarioId: params.scenario.id,
    });

    // 8. Generate Remediation Recommendations
    const remediations = RemediationEngine.generateRemediations(findings);

    // Construct final Experiment snapshot
    const expId = `exp_${params.scenario.code}_${Math.random().toString(36).substring(2, 8)}`;

    const experiment: Experiment = {
      id: expId,
      scenarioId: params.scenario.id,
      scenarioCode: params.scenario.code,
      scenarioTitle: params.scenario.title,
      scenarioCategory: params.scenario.category,
      agentConfigSnapshot,
      toolPermissionsSnapshot,
      attackPayload: payload,
      startTime,
      endTime,
      durationMs,
      status,
      trace,
      attackPath,
      detectedViolations,
      sensitiveResourcesTouched,
      externalSideEffects,
      recoveryBehavior,
      blastRadius,
      findings,
      remediations,
      isRemediatedRun: params.isRemediatedRun,
      parentExperimentId: params.parentExperimentId,
    };

    return experiment;
  }

  /**
   * Compares a baseline "Before" run with a remediated "After" run
   */
  static compareExperiments(beforeRun: Experiment, afterRun: Experiment): ExperimentComparison {
    const beforeScore = beforeRun.blastRadius.totalScore;
    const afterScore = afterRun.blastRadius.totalScore;

    // Real mathematical risk reduction
    const riskReductionPercentage = beforeScore > 0
      ? Math.max(0, Math.round(((beforeScore - afterScore) / beforeScore) * 100))
      : 0;

    const blastRadiusDelta = afterScore - beforeScore;
    const sensitiveResourcesDelta =
      afterRun.sensitiveResourcesTouched.length - beforeRun.sensitiveResourcesTouched.length;
    const unauthorizedActionsDelta =
      afterRun.detectedViolations.length - beforeRun.detectedViolations.length;
    const externalSideEffectsDelta =
      afterRun.externalSideEffects.length - beforeRun.externalSideEffects.length;

    const attackSuccessChanged =
      beforeRun.status === 'BREACHED' && (afterRun.status === 'CONTAINED' || afterRun.status === 'SUCCESS');

    let summary = '';
    if (riskReductionPercentage > 0) {
      summary = `Remediation reduced total blast radius by ${Math.abs(blastRadiusDelta)} points (${riskReductionPercentage}% reduction). Attack containment improved from ${beforeRun.status} to ${afterRun.status}.`;
    } else {
      summary = `Controls maintained existing risk posture with zero change in blast radius.`;
    }

    return {
      beforeRun,
      afterRun,
      riskReductionPercentage,
      blastRadiusDelta,
      sensitiveResourcesDelta,
      unauthorizedActionsDelta,
      externalSideEffectsDelta,
      attackSuccessChanged,
      summary,
    };
  }
}
