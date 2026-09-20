'use client';

import { useEffect } from 'react';

export type WorkspaceEventType =
  | 'workspace:invalidated'
  | 'agents:updated'
  | 'numbers:updated'
  | 'calls:updated'
  | 'messages:updated'
  | 'contacts:updated'
  | 'webhooks:updated'
  | 'billing:updated';

const CHANNEL_NAME = 'talkie_workspace_sync';

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    if (!broadcastChannel) {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    }
    return broadcastChannel;
  }
  return null;
}

export function emitWorkspaceEvent(type: WorkspaceEventType, payload?: any) {
  if (typeof window === 'undefined') return;

  // 1. Dispatch custom event locally in current window
  const event = new CustomEvent(`talkie:${type}`, { detail: payload });
  window.dispatchEvent(event);

  // 2. Broadcast to other tabs / windows
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ type, payload });
  }
}

export function useWorkspaceEventListener(
  type: WorkspaceEventType | WorkspaceEventType[],
  callback: (payload?: any) => void
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eventTypes = Array.isArray(type) ? type : [type];

    const localListeners = eventTypes.map((t) => {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent;
        callback(customEvent.detail);
      };
      window.addEventListener(`talkie:${t}`, handler);
      return { eventName: `talkie:${t}`, handler };
    });

    const channel = getBroadcastChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && eventTypes.includes(event.data.type)) {
        callback(event.data.payload);
      }
    };

    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }

    return () => {
      localListeners.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
      if (channel) {
        channel.removeEventListener('message', handleBroadcast);
      }
    };
  }, [type, callback]);
}
