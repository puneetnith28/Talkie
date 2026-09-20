'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Input, Card, Badge, TableSkeleton, EmptyState } from '@talkie/ui';
import {
  PhoneCall,
  Search,
  Bot,
  FileText,
  Sparkles,
  RefreshCw,
  PhoneIncoming,
  PhoneOutgoing,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface CallRecord {
  id: string;
  workspaceId: string;
  agentId?: string | null;
  phoneNumberId?: string | null;
  providerCallId?: string | null;
  direction: string;
  fromNumber: string;
  toNumber: string;
  callerNumber?: string;
  calleeNumber?: string;
  status: string;
  durationSeconds: number;
  startedAt?: string | null;
  endedAt?: string | null;
  summary?: string | null;
  recordingUrl?: string | null;
  transcriptStatus: string;
  createdAt: string;
  agent?: { id: string; name: string; voice?: string } | null;
  phoneNumber?: { id: string; phoneNumber: string } | null;
  transcripts?: Array<{
    id: string;
    speaker: string;
    text: string;
    timestampMs: number;
    confidence: number;
  }>;
}

interface CallsTableProps {
  initialCalls?: CallRecord[];
}

export function CallsTable({ initialCalls = [] }: CallsTableProps) {
  const [calls, setCalls] = useState<CallRecord[]>(initialCalls);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [dispatchForm, setDispatchForm] = useState({
    agentId: '',
    from: '',
    to: '',
  });
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const fetchCalls = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (directionFilter !== 'all') params.set('direction', directionFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/v1/calls?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch call logs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCalls(json.data);
      }
    } catch (err) {
      console.error('Error loading calls:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, directionFilter, searchQuery]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  useEffect(() => {
    async function loadPrerequisites() {
      try {
        const [agentsRes, numbersRes] = await Promise.all([
          fetch('/api/v1/agents'),
          fetch('/api/v1/numbers'),
        ]);
        if (agentsRes.ok) {
          const agentsJson = await agentsRes.json();
          if (agentsJson.success && Array.isArray(agentsJson.data)) {
            setAvailableAgents(agentsJson.data);
            if (agentsJson.data.length > 0) {
              setDispatchForm((prev) => ({ ...prev, agentId: agentsJson.data[0].id }));
            }
          }
        }
        if (numbersRes.ok) {
          const numbersJson = await numbersRes.json();
          if (numbersJson.success && Array.isArray(numbersJson.data)) {
            setAvailableNumbers(numbersJson.data);
            if (numbersJson.data.length > 0) {
              setDispatchForm((prev) => ({ ...prev, from: numbersJson.data[0].phoneNumber }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dispatch prerequisites:', err);
      }
    }
    loadPrerequisites();
  }, []);

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.agentId || !dispatchForm.from || !dispatchForm.to) {
      setDispatchError('Please fill in all required fields.');
      return;
    }

    setIsDispatching(true);
    setDispatchError(null);
    try {
      const res = await fetch('/api/v1/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to initiate outbound call');
      }

      setIsDispatchModalOpen(false);
      setDispatchForm((prev) => ({ ...prev, to: '' }));
      fetchCalls(true);
    } catch (err: any) {
      setDispatchError(err.message || 'Error starting call');
    } finally {
      setIsDispatching(false);
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'neutral' => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in-progress':
      case 'in_progress':
        return 'default';
      case 'failed':
      case 'busy':
      case 'no_answer':
        return 'destructive';
      case 'queued':
      case 'ringing':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search number, agent, summary..."
              className="pl-9 h-9 text-xs bg-[#0a0c10] border-white/[0.08]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-lg bg-neutral-900/60 p-1 border border-white/[0.06] text-xs">
            {['all', 'in-progress', 'completed', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st === 'in-progress' ? 'Active' : st}
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center rounded-lg bg-neutral-900/60 p-1 border border-white/[0.06] text-xs">
            {['all', 'inbound', 'outbound'].map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  directionFilter === dir
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchCalls(true)}
            disabled={isRefreshing}
            className="h-9 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.06]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDispatchModalOpen(true)}
            className="h-9 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <PhoneOutgoing className="w-3.5 h-3.5 mr-1.5" />
            Dispatch Call
          </Button>
        </div>
      </div>

      {/* Main Table / Skeleton / Empty State */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : calls.length === 0 ? (
          <EmptyState
            icon={<PhoneCall className="w-6 h-6 text-emerald-400" />}
            title="No call logs found"
            description={
              searchQuery || statusFilter !== 'all' || directionFilter !== 'all'
                ? "No call sessions matched your filter criteria. Try resetting the filters."
                : "Real-time inbound and outbound telephone sessions will automatically populate here with audio transcripts."
            }
            action={
              searchQuery || statusFilter !== 'all' || directionFilter !== 'all'
                ? {
                    label: 'Reset Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDirectionFilter('all');
                    },
                  }
                : {
                    label: 'Dispatch Test Call',
                    onClick: () => setIsDispatchModalOpen(true),
                    icon: <PhoneOutgoing className="w-3.5 h-3.5 mr-1.5" />,
                  }
            }
          />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-4">Direction & Contact</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">AI Sentiment & Summary</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {calls.map((call) => {
                    const isOutbound = call.direction === 'outbound';
                    const callerDisplay = call.fromNumber || call.callerNumber || 'Unknown';
                    const calleeDisplay = call.toNumber || call.calleeNumber || 'Unknown';
                    const primaryDisplay = isOutbound ? calleeDisplay : callerDisplay;
                    const secondaryDisplay = isOutbound ? `From: ${callerDisplay}` : `To: ${calleeDisplay}`;

                    return (
                      <tr
                        key={call.id}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedCall(call)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                                isOutbound
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isOutbound ? (
                                <PhoneOutgoing className="w-4 h-4" />
                              ) : (
                                <PhoneIncoming className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white tracking-wide">
                                {primaryDisplay}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="uppercase text-neutral-400 font-semibold">{call.direction}</span>
                                <span>•</span>
                                <span>{secondaryDisplay}</span>
                                <span>•</span>
                                <span>{new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300">
                          {call.agent ? (
                            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                              <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{call.agent.name}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-500 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(call.status)}
                            className="text-[10px] uppercase font-mono tracking-wider"
                          >
                            {call.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {call.durationSeconds > 0 ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>
                                {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-neutral-400">
                          {call.summary ? (
                            <div className="flex items-center gap-1.5 truncate">
                              <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span className="truncate text-xs text-neutral-300">{call.summary}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-600 italic">No summary generated</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCall(call)}
                              className="h-7 px-2 text-xs text-neutral-400 hover:text-white"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              <span>Transcript</span>
                            </Button>
                            <Link href={`/dashboard/calls/${call.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {calls.map((call) => {
                const isOutbound = call.direction === 'outbound';
                const callerDisplay = call.fromNumber || call.callerNumber || 'Unknown';
                const calleeDisplay = call.toNumber || call.calleeNumber || 'Unknown';
                const primaryDisplay = isOutbound ? calleeDisplay : callerDisplay;
                const secondaryDisplay = isOutbound ? `From: ${callerDisplay}` : `To: ${calleeDisplay}`;

                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="p-4 space-y-3 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                            isOutbound
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOutbound ? (
                            <PhoneOutgoing className="w-4 h-4" />
                          ) : (
                            <PhoneIncoming className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white tracking-wide font-mono">
                            {primaryDisplay}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {secondaryDisplay}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={getStatusBadgeVariant(call.status)}
                        className="text-[10px] uppercase font-mono tracking-wider shrink-0"
                      >
                        {call.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1 border-t border-white/[0.04]">
                      {call.agent && (
                        <div className="flex items-center gap-1 text-blue-400 font-medium">
                          <Bot className="w-3.5 h-3.5" />
                          <span>{call.agent.name}</span>
                        </div>
                      )}
                      {call.durationSeconds > 0 && (
                        <div className="flex items-center gap-1 font-mono text-neutral-300">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>
                            {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                          </span>
                        </div>
                      )}
                      <span className="text-neutral-500 text-[10px] font-mono ml-auto">
                        {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {call.summary && (
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-xs text-neutral-300 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 text-[11px] leading-relaxed">{call.summary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCall(call)}
                        className="h-8 px-3 text-xs text-neutral-300 border-white/[0.1] hover:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Transcript
                      </Button>
                      <Link href={`/dashboard/calls/${call.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Transcript Preview Drawer / Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Call Intelligence & Transcripts</h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    ID: {selectedCall.id} • {selectedCall.fromNumber || selectedCall.callerNumber} → {selectedCall.toNumber || selectedCall.calleeNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-neutral-400 hover:text-white text-base font-medium px-2 py-1"
              >
                ✕
              </button>
            </div>

            {selectedCall.summary && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Conversation Summary</span>
                </div>
                <p className="text-xs text-neutral-200">{selectedCall.summary}</p>
              </div>
            )}

            {/* Transcript Turns */}
            <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-[40vh]">
              {(!selectedCall.transcripts || selectedCall.transcripts.length === 0) ? (
                <div className="text-center py-10 text-xs text-neutral-500">
                  No transcript turns recorded for this call yet.
                </div>
              ) : (
                selectedCall.transcripts.map((turn: any) => (
                  <div
                    key={turn.id}
                    className={`p-3 rounded-xl text-xs space-y-1 border ${
                      turn.speaker === 'agent'
                        ? 'bg-blue-500/10 border-blue-500/20 text-neutral-200'
                        : 'bg-white/[0.03] border-white/[0.08] text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[10px] uppercase text-neutral-400">
                      <span className={turn.speaker === 'agent' ? 'text-blue-400' : 'text-emerald-400'}>
                        {turn.speaker === 'agent' ? `🤖 Agent (${selectedCall.agent?.name || 'AI'})` : `👤 Caller`}
                      </span>
                      <span className="font-mono text-neutral-500">
                        {turn.timestampMs != null ? `+${(turn.timestampMs / 1000).toFixed(1)}s` : ''}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{turn.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <Link href={`/dashboard/calls/${selectedCall.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Full Transcript & Audio Playback
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSelectedCall(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Outbound Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PhoneOutgoing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Dispatch Outbound Call</h3>
                  <p className="text-xs text-neutral-400">Trigger AI voice session to any phone destination.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-neutral-400 hover:text-white text-base font-medium px-2 py-1"
              >
                ✕
              </button>
            </div>

            {dispatchError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {dispatchError}
              </div>
            )}

            <form onSubmit={handleStartCall} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Assigned AI Agent
                </label>
                <select
                  value={dispatchForm.agentId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, agentId: e.target.value })}
                  className="w-full h-9 rounded-lg bg-neutral-900 border border-white/[0.08] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="" disabled>Select an agent...</option>
                  {availableAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.voiceMode || 'hosted'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Caller ID (From Number)
                </label>
                {availableNumbers.length > 0 ? (
                  <select
                    value={dispatchForm.from}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, from: e.target.value })}
                    className="w-full h-9 rounded-lg bg-neutral-900 border border-white/[0.08] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    {availableNumbers.map((num) => (
                      <option key={num.id} value={num.phoneNumber}>
                        {num.phoneNumber} ({num.provider})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={dispatchForm.from}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, from: e.target.value })}
                    placeholder="+14155550142"
                    className="h-9 text-xs bg-neutral-900 border-white/[0.08]"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Recipient Number (To)
                </label>
                <Input
                  value={dispatchForm.to}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, to: e.target.value })}
                  placeholder="+14155550199"
                  className="h-9 text-xs bg-neutral-900 border-white/[0.08]"
                  required
                />
                <p className="text-[10px] text-neutral-500 mt-1">Enter destination number in E.164 format.</p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDispatching}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {isDispatching ? 'Initiating...' : 'Start Call Now'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
