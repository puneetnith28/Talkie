'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@talkie/ui';
import { Webhook, Plus, Send, Eye, EyeOff, Copy, Check, Activity, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { WebhookModal } from './webhook-modal';
import { DeliveryLogsModal } from './delivery-logs-modal';

interface WebhookListProps {
  initialWebhooks: any[];
}

export function WebhookList({ initialWebhooks }: WebhookListProps) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any | null>(null);
  const [selectedLogsWebhook, setSelectedLogsWebhook] = useState<any | null>(null);

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTest = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      const res = await fetch(`/api/v1/webhooks/${webhookId}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Test delivery failed');
      alert(`Test event dispatched successfully! Status: ${data.data?.attempt?.statusCode || 200}`);
    } catch (err: any) {
      alert(`Test delivery failed: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    try {
      const res = await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete webhook');
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSaved = (saved: any) => {
    setWebhooks((prev) => {
      const exists = prev.find((w) => w.id === saved.id);
      if (exists) return prev.map((w) => (w.id === saved.id ? saved : w));
      return [saved, ...prev];
    });
  };

  const handleViewLogs = async (webhook: any) => {
    try {
      const res = await fetch(`/api/v1/webhooks/${webhook.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedLogsWebhook(data.data);
      } else {
        setSelectedLogsWebhook(webhook);
      }
    } catch {
      setSelectedLogsWebhook(webhook);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-400 font-mono">
          Configured Webhooks: {webhooks.length}
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingWebhook(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Endpoint</span>
        </Button>
      </div>

      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {webhooks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 mx-auto">
              <Webhook className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No webhook endpoints configured</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add a webhook destination to receive HTTP callbacks for calls, messages, and transcripts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Endpoint URL</th>
                  <th className="py-3 px-4">Signing Secret</th>
                  <th className="py-3 px-4">Subscribed Events</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {webhooks.map((wh) => {
                  const isRevealed = !!revealedSecrets[wh.id];
                  const events: string[] = JSON.parse(wh.eventsJson || '["*"]');

                  return (
                    <tr key={wh.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-white max-w-xs truncate">
                        {wh.url}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">
                            {isRevealed ? wh.secret : '••••••••••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleSecret(wh.id)}
                            className="text-neutral-500 hover:text-white"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(wh.secret, wh.id)}
                            className="text-neutral-500 hover:text-white"
                          >
                            {copiedId === wh.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {events.map((e) => (
                            <Badge key={e} variant="neutral" className="text-[9px] font-mono px-1.5 py-0">
                              {e}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={wh.status === 'active' ? 'success' : 'neutral'}
                          className="text-[10px] uppercase font-mono"
                        >
                          {wh.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            onClick={() => handleSendTest(wh.id)}
                            disabled={testingId === wh.id}
                            className="h-7 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10"
                            title="Send Test Event"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            <span>{testingId === wh.id ? 'Sending...' : 'Test'}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleViewLogs(wh)}
                            className="h-7 px-2 text-xs text-neutral-400 hover:text-white"
                            title="View Delivery Logs"
                          >
                            <Activity className="w-3.5 h-3.5 mr-1" />
                            <span>Logs</span>
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(wh.id)}
                            className="h-7 w-7 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <WebhookModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSaved}
        existingWebhook={editingWebhook}
      />

      <DeliveryLogsModal
        isOpen={!!selectedLogsWebhook}
        onClose={() => setSelectedLogsWebhook(null)}
        webhook={selectedLogsWebhook}
      />
    </div>
  );
}
