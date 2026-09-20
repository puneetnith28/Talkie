import type { VoiceSessionConfig, TranscriptTurn } from './types';

export class PromptBuilder {
  /**
   * Build complete LLM context with system persona, caller metadata, and guidelines
   */
  static buildPrompt(
    config: VoiceSessionConfig,
    contact?: { name?: string; email?: string; company?: string; notes?: string }
  ): string {
    const lines: string[] = [
      `[PERSONA & ROLE]`,
      config.systemPrompt,
      ``,
      `[CALL METADATA]`,
      `- Agent Name: ${config.agentName}`,
      `- Caller Number: ${config.callerNumber}`,
      `- Callee Number: ${config.calleeNumber}`,
      `- Call Direction: ${config.direction.toUpperCase()}`,
      `- Language: ${config.language}`,
    ];

    if (contact) {
      lines.push(
        ``,
        `[CALLER PROFILE]`,
        `- Name: ${contact.name || 'Unknown'}`,
        `- Company: ${contact.company || 'Unknown'}`,
        `- Notes: ${contact.notes || 'None'}`
      );
    }

    lines.push(
      ``,
      `[VOICE RESPONSE RULES]`,
      `1. Be concise, conversational, and direct. Voice latency matters.`,
      `2. Keep sentences short. Avoid long bullet points or markdown tables.`,
      `3. Never output robotic formatting like XML tags or asterisks unless required.`
    );

    return lines.join('\n');
  }

  /**
   * Format transcript history into chat messages
   */
  static formatHistory(history: TranscriptTurn[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return history.map((turn) => ({
      role: turn.speaker === 'agent' ? 'assistant' : turn.speaker === 'user' ? 'user' : 'system',
      content: turn.text,
    }));
  }
}
