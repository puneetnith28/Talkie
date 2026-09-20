import { describe, it, expect } from 'vitest';
import { UsageService } from './usage.service';
import { AuditService } from './audit.service';
import { IdempotencyService } from './idempotency.service';

describe('Usage, Audit & Idempotency Infrastructure', () => {
  it('should expose all required UsageService static methods', () => {
    expect(typeof UsageService.recordUsage).toBe('function');
    expect(typeof UsageService.getUsageSummary).toBe('function');
  });

  it('should expose all required AuditService static methods', () => {
    expect(typeof AuditService.log).toBe('function');
    expect(typeof AuditService.list).toBe('function');
  });

  it('should expose all required IdempotencyService static methods', () => {
    expect(typeof IdempotencyService.get).toBe('function');
    expect(typeof IdempotencyService.set).toBe('function');
  });
});
