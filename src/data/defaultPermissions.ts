import { ToolPermission } from '../types';

export const DEFAULT_TOOL_PERMISSIONS: Record<string, ToolPermission> = {
  'web.search': {
    toolId: 'web.search',
    toolName: 'Web Search',
    description: 'Retrieve external, unverified information from public or partner indexes.',
    sensitivity: 'MEDIUM',
    actionType: 'READ',
    sideEffect: 'NONE',
    isAllowed: true,
    requiresApproval: false,
    rateLimitPerSession: 10,
  },
  'crm.read': {
    toolId: 'crm.read',
    toolName: 'CRM Read',
    description: 'Query customer records including customer ID, name, email, plan, and status.',
    sensitivity: 'LOW',
    actionType: 'READ',
    sideEffect: 'NONE',
    isAllowed: true,
    requiresApproval: false,
    rateLimitPerSession: 20,
  },
  'crm.write': {
    toolId: 'crm.write',
    toolName: 'CRM Write',
    description: 'Modify customer records, plan upgrades, account flags, and lifecycle status.',
    sensitivity: 'HIGH',
    actionType: 'WRITE',
    sideEffect: 'INTERNAL_STATE',
    isAllowed: true, // Vulnerable by default for testing
    requiresApproval: false,
    rateLimitPerSession: 5,
  },
  'email.send': {
    toolId: 'email.send',
    toolName: 'Email Sender',
    description: 'Dispatch external emails to customers or external stakeholders.',
    sensitivity: 'HIGH',
    actionType: 'WRITE',
    sideEffect: 'EXTERNAL_SINK',
    isAllowed: true,
    requiresApproval: false, // Vulnerable by default
    rateLimitPerSession: 5,
  },
  'database.query': {
    toolId: 'database.query',
    toolName: 'Internal DB Query',
    description: 'Run structured relational queries across internal customer and analytical databases.',
    sensitivity: 'HIGH',
    actionType: 'READ',
    sideEffect: 'NONE',
    isAllowed: true,
    requiresApproval: false,
    rateLimitPerSession: 15,
  },
};
