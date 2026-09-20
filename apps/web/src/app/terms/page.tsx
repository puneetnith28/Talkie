import React from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <MarketingNavbar />
      <main className="max-w-4xl mx-auto px-4 py-20 space-y-8">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-xs text-zinc-400">Last updated: September 19, 2026</p>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Talkie telephony platform, developer API, SDKs, or services, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-lg font-bold text-white">2. Acceptable Use Policy</h2>
          <p>
            You agree not to use the Talkie platform for fraudulent telemarketing, spoofing, unsolicited spam SMS, or unlawful activities. Automated phone communications must comply with TCPA, FCC, and CRTC telecommunication regulations.
          </p>

          <h2 className="text-lg font-bold text-white">3. Metering & Billing</h2>
          <p>
            All phone numbers, voice minutes, and SMS units are billed according to standard pay-as-you-go rates. Balances are debited in real-time upon resource consumption.
          </p>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
