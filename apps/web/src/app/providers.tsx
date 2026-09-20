'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  // If Clerk publishable key is available, wrap with styled ClerkProvider
  if (publishableKey && !publishableKey.includes('your_clerk')) {
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={{
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#0a0c10',
            colorText: '#ffffff',
            colorInputBackground: '#0d1117',
            colorInputText: '#ffffff',
            borderRadius: '0.75rem',
          },
          elements: {
            card: 'bg-[#0a0c10] border border-white/[0.08] shadow-2xl backdrop-blur-xl',
            headerTitle: 'text-white font-bold tracking-tight',
            headerSubtitle: 'text-neutral-400 text-xs',
            formButtonPrimary:
              'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition-all',
            footerActionLink: 'text-emerald-400 hover:text-emerald-300 font-medium',
          },
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  // Fallback demo mode provider when Clerk publishable key is omitted
  return <>{children}</>;
}
