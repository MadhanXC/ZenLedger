import type {Metadata} from 'next';
import './globals.css';
import {SidebarProvider, SidebarInset} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {Toaster} from '@/components/ui/toaster';
import {FirebaseClientProvider} from '@/firebase/client-provider';
import AuthGate from '@/components/layout/auth-gate';
import {ThemeManager} from '@/components/layout/theme-manager';

export const metadata: Metadata = {
  title: 'Zen Ledger - Professional Business Documentation',
  description: 'Effortless quotes, estimates, and invoices for your business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeManager />
          <AuthGate>
            {children}
          </AuthGate>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
