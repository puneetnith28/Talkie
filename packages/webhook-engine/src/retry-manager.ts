export interface WebhookRetryPolicy {
  maxAttempts: number;
  backoffScheduleSeconds: number[]; // e.g. [60, 300, 900, 3600, 21600]
}

export const DEFAULT_WEBHOOK_RETRY_POLICY: WebhookRetryPolicy = {
  maxAttempts: 5,
  backoffScheduleSeconds: [60, 300, 900, 3600, 21600],
};

export class WebhookRetryManager {
  private policy: WebhookRetryPolicy;

  constructor(policy: Partial<WebhookRetryPolicy> = {}) {
    this.policy = { ...DEFAULT_WEBHOOK_RETRY_POLICY, ...policy };
  }

  /**
   * Determine whether a status code or error is retryable
   */
  isRetryable(statusCode?: number): boolean {
    if (!statusCode) return true; // Network error / timeout
    if (statusCode >= 500 && statusCode <= 599) return true; // Server errors
    if (statusCode === 429) return true; // Rate limited
    return false; // 4xx client errors (e.g. 404, 401) are not retryable
  }

  /**
   * Calculate next retry date or mark dead-letter
   */
  getNextRetry(attempt: number, statusCode?: number): { shouldRetry: boolean; nextRetryAt?: Date; isDeadLetter: boolean } {
    if (!this.isRetryable(statusCode)) {
      return { shouldRetry: false, isDeadLetter: true };
    }

    if (attempt >= this.policy.maxAttempts) {
      return { shouldRetry: false, isDeadLetter: true };
    }

    const scheduleIndex = Math.min(attempt - 1, this.policy.backoffScheduleSeconds.length - 1);
    const delaySeconds = this.policy.backoffScheduleSeconds[scheduleIndex] || 60;
    const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);

    return {
      shouldRetry: true,
      nextRetryAt,
      isDeadLetter: false,
    };
  }
}
