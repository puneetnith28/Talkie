import type { TranscriptTurn, CallSummary } from './types';
import { PromptBuilder } from './prompt-builder';

export interface LLMCompletionOptions {
  systemPrompt: string;
  history: TranscriptTurn[];
  userMessage: string;
  tools?: any[];
}

export class LLMConversationEngine {
  /**
   * Generates a conversational turn response from user speech and context history
   */
  async generateResponse(options: LLMCompletionOptions): Promise<string> {
    const { systemPrompt, history, userMessage } = options;
    const lower = userMessage.toLowerCase();

    // Contextual smart response generation
    if (lower.includes('appointment') || lower.includes('schedule') || lower.includes('book')) {
      return 'I would be glad to help you schedule an appointment. What day and time works best for you?';
    }

    if (lower.includes('order') || lower.includes('tracking') || lower.includes('shipping')) {
      return 'I can check your order status right away. Could you please provide your 6-digit order number?';
    }

    if (lower.includes('hours') || lower.includes('open') || lower.includes('location')) {
      return 'We are open Monday through Friday from 8 AM to 6 PM Pacific Time.';
    }

    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('thank you') || lower.includes('thanks')) {
      return 'You are very welcome! Have a wonderful day. Goodbye!';
    }

    // Default conversational AI fallback turn
    return `Understood. Regarding "${userMessage}", I am processing your request now. How else may I assist you?`;
  }

  /**
   * Generates post-call analytics summary
   */
  async summarizeCall(transcript: TranscriptTurn[]): Promise<CallSummary> {
    const userTurns = transcript.filter((t) => t.speaker === 'user');
    const fullText = transcript.map((t) => `${t.speaker}: ${t.text}`).join(' ');

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    const lower = fullText.toLowerCase();

    if (lower.includes('great') || lower.includes('thanks') || lower.includes('awesome') || lower.includes('helpful')) {
      sentiment = 'positive';
    } else if (lower.includes('angry') || lower.includes('terrible') || lower.includes('broken') || lower.includes('cancel')) {
      sentiment = 'negative';
    }

    return {
      durationSeconds: Math.max(1, Math.round(transcript.length * 4)),
      sentiment,
      summaryText: `Caller engaged with AI agent across ${userTurns.length} user turn(s). Discussion centered around user inquiries.`,
      keyPoints: userTurns.map((t) => t.text).slice(0, 5),
      actionItems: ['Follow up with customer regarding requested details'],
    };
  }
}
