'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { DemoModeAlert } from './demo-mode-alert';
import { Button } from '@talkie/ui';
import { Terminal, Menu, LogOut } from 'lucide-react';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';

interface DashboardShellProps {
  children: React.ReactNode;
}

interface WorkspaceSession {
  userName: string;
  workspaceName: string;
  balanceDollars: string;
  userInitials: string;
  userEmail: string;
  isDemoMode: boolean;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [session, setSession] = useState<WorkspaceSession>({
    userName: 'Puneet Yadav',
    workspaceName: 'Talkie AI Labs',
    balanceDollars: '50.00',
    userInitials: 'PY',
    userEmail: 'puneet@talkie.ai',
    isDemoMode: true,
  });
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Fetch active workspace and session context
  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/auth/me')
      .then((res) => {
        if (res.status === 401) {
          router.push('/sign-in');
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (!res) return;
        if (isMounted && res.success && res.data) {
          const ws = res.data.workspace;
          const user = res.data.user;
          const name = user?.name || user?.email?.split('@')[0] || 'User';
          const initials = name
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'TK';

          setSession({
            userName: name,
            workspaceName: ws?.name || 'Talkie AI Labs',
            balanceDollars: ws?.balanceDollars || '50.00',
            userInitials: initials,
            userEmail: user?.email || '',
            isDemoMode: res.data.isDemoMode ?? true,
          });
        } else if (!res.success && res.error === 'Unauthorized') {
          router.push('/sign-in');
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open & handle Escape key
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } catch {}
    document.cookie = 'talkie_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    router.push('/sign-in');
  };

  return (
    <div className="flex h-screen bg-[#08090b] text-white overflow-hidden font-sans">
      {/* Desktop Sidebar (visible on md+) */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar isDemoMode={session.isDemoMode} />
      </div>

      {/* Mobile Drawer (visible on < md when open) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Panel */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              onClose={() => setMobileDrawerOpen(false)}
              showCloseButton={true}
              isDemoMode={session.isDemoMode}
              className="w-full h-full shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo Mode Alert Banner */}
        <DemoModeAlert />

        {/* Top Header Navbar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0a0c10]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[140px] sm:max-w-none">
                Workspace: {session.workspaceName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/usage">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono hover:bg-emerald-500/15 transition cursor-pointer">
                <span>Credits: ${session.balanceDollars}</span>
              </div>
            </Link>

            <Link href="/docs">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs">
                <Terminal className="w-3.5 h-3.5" />
                <span>API Docs</span>
              </Button>
            </Link>

            {/* User Profile Pill */}
            {!session.isDemoMode ? (
              <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        'w-7 h-7 rounded-full border border-white/[0.1] hover:border-emerald-500/40 transition',
                      userButtonPopoverCard:
                        'bg-[#0a0c10] border border-white/[0.1] shadow-2xl text-white',
                      userButtonPopoverActionButton:
                        'text-neutral-300 hover:text-white hover:bg-white/[0.05]',
                      userButtonPopoverActionButtonText:
                        'text-xs text-neutral-300 font-medium',
                    },
                  }}
                />
                <span className="hidden sm:inline text-xs font-semibold text-white truncate max-w-[130px]">
                  {clerkUser?.fullName || clerkUser?.firstName || session.userName}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-red-500/30 hover:bg-red-500/10 text-neutral-300 hover:text-red-400 transition cursor-pointer"
                title="Sign Out"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500/30 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                  {session.userInitials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold truncate max-w-[120px]">
                  {session.userName}
                </span>
                <LogOut className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
