# AGENTX Threat Model

## 1. System Overview & Boundaries
The target under test is an autonomous or semi-autonomous AI agent equipped with access to internal and external tools (CRM, Relational Database, Search, Email). The system boundary separates:
1. **Untrusted Inputs**: Direct user prompts, third-party retrieved web content (RAG), and external webhook data.
2. **Agent Reasoning Core**: The model context window, system prompt, and intermediate thought loop.
3. **Sandbox Policy Interceptor**: Granular authorization gate checking capabilities, side-effects, and sensitive resources.
4. **Tool Execution Providers**: Internal databases, CRM endpoints, and external side-effect sinks.

## 2. Threat Actors & Scenarios
- **External Attacker (Direct Injection)**: Crafts malicious inputs attempting to override system constraints and exfiltrate records.
- **Malicious Third-Party (Indirect Injection)**: Plants hostile directives on public web pages or documents that the agent retrieves during standard operations.
- **Insider / Social Engineering**: Attempts to coerce the agent into modifying records without authorization.
- **Compromised Tool / Dependency**: Upstream APIs returning malformed data or embedded adversarial instructions in data fields.
- **Infrastructure Degradation**: Downstream service timeouts, connection drops, and deadlocks inducing unhandled crashes or retry loops.

## 3. Vulnerability Classifications Evaluated
- **OWASP LLM01:2025 Prompt Injection** (Direct and Indirect)
- **OWASP LLM02:2025 Sensitive Information Disclosure** (Exfiltration across perimeter)
- **OWASP LLM06:2025 Excessive Agency** (Unchecked write permissions on CRM)
- **OWASP LLM08:2025 Excessive Autonomy** (Unbounded multi-tool chaining)
- **CWE-400: Uncontrolled Resource Consumption** (Unbounded retry loops)
- **CWE-20: Improper Input Validation** (Malformed JSON tool responses)

## 4. Remediation Matrix

| Vulnerability | Remediation Pattern | Concrete Sandbox Control |
|:---|:---|:---|
| Direct Prompt Injection | System Instruction Anchoring | Context boundary separation |
| Indirect Prompt Injection | Content Quarantine | `isolateUntrustedContent: true` |
| Excessive Write Agency | Human-in-the-Loop Gating | `requiresApproval: true` on `crm.write` |
| Sensitive Data Exfiltration | Egress Destination Whitelisting | `allowedExternalDestinations` enforcement |
| Cross-Tool Chaining Abuse | Step Count Budgeting | Clamp `maxSteps: 4` + intermediary approval |
| Retry Loop Exhaustion | Exponential Backoff & Circuit Breaker | Clamp `retryLimit: 1` |
| Malformed Tool Response | Ingress Schema Validation | `strictSchemaValidation: true` |
