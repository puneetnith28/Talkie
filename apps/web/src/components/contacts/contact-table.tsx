'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { Search, Plus, Mail, Building, Phone, MessageSquare, Edit2, Trash2, Users } from 'lucide-react';
import { ContactModal } from './contact-modal';

interface ContactTableProps {
  initialContacts: any[];
}

export function ContactTable({ initialContacts }: ContactTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  const filtered = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete contact ${name}?`)) return;

    try {
      const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleSaved = (savedContact: any) => {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === savedContact.id);
      if (exists) {
        return prev.map((c) => (c.id === savedContact.id ? savedContact : c));
      }
      return [savedContact, ...prev];
    });
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

        <Button
          variant="primary"
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact</span>
        </Button>
      </div>

      {/* Contacts List Card */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No contacts found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add contacts to start phone conversations, automate inbound routing, or send SMS.
            </p>
          </div>
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
                {filtered.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                          {(contact.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span>{contact.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {contact.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {contact.company || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {contact.email || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href="/dashboard/messages">
                          <Button
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-400 hover:bg-emerald-500/10"
                            title="Message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
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

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaved}
        existingContact={editingContact}
      />
    </div>
  );
}
