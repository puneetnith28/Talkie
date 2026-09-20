'use client';

import React, { useState, useEffect } from 'react';
import { MembersTable } from '@/components/settings/members-table';
import { AuditLogsTable } from '@/components/settings/audit-logs-table';
import { Button } from '@talkie/ui';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'audit'>('general');
  const [members, setMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('Talkie Workspace');

  const fetchData = async () => {
    try {
      const [memRes, auditRes] = await Promise.all([
        fetch('/api/v1/settings/members'),
        fetch('/api/v1/settings/audit'),
      ]);

      const [memJson, auditJson] = await Promise.all([
        memRes.json(),
        auditRes.json(),
      ]);

      if (memJson.success) setMembers(memJson.data);
      if (auditJson.success) setAuditLogs(auditJson.data);
    } catch (err) {
      console.error('Failed to load settings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage workspace organization, team member permissions, and compliance audit trail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'general'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'members'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Team Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'audit'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono">Loading settings...</div>
      ) : (
        <>
          {activeTab === 'general' && (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-2xl">
              <h3 className="text-base font-bold text-white">Workspace Information</h3>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <Button variant="primary" onClick={() => alert('Workspace settings saved.')}>
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'members' && (
            <MembersTable members={members} onRefresh={fetchData} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsTable logs={auditLogs} />
          )}
        </>
      )}
    </div>
  );
}
