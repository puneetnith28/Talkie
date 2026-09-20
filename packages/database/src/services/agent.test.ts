import { describe, it, expect } from 'vitest';
import { AgentService } from './agent.service';

describe('Agent Service Layer', () => {
  it('should expose all required AgentService static methods', () => {
    expect(typeof AgentService.create).toBe('function');
    expect(typeof AgentService.getById).toBe('function');
    expect(typeof AgentService.list).toBe('function');
    expect(typeof AgentService.update).toBe('function');
    expect(typeof AgentService.delete).toBe('function');
    expect(typeof AgentService.clone).toBe('function');
  });
});
