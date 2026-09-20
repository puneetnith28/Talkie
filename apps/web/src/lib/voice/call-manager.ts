import { CallService, AgentService, NumberService, ContactService, UsageService } from '@talkie/database';
import { SessionCoordinator, MockCallProvider } from '@talkie/voice';
import type { VoiceSessionConfig } from '@talkie/voice';

export class CallManager {
  private static activeSessions = new Map<string, SessionCoordinator>();
  private static callProvider = new MockCallProvider();

  /**
   * Initiate an outbound voice call
   */
  static async startOutboundCall(options: {
    workspaceId: string;
    agentId: string;
    from: string; // Caller ID number
    to: string; // Recipient number
  }) {
    const { workspaceId, agentId, from, to } = options;

    const agent = await AgentService.getById(workspaceId, agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const callerNumber = await NumberService.getByPhoneNumber(from);
    if (!callerNumber || callerNumber.workspaceId !== workspaceId) {
      throw new Error(`Caller number ${from} does not belong to this workspace`);
    }

    // Resolve or create contact
    let contact = await ContactService.getByPhoneNumber(workspaceId, to);
    if (!contact) {
      contact = await ContactService.create(workspaceId, {
        phoneNumber: to,
        name: `Contact (${to})`,
      });
    }

    // Create DB Call record
    const callRecord = await CallService.create(workspaceId, {
      agentId: agent.id,
      phoneNumberId: callerNumber.id,
      contactId: contact.id,
      direction: 'outbound',
      callerNumber: from,
      calleeNumber: to,
      status: 'ringing',
    });

    const sessionConfig: VoiceSessionConfig = {
      callId: callRecord.id,
      workspaceId,
      agentId: agent.id,
      agentName: agent.name,
      systemPrompt: agent.systemPrompt,
      beginMessage: agent.beginMessage || undefined,
      voice: agent.voice,
      language: agent.language,
      voiceSpeed: agent.voiceSpeed,
      interruptionSensitivity: agent.interruptionSensitivity,
      enableBackchannel: agent.enableBackchannel,
      maxSilenceMs: agent.maxSilenceMs,
      callerNumber: from,
      calleeNumber: to,
      direction: 'outbound',
    };

    const coordinator = new SessionCoordinator(sessionConfig, {
      callProvider: this.callProvider,
    });

    this.activeSessions.set(callRecord.id, coordinator);

    // Start session in background
    await coordinator.start();
    await CallService.updateStatus(callRecord.id, 'in-progress');

    return {
      call: callRecord,
      session: coordinator,
    };
  }

  /**
   * Hang up and finalize active call
   */
  static async hangupCall(workspaceId: string, callId: string) {
    const coordinator = this.activeSessions.get(callId);
    let summaryData = null;

    if (coordinator) {
      const { summary, transcript } = await coordinator.end();
      summaryData = summary;

      // Save transcript turns and summary to DB
      for (const turn of transcript) {
        await CallService.logTurn(callId, {
          speaker: turn.speaker,
          text: turn.text,
          startTimeOffsetMs: turn.timestamp,
        });
      }

      await CallService.finalizeCall(callId, {
        durationSeconds: summary.durationSeconds,
        summary: summary.summaryText,
        sentiment: summary.sentiment,
      });

      // Record voice usage debit
      const minutes = Math.max(1, Math.ceil(summary.durationSeconds / 60));
      await UsageService.recordUsage(workspaceId, {
        type: 'voice_minutes',
        quantity: minutes,
        costCents: minutes * 2, // 2 cents / minute
        description: `Voice call duration: ${summary.durationSeconds}s`,
      });

      this.activeSessions.delete(callId);
    } else {
      await CallService.updateStatus(callId, 'completed');
    }

    return { success: true, summary: summaryData };
  }

  static getActiveSession(callId: string): SessionCoordinator | undefined {
    return this.activeSessions.get(callId);
  }
}
