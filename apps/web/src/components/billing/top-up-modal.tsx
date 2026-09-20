'use client';

import React, { useState } from 'react';
import { Button } from '@talkie/ui';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [
  { label: '$10.00', cents: 1000 },
  { label: '$25.00', cents: 2500, popular: true },
  { label: '$50.00', cents: 5000 },
  { label: '$100.00', cents: 10000 },
  { label: '$250.00', cents: 25000 },
];

export function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
  const [selectedCents, setSelectedCents] = useState<number>(2500);
  const [customCents, setCustomCents] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const amount = customCents ? Math.round(parseFloat(customCents) * 100) : selectedCents;

    if (!amount || amount < 500) {
      setError('Minimum top-up amount is $5.00');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: amount }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create checkout session');
      }

      // Simulate payment completion in dev/mock
      alert(`Top-up successful! Added $${(amount / 100).toFixed(2)} to workspace balance.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Add Account Balance</h2>
            <p className="text-xs text-zinc-400 mt-1">Refill credits for AI voice calls, SMS, and phone numbers</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Preset grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESET_AMOUNTS.map((preset) => {
            const isSelected = selectedCents === preset.cents && !customCents;
            return (
              <button
                key={preset.cents}
                type="button"
                onClick={() => {
                  setSelectedCents(preset.cents);
                  setCustomCents('');
                }}
                className={`relative py-3 px-2 rounded-xl text-center font-semibold text-sm border transition ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {preset.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wider bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    Popular
                  </span>
                )}
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Or enter custom amount ($ USD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
            <input
              type="number"
              min="5"
              step="5"
              placeholder="e.g. 50.00"
              value={customCents}
              onChange={(e) => setCustomCents(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
