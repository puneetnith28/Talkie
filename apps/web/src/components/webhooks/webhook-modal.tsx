'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { Webhook, Loader2, AlertCircle, Check } from 'lucide-react';

const AVAILABLE_EVENTS = [
  { id: '*', label: 'All Events (*)' },
  { id: 'call.started', label: 'Call Started' },
  { id: 'call.ended', label: 'Call Ended' },
  { id: 'call.transcript', label: 'Call Transcript Turn' },
  { id: 'message.received', label: 'Message Received (Inbound)' },
  { id: 'message.sent', label: 'Message Sent (Outbound)' },
  { id: 'number.provisioned', label: 'Number Provisioned' },
];

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (webhook: any) => void;
  existingWebhook?: any;
}

export function WebhookModal({
  isOpen,
  onClose,
  onSuccess,
  existingWebhook,
}: WebhookModalProps) {
  const [url, setUrl] = useState(existingWebhook?.url || '');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    existingWebhook ? JSON.parse(existingWebhook.eventsJson || '["*"]') : ['*']
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleEvent = (eventId: string) => {
    if (eventId === '*') {
      setSelectedEvents(['*']);
      return;
    }
    const withoutAll = selectedEvents.filter((e) => e !== '*');
    if (withoutAll.includes(eventId)) {
      const next = withoutAll.filter((e) => e !== eventId);
      setSelectedEvents(next.length === 0 ? ['*'] : next);
    } else {
      setSelectedEvents([...withoutAll, eventId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = existingWebhook
        ? `/api/v1/webhooks/${existingWebhook.id}`
        : '/api/v1/webhooks';
      const method = existingWebhook ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          events: selectedEvents,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to save webhook');

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Webhook className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {existingWebhook ? 'Edit Webhook' : 'Add Webhook Endpoint'}
              </h3>
              <p className="text-xs text-neutral-400">Receive real-time HTTP events with HMAC signing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-sm font-medium">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Endpoint URL <span className="text-emerald-400">*</span>
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/talkie"
              required
              type="url"
              className="bg-black/40 border-white/[0.08] text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Subscribed Events</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {AVAILABLE_EVENTS.map((evt) => {
                const isChecked = selectedEvents.includes(evt.id);
                return (
                  <div
                    key={evt.id}
                    onClick={() => toggleEvent(evt.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/[0.2]'
                    }`}
                  >
                    <span className="font-mono text-[11px] truncate">{evt.label}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !url}
              className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{existingWebhook ? 'Save Changes' : 'Create Webhook'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
