'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge } from '@talkie/ui';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { MessagesContainer } from '@/components/messages/messages-container';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [convRes, numRes] = await Promise.all([
        fetch('/api/v1/conversations'),
        fetch('/api/v1/numbers'),
      ]);

      const [convJson, numJson] = await Promise.all([
        convRes.json(),
        numRes.json(),
      ]);

      if (convJson.success && Array.isArray(convJson.data)) {
        setConversations(convJson.data);
      }
      if (numJson.success && Array.isArray(numJson.data)) {
        setNumbers(numJson.data);
      }
    } catch (err) {
      console.error('Failed to load messaging data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Messages & Conversations</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {conversations.length} Active Threads
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Omnichannel messaging inbox with real-time SMS, MMS, and WhatsApp customer threads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh threads"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <MessagesContainer initialConversations={conversations} phoneNumbers={numbers} />
    </div>
  );
}
