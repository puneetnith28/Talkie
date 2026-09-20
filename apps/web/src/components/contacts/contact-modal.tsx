'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Textarea } from '@talkie/ui';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { contactValidationSchema } from '@/lib/validations';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: any) => void;
  existingContact?: any;
}

export function ContactModal({
  isOpen,
  onClose,
  onSuccess,
  existingContact,
}: ContactModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(existingContact?.phoneNumber || '');
  const [name, setName] = useState(existingContact?.name || '');
  const [email, setEmail] = useState(existingContact?.email || '');
  const [company, setCompany] = useState(existingContact?.company || '');
  const [notes, setNotes] = useState(existingContact?.notes || '');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const parseResult = contactValidationSchema.safeParse({
      phoneNumber,
      name,
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const url = existingContact
        ? `/api/v1/contacts/${existingContact.id}`
        : '/api/v1/contacts';
      const method = existingContact ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseResult.data),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to save contact');

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-md bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {existingContact ? 'Edit Contact' : 'Create Contact'}
              </h3>
              <p className="text-xs text-neutral-400">Manage caller and messaging profiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-white text-sm font-medium transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Phone Number <span className="text-emerald-400">*</span>
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: '' }));
              }}
              placeholder="+14155550199"
              disabled={!!existingContact || loading}
              className={`bg-black/40 border-white/[0.08] text-xs h-9 font-mono ${
                fieldErrors.phoneNumber ? 'border-red-500/60 focus:border-red-500' : ''
              }`}
            />
            {fieldErrors.phoneNumber && (
              <p className="text-[11px] text-red-400">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Full Name <span className="text-emerald-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Sarah Connor"
              disabled={loading}
              className={`bg-black/40 border-white/[0.08] text-xs h-9 ${
                fieldErrors.name ? 'border-red-500/60 focus:border-red-500' : ''
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Email</label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="sarah@example.com"
                type="email"
                disabled={loading}
                className={`bg-black/40 border-white/[0.08] text-xs h-9 ${
                  fieldErrors.email ? 'border-red-500/60' : ''
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Company</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                disabled={loading}
                className="bg-black/40 border-white/[0.08] text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VIP Client / Support Tier 1"
              rows={2}
              disabled={loading}
              className="bg-black/40 border-white/[0.08] text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{existingContact ? 'Save Changes' : 'Create Contact'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
