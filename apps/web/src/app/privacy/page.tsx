import React from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <MarketingNavbar />
      <main className="max-w-4xl mx-auto px-4 py-20 space-y-8">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-xs text-zinc-400">Last updated: September 19, 2026</p>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            We collect information provided when creating workspaces, provisioning phone numbers, streaming audio transcripts, and executing REST API calls.
          </p>

          <h2 className="text-lg font-bold text-white">2. Audio & Transcript Security</h2>
          <p>
            Voice recordings and transcripts are encrypted in-transit (TLS 1.3) and at-rest (AES-256). Transcripts are processed for real-time turn delivery and never sold to third parties.
          </p>

          <h2 className="text-lg font-bold text-white">3. Data Retention & Deletion</h2>
          <p>
            You can delete call records, transcripts, and contact entries at any time via the Talkie dashboard or REST API endpoints.
          </p>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
