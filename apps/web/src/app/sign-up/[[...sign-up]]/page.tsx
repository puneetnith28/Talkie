'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { Button, Card } from '@talkie/ui';
import { ShieldCheck, Sparkles, ArrowRight, Bot } from 'lucide-react';

const hasClerkKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk')
);

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            T
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Talkie</span>
        </Link>
        <Link href="/docs" className="text-xs text-neutral-400 hover:text-white transition">
          Documentation →
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="max-w-md w-full mx-auto my-8 z-10 flex flex-col items-center">
        {hasClerkKey ? (
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        ) : (
          <Card className="w-full p-8 bg-[#0a0c10]/90 border border-white/[0.1] backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Bot className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Create your Account</h1>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Get started with $50.00 in free telephony credits and full AI voice access.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Instant Developer Sandbox Access</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                No credit card required. Test phone numbers, inbound/outbound calls, and webhooks immediately.
              </p>
            </div>

            <Link href="/dashboard" className="block w-full">
              <Button
                variant="primary"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs py-2.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Launch Workspace & Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>HIPAA & SOC-2 Ready</span>
              </span>
              <span>256-bit TLS</span>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-neutral-500 z-10">
        <div className="flex justify-center gap-6 mb-2">
          <Link href="/privacy" className="hover:text-neutral-400 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-neutral-400 transition">Terms of Service</Link>
          <Link href="/docs" className="hover:text-neutral-400 transition">API Reference</Link>
        </div>
        <p>© {new Date().getFullYear()} Talkie AI Inc. Carrier grade voice infrastructure.</p>
      </footer>
    </div>
  );
}
