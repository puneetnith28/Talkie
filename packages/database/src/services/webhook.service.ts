import crypto from 'node:crypto';
import { prisma } from '../client';
import type { WebhookEventName } from '@talkie/types';

export interface CreateWebhookInput {
  url: string;
  events?: WebhookEventName[] | string[];
  status?: 'active' | 'paused' | 'disabled';
}

export interface UpdateWebhookInput {
  url?: string;
  events?: WebhookEventName[] | string[];
  status?: 'active' | 'paused' | 'disabled';
}

export interface RecordDeliveryInput {
  event: string;
  payload: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  latencyMs?: number;
  attempt?: number;
  status?: 'success' | 'retrying' | 'failed';
  nextRetryAt?: Date;
}

export class WebhookService {
  /**
   * Create a new webhook subscription with a secure random signing secret
   */
  static async createWebhook(workspaceId: string, input: CreateWebhookInput) {
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const eventsJson = JSON.stringify(input.events ?? ['*']);

    return prisma.webhook.create({
      data: {
        workspaceId,
        url: input.url,
        secret,
        status: input.status ?? 'active',
        eventsJson,
      },
    });
  }

  /**
   * Get webhook by ID with tenant check
   */
  static async getWebhookById(workspaceId: string, webhookId: string) {
    return prisma.webhook.findFirst({
      where: {
        id: webhookId,
        workspaceId,
      },
      include: {
        deliveries: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * List all webhooks for a workspace
   */
  static async listWebhooks(workspaceId: string) {
    return prisma.webhook.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update webhook endpoint or event subscriptions
   */
  static async updateWebhook(workspaceId: string, webhookId: string, input: UpdateWebhookInput) {
    const existing = await prisma.webhook.findFirst({
      where: { id: webhookId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Webhook not found or access denied: ${webhookId}`);
    }

    return prisma.webhook.update({
      where: { id: webhookId },
      data: {
        url: input.url,
        status: input.status,
        eventsJson: input.events ? JSON.stringify(input.events) : undefined,
      },
    });
  }

  /**
   * Delete a webhook subscription
   */
  static async deleteWebhook(workspaceId: string, webhookId: string) {
    const existing = await prisma.webhook.findFirst({
      where: { id: webhookId, workspaceId },
    });

    if (!existing) {
      throw new Error(`Webhook not found or access denied: ${webhookId}`);
    }

    return prisma.webhook.delete({
      where: { id: webhookId },
    });
  }

  /**
   * Record a webhook delivery attempt
   */
  static async recordDelivery(webhookId: string, input: RecordDeliveryInput) {
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event: input.event,
        payloadJson: JSON.stringify(input.payload),
        statusCode: input.statusCode,
        responseBody: input.responseBody,
        latencyMs: input.latencyMs,
        attempt: input.attempt ?? 1,
        status: input.status ?? 'success',
        nextRetryAt: input.nextRetryAt,
      },
    });

    await prisma.webhook.update({
      where: { id: webhookId },
      data: { lastDeliveryAt: new Date() },
    });

    return delivery;
  }

  /**
   * Get delivery logs for a webhook
   */
  static async getWebhookDeliveries(webhookId: string, options?: { limit?: number; offset?: number }) {
    return prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }
}
