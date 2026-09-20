import { prisma } from '../client';
import type { CallDirection, CallStatus, SpeakerType } from '@talkie/types';

export interface CreateCallInput {
  agentId?: string;
  phoneNumberId?: string;
  contactId?: string;
  providerCallId?: string;
  direction: CallDirection | string;
  fromNumber?: string;
  toNumber?: string;
  callerNumber?: string;
  calleeNumber?: string;
  status?: CallStatus | string;
}

export interface UpdateCallInput {
  status?: CallStatus | string;
  durationSeconds?: number;
  startedAt?: Date;
  endedAt?: Date;
  summary?: string;
  recordingUrl?: string;
  transcriptStatus?: string;
}

export interface AddTranscriptInput {
  speaker: SpeakerType | string;
  text: string;
  timestampMs?: number;
  startTimeOffsetMs?: number;
  confidence?: number;
}

export class CallService {
  /**
   * Create a new call record scoped to a workspace
   */
  static async createCall(workspaceId: string, input: CreateCallInput) {
    const fromNumber = input.fromNumber || input.callerNumber || '';
    const toNumber = input.toNumber || input.calleeNumber || '';

    return prisma.call.create({
      data: {
        workspaceId,
        agentId: input.agentId,
        phoneNumberId: input.phoneNumberId,
        providerCallId: input.providerCallId,
        direction: input.direction,
        fromNumber,
        toNumber,
        status: input.status ?? 'queued',
        startedAt: input.status === 'in-progress' || input.status === 'in_progress' ? new Date() : undefined,
      },
      include: {
        agent: true,
        phoneNumber: true,
        transcripts: true,
      },
    });
  }

  static async create(workspaceId: string, input: CreateCallInput) {
    return this.createCall(workspaceId, input);
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

  static async getById(workspaceId: string, callId: string) {
    return this.getCallById(workspaceId, callId);
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

  static async updateStatus(callId: string, status: string) {
    return prisma.call.update({
      where: { id: callId },
      data: {
        status,
        endedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
      },
    });
  }

  static async finalizeCall(
    callId: string,
    data: { durationSeconds: number; summary?: string; sentiment?: string }
  ) {
    return prisma.call.update({
      where: { id: callId },
      data: {
        status: 'completed',
        durationSeconds: data.durationSeconds,
        summary: data.summary,
        transcriptStatus: 'completed',
        endedAt: new Date(),
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
        timestampMs: turn.timestampMs ?? turn.startTimeOffsetMs ?? 0,
        confidence: turn.confidence ?? 0.95,
      },
    });
  }

  static async logTurn(callId: string, turn: AddTranscriptInput) {
    return this.addTranscriptTurn(callId, turn);
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
      contactId?: string;
      direction?: CallDirection | string;
      status?: CallStatus | string;
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
        transcripts: {
          orderBy: { timestampMs: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  static async list(
    workspaceId: string,
    options?: {
      agentId?: string;
      phoneNumberId?: string;
      contactId?: string;
      direction?: CallDirection | string;
      status?: CallStatus | string;
      limit?: number;
      offset?: number;
    }
  ) {
    return this.listCalls(workspaceId, options);
  }
}
