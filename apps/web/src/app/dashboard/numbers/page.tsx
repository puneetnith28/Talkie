'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, EmptyState, TableSkeleton } from '@talkie/ui';
import { Phone, Plus, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { NumbersTable } from '@/components/numbers/numbers-table';
import { ProvisionModal } from '@/components/numbers/provision-modal';

export default function NumbersPage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [numRes, agentRes] = await Promise.all([
        fetch('/api/v1/numbers'),
        fetch('/api/v1/agents'),
      ]);

      const [numData, agentData] = await Promise.all([
        numRes.json(),
        agentRes.json(),
      ]);

      if (numData.success && Array.isArray(numData.data)) {
        setNumbers(numData.data);
      }
      if (agentData.success && Array.isArray(agentData.data)) {
        setAgents(agentData.data);
      }
    } catch (err) {
      console.error('Failed to load numbers or agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNumberProvisioned = (newNumber: any) => {
    setNumbers((prev) => [newNumber, ...prev]);
  };

  const activeCount = numbers.filter((n) => n.status === 'active').length;
  const assignedCount = numbers.filter((n) => n.agentId != null).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Phone Numbers</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {numbers.length} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Provision, assign, and manage virtual E.164 telephony endpoints for inbound & outbound AI traffic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh numbers"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Button
            onClick={() => setIsProvisionOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Get a Phone Number</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Active</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Phone className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Assigned to Agents</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{assignedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
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

      {/* Numbers Table or Empty State */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : numbers.length === 0 ? (
        <EmptyState
          icon={<Phone className="w-6 h-6 text-emerald-400" />}
          title="No phone numbers claimed yet"
          description="Claim a dedicated virtual number to connect callers directly with your conversational voice agents and send SMS automations."
          action={{
            label: 'Get a Phone Number',
            onClick: () => setIsProvisionOpen(true),
            icon: <Plus className="w-3.5 h-3.5" />,
          }}
        />
      ) : (
        <NumbersTable initialNumbers={numbers} agents={agents} />
      )}

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
