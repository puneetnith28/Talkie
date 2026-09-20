export type CallSessionState =
  | 'idle'
  | 'ringing'
  | 'connected'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'ending'
  | 'ended'
  | 'failed';

export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed';

export interface VoiceSessionConfig {
  callId: string;
  workspaceId: string;
  agentId: string;
  agentName: string;
  systemPrompt: string;
  beginMessage?: string;
  voice: string;
  language: string;
  voiceSpeed: number;
  interruptionSensitivity: number; // 0.0 to 1.0
  enableBackchannel: boolean;
  maxSilenceMs: number;
  callerNumber: string;
  calleeNumber: string;
  direction: CallDirection;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'agent' | 'user' | 'system';
  text: string;
  timestamp: number; // Offset from start in ms
  durationMs?: number;
  isFinal?: boolean;
}

export interface AudioChunk {
  data: Buffer | Uint8Array;
  sampleRate: number;
  channels: number;
  format: 'pcm16' | 'mulaw' | 'mp3';
  timestamp: number;
}

export interface CallSummary {
  durationSeconds: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  summaryText: string;
  keyPoints: string[];
  actionItems: string[];
}
