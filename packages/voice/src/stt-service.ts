import type { AudioChunk, TranscriptTurn } from './types';

export interface STTEvent {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export class STTService {
  private listeners: ((event: STTEvent) => void)[] = [];

  /**
   * Process raw audio chunk and convert into transcript event
   */
  async processAudio(audio: AudioChunk): Promise<STTEvent> {
    // In mock/cloud integration, converts audio chunk to text
    const text = audio.data.toString();
    const event: STTEvent = {
      text,
      isFinal: true,
      confidence: 0.95,
      timestamp: audio.timestamp,
    };

    this.listeners.forEach((listener) => listener(event));
    return event;
  }

  /**
   * Helper to simulate a user speech turn directly
   */
  simulateSpeechTurn(text: string, timestamp: number = Date.now()): STTEvent {
    const event: STTEvent = {
      text,
      isFinal: true,
      confidence: 0.98,
      timestamp,
    };
    this.listeners.forEach((listener) => listener(event));
    return event;
  }

  onTranscript(listener: (event: STTEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
