'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { Button, Input, Card } from '@talkie/ui';
import { Bot, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk')
);

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const [email, setEmail] = useState('demo@talkie.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Set authentication session cookie
    document.cookie = `talkie_session=demo_user_${Date.now()}; path=/; max-age=86400; SameSite=Lax`;
    setTimeout(() => {
      router.push(redirectUrl);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:scale-105 transition">
            T
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">Talkie</span>
        </Link>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Carrier-grade AI phone, voice, and omnichannel messaging console
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {hasClerkKeys ? (
          <div className="flex justify-center">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
            />
          </div>
        ) : (
          <Card className="p-8 bg-[#0a0c10]/90 border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
            <div className="space-y-1.5 text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">Sign in to Talkie</h1>
              <p className="text-xs text-neutral-400">
                Access your agent pipeline, phone numbers, and call logs
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Development Demo Mode active with full console access</span>
            </div>

            <form onSubmit={handleDemoSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Work Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acme.ai"
                  required
                  className="bg-black/40 border-white/[0.08] text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300">Password</label>
                  <span className="text-[11px] text-emerald-400 cursor-pointer hover:underline">
                    Demo Credentials
                  </span>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="bg-black/40 border-white/[0.08] text-xs h-9"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs py-2 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? 'Launching Console...' : 'Launch Console Demo'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-neutral-400">
              <span>Don&apos;t have an account? </span>
              <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign up free →
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090b]" />}>
      <SignInForm />
    </Suspense>
  );
}
