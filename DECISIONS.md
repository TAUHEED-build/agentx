# Architectural Decision Records (ADR)

## ADR 01: Deterministic Engine over Mock Stubs
- **Context**: The user required a functioning experimentation engine rather than a static mockup with hardcoded charts and arbitrary scores.
- **Decision**: Implemented `ExperimentRunner`, `AgentRuntime`, `SandboxEnvironment`, `BlastRadiusEngine`, and `TraceRecorder` as real TypeScript classes. Every metric in the dashboard is calculated dynamically from recorded trace events.
- **Consequences**: Guarantees anti-fraud compliance; allows users to tweak configurations and witness real mathematical changes in blast radius and trace behavior.

## ADR 02: Client-Side Hermetic Execution
- **Context**: External LLM API keys and external databases can fail, introduce network latency, or leak sensitive test payloads.
- **Decision**: Built complete mock tool registry and deterministic agent decision logic into the client application runtime, while preserving standard `AgentRuntimeInterface` for future live LLM integration.
- **Consequences**: AGENTX runs completely offline with zero API key dependencies, instant execution, and 100% reproducible results.

## ADR 03: Anti-Slop Visual Language
- **Context**: Technical security research consoles demand high information density, strict WCAG contrast, and zero AI-slop visual clichés.
- **Decision**: Implemented zero-pill metadata discipline with unboxed text and typographic `·` separators, neutral dark slate canvas (`#090d16`), tabular numerals (`tabular-nums`) for all numbers, and 3-zone Top Bar Contract.
