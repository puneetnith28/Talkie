'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Phone,
  MessageSquare,
  PhoneCall,
  Users,
  Webhook,
  CreditCard,
  Key,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@talkie/ui';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Phone Numbers', href: '/dashboard/numbers', icon: Phone },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Calls & Transcripts', href: '/dashboard/calls', icon: PhoneCall },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'Usage & Billing', href: '/dashboard/usage', icon: CreditCard },
  { name: 'API Keys', href: '/dashboard/settings/api-keys', icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0c10] border-r border-white/[0.08] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            T
          </div>
          <span className="font-semibold text-white tracking-tight">Talkie Console</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Core Platform
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-neutral-200'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Developers & Docs
        </div>
        <Link
          href="/docs"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <span>API Reference & SDKs</span>
        </Link>
      </nav>

      {/* Workspace & Mode Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-white/[0.01]">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-neutral-300">Live Voice Ready</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-mono">
            Demo Mode
          </span>
        </div>
      </div>
    </aside>
  );
}
