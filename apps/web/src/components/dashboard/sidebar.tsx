'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@talkie/ui';
import { useClerk, useUser } from '@clerk/nextjs';

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
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = clerkUser?.fullName || clerkUser?.firstName || 'Puneet Yadav';
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || 'puneetnith28@gmail.com';
  const userInitial = (userName[0] || 'P').toUpperCase();

  // Close dropdown on route change
  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } catch (_err) {
      // Ignore signOut errors on unmounted session
    }
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

      {/* Workspace & User Profile Footer with Popover Dropdown */}
      <div className="relative p-3 border-t border-white/[0.08] bg-[#0c0e12]/80 flex-shrink-0" ref={menuRef}>
        {/* Dropdown Popover */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-2xl bg-[#0e1117] border border-white/[0.12] shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-2">
            {/* Header info with name & email */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={userName}
                  className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/25 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-300 shrink-0 shadow-sm">
                  {userInitial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate leading-tight">{userName}</div>
                <div className="text-[10px] text-neutral-400 font-mono truncate leading-tight mt-0.5">{userEmail}</div>
              </div>
            </div>

            {/* Status pill */}
            <div className="px-2 py-0.5 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Voice Ready
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-neutral-300">
                {isDemoMode ? 'Demo Mode' : 'Clerk Active'}
              </span>
            </div>

            <div className="h-px bg-white/[0.06] my-1" />

            {/* Quick Links */}
            <div className="space-y-0.5">
              <Link
                href="/dashboard/settings"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-400" />
                <span>Account Settings</span>
              </Link>
              <Link
                href="/dashboard/usage"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                <span>Usage & Billing</span>
              </Link>
            </div>

            <div className="h-px bg-white/[0.06] my-1" />

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Normal State Trigger: Shows Avatar, Name only, and Chevrons */}
        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group',
            userMenuOpen
              ? 'bg-white/[0.08] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt={userName}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500/25 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                {userInitial}
              </div>
            )}
            <span className="text-xs font-semibold text-white truncate max-w-[130px] group-hover:text-emerald-300 transition-colors">
              {userName}
            </span>
          </div>

          <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-200 shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
}
