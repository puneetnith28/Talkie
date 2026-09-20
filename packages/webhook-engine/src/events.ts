import type { WebhookEvent, WebhookEventName } from './types';

export class WebhookEventBuilder {
  /**
   * Constructs a typed, standardized webhook event wrapper
   */
  static createEvent<T extends Record<string, any>>(
    workspaceId: string,
    event: WebhookEventName | string,
    data: T
  ): WebhookEvent<T> {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event,
      timestamp: new Date().toISOString(),
      workspaceId,
      data,
    };
  }

  /**
   * Serializes event to deterministic JSON
   */
  static serialize(event: WebhookEvent): string {
    return JSON.stringify(event);
  }
}
