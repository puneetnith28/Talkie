'use client';

import React, { useEffect, useRef } from 'react';
import { Badge } from '@talkie/ui';
import { Bot, User, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

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
      <div className="flex-1 flex items-center justify-center bg-[#0d0f14] text-neutral-500 text-sm">
        Select a conversation from the list to start messaging.
      </div>
    );
  }

  const contactName = conversation.contact?.name || conversation.contact?.phoneNumber || 'Direct SMS';
  const phoneNumber = conversation.phoneNumber?.phoneNumber || conversation.phoneNumberId;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f14]">
      {/* Thread Header */}
      <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0a0c10]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {contactName.charAt(0).toUpperCase()}
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
              {conversation.contact?.phoneNumber} • via {phoneNumber}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs font-mono">
            {conversation.channel?.toUpperCase() || 'SMS'}
          </Badge>
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
