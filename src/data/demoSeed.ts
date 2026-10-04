import { DEFAULT_AGENT } from './defaultAgent';
import { DEFAULT_TOOL_PERMISSIONS } from './defaultPermissions';
import { ATTACK_SCENARIOS } from '../engine/attacks/scenarios';
import { ExperimentRunner } from '../engine/experiments/ExperimentRunner';
import { RemediationEngine } from '../engine/remediation/RemediationEngine';
import { Experiment } from '../types';

export async function seedDemoEnvironment(): Promise<{
  experiments: Experiment[];
}> {
  const experiments: Experiment[] = [];

  // Scenarios to seed:
  // 1. Direct Prompt Injection (01)
  const sc01 = ATTACK_SCENARIOS.find(s => s.code === '01')!;
  const exp01 = await ExperimentRunner.runExperiment({
    scenario: sc01,
    agentConfig: DEFAULT_AGENT,
    permissions: DEFAULT_TOOL_PERMISSIONS,
  });
  experiments.push(exp01);

  // 2. Indirect Prompt Injection (02)
  const sc02 = ATTACK_SCENARIOS.find(s => s.code === '02')!;
  const exp02 = await ExperimentRunner.runExperiment({
    scenario: sc02,
    agentConfig: DEFAULT_AGENT,
    permissions: DEFAULT_TOOL_PERMISSIONS,
  });
  experiments.push(exp02);

  // 3. Unauthorized CRM Write (04) - Before Run
  const sc04 = ATTACK_SCENARIOS.find(s => s.code === '04')!;
  const exp04Before = await ExperimentRunner.runExperiment({
    scenario: sc04,
    agentConfig: DEFAULT_AGENT,
    permissions: DEFAULT_TOOL_PERMISSIONS,
  });
  experiments.push(exp04Before);

  // 4. Remediated Run for 04 (After Run)
  if (exp04Before.remediations.length > 0) {
    const rem = exp04Before.remediations[0];
    const patched = RemediationEngine.applyRemediation(
      DEFAULT_AGENT,
      DEFAULT_TOOL_PERMISSIONS,
      rem
    );
    const exp04After = await ExperimentRunner.runExperiment({
      scenario: sc04,
      agentConfig: patched.updatedAgentConfig,
      permissions: patched.updatedPermissions,
      isRemediatedRun: true,
      parentExperimentId: exp04Before.id,
    });
    experiments.push(exp04After);
  }

  // 5. Sensitive Data Exfiltration (05)
  const sc05 = ATTACK_SCENARIOS.find(s => s.code === '05')!;
  const exp05 = await ExperimentRunner.runExperiment({
    scenario: sc05,
    agentConfig: DEFAULT_AGENT,
    permissions: DEFAULT_TOOL_PERMISSIONS,
  });
  experiments.push(exp05);

  // 6. Tool Timeout Reliability Scenario (07)
  const sc07 = ATTACK_SCENARIOS.find(s => s.code === '07')!;
  const exp07 = await ExperimentRunner.runExperiment({
    scenario: sc07,
    agentConfig: DEFAULT_AGENT,
    permissions: DEFAULT_TOOL_PERMISSIONS,
  });
  experiments.push(exp07);

  return { experiments };
}
