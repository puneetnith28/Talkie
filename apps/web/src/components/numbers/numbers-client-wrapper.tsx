'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@talkie/ui';
import { Phone, Plus, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { NumbersTable } from './numbers-table';
import { ProvisionModal } from './provision-modal';

interface NumbersClientWrapperProps {
  initialNumbers: any[];
  agents: any[];
}

export function NumbersClientWrapper({ initialNumbers, agents }: NumbersClientWrapperProps) {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);

  const handleNumberProvisioned = (newNumber: any) => {
    setNumbers((prev) => [newNumber, ...prev]);
  };

  const activeCount = numbers.filter((n) => n.status === 'active').length;
  const assignedCount = numbers.filter((n) => n.agentId != null).length;

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Phone Numbers</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {numbers.length} Active
            </Badge>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Provision, assign, and manage virtual E.164 telephony endpoints for inbound & outbound AI traffic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsProvisionOpen(true)}
            variant="primary"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Get a Phone Number</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Active</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Phone className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Assigned to Agents</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{assignedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Carrier Tier</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <span>Tier 1 Direct</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Numbers Table */}
      <NumbersTable initialNumbers={numbers} agents={agents} />

      {/* Provision Modal */}
      <ProvisionModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onSuccess={handleNumberProvisioned}
        agents={agents}
      />
    </div>
  );
}
