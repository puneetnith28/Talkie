import { EventEmitter } from 'events';

class RealtimePubSub {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  /**
   * Broadcast an event to workspace subscribers
   */
  publish(workspaceId: string, eventName: string, data: any) {
    this.emitter.emit(`workspace:${workspaceId}`, { eventName, data });
  }

  /**
   * Broadcast a real-time live transcript turn for an active call
   */
  publishCallTranscript(callId: string, turn: any) {
    this.emitter.emit(`call:${callId}:transcript`, turn);
  }

  /**
   * Subscribe to workspace events
   */
  subscribe(workspaceId: string, listener: (msg: { eventName: string; data: any }) => void) {
    const channel = `workspace:${workspaceId}`;
    this.emitter.on(channel, listener);
    return () => {
      this.emitter.off(channel, listener);
    };
  }

  /**
   * Subscribe to live call transcript turns
   */
  subscribeCallTranscript(callId: string, listener: (turn: any) => void) {
    const channel = `call:${callId}:transcript`;
    this.emitter.on(channel, listener);
    return () => {
      this.emitter.off(channel, listener);
    };
  }
}

export const realtimePubSub = new RealtimePubSub();
