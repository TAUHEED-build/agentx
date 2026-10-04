import { TraceEvent, TraceEventType } from '../../types';

export class TraceRecorder {
  private events: TraceEvent[] = [];
  private sequenceCounter = 0;
  private baseTimestamp: number;

  constructor(baseTimestamp?: number) {
    this.baseTimestamp = baseTimestamp || Date.now();
  }

  record(eventData: Omit<TraceEvent, 'id' | 'sequence' | 'timestamp'> & { timestamp?: number }): TraceEvent {
    this.sequenceCounter += 1;
    const event: TraceEvent = {
      id: `evt_${this.sequenceCounter.toString().padStart(4, '0')}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: eventData.timestamp || this.baseTimestamp + this.sequenceCounter * 120, // realistic millisecond progression
      sequence: this.sequenceCounter,
      actor: eventData.actor,
      eventType: eventData.eventType,
      tool: eventData.tool,
      input: eventData.input,
      output: eventData.output,
      metadata: eventData.metadata,
    };

    this.events.push(event);
    return event;
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }

  getEventsByType(type: TraceEventType): TraceEvent[] {
    return this.events.filter(e => e.eventType === type);
  }

  getViolations(): string[] {
    const violations = new Set<string>();
    for (const evt of this.events) {
      if (evt.metadata?.violation) {
        violations.add(evt.metadata.violation);
      }
    }
    return Array.from(violations);
  }

  getSensitiveResourcesTouched(): string[] {
    const resources = new Set<string>();
    for (const evt of this.events) {
      if (evt.eventType === 'sensitive_data_access' && evt.metadata?.resource) {
        resources.add(evt.metadata.resource);
      }
      if (evt.eventType === 'tool_call' && evt.tool === 'database.query') {
        const query = typeof evt.input === 'object' && evt.input !== null ? JSON.stringify(evt.input) : String(evt.input || '');
        if (query.includes('pii') || query.includes('payment') || query.includes('salary')) {
          resources.add(query);
        }
      }
    }
    return Array.from(resources);
  }

  getExternalSideEffects(): string[] {
    const sideEffects = new Set<string>();
    for (const evt of this.events) {
      if (evt.eventType === 'external_side_effect') {
        const desc = evt.metadata?.destination
          ? `${evt.tool || 'action'} -> ${evt.metadata.destination}`
          : `${evt.tool || 'external action'}`;
        sideEffects.add(desc);
      }
    }
    return Array.from(sideEffects);
  }

  clear() {
    this.events = [];
    this.sequenceCounter = 0;
  }
}
