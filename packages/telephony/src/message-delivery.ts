import type { MessageDeliveryStatus, DeliveryReceipt } from './messaging-interface';

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 10000,
};

export class MessageDeliveryManager {
  private retryPolicy: RetryPolicy;

  constructor(policy: Partial<RetryPolicy> = {}) {
    this.retryPolicy = { ...DEFAULT_RETRY_POLICY, ...policy };
  }

  /**
   * Calculates exponential backoff delay with jitter
   */
  calculateBackoff(attempt: number): number {
    const baseDelay = Math.min(
      this.retryPolicy.initialDelayMs * Math.pow(this.retryPolicy.backoffFactor, attempt),
      this.retryPolicy.maxDelayMs
    );
    // Add 20% jitter
    const jitter = baseDelay * 0.2 * Math.random();
    return Math.floor(baseDelay + jitter);
  }

  /**
   * Determines if a message error is transient/retryable
   */
  isRetryableError(errorCode?: string): boolean {
    if (!errorCode) return true;
    const nonRetryable = ['INVALID_NUMBER', 'UNALLOCATED_NUMBER', 'BLACKLISTED', 'CARRIER_BLOCKED'];
    return !nonRetryable.includes(errorCode.toUpperCase());
  }

  /**
   * Process and evaluate delivery receipt
   */
  evaluateReceipt(receipt: DeliveryReceipt): {
    finalStatus: MessageDeliveryStatus;
    shouldRetry: boolean;
  } {
    if (receipt.status === 'delivered') {
      return { finalStatus: 'delivered', shouldRetry: false };
    }

    if (receipt.status === 'failed' || receipt.status === 'undelivered') {
      const retryable = this.isRetryableError(receipt.errorCode);
      return {
        finalStatus: retryable ? 'failed' : 'undelivered',
        shouldRetry: retryable,
      };
    }

    return { finalStatus: receipt.status, shouldRetry: false };
  }
}
