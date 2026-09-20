// Core Talkie Shared Domain Types

export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'member';

export type VoiceMode = 'hosted' | 'webhook';

export type PhoneNumberStatus = 'available' | 'provisioning' | 'active' | 'released' | 'error';

export interface PhoneNumberCapabilities {
  voice: boolean;
  sms: boolean;
  mms: boolean;
  imessage?: boolean;
  whatsapp?: boolean;
}

export type CallDirection = 'inbound' | 'outbound';

export type CallStatus =
  | 'queued'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no_answer'
  | 'cancelled';

export type SpeakerType = 'user' | 'agent' | 'system';

export type MessageDirection = 'inbound' | 'outbound';

export type MessageStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';

export type ChannelType = 'sms' | 'mms' | 'imessage' | 'whatsapp';

export type WebhookEventName =
  | 'agent.message'
  | 'agent.call_started'
  | 'agent.call_ended'
  | 'message.received'
  | 'message.sent'
  | 'call.started'
  | 'call.ended'
  | 'number.provisioned'
  | 'number.released';

export type UsageType =
  | 'phone_number'
  | 'sms'
  | 'mms'
  | 'voice_minute'
  | 'tts_character'
  | 'stt_minute'
  | 'llm_token'
  | 'webhook_delivery';

export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  requestId: string;
}

export * from './auth';

