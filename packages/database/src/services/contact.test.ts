import { describe, it, expect } from 'vitest';
import { ContactService } from './contact.service';

describe('Contact Service Layer', () => {
  it('should expose all required ContactService static methods', () => {
    expect(typeof ContactService.create).toBe('function');
    expect(typeof ContactService.getById).toBe('function');
    expect(typeof ContactService.getByPhoneNumber).toBe('function');
    expect(typeof ContactService.upsertByPhoneNumber).toBe('function');
    expect(typeof ContactService.list).toBe('function');
    expect(typeof ContactService.update).toBe('function');
    expect(typeof ContactService.delete).toBe('function');
  });
});
