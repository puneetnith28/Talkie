import { describe, it, expect } from 'vitest';
import { MessageService } from './message.service';

describe('Message Service Layer', () => {
  it('should expose all required MessageService static methods', () => {
    expect(typeof MessageService.findOrCreateConversation).toBe('function');
    expect(typeof MessageService.createMessage).toBe('function');
    expect(typeof MessageService.listConversations).toBe('function');
    expect(typeof MessageService.getConversationMessages).toBe('function');
    expect(typeof MessageService.updateStatus).toBe('function');
  });
});
