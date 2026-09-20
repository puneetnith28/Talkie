'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Input, Card, Badge, TableSkeleton, EmptyState } from '@talkie/ui';
import {
  Search,
  Plus,
  Mail,
  Building,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  Users,
  RefreshCw,
  PhoneOutgoing,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ContactModal } from './contact-modal';

interface ContactRecord {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface ContactTableProps {
  initialContacts?: ContactRecord[];
}

export function ContactTable({ initialContacts = [] }: ContactTableProps) {
  const [contacts, setContacts] = useState<ContactRecord[]>(initialContacts);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [targetContactForCall, setTargetContactForCall] = useState<ContactRecord | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);

  const fetchContacts = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/v1/contacts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setContacts(json.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetch('/api/v1/agents')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setAgents(d.data);
          if (d.data.length > 0) setSelectedAgentId(d.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string, name?: string | null) => {
    if (!confirm(`Are you sure you want to delete contact "${name || id}"?`)) return;

    try {
      const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleSaved = (savedContact: ContactRecord) => {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === savedContact.id);
      if (exists) {
        return prev.map((c) => (c.id === savedContact.id ? savedContact : c));
      }
      return [savedContact, ...prev];
    });
  };

  const handleLaunchCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetContactForCall || !selectedAgentId) return;

    setIsCalling(true);
    setCallSuccess(false);

    try {
      const res = await fetch('/api/v1/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          from: '+14155550100',
          to: targetContactForCall.phoneNumber,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Call initiation failed');
      }

      setCallSuccess(true);
      setTimeout(() => {
        setIsCallModalOpen(false);
        setTargetContactForCall(null);
        setCallSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch call');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, company..."
            className="pl-9 h-9 text-xs bg-[#0a0c10] border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchContacts(true)}
            disabled={refreshing}
            className="h-9 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="h-9 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New Contact</span>
          </Button>
        </div>
      </div>

      {/* Contacts Table Card */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-emerald-400" />}
            title="No contacts found"
            description={
              searchQuery
                ? "No contacts matched your search filter. Try clearing the query."
                : "Create contacts to link phone numbers, run targeted AI campaigns, and track customer communication histories."
            }
            action={
              searchQuery
                ? {
                    label: 'Clear Search',
                    onClick: () => setSearchQuery(''),
                  }
                : {
                    label: 'Add First Contact',
                    onClick: () => {
                      setEditingContact(null);
                      setIsModalOpen(true);
                    },
                    icon: <Plus className="w-3.5 h-3.5 mr-1.5" />,
                  }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                          {(contact.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{contact.name || 'Unnamed Contact'}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Added {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {contact.phoneNumber}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-300">
                      {contact.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{contact.company}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-300">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTargetContactForCall(contact);
                            setIsCallModalOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-emerald-400 hover:bg-emerald-500/10"
                          title="Call Contact"
                        >
                          <PhoneOutgoing className="w-3.5 h-3.5" />
                        </Button>

                        <Link href="/dashboard/messages">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/10"
                            title="Message Contact"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingContact(contact);
                            setIsModalOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id, contact.name)}
                          className="h-7 w-7 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit / Create Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaved}
        existingContact={editingContact}
      />

      {/* Quick Call Modal */}
      {isCallModalOpen && targetContactForCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PhoneOutgoing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Call {targetContactForCall.name || 'Contact'}</h3>
                  <p className="text-xs text-neutral-400 font-mono">{targetContactForCall.phoneNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {callSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-semibold text-white">Voice session initiated successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleLaunchCall} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Select Voice Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full h-9 rounded-lg bg-neutral-900 border border-white/[0.08] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.voiceMode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCallModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isCalling}
                    className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                  >
                    {isCalling ? 'Connecting...' : 'Dispatch Call'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
