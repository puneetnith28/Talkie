'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { PhoneCall, Search, Clock, Bot, User, Play, ChevronRight, FileText, Sparkles } from 'lucide-react';

interface CallsTableProps {
  initialCalls: any[];
}

export function CallsTable({ initialCalls }: CallsTableProps) {
  const [calls, setCalls] = useState(initialCalls);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  const filtered = calls.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.callerNumber.includes(q) ||
      c.calleeNumber.includes(q) ||
      c.agent?.name?.toLowerCase().includes(q) ||
      c.contact?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by number, agent, contact..."
            className="pl-9 h-9 text-xs bg-[#0a0c10] border-white/[0.08]"
          />
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Total Calls: {filtered.length}
        </div>
      </div>

      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No call records found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Inbound and outbound voice sessions will show real-time transcripts and summaries here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Direction & Contact</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Sentiment & Summary</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((call) => {
                  const contactName = call.contact?.name || call.callerNumber;
                  const isOutbound = call.direction === 'outbound';

                  return (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                              isOutbound
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{contactName}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {call.direction.toUpperCase()} • {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-300">
                        {call.agent ? (
                          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                            <Bot className="w-3.5 h-3.5" />
                            <span>{call.agent.name}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={call.status === 'completed' || call.status === 'in-progress' ? 'success' : 'neutral'}
                          className="text-[10px] uppercase font-mono"
                        >
                          {call.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        {call.durationSeconds ? `${call.durationSeconds}s` : '—'}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-neutral-400">
                        {call.summary ? (
                          <span className="text-xs truncate block">{call.summary}</span>
                        ) : (
                          <span className="text-neutral-600 italic">No summary generated</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          className="h-7 px-2 text-xs text-neutral-400 hover:text-white"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          <span>Transcript</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transcript Drawer / Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Call Transcript & Intelligence</h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    ID: {selectedCall.id} • {selectedCall.callerNumber} → {selectedCall.calleeNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-neutral-400 hover:text-white text-sm font-medium"
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
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {(!selectedCall.transcripts || selectedCall.transcripts.length === 0) ? (
                <div className="text-center py-10 text-xs text-neutral-500">
                  No transcript turns recorded for this call.
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
                        {turn.startTimeOffsetMs != null ? `+${(turn.startTimeOffsetMs / 1000).toFixed(1)}s` : ''}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{turn.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
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
    </div>
  );
}
