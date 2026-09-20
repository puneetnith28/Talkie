import { describe, it, expect } from 'vitest';
import { CallService } from './call.service';

describe('Call & Transcript Service Layer', () => {
  it('should expose all required CallService static methods', () => {
    expect(typeof CallService.createCall).toBe('function');
    expect(typeof CallService.getCallById).toBe('function');
    expect(typeof CallService.updateCall).toBe('function');
    expect(typeof CallService.addTranscriptTurn).toBe('function');
    expect(typeof CallService.getCallTranscripts).toBe('function');
    expect(typeof CallService.listCalls).toBe('function');
  });
});
