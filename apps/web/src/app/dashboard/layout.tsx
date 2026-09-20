import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasClerkKeys = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk') &&
    process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes('your_clerk')
  );

  if (hasClerkKeys) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }
  } else {
    // Basic session cookie check for local dev / demo auth
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get('talkie_session')?.value ||
      cookieStore.get('__session')?.value ||
      cookieStore.get('talkie_token')?.value;

    if (!sessionToken) {
      redirect('/sign-in');
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
