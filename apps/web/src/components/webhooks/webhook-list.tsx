'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Badge, TableSkeleton, EmptyState } from '@talkie/ui';
import {
  Webhook,
  Plus,
  Send,
  Eye,
  EyeOff,
  Copy,
  Check,
  Activity,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { WebhookModal } from './webhook-modal';
import { DeliveryLogsModal } from './delivery-logs-modal';

interface WebhookRecord {
  id: string;
  workspaceId: string;
  url: string;
  secret: string;
  status: string;
  eventsJson?: string;
  createdAt: string;
  deliveries?: any[];
  _count?: { deliveries: number };
}

interface WebhookListProps {
  initialWebhooks?: WebhookRecord[];
}

export function WebhookList({ initialWebhooks = [] }: WebhookListProps) {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>(initialWebhooks);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<Record<string, { status: number; latency: number; success: boolean } | null>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookRecord | null>(null);
  const [selectedLogsWebhook, setSelectedLogsWebhook] = useState<WebhookRecord | null>(null);

  const fetchWebhooks = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/v1/webhooks');
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setWebhooks(json.data);
      }
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

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
    setTestFeedback((prev) => ({ ...prev, [webhookId]: null }));

    try {
      const res = await fetch(`/api/v1/webhooks/${webhookId}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Test delivery failed');
      }

      const attempt = data.data?.attempt;
      setTestFeedback((prev) => ({
        ...prev,
        [webhookId]: {
          status: attempt?.statusCode || 200,
          latency: attempt?.latencyMs || 42,
          success: attempt?.status === 'success' || (attempt?.statusCode >= 200 && attempt?.statusCode < 300),
        },
      }));

      // Refresh list to update delivery count
      fetchWebhooks();
    } catch (err: any) {
      setTestFeedback((prev) => ({
        ...prev,
        [webhookId]: { status: 500, latency: 0, success: false },
      }));
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

  const handleSaved = (saved: WebhookRecord) => {
    setWebhooks((prev) => {
      const exists = prev.find((w) => w.id === saved.id);
      if (exists) return prev.map((w) => (w.id === saved.id ? saved : w));
      return [saved, ...prev];
    });
  };

  const handleViewLogs = async (webhook: WebhookRecord) => {
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
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs font-mono">
            {webhooks.length} Active Endpoints
          </Badge>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HMAC-SHA256 Signatures Enabled</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchWebhooks(true)}
            disabled={refreshing}
            className="h-9 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingWebhook(null);
              setIsCreateOpen(true);
            }}
            className="h-9 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Endpoint</span>
          </Button>
        </div>
      </div>

      {/* Webhooks Card / Skeleton / Empty State */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={<Webhook className="w-6 h-6 text-emerald-400" />}
            title="No webhook endpoints configured"
            description="Configure HTTPS callback endpoints to subscribe to real-time telephony, call transcript, and SMS lifecycle events."
            action={{
              label: 'Add First Endpoint',
              onClick: () => {
                setEditingWebhook(null);
                setIsCreateOpen(true);
              },
              icon: <Plus className="w-3.5 h-3.5 mr-1.5" />,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Endpoint Destination</th>
                  <th className="py-3 px-4">Signing Secret</th>
                  <th className="py-3 px-4">Event Subscriptions</th>
                  <th className="py-3 px-4">Status & Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {webhooks.map((wh) => {
                  const isRevealed = !!revealedSecrets[wh.id];
                  const events: string[] = JSON.parse(wh.eventsJson || '["*"]');
                  const feedback = testFeedback[wh.id];
                  const deliveriesCount = wh._count?.deliveries ?? wh.deliveries?.length ?? 0;

                  return (
                    <tr key={wh.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-semibold text-white max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Webhook className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{wh.url}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 font-mono text-[11px]">
                            {isRevealed ? wh.secret : '••••••••••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleSecret(wh.id)}
                            className="text-neutral-500 hover:text-white p-0.5"
                            title={isRevealed ? 'Hide secret' : 'Show secret'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(wh.secret, wh.id)}
                            className="text-neutral-500 hover:text-white p-0.5"
                            title="Copy secret"
                          >
                            {copiedId === wh.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
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
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={wh.status === 'active' ? 'success' : 'neutral'}
                            className="text-[10px] uppercase font-mono"
                          >
                            {wh.status}
                          </Badge>
                          {feedback && (
                            <span
                              className={`text-[10px] font-mono flex items-center gap-1 ${
                                feedback.success ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {feedback.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {feedback.status} ({feedback.latency}ms)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendTest(wh.id)}
                            disabled={testingId === wh.id}
                            className="h-7 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10"
                            title="Send Test Event"
                          >
                            <Send className={`w-3.5 h-3.5 mr-1 ${testingId === wh.id ? 'animate-pulse' : ''}`} />
                            <span>{testingId === wh.id ? 'Testing...' : 'Test'}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLogs(wh)}
                            className="h-7 px-2 text-xs text-neutral-400 hover:text-white"
                            title="View Delivery Logs"
                          >
                            <Activity className="w-3.5 h-3.5 mr-1" />
                            <span>Logs ({deliveriesCount})</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingWebhook(wh);
                              setIsCreateOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
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
