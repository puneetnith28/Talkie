export interface TalkieClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  voiceProvider?: string;
  voiceId?: string;
  systemPrompt: string;
  firstSentence?: string;
  transcriptionModel?: string;
  llmModel?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  idleTimeoutSeconds?: number;
  interruptible?: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumbers?: Array<{
    id: string;
    phoneNumber: string;
    friendlyName?: string;
  }>;
}

export interface CreateAgentParams {
  name: string;
  description?: string;
  systemPrompt: string;
  voiceProvider?: string;
  voiceId?: string;
  firstSentence?: string;
  transcriptionModel?: string;
  llmModel?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  idleTimeoutSeconds?: number;
  interruptible?: boolean;
}

export interface PhoneNumber {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  friendlyName?: string;
  agentId?: string | null;
  country: string;
  capabilities: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchNumbersParams {
  country?: string;
  areaCode?: string;
  contains?: string;
  limit?: number;
}

export interface ProvisionNumberParams {
  phoneNumber: string;
  friendlyName?: string;
  agentId?: string;
}

export interface Call {
  id: string;
  workspaceId: string;
  agentId: string;
  phoneNumberId: string;
  callerNumber: string;
  calleeNumber: string;
  direction: 'inbound' | 'outbound';
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  durationSeconds?: number;
  costCents?: number;
  summary?: string;
  sentiment?: string;
  recordingUrl?: string;
  transcript?: any[];
  createdAt: string;
  endedAt?: string;
}

export interface CreateCallParams {
  agentId: string;
  fromNumber: string;
  toNumber: string;
}

export interface CallControlParams {
  action: 'hangup' | 'mute' | 'unmute' | 'interrupt' | 'transfer';
  targetNumber?: string;
}

export interface Message {
  id: string;
  workspaceId: string;
  conversationId?: string;
  phoneNumberId: string;
  senderNumber: string;
  recipientNumber: string;
  body: string;
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  costCents?: number;
  createdAt: string;
}

export interface SendMessageParams {
  fromNumber: string;
  toNumber: string;
  body: string;
  phoneNumberId?: string;
}

export interface Contact {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactParams {
  phoneNumber: string;
  name?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface WebhookConfig {
  id: string;
  workspaceId: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookParams {
  url: string;
  events: string[];
}
