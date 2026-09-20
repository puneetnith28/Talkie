import type { CallProvider } from './interface';
import type { VoiceSessionConfig, AudioChunk } from './types';

export class MockCallProvider implements CallProvider {
  readonly name = 'mock-telephony';

  private activeCalls = new Map<string, VoiceSessionConfig>();
  private audioBuffers = new Map<string, AudioChunk[]>();

  async initiateCall(config: VoiceSessionConfig): Promise<{ providerCallId: string; status: string }> {
    const providerCallId = `call_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.activeCalls.set(providerCallId, config);
    this.audioBuffers.set(providerCallId, []);

    return {
      providerCallId,
      status: 'ringing',
    };
  }

  async terminateCall(providerCallId: string): Promise<boolean> {
    if (!this.activeCalls.has(providerCallId)) {
      return false;
    }
    this.activeCalls.delete(providerCallId);
    this.audioBuffers.delete(providerCallId);
    return true;
  }

  async sendAudio(providerCallId: string, audio: AudioChunk): Promise<void> {
    const buffer = this.audioBuffers.get(providerCallId);
    if (buffer) {
      buffer.push(audio);
    }
  }

  getActiveCallsCount(): number {
    return this.activeCalls.size;
  }

  getAudioBuffers(providerCallId: string): AudioChunk[] {
    return this.audioBuffers.get(providerCallId) || [];
  }
}
