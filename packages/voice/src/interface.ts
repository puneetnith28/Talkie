import type {
  CallSessionState,
  VoiceSessionConfig,
  TranscriptTurn,
  AudioChunk,
  CallSummary,
} from './types';

export interface VoiceAIProvider {
  readonly name: string;

  /**
   * Transcribe incoming speech audio stream
   */
  transcribeAudio(audio: AudioChunk): Promise<{ text: string; isFinal: boolean }>;

  /**
   * Synthesize text into voice audio
   */
  synthesizeSpeech(text: string, voice: string, speed?: number): Promise<AudioChunk>;

  /**
   * Generate conversational turn response
   */
  generateResponse(
    systemPrompt: string,
    history: TranscriptTurn[],
    userMessage: string
  ): Promise<string>;

  /**
   * Generate post-call intelligence summary
   */
  summarizeCall(transcript: TranscriptTurn[]): Promise<CallSummary>;
}

export interface CallProvider {
  readonly name: string;

  /**
   * Initiate an outbound phone call
   */
  initiateCall(config: VoiceSessionConfig): Promise<{ providerCallId: string; status: string }>;

  /**
   * Terminate/Hangup an active call
   */
  terminateCall(providerCallId: string): Promise<boolean>;

  /**
   * Send audio to active call channel
   */
  sendAudio(providerCallId: string, audio: AudioChunk): Promise<void>;
}
