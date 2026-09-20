import React from 'react';
import Link from 'next/link';
import { GridBackground } from '@talkie/ui';

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#07080a] py-14 text-xs text-zinc-400 overflow-hidden font-sans">
      {/* Subtle Structural Grid Overlay */}
      <GridBackground size={48} variant="subtle" mask="top" opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="font-bold text-white text-base">Talkie</span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Carrier-grade telephony, real-time audio streaming, and voice agent infrastructure for developers.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Product</div>
            <div><Link href="/dashboard/agents" className="hover:text-white transition">AI Agents</Link></div>
            <div><Link href="/dashboard/numbers" className="hover:text-white transition">Phone Numbers</Link></div>
            <div><Link href="/dashboard/calls" className="hover:text-white transition">Live Calls</Link></div>
            <div><Link href="/dashboard/messages" className="hover:text-white transition">Omnichannel SMS</Link></div>
            <div><Link href="/dashboard/usage" className="hover:text-white transition">Pricing & Ledger</Link></div>
          </div>

          {/* Developers */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Developers</div>
            <div><Link href="/docs" className="hover:text-white transition">Interactive API Reference</Link></div>
            <div><Link href="/dashboard/settings/api-keys" className="hover:text-white transition">API Keys</Link></div>
            <div><Link href="/dashboard/webhooks" className="hover:text-white transition">Webhooks</Link></div>
            <div><a href="#code" className="hover:text-white transition">Python & Node SDKs</a></div>
            <div><a href="#code" className="hover:text-white transition">MCP Server</a></div>
          </div>

          {/* Legal */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Legal</div>
            <div><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></div>
            <div><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></div>
            <div><span className="text-zinc-600">SOC-2 Type II Ready</span></div>
            <div><span className="text-zinc-600">HIPAA Compliant BAA</span></div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>© {new Date().getFullYear()} Talkie AI Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
            <Link href="/docs" className="hover:text-zinc-400 transition">Documentation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
