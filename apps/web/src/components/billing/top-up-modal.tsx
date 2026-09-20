'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@talkie/ui';
import { CreditCard, CheckCircle2, DollarSign, Sparkles, Loader2 } from 'lucide-react';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const amount = customCents ? Math.round(parseFloat(customCents) * 100) : selectedCents;

    if (!amount || amount < 500) {
      setError('Minimum top-up amount is $5.00 (500 cents)');
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
        throw new Error(data.error?.message || 'Failed to process checkout');
      }

      setSuccessMessage(`Successfully added $${(amount / 100).toFixed(2)} to your account balance!`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Add Account Balance</h2>
              <p className="text-xs text-neutral-400">Instant credit refill for voice pipelines and numbers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-white transition text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-white">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preset grid */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">Select Amount</label>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`relative py-3 px-2 rounded-xl text-center font-semibold text-xs border transition ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.08] text-neutral-300 hover:border-white/[0.2] hover:bg-white/[0.05]'
                      }`}
                    >
                      {preset.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-wider bg-emerald-500 text-black px-1.5 py-0.2 rounded-full font-bold">
                          Popular
                        </span>
                      )}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Or enter custom amount ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  placeholder="e.g. 50.00"
                  value={customCents}
                  onChange={(e) => setCustomCents(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCheckout}
                disabled={loading}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
