# AGENTX Experimentation Methodology

## Deterministic Experiment Life Cycle

Every experiment follows a strict immutable pipeline:

1. **Snapshotting**: The agent configuration and tool permissions table are deeply cloned to ensure that in-flight mutations do not retroactively alter historic runs.
2. **Telemetry Ingestion**: Monotonic timestamps and auto-incrementing sequence IDs are assigned to every event emitted during execution.
3. **Graph Derivation**: The directed acyclic attack graph is constructed directly from observed trace interactions, establishing causal parent-child links between inputs, agent decisions, tool invocations, and sinks.
4. **Blast-Radius Computation**: Evaluates 5 mathematical vectors (Privilege, Data Exposure, Side Effects, Chain Depth, Recovery Failure) to produce a normalized 0–100 score.
5. **Remediation & Comparative Rerun**:
   - The user inspects findings and clicks "Apply Control".
   - The control updates the live sandbox policy.
   - The user clicks "Rerun Same Experiment".
   - The engine computes mathematical deltas:
     - `Risk Reduction % = ((Before - After) / Before) * 100`
     - Deltas for sensitive assets touched, unauthorized actions, and side effects.
