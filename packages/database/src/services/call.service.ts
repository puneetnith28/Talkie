import { prisma } from '../client';
import type { CallDirection, CallStatus, SpeakerType } from '@talkie/types';

export interface CreateCallInput {
  agentId?: string;
  phoneNumberId?: string;
  providerCallId?: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  status?: CallStatus;
}

export interface UpdateCallInput {
  status?: CallStatus;
  durationSeconds?: number;
  startedAt?: Date;
  endedAt?: Date;
  summary?: string;
  recordingUrl?: string;
  transcriptStatus?: string;
}

export interface AddTranscriptInput {
  speaker: SpeakerType;
  text: string;
  timestampMs?: number;
  confidence?: number;
}

export class CallService {
  /**
   * Create a new call record scoped to a workspace
   */
  static async createCall(workspaceId: string, input: CreateCallInput) {
    return prisma.call.create({
      data: {
        workspaceId,
        agentId: input.agentId,
        phoneNumberId: input.phoneNumberId,
        providerCallId: input.providerCallId,
        direction: input.direction,
        fromNumber: input.fromNumber,
        toNumber: input.toNumber,
        status: input.status ?? 'queued',
        startedAt: input.status === 'in_progress' ? new Date() : undefined,
      },
      include: {
        agent: true,
        phoneNumber: true,
      },
    });
  }

  /**
   * Get call details including transcripts with tenant check
   */
  static async getCallById(workspaceId: string, callId: string) {
    return prisma.call.findFirst({
      where: {
        id: callId,
        workspaceId,
      },
      include: {
        agent: true,
        phoneNumber: true,
        transcripts: {
          orderBy: { timestampMs: 'asc' },
        },
      },
    });
  }

  /**
   * Update call lifecycle state and metrics
   */
  static async updateCall(workspaceId: string, callId: string, input: UpdateCallInput) {
    const existing = await prisma.call.findFirst({
      where: { id: callId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Call not found or access denied: ${callId}`);
    }

    return prisma.call.update({
      where: { id: callId },
      data: input,
      include: {
        agent: true,
        phoneNumber: true,
      },
    });
  }

  /**
   * Add a new transcript speaker turn
   */
  static async addTranscriptTurn(callId: string, turn: AddTranscriptInput) {
    return prisma.transcript.create({
      data: {
        callId,
        speaker: turn.speaker,
        text: turn.text,
        timestampMs: turn.timestampMs ?? 0,
        confidence: turn.confidence ?? 0.95,
      },
    });
  }

  /**
   * Get all transcript turns for a call
   */
  static async getCallTranscripts(callId: string) {
    return prisma.transcript.findMany({
      where: { callId },
      orderBy: { timestampMs: 'asc' },
    });
  }

  /**
   * List calls for a workspace with filters and pagination
   */
  static async listCalls(
    workspaceId: string,
    options?: {
      agentId?: string;
      phoneNumberId?: string;
      direction?: CallDirection;
      status?: CallStatus;
      limit?: number;
      offset?: number;
    }
  ) {
    return prisma.call.findMany({
      where: {
        workspaceId,
        ...(options?.agentId ? { agentId: options.agentId } : {}),
        ...(options?.phoneNumberId ? { phoneNumberId: options.phoneNumberId } : {}),
        ...(options?.direction ? { direction: options.direction } : {}),
        ...(options?.status ? { status: options.status } : {}),
      },
      include: {
        agent: true,
        phoneNumber: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }
}
