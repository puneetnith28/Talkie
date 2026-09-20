'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge } from '@talkie/ui';
import { Users, Building, Mail, Phone, RefreshCw } from 'lucide-react';
import { ContactTable } from '@/components/contacts/contact-table';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/contacts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setContacts(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load contacts stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const companiesCount = new Set(contacts.map((c) => c.company).filter(Boolean)).size;
  const emailsCount = contacts.filter((c) => Boolean(c.email)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Contacts & Audience</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {contacts.length} Total Contacts
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Customer directory, caller profiles, and phone numbers for instant AI routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchContacts}
            title="Refresh contacts"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Directory Size</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{contacts.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Organizations</div>
            <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">{companiesCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Coverage</div>
            <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
              {contacts.length > 0 ? `${Math.round((emailsCount / contacts.length) * 100)}%` : '0%'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Mail className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <ContactTable initialContacts={contacts} />
    </div>
  );
}
