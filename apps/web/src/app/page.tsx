import React from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingHero } from '@/components/marketing/hero';
import { MarketingEcosystem } from '@/components/marketing/ecosystem';
import { MarketingHowItWorks } from '@/components/marketing/how-it-works';
import { NumberSearchDemo } from '@/components/marketing/number-search-demo';
import { MessagingDemo } from '@/components/marketing/messaging-demo';
import { TranscriptionDemo } from '@/components/marketing/transcription-demo';
import { CodeShowcase } from '@/components/marketing/code-showcase';
import { MarketingUseCases } from '@/components/marketing/use-cases';
import { MarketingFAQ } from '@/components/marketing/faq-accordion';
import { MarketingFinalCTA } from '@/components/marketing/final-cta';
import { MarketingFooter } from '@/components/marketing/footer';
import '@/styles/marketing.css';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/20 selection:text-blue-400 overflow-x-hidden">
      {/* Navigation */}
      <MarketingNavbar />

      {/* Hero Section with Interactive Call Simulation */}
      <MarketingHero />

      {/* Ecosystem & Providers Proof */}
      <MarketingEcosystem />

      {/* How It Works 4-Step Pipeline */}
      <MarketingHowItWorks />

      {/* Interactive Number Search & Claim Widget */}
      <NumberSearchDemo />

      {/* Messaging & Real-Time Transcription Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Multimodal Intelligence
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Conversational Voice & Omnichannel SMS
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Seamlessly pivot between live voice calls and automated two-way text messages within unified contact threads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TranscriptionDemo />
          <MessagingDemo />
        </div>
      </section>

      {/* MCP, SDK & REST Code Showcase */}
      <CodeShowcase />

      {/* Enterprise Use Cases */}
      <MarketingUseCases />

      {/* FAQ Accordion */}
      <MarketingFAQ />

      {/* Final High-Conversion CTA */}
      <MarketingFinalCTA />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
