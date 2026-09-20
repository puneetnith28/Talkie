import { prisma } from '../client';
import type { ChannelType, MessageDirection, MessageStatus } from '@talkie/types';

export interface FindOrCreateConversationInput {
  phoneNumberId?: string;
  channelAccountId?: string;
  contactId?: string;
  agentId?: string;
  channel?: ChannelType;
  externalThreadId?: string;
}

export interface CreateMessageInput {
  conversationId?: string;
  phoneNumberId?: string;
  channelAccountId?: string;
  contactId?: string;
  agentId?: string;
  channel?: ChannelType;
  direction: MessageDirection;
  senderNumber: string;
  recipientNumber: string;
  body: string;
  mediaUrls?: string[];
  providerMessageId?: string;
  status?: MessageStatus;
  metadata?: Record<string, any>;
}

export class MessageService {
  /**
   * Find existing active conversation thread or create a new one
   */
  static async findOrCreateConversation(
    workspaceId: string,
    input: FindOrCreateConversationInput
  ) {
    if (input.contactId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          workspaceId,
          contactId: input.contactId,
          channel: input.channel ?? 'sms',
          ...(input.phoneNumberId ? { phoneNumberId: input.phoneNumberId } : {}),
          ...(input.channelAccountId ? { channelAccountId: input.channelAccountId } : {}),
        },
      });

      if (existing) {
        return existing;
      }
    }

    return prisma.conversation.create({
      data: {
        workspaceId,
        phoneNumberId: input.phoneNumberId,
        channelAccountId: input.channelAccountId,
        contactId: input.contactId,
        agentId: input.agentId,
        channel: input.channel ?? 'sms',
        externalThreadId: input.externalThreadId,
        lastMessageAt: new Date(),
      },
    });
  }

  /**
   * Create and record a message within a conversation thread
   */
  static async createMessage(workspaceId: string, input: CreateMessageInput) {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const conversation = await this.findOrCreateConversation(workspaceId, {
        phoneNumberId: input.phoneNumberId,
        channelAccountId: input.channelAccountId,
        contactId: input.contactId,
        agentId: input.agentId,
        channel: input.channel,
      });
      conversationId = conversation.id;
    }

    const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;
    const channel = input.channel ?? 'sms';

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          direction: input.direction,
          channel,
          senderNumber: input.senderNumber,
          recipientNumber: input.recipientNumber,
          body: input.body,
          mediaJson: JSON.stringify(input.mediaUrls ?? []),
          providerMessageId: input.providerMessageId,
          status: input.status ?? 'sent',
          metadataJson,
          sentAt: new Date(),
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return created;
    });

    return message;
  }

  /**
   * List conversation threads for a workspace with channel and agent filters
   */
  static async listConversations(
    workspaceId: string,
    options?: {
      channel?: string;
      agentId?: string;
      contactId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return prisma.conversation.findMany({
      where: {
        workspaceId,
        ...(options?.channel && options.channel !== 'all' ? { channel: options.channel } : {}),
        ...(options?.agentId ? { agentId: options.agentId } : {}),
        ...(options?.contactId ? { contactId: options.contactId } : {}),
      },
      include: {
        contact: true,
        phoneNumber: true,
        channelAccount: true,
        agent: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Get all messages inside a conversation thread
   */
  static async getConversationMessages(
    workspaceId: string,
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        phoneNumber: true,
        channelAccount: true,
        agent: true,
      },
    });

    if (!conversation) {
      throw new Error(`Conversation not found or access denied: ${conversationId}`);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: options?.limit ?? 100,
      skip: options?.offset ?? 0,
    });

    return messages;
  }

  /**
   * Get full conversation thread with messages and metadata
   */
  static async getConversationWithMessages(
    workspaceId: string,
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        phoneNumber: true,
        channelAccount: true,
        agent: true,
      },
    });

    if (!conversation) {
      throw new Error(`Conversation not found or access denied: ${conversationId}`);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: options?.limit ?? 100,
      skip: options?.offset ?? 0,
    });

    return {
      conversation,
      messages,
    };
  }

  /**
   * Update delivery status of a message
   */
  static async updateStatus(messageId: string, status: MessageStatus) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }
}
