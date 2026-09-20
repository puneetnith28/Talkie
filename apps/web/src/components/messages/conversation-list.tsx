'use client';

import React from 'react';
import { Badge, Input } from '@talkie/ui';
import { Search, Bot, MessageSquare, Send, Globe, MessageCircle } from 'lucide-react';

interface ConversationListProps {
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => {
    // Channel filter
    if (channelFilter !== 'all' && c.channel !== channelFilter) {
      return false;
    }
    // Search query filter
    if (!searchQuery) return true;
    const name = c.contact?.name?.toLowerCase() || '';
    const phone = c.contact?.phoneNumber || '';
    const whatsapp = c.contact?.whatsappId || '';
    const telegram = c.contact?.telegramUsername?.toLowerCase() || '';
    const agentName = c.agent?.name?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return (
      name.includes(q) ||
      phone.includes(q) ||
      whatsapp.includes(q) ||
      telegram.includes(q) ||
      agentName.includes(q)
    );
  });

  const channels = [
    { id: 'all', label: 'All' },
    { id: 'sms', label: 'SMS' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'telegram', label: 'Telegram' },
  ];

  return (
    <div className="w-full md:w-80 border-r border-white/[0.08] flex flex-col h-full bg-[#0a0c10]">
      {/* Search & Channel Filters Header */}
      <div className="p-4 border-b border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Conversations</h2>
          <Badge variant="neutral" className="text-[10px] font-mono">
            {filtered.length} of {conversations.length}
          </Badge>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts, handles..."
            className="pl-9 h-8 text-xs bg-black/40 border-white/[0.08]"
          />
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {channels.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => onChannelFilterChange(ch.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                channelFilter === ch.id
                  ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No conversation threads found.
          </div>
        ) : (
          filtered.map((conv) => {
            const isSelected = selectedId === conv.id;
            const lastMsg = conv.messages?.[0];
            const channel = conv.channel || 'sms';
            const contactName =
              conv.contact?.name ||
              (conv.contact?.telegramUsername ? `@${conv.contact?.telegramUsername}` : null) ||
              conv.contact?.phoneNumber ||
              'Direct Message';
            const agentName = conv.agent?.name;

            let channelBadgeClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            let ChannelIcon = MessageSquare;

            if (channel === 'whatsapp') {
              channelBadgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              ChannelIcon = MessageCircle;
            } else if (channel === 'telegram') {
              channelBadgeClass = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
              ChannelIcon = Send;
            }

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
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold border ${channelBadgeClass}`}
                    >
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{contactName}</div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {conv.contact?.telegramUsername
                          ? `@${conv.contact.telegramUsername}`
                          : conv.contact?.phoneNumber}
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

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${channelBadgeClass}`}
                    >
                      <ChannelIcon className="w-2.5 h-2.5" />
                      <span>{channel}</span>
                    </span>
                  </div>

                  {agentName && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400">
                      <Bot className="w-3 h-3" />
                      <span className="truncate max-w-[90px]">{agentName}</span>
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
