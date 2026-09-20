import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Talkie — Developer Platform for AI Phone, Voice, & Messaging Agents',
  description:
    'Build, test, deploy, and scale conversational AI phone agents and SMS automations with carrier-grade telephony, real-time streaming, and developer-first APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-500/20 selection:text-brand-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
