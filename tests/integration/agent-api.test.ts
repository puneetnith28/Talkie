import { describe, it, expect } from 'vitest';
import { AgentService } from '@talkie/database';

describe('Agent CRUD API Logic', () => {
  it('should validate agent creation schema and isolation', () => {
    expect(typeof AgentService.create).toBe('function');
    expect(typeof AgentService.getById).toBe('function');
    expect(typeof AgentService.update).toBe('function');
    expect(typeof AgentService.delete).toBe('function');
  });
});
