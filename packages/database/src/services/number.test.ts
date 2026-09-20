import { describe, it, expect } from 'vitest';
import { NumberService } from './number.service';

describe('Phone Number Service Layer', () => {
  it('should expose all required NumberService static methods', () => {
    expect(typeof NumberService.provision).toBe('function');
    expect(typeof NumberService.getById).toBe('function');
    expect(typeof NumberService.getByPhoneNumber).toBe('function');
    expect(typeof NumberService.list).toBe('function');
    expect(typeof NumberService.attachToAgent).toBe('function');
    expect(typeof NumberService.release).toBe('function');
  });
});
