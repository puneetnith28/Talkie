'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '@talkie/ui';
import { ConversationList } from './conversation-list';
import { ChatThread } from './chat-thread';
import { MessageComposer } from './message-composer';
import { User, Phone, Bot, Mail, Building, Plus, Sparkles } from 'lucide-react';

interface MessagesContainerProps {
  initialConversations: any[];
  phoneNumbers: any[];
}

export function MessagesContainer({
  initialConversations,
  phoneNumbers,
}: MessagesContainerProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;
    setLoadingMessages(true);

    fetch(`/api/v1/conversations/${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data?.messages) {
          setActiveMessages(data.data.messages);
        }
      })
      .catch((err) => console.error('Failed to load conversation messages:', err))
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const handleSendMessage = async (body: string) => {
    if (!selectedConversation) return;

    const senderNumber =
      selectedConversation.phoneNumber?.phoneNumber ||
      phoneNumbers[0]?.phoneNumber;

    const recipientNumber = selectedConversation.contact?.phoneNumber;

    if (!senderNumber || !recipientNumber) {
      alert('Sender phone number or recipient number is missing.');
      return;
    }

    // Optimistic message append
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversationId: selectedId,
      direction: 'outbound',
      senderNumber,
      recipientNumber,
      body,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    setActiveMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: senderNumber,
          to: recipientNumber,
          body,
          channel: selectedConversation.channel || 'sms',
          agentId: selectedConversation.agentId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send message');

      // Replace optimistic message with actual DB record
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.data : m))
      );

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessageAt: new Date().toISOString(),
                messages: [data.data],
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error sending message:', err);
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl bg-[#0a0c10]">
      {/* Column 1: Conversations List */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
      />

      {/* Column 2: Active Chat Thread & Composer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-white/[0.08]">
        <ChatThread
          conversation={selectedConversation}
          messages={activeMessages}
          loading={loadingMessages}
        />
        {selectedConversation && (
          <MessageComposer onSend={handleSendMessage} />
        )}
      </div>

      {/* Column 3: Contact Details & Agent Metadata Sidebar */}
      {selectedConversation && (
        <div className="hidden lg:flex w-72 flex-col h-full bg-[#0a0c10] p-6 space-y-6 overflow-y-auto">
          <div className="text-center space-y-3 pb-6 border-b border-white/[0.08]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl mx-auto">
              {(selectedConversation.contact?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {selectedConversation.contact?.name || 'Unknown Contact'}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {selectedConversation.contact?.phoneNumber}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Contact Attributes
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Company
                </span>
                <span>{selectedConversation.contact?.company || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span>{selectedConversation.contact?.email || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Connected Agent */}
          {selectedConversation.agent && (
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Assigned AI Agent
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{selectedConversation.agent.name}</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Voice: {selectedConversation.agent.voice} • Mode: {selectedConversation.agent.voiceMode}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
