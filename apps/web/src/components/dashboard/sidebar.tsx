'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@talkie/ui';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const coreNavItems: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Phone Numbers', href: '/dashboard/numbers', icon: Phone },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Calls & Transcripts', href: '/dashboard/calls', icon: PhoneCall },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
];

export const developerNavItems: NavItem[] = [
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'API Keys', href: '/dashboard/settings/api-keys', icon: Key },
  { name: 'API & SDK Docs', href: '/docs', icon: BookOpen },
];

export const accountNavItems: NavItem[] = [
  { name: 'Usage & Billing', href: '/dashboard/usage', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
  isDemoMode?: boolean;
}

export function Sidebar({ onClose, className, showCloseButton = false, isDemoMode = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    // Clear session cookies
    document.cookie = 'talkie_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    if (onClose) onClose();
    router.push('/sign-in');
  };

  const renderNavList = (items: NavItem[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <div className="flex items-center gap-2.5">
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
    </div>
  );

  return (
    <aside
      className={cn(
        'w-64 bg-[#0a0c10] border-r border-white/[0.08] flex flex-col h-full select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08] flex-shrink-0">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            T
          </div>
          <span className="font-semibold text-white tracking-tight">Talkie Console</span>
        </Link>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links in 3 Clean Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Core Platform
          </div>
          {renderNavList(coreNavItems)}
        </div>

        <div>
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Developer Services
          </div>
          {renderNavList(developerNavItems)}
        </div>

        <div>
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Account & Operations
          </div>
          {renderNavList(accountNavItems)}
        </div>
      </nav>

      {/* Workspace & Mode Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-white/[0.01] flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-neutral-300">Live Voice Ready</span>
          </div>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-mono',
              isDemoMode
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            )}
          >
            {isDemoMode ? 'Demo Mode' : 'Clerk Active'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
