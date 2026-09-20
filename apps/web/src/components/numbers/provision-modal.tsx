'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge, Dialog } from '@talkie/ui';
import { Phone, Search, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import type { AvailableNumber } from '@talkie/telephony';

interface ProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNumber: any) => void;
  agents?: any[];
}

export function ProvisionModal({ isOpen, onClose, onSuccess, agents = [] }: ProvisionModalProps) {
  const [areaCode, setAreaCode] = useState('415');
  const [country, setCountry] = useState('US');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError(null);
    setResults([]);
    setSelectedNumber(null);

    try {
      const res = await fetch(`/api/v1/numbers/search?areaCode=${areaCode}&country=${country}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Search failed');
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search numbers');
    } finally {
      setSearching(false);
    }
  };

  const handleProvision = async () => {
    if (!selectedNumber) return;
    setProvisioning(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: selectedNumber.phoneNumber,
          country: selectedNumber.country,
          areaCode: selectedNumber.areaCode,
          agentId: selectedAgentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Provisioning failed');

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to provision number');
    } finally {
      setProvisioning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Provision Phone Number</h2>
              <p className="text-xs text-neutral-400">Search instant E.164 carrier inventory and attach to agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-sm font-medium"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Search Controls */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-neutral-400">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="US">United States (+1)</option>
              <option value="CA">Canada (+1)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-neutral-400">Area Code</label>
            <Input
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              placeholder="e.g. 415, 212, 416"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={searching}
              className="w-full h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Numbers</span>
            </Button>
          </div>
        </form>

        {/* Search Results List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Available Numbers</span>
            <span className="font-mono text-neutral-500">$1.50 / month</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {results.length === 0 && !searching && (
              <div className="p-8 text-center text-xs text-neutral-500 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                Enter an area code and click Search to query available inventory.
              </div>
            )}

            {results.map((num) => {
              const isSelected = selectedNumber?.phoneNumber === num.phoneNumber;
              return (
                <div
                  key={num.phoneNumber}
                  onClick={() => setSelectedNumber(num)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-white/[0.2]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="font-mono text-sm font-semibold">{num.friendlyName}</span>
                      <span className="text-xs text-neutral-400 ml-2 font-mono">{num.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">{num.region}, {num.country}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Voice+SMS
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Assignment Selection */}
        {selectedNumber && (
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <label className="text-xs font-medium text-neutral-300">Assign to Agent (Optional)</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Unassigned (Route to default workspace) --</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.voice})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={provisioning}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleProvision}
            disabled={!selectedNumber || provisioning}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-1.5"
          >
            {provisioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{provisioning ? 'Provisioning...' : 'Provision Number ($1.50/mo)'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
