import { prisma } from '../client';
import type { ContactIdentity } from '@talkie/types';

export interface CreateContactInput {
  phoneNumber: string; // E.164 format
  name?: string;
  email?: string;
  whatsappId?: string;
  telegramId?: string;
  telegramUsername?: string;
  avatarUrl?: string;
  company?: string;
  notes?: string;
  identities?: ContactIdentity[];
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  whatsappId?: string;
  telegramId?: string;
  telegramUsername?: string;
  avatarUrl?: string;
  company?: string;
  notes?: string;
  identities?: ContactIdentity[];
}

export class ContactService {
  /**
   * Create a new contact scoped to a workspace
   */
  static async create(workspaceId: string, input: CreateContactInput) {
    const identitiesJson = input.identities ? JSON.stringify(input.identities) : '[]';

    return prisma.contact.create({
      data: {
        workspaceId,
        phoneNumber: input.phoneNumber,
        name: input.name ?? 'Unknown Contact',
        email: input.email,
        whatsappId: input.whatsappId,
        telegramId: input.telegramId,
        telegramUsername: input.telegramUsername,
        avatarUrl: input.avatarUrl,
        company: input.company,
        notes: input.notes,
        identitiesJson,
      },
    });
  }

  /**
   * Get contact by ID with tenant check
   */
  static async getById(workspaceId: string, contactId: string) {
    return prisma.contact.findFirst({
      where: {
        id: contactId,
        workspaceId,
      },
      include: {
        conversations: {
          take: 10,
          orderBy: { lastMessageAt: 'desc' },
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  /**
   * Find contact by phone number within workspace
   */
  static async getByPhoneNumber(workspaceId: string, phoneNumber: string) {
    return prisma.contact.findFirst({
      where: {
        workspaceId,
        phoneNumber,
      },
    });
  }

  /**
   * Find contact by WhatsApp ID within workspace
   */
  static async getByWhatsAppId(workspaceId: string, whatsappId: string) {
    return prisma.contact.findFirst({
      where: {
        workspaceId,
        whatsappId,
      },
    });
  }

  /**
   * Find contact by Telegram ID or Username within workspace
   */
  static async getByTelegramId(workspaceId: string, telegramId: string) {
    return prisma.contact.findFirst({
      where: {
        workspaceId,
        OR: [{ telegramId }, { telegramUsername: telegramId }],
      },
    });
  }

  /**
   * Omnichannel Identity Resolution: Resolve or upsert contact by any channel identifier
   */
  static async resolveOmnichannelContact(
    workspaceId: string,
    params: {
      channel: 'sms' | 'mms' | 'whatsapp' | 'telegram';
      identifier: string; // phone number, whatsappId, or telegramId
      name?: string;
      username?: string;
    }
  ) {
    let contact = null;

    if (params.channel === 'whatsapp') {
      contact = await this.getByWhatsAppId(workspaceId, params.identifier);
      if (!contact && params.identifier.startsWith('+')) {
        contact = await this.getByPhoneNumber(workspaceId, params.identifier);
      }
    } else if (params.channel === 'telegram') {
      contact = await this.getByTelegramId(workspaceId, params.identifier);
    } else {
      contact = await this.getByPhoneNumber(workspaceId, params.identifier);
    }

    if (contact) {
      // Update missing channel identity onto existing contact
      const updates: UpdateContactInput = {};
      if (params.channel === 'whatsapp' && !contact.whatsappId) {
        updates.whatsappId = params.identifier;
      }
      if (params.channel === 'telegram') {
        if (!contact.telegramId) updates.telegramId = params.identifier;
        if (params.username && !contact.telegramUsername) updates.telegramUsername = params.username;
      }
      if (params.name && contact.name === 'Unknown Contact') {
        updates.name = params.name;
      }

      if (Object.keys(updates).length > 0) {
        return this.update(workspaceId, contact.id, updates);
      }
      return contact;
    }

    // Create new omnichannel contact
    return this.create(workspaceId, {
      phoneNumber: params.channel === 'telegram' ? `tg_${params.identifier}` : params.identifier,
      whatsappId: params.channel === 'whatsapp' ? params.identifier : undefined,
      telegramId: params.channel === 'telegram' ? params.identifier : undefined,
      telegramUsername: params.channel === 'telegram' ? params.username : undefined,
      name: params.name || (params.username ? `@${params.username}` : `Contact (${params.identifier})`),
      identities: [
        {
          type: params.channel === 'sms' || params.channel === 'mms' ? 'phone' : (params.channel as any),
          value: params.identifier,
          primary: true,
        },
      ],
    });
  }

  /**
   * Upsert contact by phone number within workspace (deduplication)
   */
  static async upsertByPhoneNumber(workspaceId: string, input: CreateContactInput) {
    const existing = await this.getByPhoneNumber(workspaceId, input.phoneNumber);
    if (existing) {
      return this.update(workspaceId, existing.id, {
        name: input.name ?? existing.name ?? undefined,
        email: input.email ?? existing.email ?? undefined,
        whatsappId: input.whatsappId ?? existing.whatsappId ?? undefined,
        telegramId: input.telegramId ?? existing.telegramId ?? undefined,
        telegramUsername: input.telegramUsername ?? existing.telegramUsername ?? undefined,
        company: input.company ?? existing.company ?? undefined,
        notes: input.notes ?? existing.notes ?? undefined,
      });
    }

    return this.create(workspaceId, input);
  }

  /**
   * List contacts with search query, channel filter, and pagination
   */
  static async list(
    workspaceId: string,
    options?: {
      query?: string;
      channel?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = {
      workspaceId,
    };

    if (options?.query) {
      where.OR = [
        { name: { contains: options.query } },
        { phoneNumber: { contains: options.query } },
        { email: { contains: options.query } },
        { company: { contains: options.query } },
        { whatsappId: { contains: options.query } },
        { telegramUsername: { contains: options.query } },
      ];
    }

    if (options?.channel === 'whatsapp') {
      where.whatsappId = { not: null };
    } else if (options?.channel === 'telegram') {
      where.telegramId = { not: null };
    }

    return prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        conversations: {
          take: 1,
          orderBy: { lastMessageAt: 'desc' },
        },
      },
    });
  }

  /**
   * Update contact details
   */
  static async update(workspaceId: string, contactId: string, input: UpdateContactInput) {
    const existing = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Contact not found or access denied: ${contactId}`);
    }

    return prisma.contact.update({
      where: { id: contactId },
      data: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phoneNumber,
        whatsappId: input.whatsappId,
        telegramId: input.telegramId,
        telegramUsername: input.telegramUsername,
        avatarUrl: input.avatarUrl,
        company: input.company,
        notes: input.notes,
        ...(input.identities ? { identitiesJson: JSON.stringify(input.identities) } : {}),
      },
    });
  }

  /**
   * Delete contact
   */
  static async delete(workspaceId: string, contactId: string) {
    const existing = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Contact not found or access denied: ${contactId}`);
    }

    return prisma.contact.delete({
      where: { id: contactId },
    });
  }
}
