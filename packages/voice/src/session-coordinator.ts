import { VoiceStateMachine } from './state-machine';
import { STTService } from './stt-service';
import { TTSService } from './tts-service';
import { LLMConversationEngine } from './llm-engine';
import { MockCallProvider } from './mock-call-provider';
import type { VoiceSessionConfig, TranscriptTurn, CallSessionState, CallSummary } from './types';

export class SessionCoordinator {
  readonly config: VoiceSessionConfig;
  readonly stateMachine: VoiceStateMachine;
  readonly stt: STTService;
  readonly tts: TTSService;
  readonly llm: LLMConversationEngine;
  readonly callProvider: MockCallProvider;

  private transcript: TranscriptTurn[] = [];
  private providerCallId: string | null = null;
  private startTime: number = Date.now();

  constructor(
    config: VoiceSessionConfig,
    dependencies?: {
      callProvider?: MockCallProvider;
      llm?: LLMConversationEngine;
    }
  ) {
    this.config = config;
    this.stateMachine = new VoiceStateMachine('idle');
    this.stt = new STTService();
    this.tts = new TTSService();
    this.llm = dependencies?.llm || new LLMConversationEngine();
    this.callProvider = dependencies?.callProvider || new MockCallProvider();

    this.setupListeners();
  }

  private setupListeners() {
    this.stt.onTranscript(async (event) => {
      if (this.stateMachine.state === 'speaking') {
        // Barge-in interruption
        this.stateMachine.transition('interrupted');
        this.tts.cancel();
      }

      const turn: TranscriptTurn = {
        id: `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        speaker: 'user',
        text: event.text,
        timestamp: Date.now() - this.startTime,
        isFinal: event.isFinal,
      };
      this.transcript.push(turn);

      // Transition to thinking and generate response
      if (!this.stateMachine.isTerminal()) {
        this.stateMachine.transition('thinking');
        const responseText = await this.llm.generateResponse({
          systemPrompt: this.config.systemPrompt,
          history: this.transcript,
          userMessage: event.text,
        });

        await this.speak(responseText);
      }
    });
  }

  /**
   * Start the voice call session
   */
  async start(): Promise<void> {
    this.startTime = Date.now();
    this.stateMachine.transition('ringing');

    const callResult = await this.callProvider.initiateCall(this.config);
    this.providerCallId = callResult.providerCallId;

    this.stateMachine.transition('connected');

    // Speak greeting begin message if provided
    if (this.config.beginMessage) {
      await this.speak(this.config.beginMessage);
    } else {
      this.stateMachine.transition('listening');
    }
  }

  /**
   * Speak agent response with TTS synthesis
   */
  async speak(text: string): Promise<void> {
    if (this.stateMachine.isTerminal()) return;

    this.stateMachine.transition('speaking');

    const turn: TranscriptTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speaker: 'agent',
      text,
      timestamp: Date.now() - this.startTime,
      isFinal: true,
    };
    this.transcript.push(turn);

    const audio = await this.tts.synthesize(text, {
      voice: this.config.voice,
      speed: this.config.voiceSpeed,
    });

    if (this.providerCallId) {
      await this.callProvider.sendAudio(this.providerCallId, audio);
    }

    if (this.stateMachine.state === 'speaking') {
      this.stateMachine.transition('listening');
    }
  }

  /**
   * Handle caller speech turn
   */
  async handleUserSpeech(text: string): Promise<void> {
    this.stt.simulateSpeechTurn(text);
  }

  /**
   * End the call session and generate summary
   */
  async end(): Promise<{ summary: CallSummary; transcript: TranscriptTurn[] }> {
    if (!this.stateMachine.isTerminal()) {
      this.stateMachine.transition('ending');
    }

    if (this.providerCallId) {
      await this.callProvider.terminateCall(this.providerCallId);
    }

    this.tts.cancel();
    this.stateMachine.transition('ended');

    const summary = await this.llm.summarizeCall(this.transcript);

    return {
      summary,
      transcript: this.transcript,
    };
  }

  getTranscript(): TranscriptTurn[] {
    return [...this.transcript];
  }

  getState(): CallSessionState {
    return this.stateMachine.state;
  }
}
