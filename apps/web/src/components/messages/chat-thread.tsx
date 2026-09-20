'use client';

import React, { useEffect, useRef } from 'react';
import { Badge } from '@talkie/ui';
import { Bot, Check, CheckCheck, AlertCircle, MessageCircle, Send, MessageSquare } from 'lucide-react';

interface ChatThreadProps {
  conversation: any;
  messages: any[];
  loading?: boolean;
}

export function ChatThread({ conversation, messages, loading }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0f14] text-neutral-500 text-xs p-8 text-center">
        <MessageSquare className="w-8 h-8 text-neutral-600 mb-2" />
        <span>Select a conversation from the list to view the message history or compose a response.</span>
      </div>
    );
  }

  const channel = conversation.channel || 'sms';
  const contactName =
    conversation.contact?.name ||
    (conversation.contact?.telegramUsername ? `@${conversation.contact?.telegramUsername}` : null) ||
    conversation.contact?.phoneNumber ||
    'Direct Contact';

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
    <div className="flex-1 flex flex-col h-full bg-[#0d0f14]">
      {/* Thread Header */}
      <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0a0c10]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${channelBadgeClass}`}
          >
            {contactName.replace('@', '').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
              <span>{contactName}</span>
              {conversation.agent && (
                <Badge variant="neutral" className="text-[10px] text-blue-400 border-blue-500/20 bg-blue-500/10">
                  <Bot className="w-3 h-3 inline mr-1" />
                  {conversation.agent.name}
                </Badge>
              )}
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              {conversation.contact?.telegramUsername
                ? `@${conversation.contact.telegramUsername}`
                : conversation.contact?.phoneNumber || conversation.contact?.whatsappId || 'Active channel thread'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs uppercase font-bold px-2.5 py-1 rounded-lg border ${channelBadgeClass}`}
          >
            <ChannelIcon className="w-3.5 h-3.5" />
            <span>{channel}</span>
          </span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-xs text-neutral-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-xs text-neutral-500">
            No messages in this thread yet. Send a message to start.
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === 'outbound';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 text-sm ${
                    isOutbound
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(5,150,105,0.2)]'
                      : 'bg-[#161a22] text-neutral-200 rounded-bl-none border border-white/[0.08]'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                </div>

                {/* Metadata & Status */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-neutral-500 font-mono">
                  <span>
                    {new Date(msg.createdAt || msg.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isOutbound && (
                    <span>
                      {msg.status === 'delivered' ? (
                        <CheckCheck className="w-3 h-3 text-emerald-400 inline" />
                      ) : msg.status === 'failed' ? (
                        <AlertCircle className="w-3 h-3 text-red-400 inline" />
                      ) : (
                        <Check className="w-3 h-3 text-neutral-400 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
