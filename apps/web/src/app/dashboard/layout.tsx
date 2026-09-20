import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Button } from '@talkie/ui';
import { Terminal } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#08090b] text-white overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0a0c10]/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Workspace: Talkie AI Labs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              <span>Credits: $50.00</span>
            </div>

            <Link href="/docs">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>API Docs</span>
              </Button>
            </Link>

            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/[0.1] flex items-center justify-center text-xs font-medium text-neutral-200">
              AR
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
