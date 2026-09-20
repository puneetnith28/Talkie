import { MockCallProvider } from './mock-call-provider';
import { LLMConversationEngine } from './llm-engine';
import { SessionCoordinator } from './session-coordinator';
import type { VoiceSessionConfig } from './types';

export class VoiceAIFactory {
  /**
   * Create voice session coordinator with appropriate neural provider adapters
   */
  static createSession(
    config: VoiceSessionConfig,
    dependencies?: {
      callProvider?: MockCallProvider;
      llm?: LLMConversationEngine;
    }
  ): SessionCoordinator {
    const isDemoMode = process.env.TALKIE_DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY;

    return new SessionCoordinator(config, {
      callProvider: dependencies?.callProvider || new MockCallProvider(),
      llm: dependencies?.llm || new LLMConversationEngine(),
    });
  }
}
