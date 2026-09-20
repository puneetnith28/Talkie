'use client';

import React from 'react';
import { Card, Badge, Input } from '@talkie/ui';
import { Search, User, Bot, MessageSquare, Phone } from 'lucide-react';

interface ConversationListProps {
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = c.contact?.name?.toLowerCase() || '';
    const phone = c.contact?.phoneNumber || '';
    const agentName = c.agent?.name?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || phone.includes(q) || agentName.includes(q);
  });

  return (
    <div className="w-full md:w-80 border-r border-white/[0.08] flex flex-col h-full bg-[#0a0c10]">
      {/* Search Header */}
      <div className="p-4 border-b border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Conversations</h2>
          <Badge variant="neutral" className="text-[10px] font-mono">
            {conversations.length}
          </Badge>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search threads..."
            className="pl-9 h-8 text-xs bg-black/40 border-white/[0.08]"
          />
        </div>
      </div>

      {/* Conversation Thread Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const isSelected = selectedId === conv.id;
            const lastMsg = conv.messages?.[0];
            const contactName = conv.contact?.name || conv.contact?.phoneNumber || 'Direct SMS';
            const agentName = conv.agent?.name;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-xs font-semibold">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{contactName}</div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {conv.contact?.phoneNumber}
                      </div>
                    </div>
                  </div>

                  {conv.lastMessageAt && (
                    <div className="text-[10px] text-neutral-500 font-mono shrink-0 ml-2">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>

                {lastMsg && (
                  <div className="mt-2 text-xs text-neutral-400 truncate font-sans pl-1">
                    <span className="text-neutral-500 font-mono mr-1">
                      {lastMsg.direction === 'outbound' ? 'You:' : 'Them:'}
                    </span>
                    {lastMsg.body}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="neutral" className="text-[9px] uppercase px-1.5 py-0">
                    {conv.channel || 'SMS'}
                  </Badge>
                  {agentName && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400">
                      <Bot className="w-3 h-3" />
                      <span>{agentName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
