export type WebhookEventName =
  | 'call.started'
  | 'call.ended'
  | 'call.transcript'
  | 'message.received'
  | 'message.sent'
  | 'message.delivered'
  | 'number.provisioned'
  | 'number.released'
  | 'agent.created'
  | 'agent.updated';

export interface WebhookEvent<T = Record<string, any>> {
  id: string; // evt_...
  event: WebhookEventName | string;
  timestamp: string; // ISO 8601
  workspaceId: string;
  data: T;
}

export interface WebhookDeliveryAttempt {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  statusCode?: number;
  responseBody?: string;
  latencyMs?: number;
  attempt: number;
  status: 'success' | 'retrying' | 'failed' | 'dead-letter';
  nextRetryAt?: Date;
  error?: string;
}

export interface WebhookConfig {
  id: string;
  workspaceId: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'paused' | 'disabled';
}
