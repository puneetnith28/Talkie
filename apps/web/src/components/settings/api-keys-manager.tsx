'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { Key, Plus, Copy, Check, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';

interface ApiKeysManagerProps {
  initialKeys: any[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [keyName, setKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    setLoading(true);

    try {
      const res = await fetch('/api/v1/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to generate key');

      setNewlyCreatedKey(data.data.rawKey);
      setKeys((prev) => [data.data, ...prev]);
      setKeyName('');
    } catch (err: any) {
      alert(err.message || 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access immediately.')) return;

    try {
      const res = await fetch(`/api/v1/settings/api-keys?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke key');
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert('Revoke failed');
    }
  };

  const copyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Create New Key Section */}
      <Card className="p-6 bg-[#0a0c10] border-white/[0.08] space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Create API Key</h3>
          <p className="text-xs text-neutral-400 mt-1">
            API keys allow authenticated access to the Talkie REST API v1, CLI, and SDKs.
          </p>
        </div>

        {newlyCreatedKey && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Save your key now — it will never be displayed again!</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={newlyCreatedKey}
                className="font-mono text-xs bg-black/60 border-white/[0.08] text-white select-all"
              />
              <Button
                variant="primary"
                onClick={() => copyKey(newlyCreatedKey)}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5 shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-3">
          <Input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key Description (e.g. Production Backend)"
            className="text-xs bg-black/40 border-white/[0.08]"
          />
          <Button
            variant="primary"
            type="submit"
            disabled={!keyName || loading}
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Key</span>
          </Button>
        </form>
      </Card>

      {/* Existing Keys Table */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {keys.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No active API keys found. Generate a key to begin making authenticated requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Key Hint</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4 text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{k.keyHint}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleRevoke(k.id)}
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
