import { prisma } from '../client';

export interface CreateContactInput {
  phoneNumber: string; // E.164 format
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
}

export class ContactService {
  /**
   * Create a new contact scoped to a workspace
   */
  static async create(workspaceId: string, input: CreateContactInput) {
    return prisma.contact.create({
      data: {
        workspaceId,
        phoneNumber: input.phoneNumber,
        name: input.name ?? 'Unknown Contact',
        email: input.email,
        company: input.company,
        notes: input.notes,
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
          take: 5,
          orderBy: { lastMessageAt: 'desc' },
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
   * Upsert contact by phone number within workspace (deduplication)
   */
  static async upsertByPhoneNumber(workspaceId: string, input: CreateContactInput) {
    const existing = await this.getByPhoneNumber(workspaceId, input.phoneNumber);
    if (existing) {
      return this.update(workspaceId, existing.id, {
        name: input.name ?? existing.name ?? undefined,
        email: input.email ?? existing.email ?? undefined,
        company: input.company ?? existing.company ?? undefined,
        notes: input.notes ?? existing.notes ?? undefined,
      });
    }

    return this.create(workspaceId, input);
  }

  /**
   * List contacts with search query and pagination
   */
  static async list(
    workspaceId: string,
    options?: {
      query?: string;
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
      ];
    }

    return prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
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
        company: input.company,
        notes: input.notes,
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
