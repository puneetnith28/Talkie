import { prisma } from '../client';
import type { PhoneNumberCapabilities, PhoneNumberStatus } from '@talkie/types';

export interface ProvisionNumberInput {
  phoneNumber: string; // E.164 format: e.g., +14155550142
  provider?: string;
  providerNumberId?: string;
  country?: string;
  countryCode?: string;
  areaCode?: string;
  capabilities?: PhoneNumberCapabilities;
  agentId?: string;
}

export class NumberService {
  /**
   * Provision a phone number for a workspace
   */
  static async provision(workspaceId: string, input: ProvisionNumberInput) {
    const capabilitiesJson = JSON.stringify(
      input.capabilities ?? { voice: true, sms: true, mms: false }
    );

    return prisma.phoneNumber.create({
      data: {
        workspaceId,
        phoneNumber: input.phoneNumber,
        provider: input.provider ?? 'mock',
        providerNumberId: input.providerNumberId,
        country: input.country ?? 'US',
        countryCode: input.countryCode ?? '+1',
        areaCode: input.areaCode ?? '415',
        capabilitiesJson,
        status: 'active',
        agentId: input.agentId,
      },
      include: {
        agent: true,
      },
    });
  }

  /**
   * Get a phone number by ID with tenant check
   */
  static async getById(workspaceId: string, numberId: string) {
    return prisma.phoneNumber.findFirst({
      where: {
        id: numberId,
        workspaceId,
      },
      include: {
        agent: true,
      },
    });
  }

  /**
   * Lookup a phone number by E.164 string (used for inbound routing)
   */
  static async getByPhoneNumber(phoneNumber: string) {
    return prisma.phoneNumber.findUnique({
      where: { phoneNumber },
      include: {
        agent: true,
        workspace: true,
      },
    });
  }

  /**
   * List phone numbers for a workspace
   */
  static async list(
    workspaceId: string,
    options?: {
      status?: PhoneNumberStatus;
      agentId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return prisma.phoneNumber.findMany({
      where: {
        workspaceId,
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.agentId ? { agentId: options.agentId } : {}),
      },
      include: {
        agent: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Attach or detach a phone number to/from an agent
   */
  static async attachToAgent(workspaceId: string, numberId: string, agentId: string | null) {
    const existing = await this.getById(workspaceId, numberId);
    if (!existing) {
      throw new Error(`Phone number not found or access denied: ${numberId}`);
    }

    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, workspaceId },
      });
      if (!agent) {
        throw new Error(`Agent not found or access denied: ${agentId}`);
      }
    }

    return prisma.phoneNumber.update({
      where: { id: numberId },
      data: { agentId },
      include: { agent: true },
    });
  }

  /**
   * Release a phone number
   */
  static async release(workspaceId: string, numberId: string) {
    const existing = await this.getById(workspaceId, numberId);
    if (!existing) {
      throw new Error(`Phone number not found or access denied: ${numberId}`);
    }

    return prisma.phoneNumber.update({
      where: { id: numberId },
      data: {
        status: 'released',
        agentId: null,
      },
    });
  }
}
