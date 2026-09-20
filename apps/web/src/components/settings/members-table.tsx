'use client';

import React, { useState } from 'react';
import { Button } from '@talkie/ui';

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface MembersTableProps {
  members: Member[];
  onRefresh: () => void;
}

export function MembersTable({ members, onRefresh }: MembersTableProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/settings/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to invite team member');
      }

      setEmail('');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Member Box */}
      <form onSubmit={handleInvite} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white">Invite Team Member</h3>
        <p className="text-xs text-zinc-400">Add collaborators to manage AI agents, phone numbers, and view call transcripts.</p>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Invite Member'}
          </Button>
        </div>
      </form>

      {/* Members List */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-base font-bold text-white mb-4">Workspace Members ({members.length})</h3>

        <div className="divide-y divide-zinc-800/60">
          {members.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/30">
                  {m.user?.name?.[0]?.toUpperCase() || m.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {m.user?.name || m.user?.email}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{m.user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
