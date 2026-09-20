import { describe, it, expect } from 'vitest';
import { WebhookService } from './webhook.service';

describe('Webhook Service Layer', () => {
  it('should expose all required WebhookService static methods', () => {
    expect(typeof WebhookService.createWebhook).toBe('function');
    expect(typeof WebhookService.getWebhookById).toBe('function');
    expect(typeof WebhookService.listWebhooks).toBe('function');
    expect(typeof WebhookService.updateWebhook).toBe('function');
    expect(typeof WebhookService.deleteWebhook).toBe('function');
    expect(typeof WebhookService.recordDelivery).toBe('function');
    expect(typeof WebhookService.getWebhookDeliveries).toBe('function');
  });
});
