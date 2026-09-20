import { describe, it, expect, vi } from 'vitest';
import { emitWorkspaceEvent } from './event-bus';

describe('Optimistic & Event Synchronization Suite (Step 30)', () => {
  it('should dispatch custom workspace event on window without throwing', () => {
    let receivedPayload: any = null;
    const handler = (e: any) => {
      receivedPayload = e.detail;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('talkie:agents:updated', handler);
      emitWorkspaceEvent('agents:updated', { agentId: 'ag_123', status: 'active' });

      expect(receivedPayload).toEqual({ agentId: 'ag_123', status: 'active' });
      window.removeEventListener('talkie:agents:updated', handler);
    } else {
      expect(typeof emitWorkspaceEvent).toBe('function');
    }
  });

  it('should support multiple workspace event types', () => {
    const events = ['workspace:invalidated', 'calls:updated', 'billing:updated'] as const;
    events.forEach((evt) => {
      expect(() => emitWorkspaceEvent(evt, { test: true })).not.toThrow();
    });
  });
});
