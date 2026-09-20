'use client';

import React, { useState, useEffect } from 'react';
import { MembersTable } from '@/components/settings/members-table';
import { AuditLogsTable } from '@/components/settings/audit-logs-table';
import { ChannelsHub } from '@/components/settings/channels-hub';
import { Button, Card, Badge, Input } from '@talkie/ui';
import { Building2, MessageSquare, Users, ShieldAlert, AlertTriangle, Check, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'channels' | 'members' | 'audit'>('general');
  const [members, setMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('Talkie Workspace');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);

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

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Workspace Settings</h1>
            <Badge variant="neutral" className="text-xs font-mono">
              Production Tier
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage organization details, channel integrations, team access roles, and audit trails.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/[0.08] gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'general'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'channels'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Channels Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'members'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-neutral-500 font-mono text-xs">Loading workspace settings...</div>
      ) : (
        <>
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <Card className="p-6 bg-[#0a0c10] border-white/[0.08] space-y-5 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white">Organization Profile</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Configure public identifying details for this workspace tenant.
                  </p>
                </div>

                <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Workspace Name</label>
                    <Input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="bg-black/60 border-white/[0.08] text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Primary Voice Timezone</label>
                    <Input
                      readOnly
                      value="UTC (Coordinated Universal Time)"
                      className="bg-black/40 border-white/[0.06] text-neutral-400 font-mono"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="submit"
                      className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                    >
                      Save Changes
                    </Button>
                    {savedSuccess && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" />
                        Settings saved successfully
                      </span>
                    )}
                  </div>
                </form>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-[#0a0c10] border-red-500/20 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">Danger Zone</h3>
                </div>

                <p className="text-xs text-neutral-400">
                  Deleting a workspace permanently releases all carrier phone numbers, revokes active API keys, and halts voice streaming sessions.
                </p>

                <Button
                  variant="outline"
                  onClick={() => setShowDangerModal(true)}
                  className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  Delete Workspace
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'channels' && <ChannelsHub />}

          {activeTab === 'members' && (
            <MembersTable members={members} onRefresh={fetchData} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsTable logs={auditLogs} />
          )}
        </>
      )}

      {/* Danger Modal */}
      {showDangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-[#0a0c10] border-red-500/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Workspace</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you absolutely sure you want to delete <span className="text-white font-semibold">{workspaceName}</span>? This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDangerModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  alert('Deletion protection is active for root workspace.');
                  setShowDangerModal(false);
                }}
                className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                Confirm Deletion
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
