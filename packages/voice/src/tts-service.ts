import type { AudioChunk } from './types';

export interface TTSOptions {
  voice?: string;
  speed?: number;
  format?: 'pcm16' | 'mulaw' | 'mp3';
}

export class TTSService {
  private isSynthesizing = false;
  private abortController: AbortController | null = null;

  /**
   * Synthesize text into audio chunks
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<AudioChunk> {
    this.isSynthesizing = true;
    this.abortController = new AbortController();

    const speed = options.speed ?? 1.0;
    const format = options.format ?? 'pcm16';

    // Simulate audio synthesis byte stream
    const simulatedBuffer = Buffer.from(`TTS_AUDIO:${options.voice || 'default'}:${text}`);

    this.isSynthesizing = false;
    return {
      data: simulatedBuffer,
      sampleRate: 24000,
      channels: 1,
      format,
      timestamp: Date.now(),
    };
  }

  /**
   * Cancel ongoing synthesis on caller barge-in / interruption
   */
  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isSynthesizing = false;
  }

  get active(): boolean {
    return this.isSynthesizing;
  }
}
