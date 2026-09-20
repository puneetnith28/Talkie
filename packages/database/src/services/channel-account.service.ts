import { prisma } from '../client';
import type { ChannelAccountType } from '@talkie/types';

export interface CreateChannelAccountInput {
  type: ChannelAccountType | string;
  name: string;
  identifier: string;
  credentials: Record<string, any>;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateChannelAccountInput {
  name?: string;
  credentials?: Record<string, any>;
  status?: 'active' | 'disconnected' | 'error';
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export class ChannelAccountService {
  /**
   * Connect or upsert a channel account (WhatsApp Business, Telegram Bot, etc.)
   */
  static async upsertAccount(workspaceId: string, input: CreateChannelAccountInput) {
    const credentialsJson = JSON.stringify(input.credentials);
    const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

    return prisma.channelAccount.upsert({
      where: {
        workspaceId_type_identifier: {
          workspaceId,
          type: input.type,
          identifier: input.identifier,
        },
      },
      create: {
        workspaceId,
        type: input.type,
        name: input.name,
        identifier: input.identifier,
        credentialsJson,
        status: 'active',
        webhookUrl: input.webhookUrl,
        metadataJson,
      },
      update: {
        name: input.name,
        credentialsJson,
        status: 'active',
        webhookUrl: input.webhookUrl,
        metadataJson,
      },
    });
  }

  /**
   * List channel accounts for a workspace
   */
  static async listAccounts(workspaceId: string, type?: string) {
    const accounts = await prisma.channelAccount.findMany({
      where: {
        workspaceId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip sensitive secret values in listing
    return accounts.map((acc) => {
      let parsedCredentials = {};
      try {
        parsedCredentials = JSON.parse(acc.credentialsJson);
      } catch (err) {
        parsedCredentials = {};
      }

      // Mask sensitive fields
      const maskedCredentials: Record<string, any> = {};
      for (const [k, v] of Object.entries(parsedCredentials as Record<string, string>)) {
        if (typeof v === 'string' && v.length > 8) {
          maskedCredentials[k] = `${v.slice(0, 4)}...${v.slice(-4)}`;
        } else {
          maskedCredentials[k] = '***';
        }
      }

      return {
        ...acc,
        credentials: maskedCredentials,
      };
    });
  }

  /**
   * Find account by identifier (e.g. For incoming webhooks)
   */
  static async findByIdentifier(type: string, identifier: string) {
    return prisma.channelAccount.findFirst({
      where: {
        type,
        identifier,
        status: 'active',
      },
      include: {
        workspace: true,
      },
    });
  }

  /**
   * Get raw account with decrypted/full credentials for backend API dispatch
   */
  static async getAccountWithCredentials(workspaceId: string, accountId: string) {
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) return null;

    let credentials: Record<string, any> = {};
    try {
      credentials = JSON.parse(account.credentialsJson);
    } catch (err) {
      credentials = {};
    }

    return {
      ...account,
      credentials,
    };
  }

  /**
   * Disconnect or delete a channel account
   */
  static async disconnectAccount(workspaceId: string, accountId: string) {
    return prisma.channelAccount.update({
      where: { id: accountId, workspaceId },
      data: { status: 'disconnected' },
    });
  }
}
