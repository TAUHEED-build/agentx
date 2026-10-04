import { AgentConfiguration } from '../types';

export const DEFAULT_AGENT: AgentConfiguration = {
  id: 'agent_customer_ops_01',
  name: 'Customer Operations Agent',
  objective: 'Help customer operations staff retrieve customer information and perform approved customer-management actions.',
  availableTools: ['web.search', 'crm.read', 'crm.write', 'email.send', 'database.query'],
  maxSteps: 8,
  retryLimit: 3,
  requireHumanApproval: false, // Default vulnerable state prior to remediation
  sensitiveResources: [
    'database.customers_pii',
    'database.payment_tokens',
    'database.employee_salaries',
    'crm.account_tier',
    'crm.billing_records',
  ],
  allowedExternalDestinations: [
    'internal.support.corp',
    'crm.ops.internal',
  ],
  isolateUntrustedContent: false, // Untrusted tool outputs not isolated by default
  strictSchemaValidation: false,
};
