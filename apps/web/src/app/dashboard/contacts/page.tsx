import React from 'react';
import { ContactService } from '@talkie/database';
import { ContactTable } from '@/components/contacts/contact-table';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const workspaceId = 'ws_default_talkie_01';

  let contacts: any[] = [];
  try {
    contacts = await ContactService.list(workspaceId);
  } catch (err) {
    console.error('Failed to load contacts:', err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Contacts & Audience</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage your customer directory, caller profiles, and phone numbers for instant AI routing.
        </p>
      </div>

      <ContactTable initialContacts={contacts} />
    </div>
  );
}
