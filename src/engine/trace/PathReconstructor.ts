import { AttackPath, AttackPathEdge, AttackPathNode, TraceEvent } from '../../types';

export class PathReconstructor {
  /**
   * Dynamically constructs the attack/execution graph from raw trace events.
   */
  static reconstruct(traceEvents: TraceEvent[]): AttackPath {
    const nodes: AttackPathNode[] = [];
    const edges: AttackPathEdge[] = [];
    const nodeIds = new Set<string>();

    const addNode = (node: AttackPathNode) => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id);
        nodes.push(node);
      } else {
        // Append trace event id to existing node
        const existing = nodes.find(n => n.id === node.id);
        if (existing) {
          existing.traceEventIds = Array.from(new Set([...existing.traceEventIds, ...node.traceEventIds]));
          if (node.status === 'adversarial' || node.status === 'compromised' || node.status === 'blocked') {
            existing.status = node.status;
          }
        }
      }
    };

    const addEdge = (edge: AttackPathEdge) => {
      const exists = edges.some(e => e.source === edge.source && e.target === edge.target && e.label === edge.label);
      if (!exists && edge.source !== edge.target) {
        edges.push(edge);
      }
    };

    // 1. Initial Source Node (User Prompt / Attack Injected)
    const attackInjectedEvent = traceEvents.find(e => e.eventType === 'attack_injected');
    const userInputEvent = traceEvents.find(e => e.eventType === 'user_input');

    let originNodeId = 'node_origin';
    if (attackInjectedEvent) {
      originNodeId = 'node_adversary_input';
      addNode({
        id: originNodeId,
        label: 'Adversarial Injection',
        category: 'attack',
        status: 'adversarial',
        details: typeof attackInjectedEvent.input === 'string' ? attackInjectedEvent.input : 'Direct attack payload injected',
        timestamp: attackInjectedEvent.timestamp,
        traceEventIds: [attackInjectedEvent.id],
      });
    } else if (userInputEvent) {
      originNodeId = 'node_user_prompt';
      addNode({
        id: originNodeId,
        label: 'User Prompt',
        category: 'user_input',
        status: 'benign',
        details: typeof userInputEvent.input === 'string' ? userInputEvent.input : 'Initial customer operations task prompt',
        timestamp: userInputEvent.timestamp,
        traceEventIds: [userInputEvent.id],
      });
    }

    // 2. Central Agent Node
    const agentDecisions = traceEvents.filter(e => e.eventType === 'agent_decision');
    const isCompromised = traceEvents.some(
      e => e.metadata?.violation === 'OBJECTIVE_SUBVERSION' || e.metadata?.violation === 'UNTRUSTED_PROMPT_EXECUTION'
    );
    const agentNodeId = 'node_agent_core';
    addNode({
      id: agentNodeId,
      label: 'Agent Runtime',
      category: 'agent',
      status: isCompromised ? 'compromised' : 'benign',
      details: isCompromised ? 'Agent decision context subverted by adversarial directives' : 'Agent executing within operational bounds',
      timestamp: agentDecisions[0]?.timestamp || Date.now(),
      traceEventIds: agentDecisions.map(d => d.id),
    });

    addEdge({
      id: `edge_${originNodeId}_to_${agentNodeId}`,
      source: originNodeId,
      target: agentNodeId,
      label: isCompromised ? 'Subverts objective' : 'Directs task',
      type: 'invokes',
      isVulnerablePath: isCompromised,
    });

    // 3. Track Tool Invocations, Access, and Side Effects sequentially
    let lastActiveNodeId = agentNodeId;
    let sequenceCounter = 0;

    for (let i = 0; i < traceEvents.length; i++) {
      const evt = traceEvents[i];

      // Tool Call & Response
      if (evt.eventType === 'tool_call' && evt.tool) {
        sequenceCounter++;
        const toolNodeId = `node_tool_${evt.tool.replace('.', '_')}_${sequenceCounter}`;
        const isToolBlocked = traceEvents.slice(i, i + 3).some(
          nextEvt => nextEvt.eventType === 'permission_denied' && nextEvt.tool === evt.tool
        );

        addNode({
          id: toolNodeId,
          label: evt.tool,
          category: 'tool',
          status: isToolBlocked ? 'blocked' : 'benign',
          details: `Invoked with: ${JSON.stringify(evt.input || {})}`,
          timestamp: evt.timestamp,
          traceEventIds: [evt.id],
        });

        addEdge({
          id: `edge_${lastActiveNodeId}_to_${toolNodeId}`,
          source: lastActiveNodeId,
          target: toolNodeId,
          label: isToolBlocked ? 'Blocked by sandbox' : 'Executes tool',
          type: isToolBlocked ? 'blocked_by' : 'invokes',
          isVulnerablePath: !isToolBlocked && isCompromised,
        });

        lastActiveNodeId = toolNodeId;
      }

      // Sensitive Data Access
      if (evt.eventType === 'sensitive_data_access' && evt.metadata?.resource) {
        const resourceId = `node_res_${evt.metadata.resource.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        addNode({
          id: resourceId,
          label: evt.metadata.resource,
          category: 'resource',
          status: 'compromised',
          details: `Sensitive internal record touched: ${evt.metadata.resource}`,
          timestamp: evt.timestamp,
          traceEventIds: [evt.id],
        });

        addEdge({
          id: `edge_${lastActiveNodeId}_to_${resourceId}`,
          source: lastActiveNodeId,
          target: resourceId,
          label: 'Reads sensitive data',
          type: 'accesses',
          isVulnerablePath: true,
        });

        lastActiveNodeId = resourceId;
      }

      // External Side Effect / Data Exfiltration Sink
      if (evt.eventType === 'external_side_effect') {
        const destination = evt.metadata?.destination || 'external-sink';
        const sinkNodeId = `node_sink_${destination.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        addNode({
          id: sinkNodeId,
          label: `Sink: ${destination}`,
          category: 'external_sink',
          status: 'compromised',
          details: `Data leaked to unapproved external recipient: ${destination}`,
          timestamp: evt.timestamp,
          traceEventIds: [evt.id],
        });

        addEdge({
          id: `edge_${lastActiveNodeId}_to_${sinkNodeId}`,
          source: lastActiveNodeId,
          target: sinkNodeId,
          label: 'Exfiltrates to sink',
          type: 'exfiltrates',
          isVulnerablePath: true,
        });

        lastActiveNodeId = sinkNodeId;
      }

      // Permission Denied / Security Interception
      if (evt.eventType === 'permission_denied') {
        const interceptNodeId = `node_security_gate_${sequenceCounter}`;
        addNode({
          id: interceptNodeId,
          label: 'Sandbox Control Gate',
          category: 'tool',
          status: 'intercepted',
          details: evt.metadata?.explanation || 'Prohibited action stopped by active sandbox policy',
          timestamp: evt.timestamp,
          traceEventIds: [evt.id],
        });

        addEdge({
          id: `edge_${lastActiveNodeId}_to_${interceptNodeId}`,
          source: lastActiveNodeId,
          target: interceptNodeId,
          label: 'Interception triggered',
          type: 'blocked_by',
          isVulnerablePath: false,
        });
      }
    }

    // Build human-readable path summary
    const summaryPath = nodes
      .map(n => n.label)
      .join('  ⟶  ');

    return {
      nodes,
      edges,
      summary: summaryPath || 'Isolated execution - no multi-stage chain detected.',
    };
  }
}
