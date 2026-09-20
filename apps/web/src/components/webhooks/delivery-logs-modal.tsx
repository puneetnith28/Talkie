'use client';

import React from 'react';
import { Card, Button, Badge } from '@talkie/ui';
import { Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DeliveryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: any;
}

export function DeliveryLogsModal({ isOpen, onClose, webhook }: DeliveryLogsModalProps) {
  if (!isOpen || !webhook) return null;

  const deliveries = webhook.deliveries || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Delivery Logs</h3>
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
              No delivery attempts recorded for this webhook yet. Click &quot;Send Test&quot; to test.
            </div>
          ) : (
            deliveries.map((del: any) => {
              const isSuccess = del.status === 'success' || (del.statusCode >= 200 && del.statusCode < 300);

              return (
                <div
                  key={del.id}
                  className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isSuccess ? 'success' : 'destructive'}
                        className="text-[10px] font-mono uppercase"
                      >
                        {del.statusCode || del.status}
                      </Badge>
                      <span className="font-mono text-white font-semibold">{del.event}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                      <span>{del.latencyMs ? `${del.latencyMs}ms` : ''}</span>
                      <span>•</span>
                      <span>{new Date(del.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {del.responseBody && (
                    <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.04] font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-24">
                      {del.responseBody}
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
