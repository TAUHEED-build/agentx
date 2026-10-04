# AGENTX System Architecture

## Overview
AGENTX is built as a deterministic, client-side, verifiable simulation framework with strict modularity between the simulation runtime, security enforcement layer, and visualization views.

```
                    ┌────────────────────────────────┐
                    │      React SPA / Dashboard     │
                    │  (Overview, Lab, Traces, Graph) │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │       AppContext (State)       │
                    │   (localStorage persistence)   │
                    └───────────────┬────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ Experiment   │             │   Sandbox    │             │   Scoring    │
│    Runner    │ ──────────> │ Environment  │ ──────────> │    Engine    │
└──────────────┘             └──────────────┘             └──────────────┘
       │                            │                            │
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ AgentRuntime │             │ TraceRecorder│             │ Path Reconst │
│ (Decision)   │             │ & Mock Tools │             │ (DAG Synth)  │
└──────────────┘             └──────────────┘             └──────────────┘
```

## Core Modules

### 1. `AgentRuntime` (`src/engine/agent/AgentRuntime.ts`)
- Implements `AgentRuntimeInterface` (`initialize`, `execute`, `decideNextAction`, `handleToolResult`, `finish`).
- Decouples policy decisions from tool execution mechanics.
- In mock mode: evaluates objective vs untrusted input, responds deterministically to fault injection flags, and tests defensive gates.
- In production LLM mode: can seamlessly plug in `@google/genai` or OpenAI client libraries.

### 2. `SandboxEnvironment` (`src/engine/sandbox/SandboxEnvironment.ts`)
- Mediate every tool call attempted by the agent.
- Enforces capability whitelists, action type constraints (READ/WRITE/EXECUTE), and sensitivity tiering.
- Gates high-impact actions (`crm.write`, `email.send`) on human approval if configured.
- Egress validation: intercepts destination emails against the configured whitelist.
- Content isolation: strips prompt injection command keywords when enabled.

### 3. `TraceRecorder` (`src/engine/trace/TraceRecorder.ts`)
- Captures an immutable event log for every execution step.
- Automatically assigns sequence numbers, monotonic timestamps, actor classifications, inputs, outputs, and violation flags.

### 4. `PathReconstructor` (`src/engine/trace/PathReconstructor.ts`)
- Dynamically converts raw trace events into a Directed Acyclic Graph (DAG).
- Categorizes nodes (`user_input`, `agent`, `tool`, `resource`, `attack`, `external_sink`) and maps edges (`invokes`, `propagates`, `accesses`, `exfiltrates`, `blocked_by`).

### 5. `BlastRadiusEngine` (`src/engine/scoring/BlastRadiusEngine.ts`)
- Computes mathematical damage metrics (0–100) using 5 transparent factor buckets:
  - Privilege Impact (max 25)
  - Sensitive Data Exposure (max 25)
  - External Side Effects (max 20)
  - Chain Depth (max 15)
  - Recovery Failure (max 15)

### 6. `RemediationEngine` (`src/engine/remediation/RemediationEngine.ts`)
- Maps observed trace violations to OWASP LLM Top 10 and CWE standards.
- Emits executable policy patches modifying `AgentConfiguration` and `ToolPermission` objects.
