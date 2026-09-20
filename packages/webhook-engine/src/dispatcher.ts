import { WebhookSigner } from './signature';
import { WebhookEventBuilder } from './events';
import { WebhookRetryManager } from './retry-manager';
import type { WebhookConfig, WebhookEvent, WebhookDeliveryAttempt } from './types';

export interface DispatchOptions {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export class WebhookDispatcher {
  private retryManager: WebhookRetryManager;
  private fetchFn: typeof fetch;

  constructor(options: DispatchOptions = {}) {
    this.retryManager = new WebhookRetryManager();
    this.fetchFn = options.fetchFn || globalThis.fetch;
  }

  /**
   * Dispatch an event to a specific webhook endpoint
   */
  async dispatch(
    webhook: WebhookConfig,
    event: WebhookEvent,
    attemptNumber: number = 1
  ): Promise<WebhookDeliveryAttempt> {
    const payload = WebhookEventBuilder.serialize(event);
    const headers = WebhookSigner.generateHeaders(payload, webhook.secret, event.event);

    const startTime = Date.now();
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await this.fetchFn(webhook.url, {
        method: 'POST',
        headers: headers as unknown as Record<string, string>,
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const latencyMs = Date.now() - startTime;
      const responseBody = await response.text().catch(() => '');

      const isSuccess = response.status >= 200 && response.status < 300;
      const retryInfo = isSuccess
        ? { shouldRetry: false, isDeadLetter: false }
        : this.retryManager.getNextRetry(attemptNumber, response.status);

      return {
        id: attemptId,
        webhookId: webhook.id,
        event: event.event,
        url: webhook.url,
        statusCode: response.status,
        responseBody: responseBody.slice(0, 1000), // Max 1KB response log
        latencyMs,
        attempt: attemptNumber,
        status: isSuccess
          ? 'success'
          : retryInfo.shouldRetry
            ? 'retrying'
            : retryInfo.isDeadLetter
              ? 'dead-letter'
              : 'failed',
        nextRetryAt: retryInfo.nextRetryAt,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const retryInfo = this.retryManager.getNextRetry(attemptNumber);

      return {
        id: attemptId,
        webhookId: webhook.id,
        event: event.event,
        url: webhook.url,
        latencyMs,
        attempt: attemptNumber,
        status: retryInfo.shouldRetry ? 'retrying' : 'dead-letter',
        nextRetryAt: retryInfo.nextRetryAt,
        error: err.message || 'Network error / Timeout',
      };
    }
  }
}
