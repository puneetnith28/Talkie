import { prisma } from '../client';
import type { VoiceMode } from '@talkie/types';

export interface CreateAgentInput {
  name: string;
  description?: string;
  voiceMode?: VoiceMode;
  webhookUrl?: string;
  systemPrompt?: string;
  beginMessage?: string;
  voice?: string;
  language?: string;
  voiceSpeed?: number;
  interruptionSensitivity?: number;
  enableBackchannel?: boolean;
  denoisingMode?: string;
  maxSilenceMs?: number;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  voiceMode?: VoiceMode;
  webhookUrl?: string;
  systemPrompt?: string;
  beginMessage?: string;
  voice?: string;
  language?: string;
  voiceSpeed?: number;
  interruptionSensitivity?: number;
  enableBackchannel?: boolean;
  denoisingMode?: string;
  maxSilenceMs?: number;
  status?: string;
}

export class AgentService {
  /**
   * Create a new agent scoped to a workspace
   */
  static async create(workspaceId: string, input: CreateAgentInput) {
    return prisma.agent.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description,
        voiceMode: input.voiceMode ?? 'hosted',
        webhookUrl: input.webhookUrl,
        systemPrompt: input.systemPrompt ?? 'You are a helpful AI phone agent.',
        beginMessage: input.beginMessage ?? 'Hello! How can I assist you today?',
        voice: input.voice ?? 'aura-asteria-en',
        language: input.language ?? 'en-US',
        voiceSpeed: input.voiceSpeed ?? 1.0,
        interruptionSensitivity: input.interruptionSensitivity ?? 0.5,
        enableBackchannel: input.enableBackchannel ?? true,
        denoisingMode: input.denoisingMode ?? 'standard',
        maxSilenceMs: input.maxSilenceMs ?? 2000,
        status: 'active',
      },
    });
  }

  /**
   * Get an agent by ID ensuring tenant isolation
   */
  static async getById(workspaceId: string, agentId: string) {
    return prisma.agent.findFirst({
      where: {
        id: agentId,
        workspaceId,
      },
      include: {
        phoneNumbers: true,
      },
    });
  }

  /**
   * List agents for a workspace with optional status filter
   */
  static async list(workspaceId: string, options?: { status?: string; limit?: number; offset?: number }) {
    return prisma.agent.findMany({
      where: {
        workspaceId,
        ...(options?.status ? { status: options.status } : {}),
      },
      include: {
        phoneNumbers: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Update agent configuration with tenant check
   */
  static async update(workspaceId: string, agentId: string, input: UpdateAgentInput) {
    // Enforce workspaceId in update query
    const existing = await prisma.agent.findFirst({
      where: { id: agentId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Agent not found or access denied: ${agentId}`);
    }

    return prisma.agent.update({
      where: { id: agentId },
      data: input,
    });
  }

  /**
   * Delete an agent with tenant check
   */
  static async delete(workspaceId: string, agentId: string) {
    const existing = await prisma.agent.findFirst({
      where: { id: agentId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Agent not found or access denied: ${agentId}`);
    }

    return prisma.agent.delete({
      where: { id: agentId },
    });
  }

  /**
   * Clone an existing agent within workspace
   */
  static async clone(workspaceId: string, agentId: string, newName?: string) {
    const original = await this.getById(workspaceId, agentId);
    if (!original) {
      throw new Error(`Agent not found or access denied: ${agentId}`);
    }

    return this.create(workspaceId, {
      name: newName ?? `${original.name} (Copy)`,
      description: original.description ?? undefined,
      voiceMode: original.voiceMode as VoiceMode,
      webhookUrl: original.webhookUrl ?? undefined,
      systemPrompt: original.systemPrompt,
      beginMessage: original.beginMessage ?? undefined,
      voice: original.voice,
      language: original.language,
      voiceSpeed: original.voiceSpeed,
      interruptionSensitivity: original.interruptionSensitivity,
      enableBackchannel: original.enableBackchannel,
      denoisingMode: original.denoisingMode,
      maxSilenceMs: original.maxSilenceMs,
    });
  }
}
