'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@talkie/ui';
import { Activity, RefreshCw, ChevronDown, ChevronRight, Copy, Check, Send } from 'lucide-react';

interface DeliveryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: any;
  onRefreshWebhook?: () => void;
}

export function DeliveryLogsModal({ isOpen, onClose, webhook, onRefreshWebhook }: DeliveryLogsModalProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>(webhook?.deliveries || []);

  // Update deliveries when webhook prop changes
  React.useEffect(() => {
    if (webhook?.deliveries) {
      setDeliveries(webhook.deliveries);
    }
  }, [webhook]);

  if (!isOpen || !webhook) return null;

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const res = await fetch(`/api/v1/webhooks/deliveries/${deliveryId}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.delivery) {
        setDeliveries((prev) =>
          prev.map((d) => (d.id === deliveryId ? data.data.delivery : d))
        );
        onRefreshWebhook?.();
      } else {
        alert(data.error?.message || 'Retry failed');
      }
    } catch (err: any) {
      alert(err.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const copyPayload = (payload: string, id: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[88vh] bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Delivery Logs & Payload Inspector</h3>
              <p className="text-xs text-neutral-400 font-mono truncate max-w-md">{webhook.url}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-sm font-medium">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {deliveries.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500">
              No delivery attempts recorded for this webhook yet. Click &quot;Send Test&quot; to verify connectivity.
            </div>
          ) : (
            deliveries.map((del: any) => {
              const isSuccess = del.status === 'success' || (del.statusCode >= 200 && del.statusCode < 300);
              const isExpanded = expandedId === del.id;
              const isRetrying = retryingId === del.id;

              return (
                <div
                  key={del.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden text-xs transition-colors"
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : del.id)}
                        className="text-neutral-400 hover:text-white p-0.5"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <Badge
                        variant={isSuccess ? 'success' : 'destructive'}
                        className="text-[10px] font-mono uppercase shrink-0"
                      >
                        {del.statusCode || del.status}
                      </Badge>

                      <span className="font-mono text-white font-semibold truncate">{del.event}</span>

                      {del.attempt > 1 && (
                        <Badge variant="neutral" className="text-[9px] font-mono">
                          Attempt #{del.attempt}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                        {del.latencyMs !== null && del.latencyMs !== undefined && (
                          <span>{del.latencyMs}ms</span>
                        )}
                        <span>•</span>
                        <span>{new Date(del.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(del.id)}
                        disabled={isRetrying}
                        className="h-7 px-2 text-[11px] text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                        title="Retry webhook delivery"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Payload & Response Details */}
                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-white/[0.04] bg-black/40 space-y-2.5">
                      {del.payloadJson && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-neutral-400 mb-1">
                            <span>Request Payload JSON</span>
                            <button
                              onClick={() => copyPayload(del.payloadJson, `payload_${del.id}`)}
                              className="text-neutral-400 hover:text-white flex items-center gap-1 lowercase font-mono"
                            >
                              {copiedId === `payload_${del.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>copy payload</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-2.5 rounded-lg bg-black/80 border border-white/[0.06] font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-36">
                            {(() => {
                              try {
                                return JSON.stringify(JSON.parse(del.payloadJson), null, 2);
                              } catch {
                                return del.payloadJson;
                              }
                            })()}
                          </pre>
                        </div>
                      )}

                      {del.responseBody && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-neutral-400 mb-1">
                            Response Body ({del.statusCode})
                          </div>
                          <pre className="p-2.5 rounded-lg bg-black/80 border border-white/[0.06] font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-28">
                            {del.responseBody}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
