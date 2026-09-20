'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { Phone, Search, Trash2, Bot, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface NumbersTableProps {
  initialNumbers: any[];
  agents: any[];
}

export function NumbersTable({ initialNumbers, agents }: NumbersTableProps) {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredNumbers = numbers.filter((n) => {
    if (!searchQuery) return true;
    return (
      n.phoneNumber.includes(searchQuery) ||
      n.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.areaCode?.includes(searchQuery)
    );
  });

  const handleAgentChange = async (numberId: string, agentId: string) => {
    setUpdatingId(numberId);
    setError(null);

    try {
      const res = await fetch(`/api/v1/numbers/${numberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agentId || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to update assigned agent');

      setNumbers((prev) =>
        prev.map((n) => (n.id === numberId ? { ...n, agentId: agentId || null, agent: agents.find((a) => a.id === agentId) } : n))
      );
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRelease = async (numberId: string, phoneNumber: string) => {
    if (!confirm(`Are you sure you want to release ${phoneNumber}? This number will be returned to the pool.`)) {
      return;
    }

    setUpdatingId(numberId);
    setError(null);

    try {
      const res = await fetch(`/api/v1/numbers/${numberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to release number');

      setNumbers((prev) => prev.filter((n) => n.id !== numberId));
    } catch (err: any) {
      setError(err.message || 'Release failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search numbers or agents..."
            className="pl-9 h-9 text-xs bg-[#0a0c10] border-white/[0.08]"
          />
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Total Numbers: {filteredNumbers.length}
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card border-white/[0.08] overflow-hidden">
        {filteredNumbers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <Phone className="w-8 h-8 mx-auto text-neutral-600" />
            <p>No phone numbers match your search.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Phone Number</th>
                    <th className="px-6 py-3.5">Assigned Agent</th>
                    <th className="px-6 py-3.5">Capabilities</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredNumbers.map((num) => (
                    <tr key={num.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-white flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{num.phoneNumber}</span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={num.agentId || ''}
                          disabled={updatingId === num.id}
                          onChange={(e) => handleAgentChange(num.id, e.target.value)}
                          className="px-2.5 py-1 rounded bg-[#0a0c10] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50 min-w-44"
                        >
                          <option value="">-- Unassigned --</option>
                          {agents.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Badge variant="outline">Voice</Badge>
                          <Badge variant="outline">SMS</Badge>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={num.status === 'active' ? 'success' : 'neutral'}
                          className="text-[10px] uppercase font-mono"
                        >
                          {num.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === num.id}
                          onClick={() => handleRelease(num.id, num.phoneNumber)}
                          className="text-xs hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Release
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {filteredNumbers.map((num) => (
                <div key={num.id} className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span>{num.phoneNumber}</span>
                    </div>

                    <Badge
                      variant={num.status === 'active' ? 'success' : 'neutral'}
                      className="text-[10px] uppercase font-mono"
                    >
                      {num.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      Assigned Agent
                    </label>
                    <select
                      value={num.agentId || ''}
                      disabled={updatingId === num.id}
                      onChange={(e) => handleAgentChange(num.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">-- Unassigned --</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <Badge variant="outline">Voice</Badge>
                      <Badge variant="outline">SMS</Badge>
                      {num.areaCode && (
                        <span className="text-neutral-500 text-[11px]">({num.areaCode})</span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingId === num.id}
                      onClick={() => handleRelease(num.id, num.phoneNumber)}
                      className="h-8 px-3 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Release
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
