import { prisma } from '../client';
import type { ChannelType, MessageDirection, MessageStatus } from '@talkie/types';

export interface FindOrCreateConversationInput {
  phoneNumberId?: string;
  contactId?: string;
  agentId?: string;
  channel?: ChannelType;
  externalThreadId?: string;
}

export interface CreateMessageInput {
  conversationId?: string;
  phoneNumberId?: string;
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
}

export class MessageService {
  /**
   * Find existing active conversation thread or create a new one
   */
  static async findOrCreateConversation(
    workspaceId: string,
    input: FindOrCreateConversationInput
  ) {
    if (input.contactId && input.phoneNumberId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          workspaceId,
          contactId: input.contactId,
          phoneNumberId: input.phoneNumberId,
          channel: input.channel ?? 'sms',
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
        contactId: input.contactId,
        agentId: input.agentId,
        channel: input.channel,
      });
      conversationId = conversation.id;
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          direction: input.direction,
          senderNumber: input.senderNumber,
          recipientNumber: input.recipientNumber,
          body: input.body,
          mediaJson: JSON.stringify(input.mediaUrls ?? []),
          providerMessageId: input.providerMessageId,
          status: input.status ?? 'sent',
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
   * List conversation threads for a workspace
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
        ...(options?.channel ? { channel: options.channel } : {}),
        ...(options?.agentId ? { agentId: options.agentId } : {}),
        ...(options?.contactId ? { contactId: options.contactId } : {}),
      },
      include: {
        contact: true,
        phoneNumber: true,
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
    });

    if (!conversation) {
      throw new Error(`Conversation not found or access denied: ${conversationId}`);
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: options?.limit ?? 100,
      skip: options?.offset ?? 0,
    });
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
