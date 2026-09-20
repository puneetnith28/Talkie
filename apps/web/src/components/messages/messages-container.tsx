'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input, TableSkeleton, EmptyState } from '@talkie/ui';
import { ConversationList } from './conversation-list';
import { ChatThread } from './chat-thread';
import { MessageComposer } from './message-composer';
import {
  User,
  Phone,
  Bot,
  Mail,
  Building,
  Plus,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Send,
  ArrowLeft,
  X,
} from 'lucide-react';

interface MessagesContainerProps {
  initialConversations?: any[];
  phoneNumbers?: any[];
}

export function MessagesContainer({
  initialConversations = [],
  phoneNumbers = [],
}: MessagesContainerProps) {
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  const [numbers, setNumbers] = useState<any[]>(phoneNumbers);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // New message form state
  const [newRecipient, setNewRecipient] = useState('');
  const [newFromNumber, setNewFromNumber] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newChannel, setNewChannel] = useState<'sms' | 'mms' | 'whatsapp'>('sms');
  const [isSendingNew, setIsSendingNew] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/conversations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setConversations(json.data);
          if (!selectedId && json.data.length > 0) {
            setSelectedId(json.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!numbers.length) {
      fetch('/api/v1/numbers')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setNumbers(data.data);
            if (data.data.length > 0) {
              setNewFromNumber(data.data[0].phoneNumber);
            }
          }
        })
        .catch(console.error);
    } else if (!newFromNumber && numbers.length > 0) {
      setNewFromNumber(numbers[0].phoneNumber);
    }
  }, [numbers, newFromNumber]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const fetchMessagesForSelected = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/v1/conversations/${convId}`);
      const data = await res.json();
      if (data.success && data.data?.messages) {
        setActiveMessages(data.data.messages);
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessagesForSelected(selectedId);
    }
  }, [selectedId, fetchMessagesForSelected]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  const handleSendMessage = async (body: string) => {
    if (!selectedConversation) return;

    const senderNumber =
      selectedConversation.phoneNumber?.phoneNumber ||
      numbers[0]?.phoneNumber ||
      '+14155550100';

    const recipientNumber =
      selectedConversation.contact?.phoneNumber ||
      selectedConversation.recipientNumber;

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
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to send message');
      }

      // Replace optimistic message with actual DB record
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.data : m))
      );

      // Refresh conversations to update thread order
      fetchConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const handleCreateNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newFromNumber || !newBody) {
      setNewError('Please complete all required fields.');
      return;
    }

    setIsSendingNew(true);
    setNewError(null);

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: newFromNumber,
          to: newRecipient,
          body: newBody,
          channel: newChannel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to dispatch message');
      }

      setIsNewModalOpen(false);
      setNewRecipient('');
      setNewBody('');
      await fetchConversations(true);
      if (data.data?.conversationId) {
        setSelectedId(data.data.conversationId);
        setMobileShowChat(true);
      }
    } catch (err: any) {
      setNewError(err.message || 'Error sending message');
    } finally {
      setIsSendingNew(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (channelFilter !== 'all' && c.channel?.toLowerCase() !== channelFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'sms', 'whatsapp'].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                channelFilter === ch
                  ? 'bg-neutral-800 text-white border border-white/[0.1]'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchConversations(true)}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Thread
          </Button>
        </div>
      </div>

      {/* 3-Pane Messaging Workspace */}
      <div className="h-[calc(100vh-12rem)] min-h-[550px] flex rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl bg-[#0a0c10]">
        {/* Pane 1: Conversations List */}
        <div className={`w-full md:w-80 flex-shrink-0 ${mobileShowChat ? 'hidden md:flex' : 'flex'} flex-col h-full`}>
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />
        </div>

        {/* Pane 2: Active Chat Thread & Composer */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden border-r border-white/[0.08] ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {mobileShowChat && (
            <div className="md:hidden p-2 bg-[#0a0c10] border-b border-white/[0.08] flex items-center">
              <button
                onClick={() => setMobileShowChat(false)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white p-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Conversations</span>
              </button>
            </div>
          )}

          <ChatThread
            conversation={selectedConversation}
            messages={activeMessages}
            loading={loadingMessages}
          />
          {selectedConversation && (
            <MessageComposer onSend={handleSendMessage} />
          )}
        </div>

        {/* Pane 3: Contact & Agent Context Metadata */}
        {selectedConversation && (
          <div className="hidden xl:flex w-72 flex-col h-full bg-[#0a0c10] p-6 space-y-6 overflow-y-auto">
            <div className="text-center space-y-3 pb-6 border-b border-white/[0.08]">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl mx-auto">
                {(selectedConversation.contact?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedConversation.contact?.name || 'Direct Contact'}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {selectedConversation.contact?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Attributes */}
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

            {/* Assigned Agent */}
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

      {/* New Conversation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">New Omnichannel Thread</h3>
                  <p className="text-xs text-neutral-400">Dispatch SMS or WhatsApp directly from your numbers.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-neutral-400 hover:text-white text-base font-medium px-2 py-1"
              >
                ✕
              </button>
            </div>

            {newError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {newError}
              </div>
            )}

            <form onSubmit={handleCreateNewConversation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Sender Phone Number (From)
                </label>
                {numbers.length > 0 ? (
                  <select
                    value={newFromNumber}
                    onChange={(e) => setNewFromNumber(e.target.value)}
                    className="w-full h-9 rounded-lg bg-neutral-900 border border-white/[0.08] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    {numbers.map((num) => (
                      <option key={num.id} value={num.phoneNumber}>
                        {num.phoneNumber} ({num.provider})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={newFromNumber}
                    onChange={(e) => setNewFromNumber(e.target.value)}
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
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="+14155550199"
                  className="h-9 text-xs bg-neutral-900 border-white/[0.08]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Channel
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="w-full h-9 rounded-lg bg-neutral-900 border border-white/[0.08] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="sms">SMS (Standard)</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="mms">MMS (Multimedia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Message Body
                </label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Type your initial message..."
                  rows={3}
                  className="w-full rounded-lg bg-neutral-900 border border-white/[0.08] p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSendingNew}
                  className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isSendingNew ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
