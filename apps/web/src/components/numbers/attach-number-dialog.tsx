'use client';

import React, { useState } from 'react';
import { Button, Card, Badge, Dialog } from '@talkie/ui';
import { Phone, Check, Loader2, AlertCircle } from 'lucide-react';

interface AttachNumberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  availableNumbers: any[];
  onAttached: (updatedNumber: any) => void;
}

export function AttachNumberDialog({
  isOpen,
  onClose,
  agentId,
  agentName,
  availableNumbers,
  onAttached,
}: AttachNumberDialogProps) {
  const [selectedNumberId, setSelectedNumberId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAttach = async () => {
    if (!selectedNumberId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/agents/${agentId}/numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberId: selectedNumberId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to attach phone number');

      onAttached(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Attach operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const unassignedNumbers = availableNumbers.filter((n) => n.agentId !== agentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Assign Phone Number</h3>
              <p className="text-xs text-neutral-400">Route inbound and outbound calls for {agentName}</p>
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

        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-300">Select Available Number</label>
          {unassignedNumbers.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-white/[0.1] text-center text-xs text-neutral-500">
              No numbers available in workspace. Provision a new number first.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {unassignedNumbers.map((n) => {
                const isSelected = selectedNumberId === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNumberId(n.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-sm font-semibold text-white">{n.phoneNumber}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {n.country} • Area Code {n.areaCode} {n.agent ? `(Currently: ${n.agent.name})` : '(Unassigned)'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAttach}
            disabled={!selectedNumberId || loading}
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Confirm Assignment</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
